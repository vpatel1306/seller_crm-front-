import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    FiEdit2,
    FiMonitor,
    FiPlus,
    FiRefreshCw,
    FiSearch,
    FiTrash2,
    FiX,
    FiCheckCircle
} from 'react-icons/fi';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import DataTable from '../ui/DataTable';
import Button from '../ui/Button';
import AccountModal from '../layout/AccountModal';
import ConfirmModal from '../common/ConfirmModal';


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

function ActiveStatusToggle({ isActive, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            style={{ borderRadius: '999px' }}
            className={`relative inline-flex h-5 w-[36px] items-center rounded-full px-1 text-[0.65rem] font-bold uppercase text-white shadow transition-all duration-200 active:scale-[0.95] ${isActive
                    ? 'justify-start bg-gradient-to-b from-primary to-primary-hover shadow-primary/20'
                    : 'justify-end bg-gradient-to-b from-slate-400 to-slate-500 shadow-slate-200'
                }`}
        >
            <span
                style={{ borderRadius: '999px' }}
                className={`pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-white shadow transition-all duration-200 ${isActive ? 'right-0.5' : 'left-0.5'
                    }`}
            />
        </button>
    );
}

export default function AccountList({ isStandalone = false }) {
    const { activeAccount, setActiveAccount } = useAuth();
    const activeAccountId = activeAccount?.id || null;
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [checked, setChecked] = useState(() => new Set(activeAccountId ? [activeAccountId] : []));
    const [deleting, setDeleting] = useState(false);
    const [editingAccount, setEditingAccount] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [accountToDelete, setAccountToDelete] = useState(null);
    const [pendingEditedAccountId, setPendingEditedAccountId] = useState(null);

    const activeAccountRef = useRef(activeAccount);

    useEffect(() => {
        activeAccountRef.current = activeAccount;
    }, [activeAccount]);

    const fetchAccounts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/accounts-list/?skip=0&limit=100');
            const list = res.data?.data || [];
            const currentActive = activeAccountRef.current;
            setAccounts(list);

            if (currentActive?.id) {
                const latestActive = list.find((acc) => acc.id === currentActive.id);
                if (latestActive) {
                    setActiveAccount(latestActive);
                    setChecked(new Set([latestActive.id]));
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
        fetchAccounts();
    }, [fetchAccounts]);

    useEffect(() => {
        setChecked(new Set(activeAccountId ? [activeAccountId] : []));
    }, [activeAccountId]);

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

    const handleOpen = async (acc) => {
        if (!acc?.id) return;
        setChecked(new Set([acc.id]));
        if (activeAccountId === acc.id) return;

        const res = await api.post(`/set-active-account/${acc.id}`);
        const responseAccountId = res.data?.data?.active_account_id || acc.id;
        const responseAccountName = res.data?.data?.account_name || acc.account_name;

        const updatedAcc = { ...acc, id: responseAccountId, account_name: responseAccountName };
        localStorage.setItem('activeAccountId', String(responseAccountId));
        setActiveAccount(updatedAcc);
    };

    const handleAccountStatusToggle = async (acc) => {
        if (!acc?.id) return;
        const nextStatus = Number(acc.is_active) === 1 ? 0 : 1;
        await api.post(`/account-status/${acc.id}`, { is_active: nextStatus });
        setAccounts((prev) => prev.map((item) => (
            item.id === acc.id ? { ...item, is_active: nextStatus } : item
        )));
        if (activeAccountId === acc.id) {
            setActiveAccount({ ...acc, is_active: nextStatus });
        }
    };

    const handleDelete = async () => {
        if (!accountToDelete?.id) return;
        const account = accountToDelete;
        
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
            setAccountToDelete(null);
        }
    };


    const columns = [
        {
            key: 'select',
            label: 'Selected',
            className: 'w-[100px]',
            render: (row) => (
                <div className="flex justify-center">
                    {checked.has(row.id) ? (
                        <div className="flex items-center gap-2 text-primary">
                            <FiCheckCircle size={18} />
                            <span className="text-[0.65rem] font-bold uppercase tracking-widest">Active</span>
                        </div>
                    ) : (
                        <button
                            onClick={(e) => { e.stopPropagation(); handleOpen(row); }}
                            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[0.65rem] font-bold uppercase text-slate-500 transition-all hover:bg-primary hover:text-white hover:border-primary"
                        >
                            Select
                        </button>
                    )}
                </div>
            ),
        },
        {
            key: 'account_name',
            label: 'Account Identity',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-bold text-slate-900">{row.account_name || '-'}</span>
                    <span className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-400">{row.person_name || 'Individual'}</span>
                </div>
            ),
        },
        {
            key: 'marketplace',
            label: 'Platform',
            render: (row) => row.marketplace ? (
                <span className="rounded-inner bg-slate-100 px-3 py-1 text-[0.65rem] font-black uppercase text-slate-600 ring-1 ring-inset ring-slate-200">{row.marketplace}</span>
            ) : '-',
        },
        {
            key: 'orders',
            label: 'Lifetime Orders',
            right: true,
            render: (row) => <span className="font-black text-slate-950">{num(row.orders) !== null ? num(row.orders).toLocaleString('en-IN') : '-'}</span>,
        },
        {
            key: 'profit_loss',
            label: 'P&L Analytics',
            right: true,
            render: (row) => {
                const pl = num(row.profit_loss);
                return pl !== null ? <span className={`font-black tabular-nums ${pl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{fmtNum(pl)}</span> : '-';
            },
        },
        {
            key: 'updated_at',
            label: 'Last Sync',
            render: (row) => <span className="text-[0.65rem] font-bold text-slate-400 uppercase leading-tight">{fmtDateTime(row.updated_at)}</span>,
        },
        {
            key: 'account_active',
            label: 'Operation State',
            className: 'w-[140px]',
            render: (row) => (
                <div className="flex items-center justify-center gap-3">
                    <span className={`text-[0.65rem] font-black uppercase tracking-wider ${Number(row.is_active) === 1 ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {Number(row.is_active) === 1 ? 'Online' : 'Offline'}
                    </span>
                    <ActiveStatusToggle
                        isActive={Number(row.is_active) === 1}
                        onClick={(event) => {
                            event.stopPropagation();
                            handleAccountStatusToggle(row);
                        }}
                    />
                </div>
            ),
        },
        {
            key: 'actions',
            label: 'Control',
            className: 'w-[120px]',
            render: (row) => {
                const isDeletingThisRow = deleting && checked.has(row.id);
                return (
                    <div className="flex items-center justify-center gap-1.5">
                        <Button
                            variant="edit"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(event) => {
                                event.stopPropagation();
                                setEditingAccount(row);
                            }}
                        >
                            <FiEdit2 size={13} />
                        </Button>
                        <Button
                            variant="delete"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(event) => {
                                event.stopPropagation();
                                setAccountToDelete(row);
                            }}

                        >
                            <FiTrash2 size={13} />
                        </Button>
                        {isDeletingThisRow ? <span className="text-[0.55rem] font-black text-rose-500 uppercase">...</span> : null}
                    </div>
                );
            },
        },
    ];

    return (
        <div className={`flex flex-col h-full ${isStandalone ? 'p-2' : ''}`}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
                <div>
                    <h1 className="text-xl font-black text-slate-900 tracking-tight">Marketplace Accounts</h1>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">Manage credentials and sync status for {accounts.length} linked accounts</p>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="refresh" size='sm' onClick={fetchAccounts} isLoading={loading}>
                        <FiRefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                        <span className="ml-1">Sync List</span>
                    </Button>
                    <Button variant="create" size='sm' onClick={() => setIsAddModalOpen(true)}>
                        <FiPlus size={16} />
                        <span className="ml-1">New Account</span>
                    </Button>
                </div>
            </div>

            <div className="flex-1 flex flex-col min-h-0 bg-white rounded-default border border-slate-200 overflow-hidden shadow-soft">
                <div className="p-4 border-b border-slate-100 bg-slate-50/30">
                    <div className="relative">
                        <FiSearch size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            className="w-full rounded-inner border border-slate-200 bg-white py-2.5 pl-11 pr-11 text-sm text-slate-900 outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                            type="text"
                            placeholder="Search by account identity, platform, mobile or GST..."
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                        />
                        {search && (
                            <button
                                type="button"
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                onClick={() => setSearch('')}
                            >
                                <FiX size={16} />
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex-1 min-h-0 overflow-hidden">
                    <DataTable
                        columns={columns}
                        data={filtered}
                        loading={loading}
                        getRowId={(row) => row.id}
                        onRowClick={handleOpen}
                        wrapperClassName="h-full"
                        tableClassName="min-w-[1000px]"
                        headerCellClassName="px-4 py-3 bg-slate-50/80 text-[0.62rem] font-black uppercase tracking-[0.2em] text-slate-500 border-b border-slate-200"
                        cellClassName="px-4 py-4 text-sm"
                        hoverClass="hover:bg-slate-50/50"
                        selectedClass="bg-primary/5"
                        selectedId={activeAccountId}
                    />
                </div>

                <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
                    <span className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-400">Showing {filtered.length} Results</span>
                    <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[0.65rem] font-black uppercase tracking-tighter text-slate-400">Live Connection Active</span>
                    </div>
                </div>
            </div>

            {editingAccount && (
                <AccountModal
                    mode="edit"
                    initialData={editingAccount}
                    onClose={() => setEditingAccount(null)}
                    onSuccess={() => {
                        setPendingEditedAccountId(editingAccount.id);
                        setEditingAccount(null);
                        fetchAccounts();
                    }}
                />
            )}

            {isAddModalOpen && (
                <AccountModal
                    mode="add"
                    onClose={() => setIsAddModalOpen(false)}
                    onSuccess={() => {
                        setIsAddModalOpen(false);
                        fetchAccounts();
                    }}
                />
            )}

            <ConfirmModal
                isOpen={Boolean(accountToDelete)}
                onClose={() => setAccountToDelete(null)}
                onConfirm={handleDelete}
                title="Delete Account"
                message={`Are you sure you want to delete the account "${accountToDelete?.account_name}"? All data associated with this account will be permanently removed.`}
                confirmLabel="Delete Account"
                variant="danger"
            />
        </div>

    );
}
