import { useState, useEffect } from 'react';

interface Props {
  onClose: () => void;
}

export default function CompanySettingsModal({ onClose }: Props) {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data?.description) setDescription(data.description);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description })
      });
      onClose();
    } catch (error) {
      console.error(error);
      setSaving(false);
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
        width: '550px',
        border: '1px solid #27272a',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
          <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#fff' }}>Company Description</h2>
        </div>
        <p style={{ color: '#71717a', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          Describe your company, products, and services. The AI will use this to create personalized proposals for each client.
        </p>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#52525b' }}>Loading...</div>
        ) : (
          <>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. We are a digital product studio specializing in web and mobile app development. We serve B2B SaaS companies and help them design, build, and scale their products. Our services include UI/UX design, full-stack development, DevOps, and ongoing support..."
              style={{
                width: '100%',
                minHeight: '200px',
                padding: '1rem',
                background: '#09090b',
                border: '1px solid #27272a',
                color: '#e4e4e7',
                borderRadius: '10px',
                outline: 'none',
                fontSize: '0.9rem',
                lineHeight: 1.7,
                resize: 'vertical',
                transition: 'border-color 0.2s',
                fontFamily: 'Inter, sans-serif'
              }}
              onFocus={e => e.currentTarget.style.borderColor = '#3b82f6'}
              onBlur={e => e.currentTarget.style.borderColor = '#27272a'}
            />
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button
                onClick={onClose}
                style={{ padding: '0.7rem 1.5rem', background: 'transparent', border: '1px solid #27272a', color: '#a1a1aa', cursor: 'pointer', borderRadius: '8px', fontWeight: 500, transition: 'all 0.2s', fontSize: '0.875rem' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#27272a'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#a1a1aa'; }}
              >Cancel</button>
              <button
                onClick={handleSave}
                disabled={saving || !description.trim()}
                style={{
                  padding: '0.7rem 1.5rem',
                  background: description.trim() ? '#3b82f6' : '#27272a',
                  border: 'none',
                  color: '#fff',
                  cursor: description.trim() ? 'pointer' : 'not-allowed',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  transition: 'background 0.2s',
                  opacity: saving ? 0.7 : 1
                }}
              >{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
