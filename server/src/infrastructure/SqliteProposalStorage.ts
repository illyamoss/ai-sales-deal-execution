import sqlite3 from 'sqlite3';
import { IProposalStorage } from '../domain/interfaces';
import { Client, Proposal, ProposalPage, ProposalTab, AnalyticsEvent, CompanySettings } from '../domain/entities';

export class SqliteProposalStorage implements IProposalStorage {
  private db: sqlite3.Database | null = null;

  constructor(private dbFilePath: string) {}

  public async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbFilePath, (err) => {
        if (err) return reject(err);
        this.initializeTables().then(resolve).catch(reject);
      });
    });
  }

  public async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return resolve();
      this.db.close((err) => {
        if (err) return reject(err);
        this.db = null;
        resolve();
      });
    });
  }

  private async initializeTables(): Promise<void> {
    const queries = [
      `CREATE TABLE IF NOT EXISTS clients (
        id TEXT PRIMARY KEY,
        name TEXT,
        website TEXT,
        details TEXT
      )`,
      `CREATE TABLE IF NOT EXISTS proposals (
        id TEXT PRIMARY KEY,
        clientId TEXT,
        createdAt INTEGER,
        FOREIGN KEY(clientId) REFERENCES clients(id)
      )`,
      `CREATE TABLE IF NOT EXISTS proposal_pages (
        id TEXT PRIMARY KEY,
        proposalId TEXT,
        FOREIGN KEY(proposalId) REFERENCES proposals(id)
      )`,
      `CREATE TABLE IF NOT EXISTS proposal_tabs (
        id TEXT PRIMARY KEY,
        proposalPageId TEXT,
        title TEXT,
        htmlContent TEXT,
        FOREIGN KEY(proposalPageId) REFERENCES proposal_pages(id)
      )`,
      `CREATE TABLE IF NOT EXISTS analytics_events (
        id TEXT PRIMARY KEY,
        proposalId TEXT,
        tabId TEXT,
        eventType TEXT,
        value INTEGER,
        sessionId TEXT,
        metadata TEXT,
        timestamp INTEGER,
        FOREIGN KEY(proposalId) REFERENCES proposals(id)
      )`,
      `CREATE TABLE IF NOT EXISTS company_settings (
        id TEXT PRIMARY KEY,
        description TEXT
      )`
    ];

    for (const query of queries) {
      await this.runQuery(query);
    }

    await this.runMigrations();
  }

  private async runMigrations(): Promise<void> {
    await this.runQuery(`ALTER TABLE analytics_events ADD COLUMN sessionId TEXT`).catch(() => {});
    await this.runQuery(`ALTER TABLE analytics_events ADD COLUMN metadata TEXT`).catch(() => {});
  }

  private runQuery(sql: string, params: any[] = []): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject(new Error('Database not connected'));
      this.db.run(sql, params, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  private getQuery<T>(sql: string, params: any[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject(new Error('Database not connected'));
      this.db.all(sql, params, (err, rows) => {
        if (err) return reject(err);
        resolve(rows as T[]);
      });
    });
  }

  public async createClient(client: Client): Promise<void> {
    const sql = `INSERT INTO clients (id, name, website, details) VALUES (?, ?, ?, ?)`;
    await this.runQuery(sql, [client.id, client.name, client.website, client.details]);
  }

  public async createProposal(proposal: Proposal): Promise<void> {
    const sql = `INSERT INTO proposals (id, clientId, createdAt) VALUES (?, ?, ?)`;
    await this.runQuery(sql, [proposal.id, proposal.clientId, proposal.createdAt]);
  }

  public async createProposalPage(page: ProposalPage): Promise<void> {
    const sql = `INSERT INTO proposal_pages (id, proposalId) VALUES (?, ?)`;
    await this.runQuery(sql, [page.id, page.proposalId]);
  }

  public async createProposalTab(tab: ProposalTab): Promise<void> {
    const sql = `INSERT INTO proposal_tabs (id, proposalPageId, title, htmlContent) VALUES (?, ?, ?, ?)`;
    await this.runQuery(sql, [tab.id, tab.proposalPageId, tab.title, tab.htmlContent]);
  }

  public async saveAnalyticsEvent(event: AnalyticsEvent): Promise<void> {
    const sql = `INSERT INTO analytics_events (id, proposalId, tabId, eventType, value, sessionId, metadata, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    await this.runQuery(sql, [
      event.id, event.proposalId, event.tabId, event.eventType,
      event.value, event.sessionId, event.metadata, event.timestamp
    ]);
  }

  public async updateProposalTab(id: string, htmlContent: string): Promise<void> {
    await this.runQuery(`UPDATE proposal_tabs SET htmlContent = ? WHERE id = ?`, [htmlContent, id]);
  }

  public async deleteProposal(id: string): Promise<void> {
    const pages = await this.getQuery<ProposalPage>(`SELECT id FROM proposal_pages WHERE proposalId = ?`, [id]);
    for (const p of pages) {
      await this.runQuery(`DELETE FROM proposal_tabs WHERE proposalPageId = ?`, [p.id]);
    }
    await this.runQuery(`DELETE FROM proposal_pages WHERE proposalId = ?`, [id]);
    await this.runQuery(`DELETE FROM analytics_events WHERE proposalId = ?`, [id]);
    await this.runQuery(`DELETE FROM proposals WHERE id = ?`, [id]);
  }

  public async getProposals(): Promise<(Proposal & { clientName: string })[]> {
    const sql = `
      SELECT p.*, c.name as clientName 
      FROM proposals p
      JOIN clients c ON p.clientId = c.id
      ORDER BY p.createdAt DESC
    `;
    return this.getQuery(sql);
  }

  public async getProposal(id: string): Promise<Proposal | null> {
    const rows = await this.getQuery<Proposal>(`SELECT * FROM proposals WHERE id = ?`, [id]);
    return rows[0] || null;
  }

  public async getClient(id: string): Promise<Client | null> {
    const rows = await this.getQuery<Client>(`SELECT * FROM clients WHERE id = ?`, [id]);
    return rows[0] || null;
  }

  public async getProposalPageByProposalId(proposalId: string): Promise<ProposalPage | null> {
    const rows = await this.getQuery<ProposalPage>(`SELECT * FROM proposal_pages WHERE proposalId = ?`, [proposalId]);
    return rows[0] || null;
  }

  public async getProposalTabs(proposalPageId: string): Promise<ProposalTab[]> {
    return this.getQuery<ProposalTab>(`SELECT * FROM proposal_tabs WHERE proposalPageId = ?`, [proposalPageId]);
  }

  public async getAnalytics(proposalId: string): Promise<AnalyticsEvent[]> {
    return this.getQuery<AnalyticsEvent>(`SELECT * FROM analytics_events WHERE proposalId = ? ORDER BY timestamp ASC`, [proposalId]);
  }

  public async getCompanySettings(): Promise<CompanySettings | null> {
    const rows = await this.getQuery<CompanySettings>(`SELECT * FROM company_settings LIMIT 1`);
    return rows[0] || null;
  }

  public async saveCompanySettings(settings: CompanySettings): Promise<void> {
    await this.runQuery(`DELETE FROM company_settings`);
    await this.runQuery(`INSERT INTO company_settings (id, description) VALUES (?, ?)`, [settings.id, settings.description]);
  }
}
