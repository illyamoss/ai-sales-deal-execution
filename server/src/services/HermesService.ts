import http from 'http';

const HERMES_HOST = '127.0.0.1';
const HERMES_PORT = 8642;
const HERMES_API_KEY = process.env.API_SERVER_KEY || 'strong';
const MODEL = 'hermes-agent';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

function chatCompletion(messages: ChatMessage[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ model: MODEL, messages, stream: false });

    const options = {
      hostname: HERMES_HOST,
      port: HERMES_PORT,
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${HERMES_API_KEY}`,
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const content = json.choices?.[0]?.message?.content || '';
          resolve(content);
        } catch (_e) {
          reject(new Error(`Failed to parse Hermes response: ${data.slice(0, 200)}`));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(120000, () => {
      req.destroy(new Error('Hermes request timeout'));
    });
    req.write(payload);
    req.end();
  });
}

function streamCompletion(
  messages: ChatMessage[],
  onChunk: (delta: string, fullText: string) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ model: MODEL, messages, stream: true });

    const options = {
      hostname: HERMES_HOST,
      port: HERMES_PORT,
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${HERMES_API_KEY}`,
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = http.request(options, (res) => {
      if (res.statusCode !== 200) {
        let body = '';
        res.on('data', (c: Buffer) => body += c.toString());
        res.on('end', () => reject(new Error(`Hermes returned ${res.statusCode}: ${body.slice(0, 200)}`)));
        return;
      }

      let fullText = '';
      let lineBuffer = '';

      res.on('data', (chunk: Buffer) => {
        lineBuffer += chunk.toString();
        const lines = lineBuffer.split('\n');
        lineBuffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;
          if (trimmed === 'data: [DONE]') continue;

          try {
            const json = JSON.parse(trimmed.slice(6));
            const delta = json.choices?.[0]?.delta?.content;
            if (delta) {
              fullText += delta;
              onChunk(delta, fullText);
            }
          } catch (_e) {}
        }
      });

      res.on('end', () => resolve(fullText));
      res.on('error', reject);
    });

    req.on('error', reject);
    req.setTimeout(120000, () => {
      req.destroy(new Error('Hermes request timeout'));
    });
    req.write(payload);
    req.end();
  });
}

function extractMarkdown(text: string): string {
  const fenceMatch = text.match(/```(?:markdown|md)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    return fenceMatch[1].trim();
  }
  return text.trim();
}

const TAB_DELIMITER_RE = /---TAB:\s*(.+?)---/g;

export async function generateProposalStream(
  clientName: string,
  website: string,
  details: string,
  companyDescription: string,
  onStatusUpdate: (status: string) => void,
  onSection: (section: { title: string; htmlContent: string }) => void
): Promise<void> {
  onStatusUpdate('Researching company & client profiles...');

  const systemPrompt = `You are an elite AI sales strategist. Your proposals are concise, insightful, and win deals.

===== OUR COMPANY =====
${companyDescription}

===== CLIENT =====
Name: ${clientName}
Website: ${website || 'Not provided'}
Context: ${details || 'Not provided'}

===== PRE-GENERATION RESEARCH =====
Before writing a single word, deeply analyze:
1. OUR COMPANY profile above — what services do we offer? What is our methodology? What is our unique value proposition? What problems do we solve? Who are our ideal clients?
2. THE CLIENT — based on their name, website, and context, infer their industry, size, challenges, and goals.
3. THE FIT — map our specific capabilities to the client's exact needs. Every recommendation must flow from what OUR COMPANY actually does.

===== SECTION STRATEGY =====
Select exactly 4-6 sections. Choose based on the client, not a template:
- Startup/growth → strategy, roadmap, metrics
- Enterprise → implementation, governance, integration
- Budget-focused → pricing tiers, ROI, quick wins
- Time-sensitive → timeline, agile delivery, milestones
- Non-technical → plain language, business outcomes
- Technical → architecture, methodology, tech stack

===== CONTENT RULES =====
- Each section: 3-5 short paragraphs. Be direct. No fluff.
- Use Markdown: ## headers, bullet lists, **bold** for emphasis, tables for numbers.
- Mention the client by name. Reference their website and context.
- Use realistic numbers specific to our company's pricing model.
- Be confident but factual. No generic consulting-speak.

===== FORMAT (CRITICAL) =====
Separate each section with this exact delimiter on its own line:
---TAB: Section Title---

Example:
---TAB: Executive Summary---
## Executive Summary
After reviewing ${clientName}'s needs, we recommend...

---TAB: Strategic Approach---
## Strategic Approach
Based on our expertise in...

Return ONLY delimited sections. No preamble, no closing remarks, no code fences.`;

  try {
    const emittedSections = new Set<string>();
    let contentStart = 0;
    let pendingTitle: string | null = null;

    const fullText = await streamCompletion(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Generate a personalized, concise proposal for ${clientName}.${website ? ` Website: ${website}.` : ''}${details ? ` Key info: ${details}` : ''}` }
      ],
      (_, accumulatedText) => {
        const matches: { index: number; end: number; title: string }[] = [];
        const regex = new RegExp(TAB_DELIMITER_RE.source, 'g');
        let m: RegExpExecArray | null;

        while ((m = regex.exec(accumulatedText)) !== null) {
          matches.push({
            index: m.index,
            end: m.index + m[0].length,
            title: m[1].trim()
          });
        }

        if (matches.length === 0) return;

        if (pendingTitle === null) {
          pendingTitle = matches[0].title;
          contentStart = matches[0].end;
          onStatusUpdate(`Drafting "${pendingTitle}"...`);
        }

        for (let i = 1; i < matches.length; i++) {
          const prevTitle = matches[i - 1].title;
          const prevEnd = matches[i - 1].end;
          const currStart = matches[i].index;

          if (!emittedSections.has(prevTitle)) {
            const content = accumulatedText.slice(prevEnd, currStart).trim();
            if (content) {
              emittedSections.add(prevTitle);
              onSection({
                title: prevTitle,
                htmlContent: extractMarkdown(content)
              });
            }
          }

          pendingTitle = matches[i].title;
          contentStart = matches[i].end;

          if (!emittedSections.has(pendingTitle)) {
            onStatusUpdate(`Drafting "${pendingTitle}"...`);
          }
        }
      }
    );

    if (pendingTitle && !emittedSections.has(pendingTitle)) {
      const content = fullText.slice(contentStart).trim();
      if (content) {
        onSection({
          title: pendingTitle,
          htmlContent: extractMarkdown(content)
        });
      }
    }

    if (emittedSections.size === 0 && fullText.trim()) {
      const parsed = parseNonStreamed(fullText);
      for (const section of parsed) {
        if (!emittedSections.has(section.title)) {
          emittedSections.add(section.title);
          onSection(section);
        }
      }
    }

    onStatusUpdate('Finalizing...');
  } catch (error) {
    throw new Error('Failed to generate proposal: ' + error);
  }
}

function parseNonStreamed(text: string): { title: string; htmlContent: string }[] {
  const results: { title: string; htmlContent: string }[] = [];
  const parts = text.split(/---TAB:\s*(.*?)---/);

  for (let i = 1; i < parts.length; i += 2) {
    const title = parts[i].trim();
    const content = parts[i + 1] ? parts[i + 1].trim() : '';
    if (title && content) {
      results.push({ title, htmlContent: extractMarkdown(content) });
    }
  }

  if (results.length === 0) {
    results.push({ title: 'Proposal', htmlContent: extractMarkdown(text) });
  }

  return results;
}

export async function editTabWithAI(
  tabTitle: string,
  currentHTML: string,
  userInstruction: string,
  companyDescription: string,
  clientName: string
): Promise<string> {
  const systemPrompt = `You are a proposal editor. The user wants to modify a section of a client proposal.

ABOUT OUR COMPANY:
${companyDescription}

CLIENT: ${clientName}

CURRENT MARKDOWN OF THE "${tabTitle}" SECTION:
${currentHTML}

IMPORTANT RULES:
1. Return ONLY the complete updated Markdown for this section. No explanation.
2. Use proper Markdown formatting (headers, lists, tables).
3. Apply the user's requested changes while keeping the overall structure intact.
4. If the user asks for something unrelated to the proposal content, politely decline in the Markdown itself.`;

  const result = await chatCompletion([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userInstruction }
  ]);

  return extractMarkdown(result);
}

export async function chatAboutProposal(
  messages: ChatMessage[],
  tabTitle: string,
  currentHTML: string,
  companyDescription: string,
  clientName: string
): Promise<{ message: string; updatedHTML: string | null }> {
  const systemPrompt = `You are an AI assistant helping edit a client proposal. You can have a conversation about changes.

ABOUT OUR COMPANY:
${companyDescription}

CLIENT: ${clientName}
CURRENT SECTION: "${tabTitle}"

When the user asks you to make changes to the proposal section, respond with a brief confirmation message, then include the full updated Markdown wrapped in a special marker:

---UPDATED_MD_START---
(full Markdown here)
---UPDATED_MD_END---

If the user is just asking questions or chatting without requesting changes, respond normally without the Markdown markers.

RULES FOR MARKDOWN:
1. Use standard Markdown formatting (headers, lists, tables).
2. Do not use HTML tags.`;

  const allMessages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Here is the current content of the "${tabTitle}" section:\n\n${currentHTML}` },
    ...messages
  ];

  const response = await chatCompletion(allMessages);

  const mdMatch = response.match(/---UPDATED_MD_START---([\s\S]*?)---UPDATED_MD_END---/);
  if (mdMatch) {
    const cleanMessage = response.replace(/---UPDATED_MD_START---[\s\S]*?---UPDATED_MD_END---/, '').trim();
    const cleanMD = extractMarkdown(mdMatch[1]);
    return {
      message: cleanMessage || 'Done! Here are the updated changes.',
      updatedHTML: cleanMD
    };
  }

  return { message: response, updatedHTML: null };
}