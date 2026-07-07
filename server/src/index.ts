import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { SqliteProposalStorage } from './infrastructure/SqliteProposalStorage';
import { generateProposalStream, chatAboutProposal } from './services/HermesService';

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const dbPath = path.join(__dirname, '..', 'proposals.db');
const storage = new SqliteProposalStorage(dbPath);

app.get('/api/settings', async (_req, res) => {
  try {
    const settings = await storage.getCompanySettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.post('/api/settings', async (req, res) => {
  try {
    const { description } = req.body;
    await storage.saveCompanySettings({ id: 'default', description });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.post('/api/proposals/:id/generate', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  try {
    const proposalId = req.params.id;
    const proposal = await storage.getProposal(proposalId);
    if (!proposal) {
      throw new Error('Proposal not found');
    }

    const client = await storage.getClient(proposal.clientId);
    if (!client) {
      throw new Error('Client not found');
    }

    const settings = await storage.getCompanySettings();
    const companyDescription = settings?.description || 'A professional services company.';

    let page = await storage.getProposalPageByProposalId(proposalId);
    if (!page) {
      const pageId = uuidv4();
      await storage.createProposalPage({ id: pageId, proposalId });
      page = { id: pageId, proposalId };
    }

    await generateProposalStream(
      client.name,
      client.website || '',
      client.details || '',
      companyDescription,
      (status: string) => {
        const event = JSON.stringify({ type: 'status', message: status });
        res.write(`data: ${event}\n\n`);
      },
      async (section) => {
        const tabId = uuidv4();
        await storage.createProposalTab({
          id: tabId,
          proposalPageId: page!.id,
          title: section.title,
          htmlContent: section.htmlContent
        });
        const event = JSON.stringify({ type: 'tab', id: tabId, title: section.title });
        res.write(`data: ${event}\n\n`);
      }
    );

    const doneEvent = JSON.stringify({ type: 'done', proposalId });
    res.write(`data: ${doneEvent}\n\n`);
    res.end();
  } catch (error) {
    console.error('Generation error:', error);
    const errEvent = JSON.stringify({ type: 'error', message: String(error) });
    res.write(`data: ${errEvent}\n\n`);
    res.end();
  }
});

app.post('/api/proposals', async (req, res) => {
  try {
    const { clientName, website, details } = req.body;

    const clientId = uuidv4();
    await storage.createClient({
      id: clientId,
      name: clientName,
      website: website || '',
      details: details || ''
    });

    const proposalId = uuidv4();
    await storage.createProposal({
      id: proposalId,
      clientId,
      createdAt: Date.now()
    });

    const pageId = uuidv4();
    await storage.createProposalPage({ id: pageId, proposalId });

    res.json({ proposalId });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.get('/api/proposals', async (_req, res) => {
  try {
    const proposals = await storage.getProposals();
    res.json(proposals);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.get('/api/proposals/:id', async (req, res) => {
  try {
    const proposal = await storage.getProposal(req.params.id);
    if (!proposal) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    const client = await storage.getClient(proposal.clientId);
    const page = await storage.getProposalPageByProposalId(proposal.id);

    let tabs: any[] = [];
    if (page) {
      tabs = await storage.getProposalTabs(page.id);
    }

    res.json({ proposal, client, page, tabs });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.post('/api/proposals/:id/chat', async (req, res) => {
  try {
    const { tabId, messages } = req.body;

    const proposal = await storage.getProposal(req.params.id);
    if (!proposal) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    const client = await storage.getClient(proposal.clientId);
    const page = await storage.getProposalPageByProposalId(proposal.id);
    if (!page) {
      res.status(404).json({ error: 'Page not found' });
      return;
    }

    const tabs = await storage.getProposalTabs(page.id);
    const tab = tabs.find(t => t.id === tabId);
    if (!tab) {
      res.status(404).json({ error: 'Tab not found' });
      return;
    }

    const settings = await storage.getCompanySettings();
    const companyDescription = settings?.description || 'A professional services company.';

    const result = await chatAboutProposal(
      messages,
      tab.title,
      tab.htmlContent,
      companyDescription,
      client?.name || 'Client'
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.put('/api/tabs/:id', async (req, res) => {
  try {
    const { htmlContent } = req.body;
    await storage.updateProposalTab(req.params.id, htmlContent);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.post('/api/analytics', async (req, res) => {
  try {
    const events = req.body.events;
    for (const event of events) {
      await storage.saveAnalyticsEvent({
        id: uuidv4(),
        proposalId: event.proposalId,
        tabId: event.tabId || '',
        eventType: event.eventType,
        value: event.value,
        sessionId: event.sessionId || '',
        metadata: event.metadata ? JSON.stringify(event.metadata) : '',
        timestamp: event.timestamp || Date.now()
      });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.get('/api/analytics/:proposalId', async (req, res) => {
  try {
    const events = await storage.getAnalytics(req.params.proposalId);
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.delete('/api/proposals/:id', async (req, res) => {
  try {
    await storage.deleteProposal(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

async function start() {
  await storage.connect();
  app.listen(3000, () => {
    console.log('Server running on port 3000');
  });
}

start();
