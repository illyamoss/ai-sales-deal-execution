export function buildIntroductionHTML(clientName: string, website: string): string {
  return `
<style>
  .prop-root { font-family: 'Inter', system-ui, sans-serif; color: #e4e4e7; line-height: 1.8; }
  .prop-root h1 { font-size: 2rem; font-weight: 700; color: #fff; letter-spacing: -0.03em; margin: 0 0 0.5rem; }
  .prop-root h2 { font-size: 1.25rem; font-weight: 600; color: #fff; margin: 2rem 0 0.75rem; }
  .prop-root p { color: #a1a1aa; margin: 0 0 1rem; }
  .prop-root .badge { display: inline-flex; align-items: center; gap: 6px; background: #1e1e1e; border: 1px solid #27272a; border-radius: 999px; padding: 4px 12px; font-size: 0.8rem; color: #a1a1aa; margin-bottom: 1.5rem; }
  .prop-root .badge span { width: 6px; height: 6px; background: #10b981; border-radius: 50%; }
  .prop-root .hero { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); border: 1px solid #1f2d4e; border-radius: 16px; padding: 2.5rem; margin-bottom: 2rem; }
  .prop-root .hero-title { font-size: 2.5rem; font-weight: 800; color: #fff; letter-spacing: -0.04em; line-height: 1.1; margin-bottom: 1rem; }
  .prop-root .hero-title em { font-style: normal; background: linear-gradient(90deg, #3b82f6, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .prop-root .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-top: 2rem; }
  .prop-root .stat { text-align: center; }
  .prop-root .stat-num { font-size: 2rem; font-weight: 700; color: #fff; }
  .prop-root .stat-label { font-size: 0.8rem; color: #52525b; }
  .prop-root .divider { border: none; border-top: 1px solid #27272a; margin: 2rem 0; }
</style>
<div class="prop-root">
  <div class="badge"><span></span> Proposal prepared exclusively for ${clientName}</div>

  <div class="hero">
    <div class="hero-title">We help companies like <em>${clientName}</em><br>grow faster.</div>
    <p>This document outlines our proposed engagement — tailored specifically to your goals. We've designed every section to address your unique challenges and opportunities.</p>
    <div class="stats">
      <div class="stat"><div class="stat-num">150+</div><div class="stat-label">Clients Served</div></div>
      <div class="stat"><div class="stat-num">98%</div><div class="stat-label">Client Satisfaction</div></div>
      <div class="stat"><div class="stat-num">5 yrs</div><div class="stat-label">Industry Experience</div></div>
    </div>
  </div>

  <h2>Why We're the Right Partner</h2>
  <p>We're not a vendor — we're a growth partner. Our approach is built around delivering measurable outcomes, not just deliverables. Every engagement starts with deep understanding of your business, and ends only when we've exceeded your goals.</p>
  <p>We looked at ${website ? `<a href="${website}" style="color:#3b82f6">${website}</a>` : 'your business'} and believe there are significant opportunities to accelerate your growth with the right execution strategy.</p>

  <hr class="divider">
  <p style="color:#52525b; font-size:0.85rem">This proposal is confidential and prepared solely for the use of ${clientName}. Please reach out if you have any questions before reviewing the rest of the sections.</p>
</div>`;
}

export function buildScopeHTML(clientName: string): string {
  return `
<style>
  .prop-root { font-family: 'Inter', system-ui, sans-serif; color: #e4e4e7; line-height: 1.8; }
  .prop-root h1 { font-size: 1.75rem; font-weight: 700; color: #fff; letter-spacing: -0.03em; margin: 0 0 0.5rem; }
  .prop-root h2 { font-size: 1.1rem; font-weight: 600; color: #fff; margin: 2rem 0 0.75rem; }
  .prop-root p { color: #a1a1aa; margin: 0 0 1rem; }
  .prop-root .phase { border: 1px solid #1f1f23; border-radius: 12px; padding: 1.5rem; margin-bottom: 1rem; background: #111113; }
  .prop-root .phase-header { display: flex; align-items: center; gap: 12px; margin-bottom: 0.75rem; }
  .prop-root .phase-num { width: 32px; height: 32px; border-radius: 8px; background: linear-gradient(135deg, #3b82f6, #6366f1); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem; color: #fff; flex-shrink: 0; }
  .prop-root .phase-title { font-weight: 600; color: #fff; }
  .prop-root .phase-duration { margin-left: auto; font-size: 0.78rem; background: #1e1e1e; border: 1px solid #27272a; border-radius: 4px; padding: 2px 8px; color: #71717a; }
  .prop-root ul { list-style: none; padding: 0; margin: 0; }
  .prop-root li { padding: 6px 0 6px 20px; color: #a1a1aa; font-size: 0.9rem; position: relative; }
  .prop-root li::before { content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 6px; height: 6px; border-radius: 50%; background: #3b82f6; }
  .prop-root .not-included { background: #18181b; border: 1px solid #27272a; border-radius: 8px; padding: 1rem 1.25rem; }
  .prop-root .not-included li::before { background: #ef4444; }
</style>
<div class="prop-root">
  <h1>Scope of Work</h1>
  <p>Tailored specifically for ${clientName}. Our engagement is structured in three clear phases, each with defined deliverables and timelines.</p>

  <div class="phase">
    <div class="phase-header">
      <div class="phase-num">1</div>
      <div class="phase-title">Discovery & Strategy</div>
      <div class="phase-duration">Weeks 1–2</div>
    </div>
    <ul>
      <li>Stakeholder interviews and requirements gathering</li>
      <li>Competitive landscape analysis</li>
      <li>Current-state audit and gap analysis</li>
      <li>Technical architecture review</li>
      <li>Delivery of Strategy Document & Roadmap</li>
    </ul>
  </div>

  <div class="phase">
    <div class="phase-header">
      <div class="phase-num">2</div>
      <div class="phase-title">Design & Build</div>
      <div class="phase-duration">Weeks 3–10</div>
    </div>
    <ul>
      <li>UI/UX design with two rounds of revisions</li>
      <li>Frontend and backend development</li>
      <li>Third-party integrations</li>
      <li>Weekly progress updates and demo sessions</li>
      <li>QA and cross-browser/device testing</li>
    </ul>
  </div>

  <div class="phase">
    <div class="phase-header">
      <div class="phase-num">3</div>
      <div class="phase-title">Launch & Handover</div>
      <div class="phase-duration">Weeks 11–12</div>
    </div>
    <ul>
      <li>Production deployment</li>
      <li>Team training and onboarding sessions</li>
      <li>Documentation and knowledge transfer</li>
      <li>30-day post-launch support included</li>
    </ul>
  </div>

  <h2>Not Included in this Scope</h2>
  <div class="not-included">
    <ul>
      <li>Third-party software licensing fees</li>
      <li>Infrastructure / hosting costs</li>
      <li>Ongoing maintenance beyond the 30-day period</li>
    </ul>
  </div>
</div>`;
}

export function buildPricingHTML(clientName: string): string {
  return `
<style>
  .prop-root { font-family: 'Inter', system-ui, sans-serif; color: #e4e4e7; line-height: 1.8; }
  .prop-root h1 { font-size: 1.75rem; font-weight: 700; color: #fff; letter-spacing: -0.03em; margin: 0 0 0.5rem; }
  .prop-root h2 { font-size: 1.1rem; font-weight: 600; color: #fff; margin: 2rem 0 0.75rem; }
  .prop-root p { color: #a1a1aa; margin: 0 0 1rem; }
  .prop-root .pricing-table { border: 1px solid #1f1f23; border-radius: 12px; overflow: hidden; margin-bottom: 1.5rem; }
  .prop-root .pricing-row { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem; border-bottom: 1px solid #18181b; }
  .prop-root .pricing-row:last-child { border-bottom: none; }
  .prop-root .pricing-row.total { background: #111113; }
  .prop-root .pricing-row.total .label { font-weight: 700; color: #fff; }
  .prop-root .pricing-row.total .amount { font-size: 1.5rem; font-weight: 800; color: #fff; }
  .prop-root .label { color: #a1a1aa; font-size: 0.9rem; }
  .prop-root .amount { color: #fff; font-weight: 600; }
  .prop-root .highlight { background: linear-gradient(135deg, #1a1f35, #1a2535); border: 1px solid #1f3a6e; border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem; }
  .prop-root .highlight-title { font-weight: 700; color: #3b82f6; margin-bottom: 0.25rem; }
  .prop-root .timeline { display: flex; gap: 1rem; margin-top: 1.5rem; }
  .prop-root .timeline-item { flex: 1; background: #111113; border: 1px solid #1f1f23; border-radius: 10px; padding: 1rem; text-align: center; }
  .prop-root .timeline-item .pct { font-size: 1.25rem; font-weight: 700; color: #fff; }
  .prop-root .timeline-item .desc { font-size: 0.78rem; color: #52525b; }
  .prop-root .guarantee { border: 1px solid #10b98133; background: #10b98110; border-radius: 10px; padding: 1rem 1.25rem; display: flex; gap: 10px; align-items: flex-start; }
  .prop-root .guarantee .icon { font-size: 1.25rem; flex-shrink: 0; line-height: 1.4; }
</style>
<div class="prop-root">
  <h1>Investment & Pricing</h1>
  <p>A transparent breakdown of your investment in this engagement with ${clientName}. All prices are in USD.</p>

  <div class="highlight">
    <div class="highlight-title">✦ Fixed Price Engagement</div>
    <p style="margin:0; color:#a1a1aa; font-size:0.9rem">No hourly billing surprises. We work on a fixed-scope, fixed-price model so you always know exactly what you're paying for.</p>
  </div>

  <div class="pricing-table">
    <div class="pricing-row">
      <span class="label">Phase 1 — Discovery & Strategy</span>
      <span class="amount">$3,000</span>
    </div>
    <div class="pricing-row">
      <span class="label">Phase 2 — Design & Build</span>
      <span class="amount">$18,000</span>
    </div>
    <div class="pricing-row">
      <span class="label">Phase 3 — Launch & Handover</span>
      <span class="amount">$4,000</span>
    </div>
    <div class="pricing-row">
      <span class="label">30-Day Post-Launch Support</span>
      <span class="amount" style="color:#10b981">Included</span>
    </div>
    <div class="pricing-row total">
      <span class="label">Total Investment</span>
      <span class="amount">$25,000</span>
    </div>
  </div>

  <h2>Payment Schedule</h2>
  <div class="timeline">
    <div class="timeline-item">
      <div class="pct">40%</div>
      <div class="desc">On contract signing</div>
    </div>
    <div class="timeline-item">
      <div class="pct">40%</div>
      <div class="desc">At Phase 2 kickoff</div>
    </div>
    <div class="timeline-item">
      <div class="pct">20%</div>
      <div class="desc">On final delivery</div>
    </div>
  </div>

  <h2 style="margin-top:2rem">Our Guarantee</h2>
  <div class="guarantee">
    <div class="icon">🛡️</div>
    <div>
      <div style="font-weight:600; color:#10b981; margin-bottom:2px">Satisfaction Guaranteed</div>
      <div style="color:#a1a1aa; font-size:0.875rem">If we don't deliver what we've scoped, we'll make it right — no questions asked. We stake our reputation on every project we take on.</div>
    </div>
  </div>
</div>`;
}

export function buildTimelineHTML(): string {
  return `
<style>
  .prop-root { font-family: 'Inter', system-ui, sans-serif; color: #e4e4e7; line-height: 1.8; }
  .prop-root h1 { font-size: 1.75rem; font-weight: 700; color: #fff; letter-spacing: -0.03em; margin: 0 0 0.5rem; }
  .prop-root p { color: #a1a1aa; margin: 0 0 1rem; }
  .prop-root .tl { position: relative; padding-left: 2rem; }
  .prop-root .tl::before { content: ''; position: absolute; left: 11px; top: 0; bottom: 0; width: 2px; background: linear-gradient(to bottom, #3b82f6, #6366f1, #8b5cf6); border-radius: 2px; }
  .prop-root .tl-item { position: relative; margin-bottom: 2rem; }
  .prop-root .tl-dot { position: absolute; left: -2rem; top: 4px; width: 12px; height: 12px; border-radius: 50%; background: #3b82f6; border: 2px solid #09090b; box-shadow: 0 0 0 3px #3b82f633; }
  .prop-root .tl-week { font-size: 0.75rem; color: #3b82f6; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px; }
  .prop-root .tl-title { font-size: 1rem; font-weight: 600; color: #fff; margin-bottom: 4px; }
  .prop-root .tl-desc { font-size: 0.875rem; color: #71717a; }
  .prop-root .tl-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 8px; }
  .prop-root .tag { font-size: 0.72rem; padding: 2px 8px; border-radius: 4px; font-weight: 500; }
  .prop-root .tag.blue { background: #1e3a5f; color: #3b82f6; }
  .prop-root .tag.purple { background: #2d1f5e; color: #8b5cf6; }
  .prop-root .tag.green { background: #14321a; color: #10b981; }
</style>
<div class="prop-root">
  <h1>Project Timeline</h1>
  <p>A 12-week delivery plan from kickoff to go-live.</p>

  <div class="tl">
    <div class="tl-item">
      <div class="tl-dot"></div>
      <div class="tl-week">Weeks 1–2</div>
      <div class="tl-title">Discovery & Kickoff</div>
      <div class="tl-desc">Stakeholder interviews, requirements alignment, technical audit, and project setup.</div>
      <div class="tl-tags"><span class="tag blue">Strategy</span><span class="tag blue">Research</span></div>
    </div>
    <div class="tl-item">
      <div class="tl-dot" style="background:#6366f1"></div>
      <div class="tl-week">Weeks 3–4</div>
      <div class="tl-title">Design & Prototyping</div>
      <div class="tl-desc">Wireframes, UI mockups, design system, and interactive prototype for feedback.</div>
      <div class="tl-tags"><span class="tag purple">Design</span><span class="tag purple">UX</span></div>
    </div>
    <div class="tl-item">
      <div class="tl-dot" style="background:#8b5cf6"></div>
      <div class="tl-week">Weeks 5–10</div>
      <div class="tl-title">Development Sprint</div>
      <div class="tl-desc">Iterative 2-week sprints. Weekly demos. Frontend, backend, integrations, and testing.</div>
      <div class="tl-tags"><span class="tag purple">Engineering</span><span class="tag purple">QA</span></div>
    </div>
    <div class="tl-item">
      <div class="tl-dot" style="background:#10b981"></div>
      <div class="tl-week">Weeks 11–12</div>
      <div class="tl-title">Launch & Handover</div>
      <div class="tl-desc">Production deployment, team training, documentation handover, and 30-day support begins.</div>
      <div class="tl-tags"><span class="tag green">Launch</span><span class="tag green">Support</span></div>
    </div>
  </div>
</div>`;
}

export function buildAboutHTML(): string {
  return `
<style>
  .prop-root { font-family: 'Inter', system-ui, sans-serif; color: #e4e4e7; line-height: 1.8; }
  .prop-root h1 { font-size: 1.75rem; font-weight: 700; color: #fff; letter-spacing: -0.03em; margin: 0 0 0.5rem; }
  .prop-root h2 { font-size: 1.1rem; font-weight: 600; color: #fff; margin: 2rem 0 0.75rem; }
  .prop-root p { color: #a1a1aa; margin: 0 0 1rem; }
  .prop-root .team { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem; }
  .prop-root .member { background: #111113; border: 1px solid #1f1f23; border-radius: 12px; padding: 1.25rem; }
  .prop-root .avatar { width: 44px; height: 44px; border-radius: 10px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); display: flex; align-items: center; justify-content: center; font-weight: 700; color: #fff; font-size: 1.1rem; margin-bottom: 0.75rem; }
  .prop-root .member-name { font-weight: 600; color: #fff; font-size: 0.95rem; }
  .prop-root .member-role { font-size: 0.8rem; color: #52525b; }
  .prop-root .values { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.75rem; }
  .prop-root .value { background: #111113; border: 1px solid #1f1f23; border-radius: 10px; padding: 1rem; text-align: center; }
  .prop-root .value-icon { font-size: 1.5rem; margin-bottom: 4px; }
  .prop-root .value-label { font-size: 0.8rem; font-weight: 600; color: #a1a1aa; }
</style>
<div class="prop-root">
  <h1>About Us</h1>
  <p>We're a boutique product studio specialising in building digital products that scale. Founded in 2019, we've worked with startups, scale-ups, and enterprise teams across 20+ countries.</p>

  <h2>Meet the Team</h2>
  <div class="team">
    <div class="member">
      <div class="avatar">JD</div>
      <div class="member-name">Jane Doe</div>
      <div class="member-role">Founder & Strategy Lead</div>
    </div>
    <div class="member">
      <div class="avatar">MS</div>
      <div class="member-name">Mark Smith</div>
      <div class="member-role">Head of Engineering</div>
    </div>
    <div class="member">
      <div class="avatar">AK</div>
      <div class="member-name">Anna Kim</div>
      <div class="member-role">Lead Designer</div>
    </div>
    <div class="member">
      <div class="avatar">TP</div>
      <div class="member-name">Tom Park</div>
      <div class="member-role">Client Success</div>
    </div>
  </div>

  <h2>Our Values</h2>
  <div class="values">
    <div class="value"><div class="value-icon">🎯</div><div class="value-label">Outcome-first</div></div>
    <div class="value"><div class="value-icon">🔍</div><div class="value-label">Transparent</div></div>
    <div class="value"><div class="value-icon">⚡</div><div class="value-label">Move fast</div></div>
  </div>
</div>`;
}

export function buildNextStepsHTML(clientName: string): string {
  return `
<style>
  .prop-root { font-family: 'Inter', system-ui, sans-serif; color: #e4e4e7; line-height: 1.8; }
  .prop-root h1 { font-size: 1.75rem; font-weight: 700; color: #fff; letter-spacing: -0.03em; margin: 0 0 0.5rem; }
  .prop-root p { color: #a1a1aa; margin: 0 0 1rem; }
  .prop-root .step { display: flex; gap: 1rem; padding: 1.25rem; border: 1px solid #1f1f23; border-radius: 12px; margin-bottom: 0.75rem; align-items: flex-start; background: #111113; transition: border-color 0.2s; }
  .prop-root .step-num { width: 36px; height: 36px; border-radius: 8px; background: linear-gradient(135deg, #3b82f6, #6366f1); display: flex; align-items: center; justify-content: center; font-weight: 700; color: #fff; flex-shrink: 0; }
  .prop-root .step-body {}
  .prop-root .step-title { font-weight: 600; color: #fff; margin-bottom: 2px; }
  .prop-root .step-desc { font-size: 0.875rem; color: #71717a; }
  .prop-root .cta-box { background: linear-gradient(135deg, #1a1f35, #1a2535); border: 1px solid #1f3a6e; border-radius: 14px; padding: 2rem; text-align: center; margin-top: 2rem; }
  .prop-root .cta-title { font-size: 1.25rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem; }
  .prop-root .cta-sub { color: #52525b; font-size: 0.875rem; margin-bottom: 1.5rem; }
</style>
<div class="prop-root">
  <h1>Next Steps</h1>
  <p>Here's how we get started once ${clientName} is ready to move forward.</p>

  <div class="step">
    <div class="step-num">1</div>
    <div class="step-body">
      <div class="step-title">Review this Proposal</div>
      <div class="step-desc">Take your time to go through each section. Note any questions or adjustments you'd like to discuss.</div>
    </div>
  </div>

  <div class="step">
    <div class="step-num">2</div>
    <div class="step-body">
      <div class="step-title">Schedule a Call</div>
      <div class="step-desc">Book a 30-minute alignment call with us to answer any questions and agree on final scope.</div>
    </div>
  </div>

  <div class="step">
    <div class="step-num">3</div>
    <div class="step-body">
      <div class="step-title">Sign the Agreement</div>
      <div class="step-desc">We'll send a simple contract for digital signing via DocuSign. No lengthy legal processes.</div>
    </div>
  </div>

  <div class="step">
    <div class="step-num">4</div>
    <div class="step-body">
      <div class="step-title">Kickoff Week 1</div>
      <div class="step-desc">First payment initiates the project. We'll schedule the kickoff meeting and you'll meet your dedicated team.</div>
    </div>
  </div>

  <div class="cta-box">
    <div class="cta-title">Ready to get started?</div>
    <div class="cta-sub">We're excited about the opportunity to work with ${clientName}. Let's build something great together.</div>
    <div style="color:#3b82f6; font-weight:600; font-size:0.9rem">→ Reach out to schedule your kickoff call</div>
  </div>
</div>`;
}
