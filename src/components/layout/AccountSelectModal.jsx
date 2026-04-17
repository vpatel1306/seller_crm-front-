import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FiCheck,
  FiDatabase,
  FiEdit2,
  FiFolder,
  FiMonitor,
  FiRefreshCw,
  FiSearch,
  FiTrash2,
  FiX,
} from 'react-icons/fi';
import CommonModal from '../common/CommonModal';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import DataTable from '../ui/DataTable';
import Button from '../ui/Button';
import AccountModal from './AccountModal';

const fmtDate = (d) => {
  if (!d) return '-';
  const dt = new Date(d);
  return Number.isNaN(dt.getTime()) ? d : dt.toLocaleDateString('en-IN');
};

const fmtDateTime = (d) => {
  if (!d) return '-';
  const dt = new Date(d);
  return Number.isNaN(dt.getTime())
    ? d
    : `${dt.toLocaleDateString('en-IN')} ${dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
};

const num = (val) => (val === null || val === undefined || val === '' ? null : Number(val));
const fmtNum = (val) => {
  const n = num(val);
  return n === null ? '-' : n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export default function AccountSelectModal({ isOpen, onClose }) {
  const { activeAccount, setActiveAccount } = useAuth();
  const activeAccountId = activeAccount?.id || null;
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [checked, setChecked] = useState(() => new Set(activeAccountId ? [activeAccountId] : []));
  const [deleting, setDeleting] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [pendingEditedAccountId, setPendingEditedAccountId] = useState(null);
  const activeAccountRef = useRef(activeAccount);
 
  useEffect(() => {
    activeAccountRef.current = activeAccount;
  }, [activeAccount]);

  const fetchAccounts = useCallback(async (preserveActive = true) => {
    setLoading(true);
    try {
      const res = await api.get('/accounts-list/?skip=0&limit=100');
      const list = res.data?.data || [];
      const currentActive = activeAccountRef.current;
      setAccounts(list);

      if (!preserveActive && !currentActive?.id) {
        setActiveAccount(list[0] || null);
      } else if (currentActive?.id) {
        const latestActive = list.find((acc) => acc.id === currentActive.id);
        if (latestActive) {
          setActiveAccount(latestActive);
          setChecked(new Set([latestActive.id]));
        } else if (!latestActive && preserveActive && list.length > 0) {
          setActiveAccount(list[0]);
        }
      }

      if (pendingEditedAccountId) {
        const updatedEditedAccount = list.find((acc) => acc.id === pendingEditedAccountId);
        if (updatedEditedAccount) {
          setChecked(new Set([updatedEditedAccount.id]));
        }
        setPendingEditedAccountId(null);
      }
    } finally {
      setLoading(false);
    }
  }, [pendingEditedAccountId, setActiveAccount]);

  useEffect(() => {
    if (isOpen) {
      fetchAccounts();
    }
  }, [fetchAccounts, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    setChecked(new Set(activeAccountId ? [activeAccountId] : []));
  }, [activeAccountId, isOpen]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return accounts.filter((acc) => (
      (acc.account_name || '').toLowerCase().includes(q) ||
      (acc.person_name || '').toLowerCase().includes(q) ||
      (acc.mobile_no || '').toLowerCase().includes(q) ||
      (acc.gst_no || '').toLowerCase().includes(q) ||
      (acc.marketplace || '').toLowerCase().includes(q)
    ));
  }, [accounts, search]);

  const selectedAcc = checked.size === 1 ? accounts.find((acc) => checked.has(acc.id)) : null;

  const toggleCheck = (id) => {
    setChecked((prev) => (prev.has(id) ? new Set() : new Set([id])));
  };

  const handleOpen = async (acc) => {
    const res = await api.post(`/set-active-account/${acc.id}`);
    const responseAccountId = res.data?.data?.active_account_id || acc.id;
    const responseAccountName = res.data?.data?.account_name || acc.account_name;

    const updatedAcc = { ...acc, id: responseAccountId, account_name: responseAccountName };
    localStorage.setItem('activeAccountId', String(responseAccountId));
    setActiveAccount(updatedAcc);
    onClose();
  };

  const handleDelete = async (account) => {
    if (!account?.id) return;
    const shouldDelete = window.confirm(`Delete account "${account.account_name || 'this account'}"?`);
    if (!shouldDelete) return;

    setDeleting(true);
    try {
      await api.delete(`/account-delete/${account.id}`);

      if (activeAccount?.id === account.id) {
        setActiveAccount(null);
      }

      setChecked(new Set());
      await fetchAccounts();
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = (account) => {
    setEditingAccount(account);
  };

  const columns = [
    {
      key: 'select',
      label: 'Sel',
      className: 'min-w-[72px] md:left-[52px] md:z-20 md:bg-white',
      headerClassName: 'min-w-[72px] md:left-[52px] md:z-30 md:bg-surface-alt/95',
      render: (row) => (
        <div className="flex justify-center">
          <input
            type="radio"
            name="acc-select"
            checked={checked.has(row.id)}
            onChange={(event) => {
              event.stopPropagation();
              toggleCheck(row.id);
            }}
            className="h-4 w-4 accent-primary"
          />
        </div>
      ),
    },
    {
      key: 'account_name',
      label: 'Account Name',
      className: 'min-w-[220px] md:left-[124px] md:z-20 md:bg-white md:shadow-[10px_0_18px_-18px_rgba(15,23,42,0.25)]',
      headerClassName: 'min-w-[220px] md:left-[124px] md:z-30 md:bg-surface-alt/95 md:shadow-[10px_0_18px_-18px_rgba(15,23,42,0.25)]',
      render: (row) => {
        const isActive = activeAccountId === row.id;
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-bold text-text">
              <span>{row.account_name || '-'}</span>
              {isActive ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-[0.65rem] font-extrabold uppercase tracking-[0.16em] text-emerald-700">
                  <FiCheck size={10} />
                  Active
                </span>
              ) : null}
            </div>
            <div className="text-xs text-text-muted">{row.person_name || row.mobile_no || 'No contact info'}</div>
          </div>
        );
      },
    },
    {
      key: 'marketplace',
      label: 'Marketplace',
      className: 'min-w-[120px]',
      render: (row) => row.marketplace ? (
        <span className="rounded-full bg-surface-alt px-3 py-1 text-xs font-bold text-text-muted">{row.marketplace}</span>
      ) : '-',
    },
    {
      key: 'expiry_date',
      label: 'Expiry Date',
      className: 'min-w-[118px]',
      render: (row) => <span className="text-text-muted">{fmtDate(row.expiry_date)}</span>,
    },
    {
      key: 'first_order_date',
      label: 'First Order',
      className: 'min-w-[118px]',
      render: (row) => <span className="text-text-muted">{fmtDate(row.first_order_date ?? row.order_data_from)}</span>,
    },
    {
      key: 'last_order_date',
      label: 'Last Order',
      className: 'min-w-[118px]',
      render: (row) => <span className="text-text-muted">{fmtDate(row.last_order_date)}</span>,
    },
    {
      key: 'orders',
      label: 'Orders',
      right: true,
      className: 'min-w-[92px]',
      render: (row) => <span className="font-bold text-text">{num(row.orders) !== null ? num(row.orders).toLocaleString('en-IN') : '-'}</span>,
    },
    {
      key: 'profit_loss',
      label: 'Account P/L',
      right: true,
      className: 'min-w-[118px]',
      render: (row) => {
        const pl = num(row.profit_loss);
        return pl !== null ? <span className={`font-bold ${pl >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{fmtNum(pl)}</span> : '-';
      },
    },
    {
      key: 'advertisement',
      label: 'Ad Spend',
      right: true,
      className: 'min-w-[108px]',
      render: (row) => <span className="font-bold text-red-500">{num(row.advertisement) !== null ? `-${fmtNum(row.advertisement)}` : '-'}</span>,
    },
    {
      key: 'updated_at',
      label: 'Last Update',
      className: 'min-w-[170px]',
      render: (row) => <span className="text-xs text-text-muted">{fmtDateTime(row.updated_at)}</span>,
    },
    {
      key: 'open_pc_name',
      label: 'Open PC',
      className: 'min-w-[126px]',
      render: (row) => row.open_pc_name ? (
        <span className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-alt px-2.5 py-1 text-[0.7rem] text-text-muted">
          <FiMonitor size={10} />
          {row.open_pc_name}
        </span>
      ) : '-',
    },
    {
      key: 'actions',
      label: 'Action',
      className: 'min-w-[260px] md:sticky md:right-0 md:z-20 md:border-l md:border-border md:bg-white md:shadow-[-12px_0_18px_-18px_rgba(15,23,42,0.28)]',
      headerClassName: 'min-w-[260px] md:sticky md:right-0 md:z-30 md:border-l md:border-border md:bg-surface-alt/95 md:shadow-[-12px_0_18px_-18px_rgba(15,23,42,0.28)]',
      render: (row) => {
        const isActive = activeAccountId === row.id;
        const isDeletingThisRow = deleting && checked.has(row.id);
        return (
          <div className="flex items-center gap-2 bg-inherit">
            <Button
              variant="secondary"
              size="sm"
              className="h-8 rounded-[10px] px-3 text-[0.66rem] tracking-[0.14em]"
              onClick={(event) => {
                event.stopPropagation();
                handleEdit(row);
              }}
            >
              <FiEdit2 size={12} />
              Edit
            </Button>
            <Button
              variant={isActive ? 'outline' : 'primary'}
              size="sm"
              className="h-8 rounded-[10px] px-3 text-[0.66rem] tracking-[0.14em]"
              onClick={(event) => {
                event.stopPropagation();
                handleOpen(row);
              }}
            >
              <FiFolder size={12} />
              {isActive ? 'Active' : 'Open'}
            </Button>
            <Button
              variant="danger"
              size="sm"
              className="h-8 rounded-[10px] px-3 text-[0.66rem] tracking-[0.14em]"
              onClick={(event) => {
                event.stopPropagation();
                setChecked(new Set([row.id]));
                handleDelete(row);
              }}
            >
              <FiTrash2 size={12} />
              {isDeletingThisRow ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <CommonModal
        isOpen={isOpen}
        onClose={onClose}
        title="Change Account"
        size="full"
        headerStyle="gradient"
        showFooter={false}
        customClass="max-w-[1380px]"
      >
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm font-medium text-text-muted">
              Showing {filtered.length} of {accounts.length} accounts
            </div>

            <div className="flex flex-wrap gap-2">
              {/* <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-[16px] bg-purple-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-purple-600/20 transition-all hover:bg-purple-700"
                onClick={() => window.alert('Coming soon')}
              >
                <FiDatabase size={15} />
                Backup DB
              </button> */}
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-[16px] bg-green-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-green-500/20 transition-all hover:bg-green-600"
                onClick={() => fetchAccounts()}
              >
                <FiRefreshCw size={15} />
                Refresh
              </button>
            </div>
          </div>

          <div className="rounded-[24px] border border-border bg-white">
            <div className="border-b border-border p-4">
              <div className="relative">
                <FiSearch size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  className="w-full rounded-[18px] border border-border bg-surface-alt py-3 pl-11 pr-11 text-sm text-text outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                  type="text"
                  placeholder="Search by account name, marketplace, mobile or GST"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
                {search ? (
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted transition-colors hover:text-text"
                    onClick={() => setSearch('')}
                  >
                    <FiX size={16} />
                  </button>
                ) : null}
              </div>
            </div>

            <div className="p-4">
              <DataTable
                columns={columns}
                data={filtered}
                loading={loading}
                loadingText="Loading accounts..."
                emptyText="No accounts found matching your search."
                selectedId={selectedAcc?.id || activeAccountId}
                getRowId={(row) => row.id}
                onRowClick={(row) => toggleCheck(row.id)}
                onRowDoubleClick={handleOpen}
                mobileCardView={false}
                wrapperClassName="rounded-[20px] border border-border"
                tableClassName="min-w-[1580px]"
                headClassName="sticky top-0 z-10 bg-surface-alt/95 text-slate-700 backdrop-blur"
                headerCellClassName="border-b border-border px-3 py-3 text-[0.68rem] font-extrabold uppercase tracking-[0.16em] whitespace-nowrap"
                indexHeaderClassName="w-[52px] border-b border-border px-3 py-3 text-center text-[0.68rem] font-extrabold md:sticky md:left-0 md:z-30 md:bg-surface-alt/95"
                indexCellClassName="w-[52px] px-3 py-3 text-center font-medium text-text-muted md:sticky md:left-0 md:z-20 md:bg-white"
                cellClassName="px-3 py-3 text-sm text-text"
                selectedClass="bg-primary/10 text-text"
                hoverClass="hover:bg-surface-alt"
              />
            </div>

            <div className="border-t border-border bg-white px-4 py-4">
              <div className="text-sm font-medium text-text-muted">Showing {filtered.length} of {accounts.length} accounts</div>
            </div>
          </div>
        </div>
      </CommonModal>

      {editingAccount ? (
        <AccountModal
          mode="edit"
          initialData={editingAccount}
          onClose={() => setEditingAccount(null)}
          onSuccess={() => {
            setPendingEditedAccountId(editingAccount.id);
            setEditingAccount(null);
            fetchAccounts(true);
          }}
        />
      ) : null}
    </>
  );
}
