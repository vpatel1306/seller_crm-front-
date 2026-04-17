import CommonOrderPage from '../../components/orders/CommonOrderPage';

export default function CancelledOrders() {
  return (
    <CommonOrderPage
      title="Cancelled Orders"
      breadcrumbLabel="Cancelled Orders"
      recordTitle="Cancelled Order Records"
      loadingText="Loading cancelled orders..."
      emptyText="No cancelled orders found."
      fixedFilterData={{ order_status: 'CANCELLED' }}
    />
  );
}
