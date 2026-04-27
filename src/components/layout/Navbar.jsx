import { useEffect, useRef, useState } from 'react';
import { FiChevronDown, FiLogOut, FiRepeat, FiUser } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import logoImage from '../../assets/logo.jpg';
import AccountSelectModal from './AccountSelectModal';
import Button from '../ui/Button';

const getCompactAccountLabel = (accountName) => {
  if (!accountName) return 'Active Account';
  const firstWord = accountName.trim().split(/\s+/)[0] || accountName;
  return `${firstWord}..`;
};

export default function Navbar() {
  const { token, user, logout, fetchUser, activeAccount } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAccountSelect, setShowAccountSelect] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  useEffect(() => {
    if (token && !user) {
      fetchUser().catch(() => {});
    }
  }, [token, user, fetchUser]);

  return (
    <header className="sticky top-0 z-[100] w-full border-b border-white/60 bg-white shadow-sm backdrop-blur-xl">
      <div className="grid w-full gap-3 px-4 py-2.5 sm:px-6 sm:py-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:px-8">
        <div className="flex min-w-0 items-center justify-between gap-3 sm:items-center lg:justify-start lg:gap-4">
          <div className="flex h-12 w-[132px] items-center justify-center overflow-hidden rounded-[14px] bg-white px-2 sm:h-14 sm:w-[152px]">
            <img src={logoImage} alt="Seller CRM logo" className="max-h-full w-full object-contain" />
          </div>

          {user ? (
            <div className="relative lg:hidden" ref={menuRef}>
              <div className="flex items-center gap-2">
               
                <Button variant='outline' size='sm' onClick={() => setShowAccountSelect(true)} className="lg:hidden">
                  <FiRepeat size={14} />
                  {getCompactAccountLabel(activeAccount?.account_name)}
                </Button>

                <Button
                  variant="ghost"
                  className="gap-2 px-0 py-0 text-text hover:bg-transparent"
                  onClick={() => setMenuOpen((value) => !value)}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-dark text-xs font-extrabold text-white">
                    {user.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <FiChevronDown size={16} className={`text-text-muted transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
                </Button>
              </div>

              {menuOpen ? (
                <div className="absolute right-0 mt-3 w-[300px] max-w-[calc(100vw-2rem)] rounded-[22px] border border-border bg-surface p-3 shadow-[0_26px_60px_rgba(15,23,42,0.18)]">
                  <div className="rounded-[18px] bg-surface-alt p-4">
                    <div className="mb-2 flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/15 text-primary">
                        <FiUser size={18} />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-extrabold text-text">{user.name}</div>
                        <div className="truncate text-xs text-text-muted">{user.email}</div>
                      </div>
                    </div>
                    <div className="text-xs text-text-muted">Active Account : {activeAccount?.account_name || 'No account selected'}</div>
                  </div>
             
                  <Button
                    variant="delete"
                    className="mt-3 w-full"
                    onClick={logout}
                  >
                    <FiLogOut size={16} />
                    Logout
                  </Button>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-end gap-3">
          {user ? (
            <div className="hidden lg:flex lg:items-center lg:gap-3">
              
              <Button variant="outline" size="sm" onClick={() => setShowAccountSelect(true)}>
                <FiRepeat size={14} />
                {activeAccount?.account_name ? `${activeAccount.account_name}` : 'Active Account'}
              </Button>

              <div className="relative" ref={menuRef}>
                <Button variant="ghost" size="icon" className="bg-transparent hover:bg-transparent" onClick={() => setMenuOpen((value) => !value)}>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-dark text-sm font-extrabold text-white">
                    {user.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                </Button>

                {menuOpen ? (
                  <div className="absolute right-0 mt-3 w-72 rounded-[22px] border border-border bg-surface p-3 shadow-[0_26px_60px_rgba(15,23,42,0.18)]">
                    <div className="rounded-[18px] bg-surface-alt p-4">
                      <div className="mb-2 flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/15 text-primary">
                          <FiUser size={18} />
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-extrabold text-text">{user.name}</div>
                          <div className="truncate text-xs text-text-muted">{user.email}</div>
                        </div>
                      </div>
                      <div className="text-xs text-text-muted"> Active Account : {activeAccount?.account_name || 'No account selected'}</div>
                    </div>
                 
                    <Button
                      variant="delete"
                      className="mt-3 w-full"
                      onClick={logout}
                    >
                      <FiLogOut size={16} />
                      Logout
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <AccountSelectModal isOpen={showAccountSelect} onClose={() => setShowAccountSelect(false)} />
    </header>
  );
}
