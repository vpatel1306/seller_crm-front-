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
    <header className="navbar">
      <span className="navbar-brand">Meesho Seller Insight</span>

      <div className="navbar-right">
       
        {/* Admin Profile — only when logged in */}
        {user && (
          <div className="nav-profile-wrap" ref={profRef}>
            <button
              className="nav-profile-btn"
              onClick={() => setProfOpen((o) => !o)}
            >
              <div className="nav-avatar">{user.name?.[0]?.toUpperCase()}</div>
              <span className="nav-profile-name">{user.name}</span>
              <FiChevronDown size={14} />
            </button>

            {profOpen && (
              <div className="nav-dropdown-menu">
                <div className="nav-dropdown-header">
                  <div className="nav-dropdown-avatar">{user.name?.[0]?.toUpperCase()}</div>
                  <div>
                    <div className="nav-dropdown-name">{user.name}</div>
                    <div className="nav-dropdown-email">{user.email}</div>
                  </div>
                </div>
                <div className="nav-dropdown-divider" />
                <button className="nav-dropdown-item nav-dropdown-logout" onClick={logout}>
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
