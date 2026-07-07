import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PanelRight } from 'lucide-react';
import ProposalTabRenderer from '../components/ProposalTabRenderer';
import AIChatSidebar from '../components/AIChatSidebar';

export default function ProposalView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTabId, setActiveTabId] = useState<string>('');
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [pendingTabChanges, setPendingTabChanges] = useState<Record<string, string>>({});
  const [savingTab, setSavingTab] = useState(false);

  const [generating, setGenerating] = useState(false);
  const [genStatus, setGenStatus] = useState('');
  const [genError, setGenError] = useState('');
  const activeTabIdRef = useRef(activeTabId);
  activeTabIdRef.current = activeTabId;
  const generationStartedRef = useRef(false);
  const fetchProposalRef = useRef<() => void>(() => {});

  const startGeneration = useCallback(async () => {
    if (generationStartedRef.current) return;
    generationStartedRef.current = true;
    setGenerating(true);
    setGenError('');
    setGenStatus('Analyzing client profile...');

    try {
      const response = await fetch(`/api/proposals/${id}/generate`, { method: 'POST' });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data: ')) continue;

          try {
            const event = JSON.parse(trimmed.slice(6));
            if (event.type === 'status') {
              setGenStatus(event.message);
            }
            if (event.type === 'tab') {
              setData((prev: any) => {
                if (!prev) return prev;
                const exists = (prev.tabs || []).some((t: any) => t.id === event.id);
                if (exists) return prev;
                const newTab = { id: event.id, title: event.title, htmlContent: '' };
                return { ...prev, tabs: [...(prev.tabs || []), newTab] };
              });
            }
            if (event.type === 'done') {
              setGenStatus('');
              setGenerating(false);
              fetchProposalRef.current();
              return;
            }
            if (event.type === 'error') {
              setGenError(event.message);
              setGenerating(false);
              return;
            }
          } catch {}
        }
      }
    } catch (err: any) {
      setGenError(err.message || String(err));
      setGenerating(false);
    }
  }, [id]);

  const fetchProposal = useCallback(() => {
    fetch(`/api/proposals/${id}`)
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
        if (d.tabs && d.tabs.length > 0) {
          if (!activeTabIdRef.current) {
            setActiveTabId(d.tabs[0].id);
          }
        } else {
          startGeneration();
        }
      })
      .catch(err => {
        console.error('Failed to fetch proposal:', err);
        setLoading(false);
      });
  }, [id, startGeneration]);

  fetchProposalRef.current = fetchProposal;

  useEffect(() => {
    fetchProposal();
  }, [fetchProposal]);

  const activeTab = data?.tabs?.find((t: any) => t.id === activeTabId);
  const hasPendingChanges = activeTabId && pendingTabChanges[activeTabId] !== undefined;
  const displayHtml = hasPendingChanges ? pendingTabChanges[activeTabId] : activeTab?.htmlContent;

  const handleCopyLink = () => {
    const link = `${window.location.origin}/view/${id}`;
    navigator.clipboard.writeText(link);
    alert('Client link copied to clipboard!');
  };

  const handleSaveTab = async () => {
    if (!hasPendingChanges) return;
    setSavingTab(true);
    try {
      await fetch(`/api/tabs/${activeTabId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ htmlContent: pendingTabChanges[activeTabId] })
      });
      setPendingTabChanges(prev => {
        const next = { ...prev };
        delete next[activeTabId];
        return next;
      });
      fetchProposal();
    } catch (error) {
      console.error(error);
    } finally {
      setSavingTab(false);
    }
  };

  const handleDiscardTab = () => {
    setPendingTabChanges(prev => {
      const next = { ...prev };
      delete next[activeTabId];
      return next;
    });
  };

  const isBusy = loading || generating;

  if (loading) {
    return (
      <div style={{ background: '#0a0a0a', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#52525b' }}>
        <div style={{ width: '24px', height: '24px', border: '2px solid #27272a', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
      </div>
    );
  }

  if (!data) {
    return <div style={{ color: '#fff', padding: '2rem' }}>Something went wrong.</div>;
  }

  return (
    <div style={{ background: '#0a0a0a', height: '100vh', overflow: 'hidden', color: '#fff', display: 'flex', flexDirection: 'column', animation: 'fadeIn 0.2s ease-out' }}>
      <header style={{ padding: '1rem 2rem', borderBottom: '1px solid #27272a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <button onClick={() => navigate('/')} style={{ padding: '0.5rem 1rem', background: 'transparent', color: '#a1a1aa', border: '1px solid #27272a', borderRadius: '4px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = '#a1a1aa'}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"></path></svg> Back
          </button>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flex: 1, justifyContent: 'center' }}>
          <button style={{ padding: '0.5rem 1rem', background: '#27272a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.2s' }}>Proposal</button>
          <button onClick={() => navigate(`/analytics/${id}`)} style={{ padding: '0.5rem 1rem', background: 'transparent', color: '#a1a1aa', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = '#a1a1aa'}>Analytics</button>
        </div>
        
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }} 
            onMouseEnter={() => setIsShareOpen(true)}
            onMouseLeave={() => setIsShareOpen(false)}
          >
            <button style={{ padding: '0.5rem 1rem', background: '#1e1e1e', color: '#fff', border: '1px solid #27272a', borderRadius: '4px', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#27272a'} onMouseLeave={e => e.currentTarget.style.background = '#1e1e1e'}>
              Share
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"></path></svg>
            </button>
            
            {isShareOpen && (
              <div style={{ position: 'absolute', top: '100%', right: 0, paddingTop: '4px', zIndex: 10 }}>
                <div style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '4px', padding: '0.5rem', width: '200px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', animation: 'fadeIn 0.2s ease-out' }}>
                  <button 
                    onClick={handleCopyLink}
                    style={{ width: '100%', padding: '0.5rem', background: 'transparent', color: '#fff', border: 'none', cursor: 'pointer', textAlign: 'left', borderRadius: '4px', transition: 'all 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#27272a'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    Copy to clipboard
                  </button>
                </div>
              </div>
            )}
          </div>

          <div style={{ width: '1px', height: '24px', background: '#27272a', margin: '0 4px' }} />

          <button
            onClick={() => { if (!isBusy) setIsChatOpen(!isChatOpen); }}
            disabled={isBusy}
            style={{
              padding: '0.5rem',
              background: isChatOpen ? '#27272a' : 'transparent',
              color: isBusy ? '#3f3f46' : isChatOpen ? '#fff' : '#a1a1aa',
              border: '1px solid transparent',
              borderRadius: '4px',
              cursor: isBusy ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              opacity: isBusy ? 0.5 : 1,
            }}
            title="Toggle Sidebar"
            onMouseEnter={e => { if (!isBusy && !isChatOpen) { e.currentTarget.style.background = '#18181b'; e.currentTarget.style.color = '#fff'; } }}
            onMouseLeave={e => { if (!isBusy && !isChatOpen) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#a1a1aa'; } }}
          >
            <PanelRight size={18} />
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        <div style={{ width: '250px', borderRight: '1px solid #27272a', padding: '1rem', overflowY: 'auto', flexShrink: 0 }}>
          <h3 style={{ marginBottom: '1rem', color: '#a1a1aa', fontSize: '0.85rem', textTransform: 'uppercase' }}>Tabs</h3>
          {(data.tabs || []).map((t: any, i: number) => {
            const isPending = pendingTabChanges[t.id] !== undefined;
            const isStreaming = generating && !t.htmlContent;
            return (
              <div 
                key={t.id} 
                onClick={() => setActiveTabId(t.id)}
                style={{
                  padding: '0.75rem',
                  cursor: 'pointer',
                  background: t.id === activeTabId ? '#1e1e1e' : 'transparent',
                  borderRadius: '4px',
                  marginBottom: '0.5rem',
                  transition: 'background 0.2s',
                  color: t.id === activeTabId ? '#fff' : '#a1a1aa',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  animation: 'fadeIn 0.3s ease-out',
                }}
                onMouseEnter={e => { if (t.id !== activeTabId) { e.currentTarget.style.background = '#18181b'; e.currentTarget.style.color = '#fff'; } }}
                onMouseLeave={e => { if (t.id !== activeTabId) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#a1a1aa'; } }}
              >
                <span>{t.title}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {isStreaming && (
                    <div style={{
                      width: '4px', height: '4px', borderRadius: '50%',
                      background: '#3b82f6',
                      animation: `pulseGlow 1s ease-in-out ${i * 0.15}s infinite`,
                    }} />
                  )}
                  {isPending && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3b82f6' }} title="Unsaved AI changes" />}
                </div>
              </div>
            );
          })}
          {generating && (!data.tabs || data.tabs.length === 0) && (
            <div style={{ padding: '0.75rem', color: '#52525b', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '14px', height: '14px', border: '2px solid #27272a', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
              {genStatus}
            </div>
          )}
        </div>
        
        <div style={{ flex: 1, padding: '2.5rem 3rem', overflowY: 'auto', position: 'relative', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
          {hasPendingChanges && (
            <div style={{
              position: 'sticky', top: '0', zIndex: 10,
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1.5rem',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              animation: 'fadeIn 0.2s ease-out'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="M12 8v4"></path><path d="M12 16h.01"></path></svg>
                <span style={{ fontSize: '0.9rem', color: '#bfdbfe', fontWeight: 500 }}>You are viewing an AI-edited preview.</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={handleDiscardTab}
                  disabled={savingTab}
                  style={{ padding: '0.4rem 0.8rem', background: 'transparent', border: '1px solid #27272a', color: '#a1a1aa', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#27272a'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#a1a1aa'; }}
                >
                  Discard
                </button>
                <button
                  onClick={handleSaveTab}
                  disabled={savingTab}
                  style={{ padding: '0.4rem 0.8rem', background: '#3b82f6', border: 'none', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', transition: 'opacity 0.2s', opacity: savingTab ? 0.7 : 1 }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  {savingTab ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}
          {displayHtml ? (
            <ProposalTabRenderer html={displayHtml} />
          ) : activeTab?.htmlContent === '' && generating ? (
            <div style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#3f3f46',
              gap: '1rem'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '3px solid #1f1f23',
                borderTopColor: '#3b82f6',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite'
              }} />
              <div style={{ fontSize: '0.9rem', color: '#52525b' }}>Generating &quot;{activeTab?.title}&quot;...</div>
            </div>
          ) : !displayHtml ? (
            <div style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#3f3f46',
              gap: '1rem'
            }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#27272a" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              <div style={{ fontSize: '0.9rem', color: '#52525b', textAlign: 'center' }}>
                {generating ? 'Your proposal is being generated...' : 'Select a tab to view its content'}
              </div>
            </div>
          ) : null}
        </div>
        
        {isChatOpen && activeTab && activeTab.htmlContent && (
          <AIChatSidebar
            proposalId={id!}
            activeTabId={activeTab.id}
            activeTabTitle={activeTab.title}
            onTabUpdate={(tabId, newHTML) => {
              setPendingTabChanges(prev => ({ ...prev, [tabId]: newHTML }));
            }}
            onClose={() => setIsChatOpen(false)}
          />
        )}
      </div>

      {generating && (
        <div style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          zIndex: 100,
        }}>
          <div style={{
            background: '#18181b',
            border: '1px solid #27272a',
            borderRadius: '12px',
            padding: '0.75rem 1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            animation: 'fadeIn 0.3s ease-out',
            maxWidth: '320px',
          }}>
            <div style={{
              width: '18px',
              height: '18px',
              border: '2px solid #27272a',
              borderTopColor: '#3b82f6',
              borderRadius: '50%',
              animation: 'spin 0.7s linear infinite',
              flexShrink: 0
            }} />
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#e4e4e7', marginBottom: '2px' }}>Generating proposal</div>
              <div style={{ fontSize: '0.7rem', color: '#71717a', lineHeight: 1.3 }}>{genStatus}</div>
            </div>
            {genError && (
              <button
                onClick={() => {
                  generationStartedRef.current = false;
                  startGeneration();
                }}
                style={{
                  marginLeft: '4px',
                  padding: '2px 10px',
                  background: 'rgba(239,68,68,0.15)',
                  border: 'none',
                  borderRadius: '4px',
                  color: '#fca5a5',
                  fontSize: '0.7rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                Retry
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}