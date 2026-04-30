import { useLocation, useNavigate } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';
import { useCallback } from 'react';

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

export default function Breadcrumbs() {
  const location = useLocation();
  const navigate = useNavigate();

  const getBreadcrumbs = useCallback(() => {
    const path = location.pathname;
    const breadcrumbs = [];

    // Dashboard is always the first breadcrumb if we're not on the dashboard
    if (path !== '/dashboard') {
      breadcrumbs.push({ label: 'Dashboard', path: '/dashboard' });
    }

    let title = ROUTE_TITLES[path];

    // Dynamic route matching
    if (!title) {
      for (const pattern in ROUTE_TITLES) {
        if (pattern.includes(':')) {
          const regex = new RegExp('^' + pattern.replace(/:[^\s/]+/g, '([\\\\w-]+)') + '$');
          if (regex.test(path)) {
            title = ROUTE_TITLES[pattern];
            break;
          }
        }
      }
    }

    if (title) {
      breadcrumbs.push({ label: title, current: true });
    } else if (path === '/dashboard') {
      breadcrumbs.push({ label: 'Dashboard', current: true });
    }

    return breadcrumbs;
  }, [location.pathname]);

  const breadcrumbs = getBreadcrumbs();

  return (
    <nav className="mb-4 flex flex-wrap items-center gap-2 px-1">
      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.label} className="flex items-center gap-2">
          {index > 0 && <FiChevronRight size={12} className="text-slate-300" />}
          {crumb.path && !crumb.current ? (
            <button
              onClick={() => navigate(crumb.path)}
              className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-slate-400 transition-colors hover:text-primary"
            >
              {crumb.label}
            </button>
          ) : (
            <span className={`text-[0.65rem] font-black uppercase tracking-[0.2em] ${crumb.current ? 'text-slate-900' : 'text-slate-400'}`}>
              {crumb.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}
