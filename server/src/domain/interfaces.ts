import { Client, Proposal, ProposalPage, ProposalTab, AnalyticsEvent, CompanySettings } from './entities';

export interface IStorage {
  connect(): Promise<void>;
  close(): Promise<void>;
}

export interface IProposalStorage extends IStorage {
  createClient(client: Client): Promise<void>;
  createProposal(proposal: Proposal): Promise<void>;
  createProposalPage(page: ProposalPage): Promise<void>;
  createProposalTab(tab: ProposalTab): Promise<void>;
  saveAnalyticsEvent(event: AnalyticsEvent): Promise<void>;
  deleteProposal(id: string): Promise<void>;
  updateProposalTab(id: string, htmlContent: string): Promise<void>;

  getProposals(): Promise<(Proposal & { clientName: string })[]>;
  getProposal(id: string): Promise<Proposal | null>;
  getClient(id: string): Promise<Client | null>;
  getProposalPageByProposalId(proposalId: string): Promise<ProposalPage | null>;
  getProposalTabs(proposalPageId: string): Promise<ProposalTab[]>;
  getAnalytics(proposalId: string): Promise<AnalyticsEvent[]>;

  getCompanySettings(): Promise<CompanySettings | null>;
  saveCompanySettings(settings: CompanySettings): Promise<void>;
}
