import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiRefreshCw } from 'react-icons/fi';
import AppShell from '../../components/layout/AppShell';
import OrdersPageHeader from '../../components/orders/OrdersPageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const PAYMENT_COLUMNS = [
  {
    key: 'payment_date',
    label: 'Payment Date',
    className: 'min-w-[190px]',
    render: (row) => <span className="text-text-muted">{formatDate(row.payment_date)}</span>,
  },
  {
    key: 'type',
    label: 'Type',
    className: 'min-w-[140px]',
    render: (row) => <span className="rounded-full bg-surface-alt px-3 py-1 text-xs font-extrabold uppercase tracking-[0.16em] text-text">{row.type || '-'}</span>,
  },
  {
    key: 'txn_id',
    label: 'Transaction ID',
    className: 'min-w-[220px]',
    render: (row) => <span className="font-semibold text-primary">{row.txn_id || '-'}</span>,
  },
  {
    key: 'amount',
    label: 'Amount',
    right: true,
    className: 'min-w-[120px]',
    render: (row) => (
      <span className={`font-extrabold ${(Number(row.amount) || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
        {formatCurrency(row.amount)}
      </span>
    ),
  },
];

function formatCurrency(value) {
  return `Rs. ${(Number(value) || 0).toFixed(2)}`;
}

function formatDate(value) {
  if (!value) return '-';
  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? value : parsedDate.toLocaleString('en-IN');
}

function DetailMetric({ label, value, tone = 'text-text' }) {
  return (
    <div className="rounded-[20px] border border-border bg-white px-4 py-4 shadow-sm">
      <div className="text-[0.68rem] font-extrabold uppercase tracking-[0.18em] text-text-muted">{label}</div>
      <div className={`mt-2 text-xl font-extrabold ${tone}`}>{value}</div>
    </div>
  );
}

export default function PaymentDetails() {
  const navigate = useNavigate();
  const { platformOrderId } = useParams();
  const { activeAccount } = useAuth();
  const [loading, setLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState(null);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const loadPaymentDetails = async () => {
      if (!platformOrderId || !activeAccount?.id) return;

      setLoading(true);
      try {
        const response = await api.get(`/get-payment-details/${platformOrderId}`, {
          headers: {
            account: activeAccount.id,
          },
        });

        const payload = response.data || {};
        setOrderDetails(payload.order_details || null);
        setPayments(Array.isArray(payload.payments) ? payload.payments : []);
      } catch {
        setOrderDetails(null);
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };

    loadPaymentDetails();
  }, [activeAccount?.id, platformOrderId]);

  const paymentSummary = useMemo(() => {
    const totalAmount = payments.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const positiveAmount = payments
      .filter((item) => (Number(item.amount) || 0) >= 0)
      .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const negativeAmount = payments
      .filter((item) => (Number(item.amount) || 0) < 0)
      .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

    return {
      totalEntries: payments.length,
      totalAmount,
      positiveAmount,
      negativeAmount,
    };
  }, [payments]);

  return (
    <AppShell>
      <div className="space-y-5">
        <OrdersPageHeader
          breadcrumbs={[
            { label: 'Dashboard', onClick: () => navigate('/dashboard') },
            { label: 'Received Payment Orders', onClick: () => navigate(-1) },
            { label: 'Payment Details', current: true },
          ]}
          actions={[
            <Button key="back" type="button" variant="secondary" size="sm" onClick={() => navigate(-1)}>
              <FiArrowLeft size={14} />
              <span>Back</span>
            </Button>,
            <Button key="refresh" type="button" variant="secondary" size="sm" onClick={() => window.location.reload()}>
              <FiRefreshCw size={14} />
              <span>Refresh</span>
            </Button>,
          ]}
        />

        <Card
          title="Order Payment Details"
          subtitle={platformOrderId ? `Platform Order ID: ${platformOrderId}` : 'Payment details'}
        >
          <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
            <DetailMetric label="Order Status" value={orderDetails?.order_status || '-'} tone="text-amber-700" />
            <DetailMetric label="Status" value={orderDetails?.status || '-'} tone="text-primary" />
            <DetailMetric label="Settlement Amount" value={formatCurrency(orderDetails?.settlement_amount)} tone="text-emerald-600" />
            <DetailMetric label="Claim Amount" value={formatCurrency(orderDetails?.claim_amount)} tone="text-rose-600" />
            <DetailMetric label="Shipping Charge" value={formatCurrency(orderDetails?.shipping_charge)} />
            <DetailMetric label="Return Shipping" value={formatCurrency(orderDetails?.return_shipping_charge)} />
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
            <DetailMetric label="Total Amount" value={formatCurrency(orderDetails?.total_amount)} />
            <DetailMetric label="Cost Amount" value={formatCurrency(orderDetails?.cost_amount)} tone="text-amber-600" />
            <DetailMetric label="Order Date" value={formatDate(orderDetails?.order_date)} />
            <DetailMetric label="Payment Entries" value={paymentSummary.totalEntries} tone="text-primary" />
            <DetailMetric label="Net Payment" value={formatCurrency(paymentSummary.totalAmount)} tone={paymentSummary.totalAmount >= 0 ? 'text-emerald-600' : 'text-rose-600'} />
            <DetailMetric label="Positive Payments" value={formatCurrency(paymentSummary.positiveAmount)} tone="text-emerald-600" />
          </div>
        </Card>

        <Card
          title="Payment Transactions"
          subtitle="Detailed payment ledger for the selected platform order."
          contentClassName="p-0"
        >
          <DataTable
            mobileCardView={false}
            columns={PAYMENT_COLUMNS}
            data={payments}
            loading={loading}
            loadingText="Loading payment details..."
            emptyText="No payment records found."
            showIndex={false}
            wrapperClassName="rounded-b-[24px] pb-2"
            tableClassName="min-w-[780px]"
            headClassName="top-0 z-10 bg-surface-alt/95 text-slate-700 backdrop-blur"
            headerCellClassName="border-b border-border px-4 py-3 text-[0.62rem] font-extrabold uppercase tracking-[0.14em] whitespace-nowrap"
            cellClassName="px-4 py-3 text-sm text-text"
            selectedClass="bg-primary/10 text-text"
            hoverClass="hover:bg-surface-alt"
          />
        </Card>
      </div>
    </AppShell>
  );
}
