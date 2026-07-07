import { useState, useRef, useEffect } from 'react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface Props {
  proposalId: string;
  activeTabId: string;
  activeTabTitle: string;
  onTabUpdate: (tabId: string, newHTML: string) => void;
  onClose: () => void;
}

export default function AIChatSidebar({ proposalId, activeTabId, activeTabTitle, onTabUpdate, onClose }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (messages.length > 0 && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    setMessages([]);
  }, [activeTabId]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`/api/proposals/${proposalId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tabId: activeTabId,
          messages: newMessages.map(m => ({ role: m.role, content: m.content }))
        })
      });

      const data = await res.json();

      setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);

      if (data.updatedHTML) {
        onTabUpdate(activeTabId, data.updatedHTML);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Something went wrong. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{
      width: '380px',
      borderLeft: '1px solid #18181b',
      background: '#0a0a0a',
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 60px)',
      flexShrink: 0,
      animation: 'slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    }}>
      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
      <div style={{
        padding: '1.25rem',
        borderBottom: '1px solid #18181b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fff' }}>AI Editor</div>
            <div style={{ fontSize: '0.75rem', color: '#71717a' }}>Editing: {activeTabTitle}</div>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'transparent', border: 'none', color: '#71717a', cursor: 'pointer', padding: '4px', borderRadius: '4px', display: 'flex', transition: 'color 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
          onMouseLeave={e => e.currentTarget.style.color = '#71717a'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"></path></svg>
        </button>
      </div>

      <div ref={scrollContainerRef} style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#3f3f46' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>✨</div>
            <div style={{ fontWeight: 500, color: '#52525b', marginBottom: '4px', fontSize: '0.9rem' }}>How can I help?</div>
            <div style={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
              Ask me to edit the "{activeTabTitle}" section. For example:
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {['Make it sound more confident', 'Add a bullet list of benefits', 'Rewrite the introduction to be shorter'].map((s, i) => (
                <button
                  key={i}
                  onClick={() => { setInput(s); inputRef.current?.focus(); }}
                  style={{ padding: '8px 12px', background: '#18181b', border: '1px solid #27272a', borderRadius: '8px', color: '#a1a1aa', cursor: 'pointer', fontSize: '0.8rem', textAlign: 'left', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#27272a'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#18181b'; e.currentTarget.style.color = '#a1a1aa'; }}
                >{s}</button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '88%',
              padding: '0.75rem 1rem',
              borderRadius: m.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
              background: m.role === 'user' ? '#18181b' : 'transparent',
              border: m.role === 'user' ? '1px solid #27272a' : 'none',
              color: m.role === 'user' ? '#e4e4e7' : '#a1a1aa',
              fontSize: '0.9rem',
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
              animation: 'fadeIn 0.2s ease-out'
            }}>
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ padding: '0.5rem 1rem', display: 'flex', gap: '6px', alignItems: 'center', opacity: 0.5 }}>
              <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#a1a1aa', animation: 'pulse 1s infinite' }} />
              <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#a1a1aa', animation: 'pulse 1s infinite 0.2s' }} />
              <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#a1a1aa', animation: 'pulse 1s infinite 0.4s' }} />
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: '1rem', borderTop: '1px solid #18181b', background: '#0a0a0a' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tell me what to change..."
            rows={1}
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              background: '#0f0f11',
              border: '1px solid #27272a',
              color: '#e4e4e7',
              borderRadius: '10px',
              outline: 'none',
              fontSize: '0.9rem',
              resize: 'none',
              fontFamily: 'Inter, sans-serif',
              lineHeight: 1.5,
              transition: 'border-color 0.15s',
              maxHeight: '100px',
              overflowY: 'auto'
            }}
            onFocus={e => e.currentTarget.style.borderColor = '#3b82f6'}
            onBlur={e => e.currentTarget.style.borderColor = '#27272a'}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            style={{
              width: '40px',
              height: '40px',
              background: input.trim() ? '#fff' : '#27272a',
              border: 'none',
              borderRadius: '10px',
              cursor: input.trim() ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'opacity 0.15s'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={input.trim() ? '#000' : '#52525b'} strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
