import { useLocation, useNavigate } from 'react-router-dom';
import { FiCheck, FiChevronDown, FiLogOut, FiRepeat, FiUser } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import { useEffect, useRef, useState, useCallback } from 'react';
import api from '../../services/api';

const getCompactAccountLabel = (accountName) => {
  if (!accountName) return 'Active Account';
  const firstWord = accountName.trim().split(/\s+/)[0] || accountName;
  return `${firstWord}..`;
};

const ROUTE_TITLES = {
  '/dashboard': 'Executive Dashboard',
  '/account': 'Accounts Identity Master',
  '/sku-list': 'SKU Master',
  '/pick-up-entry': 'Label Pickup Entry',
  '/return-entry-account-wise': 'Return Entry (Account)',
  '/daily-import': 'Daily Import Suite',
  '/sku-report': 'SKU Performance',
  '/all-orders': 'All Orders',
  '/bank-credit-statement': 'Bank Statement',
  '/cancel-pickup': 'Cancel Pickup',
  '/cancelled-orders': 'Cancelled Orders',
  '/out-for-delivery': 'Out For Delivery',
  '/payment-mismatch': 'Payment Mismatch',
  '/payment-details/:platformOrderId': 'Order Deep-Dive',
  '/pending-payment-orders': 'Pending Payments',
  '/received-payment-orders': 'Received Payments',
  '/received-returns': 'Received Returns',
  '/return-mismatch': 'Return Mismatch',
  '/returns-not-received': 'Returns Not Received',
  '/return-in-transit': 'Returns In-Transit',
  '/unsettled-pickup': 'Unsettled Pickup',
  '/ready-to-ship': 'Ready To Ship',
  '/shipped': 'Shipped Orders',
  '/approve-claim': 'Approve Claims',
  '/smart-tickets': 'Smart Ticket Support',
};

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { token, user, logout, fetchUser, activeAccount, setActiveAccount } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const menuRef = useRef(null);
  const accountMenuRef = useRef(null);

  const pageTitle = ROUTE_TITLES[location.pathname] || 'Seller CRM';

  useEffect(() => {
    const handleOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
        setAccountMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const fetchAccounts = useCallback(async () => {
    setLoadingAccounts(true);
    try {
      const res = await api.get('/account-name-list');
      if (res.data?.status) {
        setAccounts(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoadingAccounts(false);
    }
  }, []);

  useEffect(() => {
    if (accountMenuOpen && accounts.length === 0) {
      fetchAccounts();
    }
  }, [accountMenuOpen, accounts.length, fetchAccounts]);

  const handleAccountSelect = async (acc) => {
    if (activeAccount?.id === acc.id) {
      setAccountMenuOpen(false);
      return;
    }
    try {
      const res = await api.post(`/set-active-account/${acc.id}`);
      const updatedAcc = {
        ...acc,
        id: res.data?.data?.active_account_id || acc.id,
        account_name: res.data?.data?.account_name || acc.account_name
      };
      setActiveAccount(updatedAcc);
      setAccountMenuOpen(false);
      navigate('/account');
    } catch (error) {
      console.error('Error setting active account:', error);
    }
  };

  useEffect(() => {
    if (token && !user) {
      fetchUser().catch(() => { });
    }
  }, [token, user, fetchUser]);

  return (
    <header className="sticky top-0 z-[100] w-full border-b border-slate-100 bg-white/80 backdrop-blur-md">
      <div className="flex h-16 w-full items-center justify-between px-6 sm:px-8">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 lg:text-xl">
            {pageTitle}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Account Switcher - Compact on mobile */}
              <div className="relative" ref={accountMenuRef}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                  className={`h-9 gap-2 shadow-sm transition-all ${accountMenuOpen ? 'border-primary bg-primary/5 ring-4 ring-primary/10' : ''}`}
                >
                  <FiRepeat size={14} className="text-primary" />
                  <span className="hidden sm:inline">
                    {activeAccount?.account_name || 'Select Account'}
                  </span>
                  <span className="sm:hidden">
                    {getCompactAccountLabel(activeAccount?.account_name)}
                  </span>
                  <FiChevronDown size={14} className={`transition-transform duration-200 ${accountMenuOpen ? 'rotate-180' : ''}`} />
                </Button>

                {accountMenuOpen && (
                  <div className="absolute right-0 mt-3 w-64 origin-top-right rounded-default border border-slate-200 bg-white p-2 shadow-card animate-slide-up z-[110]">
                    <div className="mb-2 px-3 py-2 border-b border-slate-100">
                      <div className="text-[0.65rem] font-black uppercase tracking-widest text-slate-400">Switch Account</div>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                      {loadingAccounts ? (
                        <div className="flex items-center justify-center py-4">
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                        </div>
                      ) : accounts.length > 0 ? (
                        accounts.map((acc) => (
                          <button
                            key={acc.id}
                            onClick={() => handleAccountSelect(acc)}
                            className={`flex w-full items-center justify-between gap-3 rounded-inner px-3 py-2.5 text-sm font-semibold transition-all hover:bg-slate-50 ${activeAccount?.id === acc.id ? 'bg-primary/5 text-primary' : 'text-slate-600'
                              }`}
                          >
                            <span className="truncate">{acc.account_name}</span>
                            {activeAccount?.id === acc.id && <FiCheck size={16} className="shrink-0" />}
                          </button>
                        ))
                      ) : (
                        <div className="py-4 text-center text-xs text-slate-400 font-medium">No accounts found</div>
                      )}
                    </div>
                    <div className="mt-2 border-t border-slate-100 pt-2 px-1">
                      <button
                        onClick={() => {
                          navigate('/account');
                          setAccountMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-2 rounded-inner px-3 py-2 text-[0.7rem] font-black uppercase tracking-wider text-slate-400 hover:bg-slate-50 hover:text-primary transition-colors"
                      >
                        <FiUser size={14} />
                        Manage Accounts
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile Dropdown */}
              <div className="relative" ref={menuRef}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 overflow-hidden rounded-full p-0 hover:bg-slate-100"
                  onClick={() => setMenuOpen((value) => !value)}
                >
                  <div className="flex h-full w-full items-center justify-center bg-slate-900 text-sm font-bold text-white transition-transform active:scale-95">
                    {user.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                </Button>

                {menuOpen ? (
                  <div className="absolute right-0 mt-3 w-72 origin-top-right rounded-default border border-slate-200 bg-white p-2 shadow-card animate-slide-up">
                    <div className="rounded-inner bg-slate-50 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <FiUser size={18} />
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-bold text-slate-900">{user.name}</div>
                          <div className="truncate text-xs text-slate-500">{user.email}</div>
                        </div>
                      </div>
                      <div className="mt-3 border-t border-slate-200 pt-3">
                        <div className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-400">Active Account</div>
                        <div className="mt-0.5 truncate text-xs font-semibold text-slate-700">
                          {activeAccount?.account_name || 'None'}
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 p-1">
                      <button
                        onClick={logout}
                        className="flex w-full items-center gap-3 rounded-inner px-3 py-2 text-sm font-semibold text-error transition-colors hover:bg-red-50"
                      >
                        <FiLogOut size={16} />
                        Logout Session
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
