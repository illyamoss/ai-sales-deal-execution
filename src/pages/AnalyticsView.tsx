import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, AreaChart, Area, CartesianGrid
} from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

function StatCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div style={{
      background: '#111113',
      border: '1px solid #1f1f23',
      borderRadius: '12px',
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px'
    }}>
      <div style={{ fontSize: '0.75rem', color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      <div style={{ fontSize: '2rem', fontWeight: 700, color: accent || '#fff', lineHeight: 1.2 }}>{value}</div>
      {sub && <div style={{ fontSize: '0.8rem', color: '#71717a', marginTop: '2px' }}>{sub}</div>}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#52525b', marginBottom: '1rem', fontWeight: 600 }}>
      {children}
    </h3>
  );
}

function InsightCard({ icon, title, body, color }: { icon: string; title: string; body: string; color: string }) {
  return (
    <div style={{
      background: '#111113',
      border: `1px solid ${color}33`,
      borderRadius: '10px',
      padding: '1rem 1.25rem',
      display: 'flex',
      gap: '12px',
      alignItems: 'flex-start'
    }}>
      <div style={{ fontSize: '1.25rem', lineHeight: 1 }}>{icon}</div>
      <div>
        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#e4e4e7', marginBottom: '2px' }}>{title}</div>
        <div style={{ fontSize: '0.8rem', color: '#71717a', lineHeight: 1.5 }}>{body}</div>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '8px', padding: '10px 14px', fontSize: '0.8rem', color: '#e4e4e7' }}>
      <div style={{ color: '#a1a1aa', marginBottom: '4px' }}>{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ color: p.color, fontWeight: 600 }}>{p.name}: {p.value}{p.unit || ''}</div>
      ))}
    </div>
  );
};

function formatDuration(ms: number): string {
  if (ms < 1000) return '<1s';
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return rem > 0 ? `${m}m ${rem}s` : `${m}m`;
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const s = Math.floor(diff / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function computeEngagementScore(
  totalTime: number,
  tabsCovered: number,
  totalTabs: number,
  sessions: number,
  avgScrollDepth: number,
  clicks: number
): number {
  const timePts = Math.min(40, Math.round((totalTime / 1000 / 120) * 40));
  const coveragePts = Math.round((tabsCovered / Math.max(totalTabs, 1)) * 25);
  const sessionPts = Math.min(15, sessions * 7);
  const scrollPts = Math.round((avgScrollDepth / 100) * 10);
  const clickPts = Math.min(10, clicks * 2);
  return Math.min(100, timePts + coveragePts + sessionPts + scrollPts + clickPts);
}

function scoreColor(score: number): string {
  if (score >= 70) return '#10b981';
  if (score >= 40) return '#f59e0b';
  return '#ef4444';
}

function scoreLabel(score: number): string {
  if (score >= 70) return 'High Intent';
  if (score >= 40) return 'Moderate';
  return 'Low Engagement';
}

export default function AnalyticsView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [events, setEvents] = useState<any[]>([]);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/proposals/${id}`)
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
    fetch(`/api/analytics/${id}`)
      .then(res => res.json())
      .then(setEvents)
      .catch(console.error);
  }, [id]);

  const analytics = useMemo(() => {
    if (!data || !events.length) return null;

    const tabs: any[] = data.tabs || [];
    const tabMap: Record<string, string> = {};
    tabs.forEach(t => { tabMap[t.id] = t.title; });

    const sessions = new Set(events.filter(e => e.sessionId).map(e => e.sessionId));
    const sessionList = [...sessions];

    const tabStats: Record<string, { time: number; clicks: number; scrollDepth: number; visited: boolean }> = {};
    tabs.forEach(t => {
      tabStats[t.id] = { time: 0, clicks: 0, scrollDepth: 0, visited: false };
    });

    events.forEach(e => {
      if (!tabStats[e.tabId]) return;
      if (e.eventType === 'view_duration') {
        tabStats[e.tabId].time += e.value;
        tabStats[e.tabId].visited = true;
      }
      if (e.eventType === 'click') tabStats[e.tabId].clicks += e.value;
      if (e.eventType === 'scroll_depth' && e.value > tabStats[e.tabId].scrollDepth) {
        tabStats[e.tabId].scrollDepth = e.value;
      }
    });

    const tabBarData = tabs.map((t, i) => ({
      name: t.title,
      time: Math.round(tabStats[t.id].time / 1000),
      clicks: tabStats[t.id].clicks,
      scrollDepth: tabStats[t.id].scrollDepth,
      color: COLORS[i % COLORS.length]
    }));

    const sessionEvents = events.filter(e => e.eventType === 'session_start');
    const totalTime = Object.values(tabStats).reduce((a, b) => a + b.time, 0);
    const totalClicks = Object.values(tabStats).reduce((a, b) => a + b.clicks, 0);
    const tabsCovered = Object.values(tabStats).filter(t => t.visited).length;
    const avgScrollDepth = tabsCovered > 0
      ? Math.round(Object.values(tabStats).filter(t => t.visited).reduce((a, b) => a + b.scrollDepth, 0) / tabsCovered)
      : 0;

    const engagementScore = computeEngagementScore(
      totalTime, tabsCovered, tabs.length, sessionList.length, avgScrollDepth, totalClicks
    );

    const firstSeen = events.length > 0 ? events[0].timestamp : null;
    const lastSeen = events.length > 0 ? events[events.length - 1].timestamp : null;

    const tabSwitches = events.filter(e => e.eventType === 'tab_switch');
    const navigationPath: string[] = [];
    if (tabs.length > 0) navigationPath.push(tabs[0].title);
    tabSwitches.forEach(e => {
      try {
        const meta = typeof e.metadata === 'string' ? JSON.parse(e.metadata) : e.metadata;
        if (meta?.to && tabMap[meta.to]) navigationPath.push(tabMap[meta.to]);
      } catch {}
    });

    const timelineData: { hour: string; sessions: number }[] = [];
    const hourBuckets: Record<string, number> = {};
    sessionEvents.forEach(e => {
      const d = new Date(e.timestamp);
      const key = `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:00`;
      hourBuckets[key] = (hourBuckets[key] || 0) + 1;
    });
    Object.entries(hourBuckets).forEach(([hour, s]) => timelineData.push({ hour, sessions: s }));

    const mostEngagedTab = tabBarData.reduce((a, b) => a.time > b.time ? a : b, tabBarData[0]);
    const leastVisited = tabs.filter(t => !tabStats[t.id].visited).map(t => t.title);

    const insights: { icon: string; title: string; body: string; color: string }[] = [];

    if (mostEngagedTab && mostEngagedTab.time > 0) {
      insights.push({
        icon: '🔥',
        title: `Most time on "${mostEngagedTab.name}"`,
        body: `Client spent ${formatDuration(mostEngagedTab.time * 1000)} on this section — a clear signal of interest. Lead with this in your follow-up.`,
        color: '#f59e0b'
      });
    }
    if (leastVisited.length > 0) {
      insights.push({
        icon: '👁',
        title: `"${leastVisited[0]}" was never opened`,
        body: `This section was skipped entirely. Consider whether it adds value or if it should be moved earlier in the proposal.`,
        color: '#ef4444'
      });
    }
    if (sessionList.length > 1) {
      insights.push({
        icon: '↩️',
        title: `Client returned ${sessionList.length} times`,
        body: 'Multiple visits suggest serious consideration. This is a great time to reach out — they\'re actively reviewing.',
        color: '#10b981'
      });
    }
    if (totalClicks > 10) {
      insights.push({
        icon: '🖱️',
        title: 'High interaction level',
        body: `${totalClicks} clicks detected — client is actively engaging with the content, not just skimming.`,
        color: '#3b82f6'
      });
    }
    if (avgScrollDepth >= 80) {
      insights.push({
        icon: '📖',
        title: 'Deep reading detected',
        body: `Average scroll depth of ${avgScrollDepth}%. Client is thoroughly reading each section they visit.`,
        color: '#8b5cf6'
      });
    }
    if (engagementScore >= 70 && totalTime > 0) {
      insights.push({
        icon: '✅',
        title: 'Strong buying signal',
        body: 'This engagement score indicates the client has seriously reviewed the proposal. Time to close — send a follow-up now.',
        color: '#10b981'
      });
    }

    return {
      tabBarData, tabStats, tabsCovered, totalTime, totalClicks,
      avgScrollDepth, engagementScore, firstSeen, lastSeen,
      sessionList, sessionEvents, timelineData, navigationPath,
      insights
    };
  }, [data, events]);

  if (!data) return (
    <div style={{ background: '#09090b', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a1a1aa', fontFamily: 'Inter, sans-serif' }}>
      Loading...
    </div>
  );

  const noData = !analytics;

  return (
    <div style={{ background: '#09090b', minHeight: '100vh', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        height: '60px',
        borderBottom: '1px solid #18181b',
        position: 'sticky',
        top: 0,
        background: 'rgba(9,9,11,0.85)',
        backdropFilter: 'blur(12px)',
        zIndex: 50
      }}>
        <button onClick={() => navigate('/')} style={{ background: 'transparent', border: '1px solid #27272a', color: '#a1a1aa', padding: '0.4rem 0.9rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', transition: 'color 0.15s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = '#a1a1aa'}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"></path></svg> Back
        </button>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => navigate(`/proposal/${id}`)} style={{ padding: '0.4rem 1rem', background: 'transparent', color: '#71717a', border: 'none', cursor: 'pointer', fontSize: '0.875rem', transition: 'color 0.15s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = '#71717a'}>Proposal</button>
          <button style={{ padding: '0.4rem 1rem', background: '#1e1e1e', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem' }}>Analytics</button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.85rem', color: '#52525b' }}>{data.client?.name}</span>
        </div>
      </header>

      <div style={{ padding: '2.5rem', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '4px' }}>Engagement Analytics</h1>
            <p style={{ color: '#52525b', fontSize: '0.875rem' }}>How {data.client?.name} is interacting with your proposal</p>
          </div>
          {analytics && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: '#52525b' }}>Last seen</div>
              <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{analytics.lastSeen ? timeAgo(analytics.lastSeen) : '—'}</div>
            </div>
          )}
        </div>

        {noData ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#52525b', border: '1px dashed #27272a', borderRadius: '12px' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📊</div>
            <div style={{ fontWeight: 600, marginBottom: '4px', color: '#a1a1aa' }}>No data yet</div>
            <div style={{ fontSize: '0.85rem' }}>Share the client link and start tracking engagement.</div>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ background: '#111113', border: `1px solid ${scoreColor(analytics.engagementScore)}33`, borderRadius: '12px', padding: '1.5rem', gridColumn: 'span 1', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ fontSize: '0.75rem', color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Engagement</div>
                <div style={{ fontSize: '2.25rem', fontWeight: 800, color: scoreColor(analytics.engagementScore), lineHeight: 1 }}>{analytics.engagementScore}</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: scoreColor(analytics.engagementScore), background: `${scoreColor(analytics.engagementScore)}18`, borderRadius: '4px', padding: '2px 6px', alignSelf: 'flex-start' }}>{scoreLabel(analytics.engagementScore)}</div>
              </div>
              <StatCard label="Total Time" value={formatDuration(analytics.totalTime)} sub={`across ${analytics.sessionList.length} visit${analytics.sessionList.length !== 1 ? 's' : ''}`} />
              <StatCard label="Tabs Read" value={`${analytics.tabsCovered} / ${data.tabs.length}`} sub="sections opened" />
              <StatCard label="Avg Scroll" value={`${analytics.avgScrollDepth}%`} sub="reading depth per tab" />
              <StatCard label="Interactions" value={String(analytics.totalClicks)} sub="clicks detected" />
            </div>

            {analytics.insights.length > 0 && (
              <div style={{ marginBottom: '2.5rem' }}>
                <SectionTitle>Deal Signals & Recommendations</SectionTitle>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                  {analytics.insights.map((ins, i) => (
                    <InsightCard key={i} {...ins} />
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
              <div style={{ background: '#111113', border: '1px solid #1f1f23', borderRadius: '12px', padding: '1.5rem' }}>
                <SectionTitle>Time Spent per Section</SectionTitle>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={analytics.tabBarData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f1f23" />
                    <XAxis dataKey="name" tick={{ fill: '#52525b', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#52525b', fontSize: 11 }} axisLine={false} tickLine={false} unit="s" />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                    <Bar dataKey="time" radius={[4, 4, 0, 0]} name="Time" unit="s">
                      {analytics.tabBarData.map((entry: any, index: number) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div style={{ background: '#111113', border: '1px solid #1f1f23', borderRadius: '12px', padding: '1.5rem' }}>
                <SectionTitle>Scroll Depth per Section</SectionTitle>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={analytics.tabBarData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f1f23" />
                    <XAxis dataKey="name" tick={{ fill: '#52525b', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#52525b', fontSize: 11 }} axisLine={false} tickLine={false} unit="%" domain={[0, 100]} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                    <Bar dataKey="scrollDepth" radius={[4, 4, 0, 0]} name="Scroll Depth" unit="%">
                      {analytics.tabBarData.map((entry: any, index: number) => (
                        <Cell key={index} fill={entry.color} fillOpacity={0.8} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {analytics.timelineData.length > 0 && (
              <div style={{ background: '#111113', border: '1px solid #1f1f23', borderRadius: '12px', padding: '1.5rem', marginBottom: '2.5rem' }}>
                <SectionTitle>Visit Activity Timeline</SectionTitle>
                <ResponsiveContainer width="100%" height={140}>
                  <AreaChart data={analytics.timelineData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="sessGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f1f23" />
                    <XAxis dataKey="hour" tick={{ fill: '#52525b', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#52525b', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="sessions" stroke="#3b82f6" fill="url(#sessGrad)" name="Sessions" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {analytics.navigationPath.length > 1 && (
              <div style={{ background: '#111113', border: '1px solid #1f1f23', borderRadius: '12px', padding: '1.5rem', marginBottom: '2.5rem' }}>
                <SectionTitle>Reading Path</SectionTitle>
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                  {analytics.navigationPath.map((tab: string, i: number) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div style={{ background: `${COLORS[i % COLORS.length]}22`, border: `1px solid ${COLORS[i % COLORS.length]}55`, borderRadius: '6px', padding: '4px 12px', fontSize: '0.8rem', color: COLORS[i % COLORS.length], fontWeight: 500 }}>
                        {tab}
                      </div>
                      {i < analytics.navigationPath.length - 1 && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3f3f46" strokeWidth="2"><path d="M9 18l6-6-6-6"></path></svg>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ background: '#111113', border: '1px solid #1f1f23', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #1f1f23' }}>
                <SectionTitle>Section Breakdown</SectionTitle>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #1f1f23' }}>
                    {['Section', 'Time', 'Scroll Depth', 'Clicks', 'Status'].map(h => (
                      <th key={h} style={{ padding: '0.875rem 1.5rem', textAlign: 'left', color: '#52525b', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.tabs.map((t: any, i: number) => {
                    const s = analytics.tabStats[t.id];
                    const visited = s.visited;
                    return (
                      <tr key={t.id} style={{ borderBottom: '1px solid #18181b', transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = '#18181b'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                          <span style={{ fontWeight: 500, color: '#e4e4e7' }}>{t.title}</span>
                        </td>
                        <td style={{ padding: '1rem 1.5rem', color: visited ? '#a1a1aa' : '#3f3f46' }}>{visited ? formatDuration(s.time) : '—'}</td>
                        <td style={{ padding: '1rem 1.5rem' }}>
                          {visited ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ height: '4px', width: '80px', background: '#27272a', borderRadius: '2px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${s.scrollDepth}%`, background: COLORS[i % COLORS.length], transition: 'width 0.5s' }} />
                              </div>
                              <span style={{ color: '#a1a1aa', fontSize: '0.8rem' }}>{s.scrollDepth}%</span>
                            </div>
                          ) : <span style={{ color: '#3f3f46' }}>—</span>}
                        </td>
                        <td style={{ padding: '1rem 1.5rem', color: s.clicks > 0 ? '#a1a1aa' : '#3f3f46' }}>{s.clicks > 0 ? s.clicks : '—'}</td>
                        <td style={{ padding: '1rem 1.5rem' }}>
                          {visited ? (
                            <span style={{ background: '#10b98118', color: '#10b981', border: '1px solid #10b98133', borderRadius: '4px', padding: '2px 8px', fontSize: '0.75rem', fontWeight: 600 }}>Viewed</span>
                          ) : (
                            <span style={{ background: '#3f3f4618', color: '#71717a', border: '1px solid #3f3f4633', borderRadius: '4px', padding: '2px 8px', fontSize: '0.75rem', fontWeight: 600 }}>Skipped</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
