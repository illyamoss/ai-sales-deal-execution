import { useEffect, useRef, useCallback } from 'react';

function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const SESSION_KEY = 'proposal_session_id';

function getOrCreateSessionId(proposalId: string): string {
  const key = `${SESSION_KEY}_${proposalId}`;
  const existing = sessionStorage.getItem(key);
  if (existing) return existing;
  const id = generateSessionId();
  sessionStorage.setItem(key, id);
  return id;
}

function sendEvents(events: any[]) {
  if (events.length === 0) return;
  fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ events }),
    keepalive: true
  }).catch(() => {});
}

export function useProposalAnalytics(proposalId: string, tabs: { id: string; title: string }[]) {
  const sessionId = useRef(getOrCreateSessionId(proposalId));
  const activeTabId = useRef('');
  const tabStartTime = useRef(0);
  const hiddenAt = useRef<number | null>(null);
  const hiddenDuration = useRef(0);
  const scrollDepths = useRef<Record<string, number>>({});
  const sessionStarted = useRef(false);

  const flush = useCallback((tabId: string) => {
    if (!tabId || tabStartTime.current === 0) return;

    const elapsed = Date.now() - tabStartTime.current - hiddenDuration.current;
    if (elapsed > 300) {
      sendEvents([{
        proposalId,
        tabId,
        eventType: 'view_duration',
        value: Math.max(0, elapsed),
        sessionId: sessionId.current,
        timestamp: Date.now()
      }]);
    }

    const depth = scrollDepths.current[tabId];
    if (depth != null && depth > 0) {
      sendEvents([{
        proposalId,
        tabId,
        eventType: 'scroll_depth',
        value: depth,
        sessionId: sessionId.current,
        timestamp: Date.now()
      }]);
    }

    hiddenDuration.current = 0;
    tabStartTime.current = 0;
  }, [proposalId]);

  const switchTab = useCallback((newTabId: string) => {
    const prev = activeTabId.current;
    if (prev && prev !== newTabId) {
      flush(prev);
      sendEvents([{
        proposalId,
        tabId: newTabId,
        eventType: 'tab_switch',
        value: 1,
        sessionId: sessionId.current,
        metadata: { from: prev, to: newTabId },
        timestamp: Date.now()
      }]);
    }
    activeTabId.current = newTabId;
    tabStartTime.current = Date.now();
    hiddenDuration.current = 0;
    scrollDepths.current[newTabId] = scrollDepths.current[newTabId] ?? 0;
  }, [flush, proposalId]);

  const trackClick = useCallback((tabId: string) => {
    sendEvents([{
      proposalId,
      tabId,
      eventType: 'click',
      value: 1,
      sessionId: sessionId.current,
      timestamp: Date.now()
    }]);
  }, [proposalId]);

  const trackScrollDepth = useCallback((tabId: string, depth: number) => {
    const prev = scrollDepths.current[tabId] ?? 0;
    if (depth > prev) {
      scrollDepths.current[tabId] = depth;
    }
  }, []);

  useEffect(() => {
    if (!proposalId || tabs.length === 0 || sessionStarted.current) return;
    sessionStarted.current = true;

    sendEvents([{
      proposalId,
      tabId: '',
      eventType: 'session_start',
      value: 1,
      sessionId: sessionId.current,
      timestamp: Date.now()
    }]);
  }, [proposalId, tabs]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        hiddenAt.current = Date.now();
      } else {
        if (hiddenAt.current !== null) {
          hiddenDuration.current += Date.now() - hiddenAt.current;
          hiddenAt.current = null;
        }
      }
    };

    const handleBeforeUnload = () => {
      flush(activeTabId.current);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      flush(activeTabId.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [flush]);

  return { switchTab, trackClick, trackScrollDepth };
}
