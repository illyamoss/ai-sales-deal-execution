export interface Client {
  id: string;
  name: string;
  website: string;
  details: string;
}

export interface ProposalPage {
  id: string;
  proposalId: string;
}

export interface ProposalTab {
  id: string;
  proposalPageId: string;
  title: string;
  htmlContent: string;
}

export interface Proposal {
  id: string;
  clientId: string;
  createdAt: number;
}

export type AnalyticsEventType =
  | 'session_start'
  | 'view_duration'
  | 'click'
  | 'tab_switch'
  | 'scroll_depth'
  | 'copy'
  | 'link_click';

export interface AnalyticsEvent {
  id: string;
  proposalId: string;
  tabId: string;
  eventType: AnalyticsEventType;
  value: number;
  sessionId: string;
  metadata: string;
  timestamp: number;
}

export interface CompanySettings {
  id: string;
  description: string;
}
