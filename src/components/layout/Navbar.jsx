import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FiUser, FiLogOut, FiChevronDown } from 'react-icons/fi';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [profOpen, setProfOpen] = useState(false);
  const profRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      const portalBackdrop = document.querySelector('.asm-backdrop');
      if (portalBackdrop && portalBackdrop.contains(e.target)) return;
      if (profRef.current && !profRef.current.contains(e.target)) setProfOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="h-[60px] bg-surface border-b border-border flex items-center justify-between px-6 sticky top-0 z-[100] shadow-sm">
      <span className="text-[1.1rem] font-bold text-primary">Meesho Seller Insight</span>

      <div className="flex items-center gap-4">

        {/* Admin Profile — only when logged in */}
        {user && (
          <div className="relative" ref={profRef}>
            <button
              className="flex items-center gap-2 px-2 py-1.5 rounded-inner hover:bg-bg transition-colors"
              onClick={() => setProfOpen((o) => !o)}
            >
              <div className="w-8 h-8 rounded-full bg-primary text-white text-[0.9rem] font-bold flex items-center justify-center">{user.name?.[0]?.toUpperCase()}</div>
              <span className="text-[0.9rem] font-medium text-text max-md:hidden">{user.name}</span>
              <FiChevronDown size={14} />
            </button>

            {profOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-surface rounded-default shadow-card border border-border p-3 z-[110]">
                <div className="flex items-center gap-3 p-2 mb-2">
                  <div className="w-10 h-10 rounded-full bg-primary text-white text-[1.1rem] font-bold flex items-center justify-center">{user.name?.[0]?.toUpperCase()}</div>
                  <div>
                    <div className="text-[0.95rem] font-bold text-text">{user.name}</div>
                    <div className="text-[0.8rem] text-text-muted">{user.email}</div>
                  </div>
                </div>
                <div className="h-px bg-border my-2" />
                <button className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-inner text-[0.9rem] text-text hover:bg-bg transition-colors text-error hover:bg-[#fef2f2]" onClick={logout}>
                  <FiLogOut size={15} /> Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
