import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useProposalAnalytics } from '../hooks/useTabAnalytics';
import ProposalTabRenderer from '../components/ProposalTabRenderer';

export default function ClientProposalView() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [activeTabId, setActiveTabId] = useState<string>('');
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/proposals/${id}`)
      .then(res => res.json())
      .then(d => {
        setData(d);
        if (d.tabs?.length > 0) setActiveTabId(d.tabs[0].id);
      })
      .catch(console.error);
  }, [id]);

  const { switchTab, trackClick, trackScrollDepth } = useProposalAnalytics(id || '', data?.tabs ?? []);

  useEffect(() => {
    if (activeTabId) switchTab(activeTabId);
  }, [activeTabId]);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const onScroll = () => {
      const scrolled = el.scrollTop + el.clientHeight;
      const total = el.scrollHeight;
      if (total === 0) return;
      const depth = Math.round((scrolled / total) * 100);
      trackScrollDepth(activeTabId, depth);
    };

    const onClick = () => trackClick(activeTabId);

    el.addEventListener('scroll', onScroll, { passive: true });
    el.addEventListener('click', onClick);
    return () => {
      el.removeEventListener('scroll', onScroll);
      el.removeEventListener('click', onClick);
    };
  }, [activeTabId, trackClick, trackScrollDepth]);

  const activeTab = data?.tabs?.find((t: any) => t.id === activeTabId);

  if (!data) return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a1a1aa' }}>
      Loading...
    </div>
  );

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', color: '#fff', display: 'flex', fontFamily: 'Inter, sans-serif' }}>
      <div style={{
        width: '260px',
        borderRight: '1px solid #18181b',
        padding: '2rem 1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto'
      }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Proposal for</div>
          <div style={{ fontWeight: 600, fontSize: '1rem', color: '#fff' }}>{data.client?.name}</div>
        </div>

        {data.tabs.map((t: any, i: number) => (
          <button
            key={t.id}
            onClick={() => setActiveTabId(t.id)}
            style={{
              padding: '0.6rem 0.75rem',
              cursor: 'pointer',
              background: t.id === activeTabId ? '#1e1e1e' : 'transparent',
              border: 'none',
              borderRadius: '6px',
              color: t.id === activeTabId ? '#fff' : '#71717a',
              textAlign: 'left',
              fontSize: '0.875rem',
              fontWeight: t.id === activeTabId ? 500 : 400,
              transition: 'all 0.15s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseEnter={e => { if (t.id !== activeTabId) e.currentTarget.style.color = '#a1a1aa'; }}
            onMouseLeave={e => { if (t.id !== activeTabId) e.currentTarget.style.color = '#71717a'; }}
          >
            <span style={{ color: '#3f3f46', fontSize: '0.75rem', minWidth: '16px' }}>{i + 1}</span>
            {t.title}
          </button>
        ))}
      </div>

      <div
        ref={contentRef}
        style={{ flex: 1, padding: '3rem 4rem', overflowY: 'auto', maxHeight: '100vh' }}
      >
        {activeTab && (
          <div style={{ maxWidth: '720px' }}>
            <ProposalTabRenderer html={activeTab.htmlContent} />
          </div>
        )}
      </div>
    </div>
  );
}
