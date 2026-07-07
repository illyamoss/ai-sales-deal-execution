import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateProposalModal from '../components/CreateProposalModal';
import CompanySettingsModal from '../components/CompanySettingsModal';

function ProposalCard({ proposal, onDelete, onClick }: {
  proposal: any;
  onDelete: (id: string) => void;
  onClick: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setConfirmDelete(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(prev => !prev);
    setConfirmDelete(false);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirmDelete) {
      onDelete(proposal.id);
    } else {
      setConfirmDelete(true);
    }
  };

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? '#18181b' : '#0f0f11',
        border: '1px solid #1f1f22',
        borderRadius: '16px',
        cursor: 'pointer',
        height: '240px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        transition: 'background 0.2s, border-color 0.2s',
        borderColor: hovered ? '#3f3f46' : '#1f1f22'
      }}
    >
      <div
        ref={menuRef}
        style={{
          position: 'absolute',
          top: '14px',
          right: '14px',
          opacity: hovered || menuOpen ? 1 : 0,
          transition: 'opacity 0.2s',
        }}
      >
        <button
          onClick={handleMenuClick}
          style={{
            background: menuOpen ? '#27272a' : 'transparent',
            border: 'none',
            color: '#a1a1aa',
            cursor: 'pointer',
            padding: '4px 6px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            transition: 'background 0.15s, color 0.15s'
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
          onMouseLeave={e => e.currentTarget.style.color = '#a1a1aa'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="5" r="1"></circle>
            <circle cx="12" cy="12" r="1"></circle>
            <circle cx="12" cy="19" r="1"></circle>
          </svg>
        </button>

        {menuOpen && (
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '4px',
              background: '#18181b',
              border: '1px solid #27272a',
              borderRadius: '8px',
              padding: '4px',
              minWidth: '160px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
              animation: 'fadeIn 0.15s ease-out',
              zIndex: 10
            }}
          >
            <button
              onClick={handleDeleteClick}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: confirmDelete ? 'rgba(239,68,68,0.15)' : 'transparent',
                border: 'none',
                color: '#ef4444',
                cursor: 'pointer',
                borderRadius: '6px',
                textAlign: 'left',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'background 0.15s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}
              onMouseLeave={e => e.currentTarget.style.background = confirmDelete ? 'rgba(239,68,68,0.15)' : 'transparent'}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"></path>
                <path d="M10 11v6M14 11v6"></path>
              </svg>
              {confirmDelete ? 'Click again to confirm' : 'Delete proposal'}
            </button>
          </div>
        )}
      </div>

      <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#fff', padding: '1rem', textAlign: 'center' }}>
        {proposal.clientName}
      </h3>
    </div>
  );
}

export default function Home() {
  const [proposals, setProposals] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [hasSettings, setHasSettings] = useState(true);
  const navigate = useNavigate();

  const fetchSettings = () => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setHasSettings(!!(data && data.description && data.description.trim()));
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchSettings();
    fetch('/api/proposals')
      .then(res => res.json())
      .then(data => setProposals(data))
      .catch(console.error);
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/proposals/${id}`, { method: 'DELETE' });
      setProposals(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateClick = () => {
    if (!hasSettings) {
      alert('Please set your Company Description first so the AI knows what to write about!');
      setIsSettingsOpen(true);
      return;
    }
    setIsModalOpen(true);
  };

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', color: '#fff' }}>

      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        height: '60px',
        borderBottom: '1px solid #18181b',
        position: 'sticky',
        top: 0,
        background: 'rgba(10,10,10,0.8)',
        backdropFilter: 'blur(12px)',
        zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', borderRadius: '8px' }} />
          <span style={{ fontWeight: 600, fontSize: '1rem', letterSpacing: '-0.01em' }}>Proposals</span>
          
          <button
            onClick={() => setIsSettingsOpen(true)}
            title="Edit Company Description"
            style={{
              background: 'transparent',
              border: 'none',
              color: hasSettings ? '#a1a1aa' : '#3b82f6',
              cursor: 'pointer',
              padding: '6px',
              marginLeft: '8px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              position: 'relative',
              transition: 'all 0.2s',
              animation: hasSettings ? 'none' : 'pulse 2s infinite'
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = hasSettings ? '#a1a1aa' : '#3b82f6'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            {!hasSettings && (
              <div style={{ position: 'absolute', top: '2px', right: '2px', width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%', border: '2px solid #0a0a0a' }} />
            )}
          </button>
        </div>
        <button
          onClick={handleCreateClick}
          style={{
            padding: '0.5rem 1.1rem',
            background: '#fff',
            color: '#09090b',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'opacity 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>+</span> New
        </button>
      </header>

      <div style={{ padding: '3rem 2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, 240px)', gap: '1.5rem', justifyContent: 'center' }}>

        <div
          onClick={handleCreateClick}
          style={{
            background: '#0f0f11',
            border: '1.5px dashed #27272a',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            height: '240px',
            color: '#52525b',
            transition: 'border-color 0.2s, background 0.2s, color 0.2s'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#18181b';
            e.currentTarget.style.borderColor = '#3f3f46';
            e.currentTarget.style.color = '#a1a1aa';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = '#0f0f11';
            e.currentTarget.style.borderColor = '#27272a';
            e.currentTarget.style.color = '#52525b';
          }}
        >
          <div style={{ fontSize: '2.5rem', fontWeight: 300, lineHeight: 1, marginBottom: '0.75rem' }}>+</div>
          <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>Create a new proposal</div>
        </div>

        {proposals.map(p => (
          <ProposalCard
            key={p.id}
            proposal={p}
            onDelete={handleDelete}
            onClick={() => navigate(`/proposal/${p.id}`)}
          />
        ))}
      </div>

      {isModalOpen && (
        <CreateProposalModal
          onClose={() => setIsModalOpen(false)}
        />
      )}
      
      {isSettingsOpen && (
        <CompanySettingsModal
          onClose={() => {
            setIsSettingsOpen(false);
            fetchSettings();
          }}
        />
      )}
    </div>
  );
}
