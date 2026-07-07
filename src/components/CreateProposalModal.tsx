import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Props {
  onClose: () => void;
}

export default function CreateProposalModal({ onClose }: Props) {
  const [clientName, setClientName] = useState('');
  const [website, setWebsite] = useState('');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientName, website, details })
      });

      if (!response.ok) throw new Error('Failed to create proposal');

      const data = await response.json();
      navigate(`/proposal/${data.proposalId}`);
    } catch (err) {
      setError(String(err));
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        background: '#18181b',
        padding: '2.5rem',
        borderRadius: '16px',
        width: '450px',
        border: '1px solid #27272a',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
          <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Create Proposal</h2>
        </div>
        <p style={{ color: '#52525b', fontSize: '0.85rem', marginBottom: '1.5rem' }}>AI will research the client and generate a tailored proposal.</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.8rem', color: '#71717a', fontWeight: 500 }}>Client Name</label>
            <input
              required
              placeholder="e.g. Acme Corp"
              value={clientName}
              onChange={e => setClientName(e.target.value)}
              style={{ padding: '0.75rem', background: '#09090b', border: '1px solid #27272a', color: '#fff', borderRadius: '8px', outline: 'none', transition: 'border-color 0.2s', fontSize: '0.9rem' }}
              onFocus={e => e.currentTarget.style.borderColor = '#3b82f6'}
              onBlur={e => e.currentTarget.style.borderColor = '#27272a'}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.8rem', color: '#71717a', fontWeight: 500 }}>Website</label>
            <input
              placeholder="https://acme.com"
              value={website}
              onChange={e => setWebsite(e.target.value)}
              style={{ padding: '0.75rem', background: '#09090b', border: '1px solid #27272a', color: '#fff', borderRadius: '8px', outline: 'none', transition: 'border-color 0.2s', fontSize: '0.9rem' }}
              onFocus={e => e.currentTarget.style.borderColor = '#3b82f6'}
              onBlur={e => e.currentTarget.style.borderColor = '#27272a'}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.8rem', color: '#71717a', fontWeight: 500 }}>Additional Details</label>
            <textarea
              placeholder="Any specific requirements, budget constraints, timeline..."
              value={details}
              onChange={e => setDetails(e.target.value)}
              style={{ padding: '0.75rem', background: '#09090b', border: '1px solid #27272a', color: '#fff', borderRadius: '8px', outline: 'none', minHeight: '80px', transition: 'border-color 0.2s', resize: 'vertical', fontSize: '0.9rem', fontFamily: 'Inter, sans-serif' }}
              onFocus={e => e.currentTarget.style.borderColor = '#3b82f6'}
              onBlur={e => e.currentTarget.style.borderColor = '#27272a'}
            />
          </div>

          {error && (
            <div style={{ color: '#ef4444', fontSize: '0.85rem' }}>{error}</div>
          )}

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
            <button type="button" onClick={onClose} disabled={submitting} style={{ padding: '0.7rem 1.5rem', background: 'transparent', border: '1px solid #27272a', color: '#a1a1aa', cursor: 'pointer', borderRadius: '8px', fontWeight: 500, transition: 'all 0.2s', fontSize: '0.875rem' }} onMouseEnter={e => { e.currentTarget.style.background = '#27272a'; e.currentTarget.style.color = '#fff'; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#a1a1aa'; }}>Cancel</button>
            <button type="submit" disabled={submitting} style={{ padding: '0.7rem 1.5rem', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', border: 'none', color: '#fff', cursor: submitting ? 'not-allowed' : 'pointer', borderRadius: '8px', fontWeight: 600, fontSize: '0.875rem', transition: 'opacity 0.2s', opacity: submitting ? 0.7 : 1 }} onMouseEnter={e => { if (!submitting) e.currentTarget.style.opacity = '0.9'; }} onMouseLeave={e => { if (!submitting) e.currentTarget.style.opacity = '1'; }}>
              {submitting ? 'Creating...' : 'Generate with AI'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}