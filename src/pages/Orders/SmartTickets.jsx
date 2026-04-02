import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiRefreshCw, FiSearch, FiX } from 'react-icons/fi';
import DataTable from '../../components/ui/DataTable';
import CommonModal from '../../components/common/CommonModal';
import { useAuth } from '../../context/AuthContext';

const OPEN_TICKETS = [
  {
    id: 1,
    marked_time: '10/07/2025 04:07:22 PM',
    order_no: '156732310979970496_1',
    order_date: '21/05/2025',
    pickup_courier: 'Valmo',
    pickup_awb: 'VL0081178551584',
    return_courier: 'PocketShip',
    return_awb: 'VL0081178551584',
    reason: 'I have not received my Return/RTO shipment',
    filter: '',
    ticket_id: '232323',
    ticket_date: '10/07/2025',
    return_created_on: '26/05/2025',
  },
  {
    id: 2,
    marked_time: '10/07/2025 04:07:22 PM',
    order_no: '155950865256096384_1',
    order_date: '19/05/2025',
    pickup_courier: 'Valmo',
    pickup_awb: 'VL0081158898803',
    return_courier: 'PocketShip',
    return_awb: 'VL0081158898803',
    reason: 'I have not received my Return/RTO shipment',
    filter: '',
    ticket_id: '232324',
    ticket_date: '10/07/2025',
    return_created_on: '24/05/2025',
  },
  {
    id: 3,
    marked_time: '10/07/2025 04:07:22 PM',
    order_no: '168204780043325568_1',
    order_date: '22/06/2025',
    pickup_courier: 'Shadowfax',
    pickup_awb: 'SF1817258065FPL',
    return_courier: 'Xpress Bees',
    return_awb: '234095364494100',
    reason: 'I have not received my Return/RTO shipment',
    filter: '',
    ticket_id: '232325',
    ticket_date: '10/07/2025',
    return_created_on: '24/06/2025',
  },
  {
    id: 4,
    marked_time: '08/07/2025 09:16:13 AM',
    order_no: '168346495584665432_1',
    order_date: '22/06/2025',
    pickup_courier: 'Valmo',
    pickup_awb: 'VL0081432893037',
    return_courier: 'Shadowfax',
    return_awb: 'R1294001400FPL',
    reason: 'I have not received my Return/RTO shipment',
    filter: '',
    ticket_id: '232326',
    ticket_date: '08/07/2025',
    return_created_on: '22/06/2025',
  },
  {
    id: 5,
    marked_time: '04/07/2025 09:29:04 AM',
    order_no: '165797417378745408_1',
    order_date: '15/06/2025',
    pickup_courier: 'Valmo',
    pickup_awb: 'VL0081386014458',
    return_courier: 'Xpress Bees',
    return_awb: '234095363629404',
    reason: 'False Attempt(Return/RTO) by Logistic Partner',
    filter: '',
    ticket_id: '232327',
    ticket_date: '04/07/2025',
    return_created_on: '15/06/2025',
  },
];

const CLOSED_TICKETS = [
  {
    id: 1,
    marked_time: '01/07/2025 09:12:05 AM',
    order_no: '159975286438438400_1',
    order_date: '30/05/2025',
    reason: 'False Attempt(Return/RTO) by Logistic Partner',
    ticket_id: '',
    ticket_date: '',
    return_received_at: '03/07/2025 09:00:26 AM',
    payout_claim: '0.00',
    close_reason: 'Return Received',
  },
  {
    id: 2,
    marked_time: '01/07/2025 09:12:05 AM',
    order_no: '165816627978599136_1',
    order_date: '15/06/2025',
    reason: 'False Attempt(Return/RTO) by Logistic Partner',
    ticket_id: '',
    ticket_date: '',
    return_received_at: '03/07/2025 09:01:24 AM',
    payout_claim: '0.00',
    close_reason: 'Return Received',
  },
  {
    id: 3,
    marked_time: '28/06/2025 09:31:02 AM',
    order_no: '165351892715802752_1',
    order_date: '14/06/2025',
    reason: 'False Attempt(Return/RTO) by Logistic Partner',
    ticket_id: '',
    ticket_date: '',
    return_received_at: '28/06/2025 03:22:24 PM',
    payout_claim: '0.00',
    close_reason: 'Return Received',
  },
  {
    id: 4,
    marked_time: '26/06/2025 09:23:15 AM',
    order_no: '163914104539535168_1',
    order_date: '19/05/2025',
    reason: 'False Attempt(Return/RTO) by Logistic Partner',
    ticket_id: '',
    ticket_date: '',
    return_received_at: '28/06/2025 03:24:47 PM',
    payout_claim: '0.00',
    close_reason: 'Return Received',
  },
  {
    id: 5,
    marked_time: '19/06/2025 05:57:57 PM',
    order_no: '155962175624651264_1',
    order_date: '19/05/2025',
    reason: 'I have received wrong return',
    ticket_id: '',
    ticket_date: '',
    return_received_at: '',
    payout_claim: '201.16',
    close_reason: 'Claim Received',
  },
];

const openColumns = [
  { key: 'marked_time', label: 'Marked Time', className: () => 'text-[#555]' },
  { key: 'order_no', label: 'Order No', className: () => 'text-[#5a9ea7] font-semibold' },
  { key: 'order_date', label: 'Order Date', className: () => 'text-[#555]' },
  { key: 'pickup_courier', label: 'Pickup Courier', className: () => 'text-[#555]' },
  { key: 'pickup_awb', label: 'Pickup AWB', className: () => 'text-[#555]' },
  { key: 'return_courier', label: 'Return Courier', className: () => 'text-[#555]' },
  { key: 'return_awb', label: 'Return AWB', className: () => 'text-[#555]' },
  { key: 'reason', label: 'Reason', className: () => 'text-[#555]' },
  { key: 'filter', label: 'Filter', className: () => 'text-[#555]' },
  { key: 'ticket_id', label: 'Ticket ID', className: () => 'text-[#555]' },
  { key: 'ticket_date', label: 'Ticket Date', className: () => 'text-[#555]' },
];

const closedColumns = [
  { key: 'marked_time', label: 'Marked Time', className: () => 'text-[#555]' },
  { key: 'order_no', label: 'Order No', className: () => 'text-[#5a9ea7] font-semibold' },
  { key: 'order_date', label: 'Order Date', className: () => 'text-[#555]' },
  { key: 'reason', label: 'Reason', className: () => 'text-[#555]' },
  { key: 'ticket_id', label: 'Ticket ID', className: () => 'text-[#555]' },
  { key: 'ticket_date', label: 'Ticket Date', className: () => 'text-[#555]' },
  { key: 'return_received_at', label: 'Return Received @', className: () => 'text-[#555]' },
  { key: 'payout_claim', label: 'Payout / Claim', right: true, className: () => 'text-right text-[#555]' },
  { key: 'close_reason', label: 'Close Reason', className: () => 'text-[#555]' },
];

function SectionHeader({ title, count, subtitle, accentClass, exportText = 'Export Data' }) {
  return (
    <div className="flex flex-col gap-2 border-t border-[#d8d8d8] bg-[#f4f4f4] px-2 py-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <div className={`px-2 py-0.5 text-[13px] font-bold text-white ${accentClass}`}>{title}</div>
        <span className={`text-[14px] font-bold ${accentClass === 'bg-[#d50000]' ? 'text-[#d50000]' : 'text-[#1d8c1d]'}`}>
          {count}
        </span>
        <span className="text-[13px] font-semibold text-[#b06e5b]">{subtitle}</span>
      </div>
      <button className="text-[14px] font-semibold text-[#c16e4d] hover:underline">{exportText}</button>
    </div>
  );
}

function buildTicketBody(row, ticketId, ticketDate) {
  return [
    'Dear Meesho Support Team,',
    '',
    'I hope this message finds you well.',
    '',
    `I am writing regarding my order with Order ID: ${row.order_no}. The order date was ${row.order_date}, and the return was created on ${row.return_created_on || row.order_date}.`,
    `I have raised ticket number ${ticketId || '____'} on ${ticketDate || '____'}. Since the return was created, but the product is still stuck "In Transit" under AWB No. ${row.return_awb}.`,
    'I have not received it back yet.',
    '',
    'Kindly look into this matter and expedite the process to ensure that I receive the product at the earliest. Your prompt assistance will be highly appreciated.',
    '',
    'Thank you.',
    '',
    'Best regards,',
    'venus times store',
  ].join('\n');
}

export default function SmartTickets() {
  const navigate = useNavigate();
  const { activeAccount } = useAuth();
  const searchRef = useRef(null);
  const [search, setSearch] = useState('');
  const [openSelectedId, setOpenSelectedId] = useState(1);
  const [closedSelectedId, setClosedSelectedId] = useState(1);
  const [ticketModalRow, setTicketModalRow] = useState(null);
  const [ticketId, setTicketId] = useState('');
  const [ticketDate, setTicketDate] = useState('');
  const accountName = activeAccount?.account_name || 'No account selected';

  const filteredOpen = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return OPEN_TICKETS;
    return OPEN_TICKETS.filter((row) =>
      Object.values(row).some((value) => String(value || '').toLowerCase().includes(q))
    );
  }, [search]);

  const filteredClosed = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return CLOSED_TICKETS;
    return CLOSED_TICKETS.filter((row) =>
      Object.values(row).some((value) => String(value || '').toLowerCase().includes(q))
    );
  }, [search]);

  const openTicketModal = (row) => {
    setTicketModalRow(row);
    setTicketId(row.ticket_id || '');
    const normalizedDate = row.ticket_date
      ? row.ticket_date.split('/').reverse().join('-')
      : '';
    setTicketDate(normalizedDate);
  };

  const ticketBody = ticketModalRow
    ? buildTicketBody(
        ticketModalRow,
        ticketId,
        ticketDate ? ticketDate.split('-').reverse().join('/') : ''
      )
    : '';

  const openTableColumns = openColumns.map((col) => {
    if (col.key === 'return_courier' || col.key === 'return_awb') {
      return {
        ...col,
        render: (row) => (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openTicketModal(row);
            }}
            className="font-semibold text-[#5a9ea7] underline underline-offset-2 hover:text-[#b33939]"
          >
            {row[col.key]}
          </button>
        ),
        className: () => '',
      };
    }
    if (col.key === 'filter' || col.key === 'ticket_id' || col.key === 'ticket_date') {
      return {
        ...col,
        render: (row) => row[col.key] || '—',
      };
    }
    return col;
  });

  return (
    <div className="min-h-screen bg-[#ececec] text-[#333]">
      <div className="mx-auto flex h-screen w-full flex-col border-x border-[#d0d0d0] bg-[#f5f5e8]">
        <div className="border-b border-[#d8d8d8] bg-[#f4f4f4]">
          <div className="flex flex-col gap-2 px-2 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="bg-[#e31d1d] px-2 py-1 text-[13px] font-bold leading-none text-white sm:text-[14px]">
              SMART TICKET - {accountName}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[12px] font-semibold text-[#d14f4f]">
              <span>Search</span>
              <span className="text-[#666]">( F1 )</span>
              <div className="relative min-w-[220px] flex-1 sm:max-w-[360px]">
                <FiSearch size={12} className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[#999]" />
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-7 w-full border border-[#d8d8d8] bg-white pl-7 pr-7 text-[12px] text-[#333] outline-none"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#999] hover:text-[#444]"
                  >
                    <FiX size={12} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="flex h-full flex-col">
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <SectionHeader
                title="Open Tickets"
                count={11}
                subtitle="( Open Ticket Orders Cost Amt : 3205 Rs. )"
                accentClass="bg-[#d50000]"
              />
              <div className="shrink-0 overflow-auto border-b border-[#d8d8d8] bg-[#f7f6df] min-h-[35vh]">
                <DataTable
                  mobileCardView={false}
                  columns={openTableColumns}
                  data={filteredOpen}
                  loading={false}
                  showIndex={false}
                  emptyText="No open smart tickets found."
                  selectedId={openSelectedId}
                  onRowClick={(row) => setOpenSelectedId((prev) => (prev === row.id ? null : row.id))}
                  wrapperClassName="max-h-[34vh]"
                  tableClassName="min-w-[1680px] bg-[#f7f6df] text-[14px] text-[#444]"
                  headClassName="sticky top-0 z-10 bg-[#f3ddb9] text-[#6e543a]"
                  headerCellClassName="px-2 py-1.5 text-[11px] font-semibold whitespace-nowrap transition-colors"
                  cellClassName="px-2 py-1 whitespace-nowrap"
                  rowClassName={() => 'border-b border-[#e3dfcb] cursor-pointer bg-transparent hover:bg-[#f0e8c9]'}
                  selectedClass="bg-[#d50000] text-white"
                  hoverClass="hover:bg-[#eee8cd]"
                />
              </div>

              <SectionHeader
                title="Closed Tickets"
                count={46}
                subtitle="( Closed Ticket Orders Cost Amt : 11585 Rs. )"
                accentClass="bg-[#0a8f0a]"
              />
              <div className="min-h-0 flex-1 overflow-auto bg-[#f7f6df]">
                <DataTable
                  mobileCardView={false}
                  columns={closedColumns}
                  data={filteredClosed}
                  loading={false}
                  showIndex={false}
                  emptyText="No closed smart tickets found."
                  selectedId={closedSelectedId}
                  onRowClick={(row) => setClosedSelectedId((prev) => (prev === row.id ? null : row.id))}
                  wrapperClassName="h-full"
                  tableClassName="min-w-[1500px] bg-[#f7f6df] text-[14px] text-[#444]"
                  headClassName="sticky top-0 z-10 bg-[#f3ddb9] text-[#6e543a]"
                  headerCellClassName="px-2 py-1.5 text-[11px] font-semibold whitespace-nowrap transition-colors"
                  cellClassName="px-2 py-1 whitespace-nowrap"
                  rowClassName={() => 'border-b border-[#e3dfcb] cursor-pointer bg-transparent hover:bg-[#f0e8c9]'}
                  selectedClass="bg-[#0a8f0a] text-white"
                  hoverClass="hover:bg-[#eee8cd]"
                />
              </div>
            </div>

            <div className="sticky bottom-0 border-t border-[#d5d5d5] bg-[#efefef] px-2 py-2">
              <div className="flex flex-wrap items-center justify-end gap-2 text-[12px]">
                <span className="rounded bg-[#d91c1c] px-2 py-1 text-[11px] font-bold leading-none text-white">
                  YouTube
                </span>
                <button className="min-w-[120px] border border-[#bcbcbc] bg-[#fff7a8] px-3 py-1 text-center text-[#4a4a4a] hover:bg-[#fff08a]">
                  <span className="inline-flex items-center justify-center gap-1">
                    <FiRefreshCw size={12} />
                    Refresh
                  </span>
                </button>
                <button className="min-w-[120px] border border-[#bcbcbc] bg-[#fff7a8] px-3 py-1 text-center text-[#4a4a4a] hover:bg-[#fff08a]">
                  Setting
                </button>
                <button className="min-w-[140px] border border-[#bcbcbc] bg-[#fff7a8] px-3 py-1 text-center text-[#4a4a4a] hover:bg-[#fff08a]">
                  Delete Closed
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="min-w-[120px] border border-[#bcbcbc] bg-[#fff7a8] px-3 py-1 text-center text-[#4a4a4a] hover:bg-[#fff08a]"
                >
                  <span className="inline-flex items-center justify-center gap-1">
                    <FiX size={12} />
                    Close
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <CommonModal
          isOpen={Boolean(ticketModalRow)}
          onClose={() => setTicketModalRow(null)}
          title="Ticket Format"
          size="xl"
          showFooter={false}
          headerStyle="default"
          customClass="border border-[#7da2be] rounded-none"
        >
          {ticketModalRow && (
            <div className="space-y-4 p-1 text-[#333]">
              <div className="border-b border-[#d9d9d9] pb-3 text-center">
                <h3 className="text-[15px] font-bold text-[#b05c5c]">
                  {ticketModalRow.reason}
                </h3>
              </div>

              <div className="grid gap-3 text-[14px] sm:grid-cols-2">
                <div className="space-y-2">
                  <div><span className="font-semibold">Order Number:</span> {ticketModalRow.order_no}</div>
                  <div><span className="font-semibold">Pickup Courier:</span> {ticketModalRow.pickup_courier}</div>
                  <div><span className="font-semibold">Pickup AWB:</span> {ticketModalRow.pickup_awb}</div>
                </div>
                <div className="space-y-2">
                  <div><span className="font-semibold">Order Date :</span> {ticketModalRow.order_date}</div>
                  <div><span className="font-semibold">Return Courier :</span> {ticketModalRow.return_courier}</div>
                  <div><span className="font-semibold">Return AWB :</span> {ticketModalRow.return_awb}</div>
                </div>
              </div>

              <div className="border-t border-[#e3e3e3] pt-3">
                <div className="mb-3 text-[14px] font-semibold text-[#444]">
                  After raising the ticket, update the ticket number and
                </div>

                <div className="grid gap-3 sm:grid-cols-[160px_170px_1fr] sm:items-end">
                  <label className="flex flex-col gap-1">
                    <span className="text-[13px] font-semibold">Ticket ID</span>
                    <input
                      type="text"
                      value={ticketId}
                      onChange={(e) => setTicketId(e.target.value)}
                      className="h-9 border border-[#cfcfcf] bg-[#eefddb] px-3 text-[14px] outline-none"
                    />
                  </label>

                  <label className="flex flex-col gap-1">
                    <span className="text-[13px] font-semibold">Ticket Date</span>
                    <input
                      type="date"
                      value={ticketDate}
                      onChange={(e) => setTicketDate(e.target.value)}
                      className="h-9 border border-[#cfcfcf] bg-white px-3 text-[14px] outline-none"
                    />
                  </label>

                  <div className="sm:justify-self-end">
                    <button
                      type="button"
                      className="h-9 min-w-[100px] border border-[#b6d7a8] bg-[#dff4d5] px-4 text-[14px] font-semibold text-[#567b47] hover:bg-[#d2efc4]"
                    >
                      Update
                    </button>
                  </div>
                </div>
              </div>

              <div className="border-t border-[#e3e3e3] pt-3">
                <textarea
                  value={ticketBody}
                  readOnly
                  className="min-h-[280px] w-full resize-none border border-[#d3d3d3] bg-white p-3 text-[14px] leading-7 outline-none"
                />
              </div>

              <div className="flex flex-col gap-3 border-t border-[#e3e3e3] pt-3 sm:flex-row sm:items-end sm:justify-between">
                <div className="text-[12px] leading-6 text-[#7d7d7d]">
                  <div className="font-semibold">Ticket Raise Path</div>
                  <div className="text-[#c06a6a]">
                    Help -&gt; Returns/RTO &amp; Exchange -&gt; {ticketModalRow.reason} -&gt; Click on Raise a Ticket
                  </div>
                </div>

                <div className="flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => navigator.clipboard?.writeText(ticketBody)}
                    className="border border-[#d5c9b8] bg-[#fff7cf] px-4 py-2 text-[14px] font-semibold text-[#6c624f] hover:bg-[#fff0ba]"
                  >
                    Copy Ticket Format
                  </button>
                  <button
                    type="button"
                    onClick={() => setTicketModalRow(null)}
                    className="border border-[#d5c9b8] bg-[#fff7cf] px-6 py-2 text-[14px] font-semibold text-[#6c624f] hover:bg-[#fff0ba]"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </CommonModal>
      </div>
    </div>
  );
}
