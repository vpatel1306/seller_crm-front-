import CommonOrderPage from '../../components/orders/CommonOrderPage';

export default function DeliveredOrders() {
  return (
    <CommonOrderPage
      title="Delivered Orders"
      breadcrumbLabel="Delivered Orders"
      recordTitle="Delivered Order Records"
      loadingText="Loading Delivered orders..."
      emptyText="No Delivered orders found."
      fixedFilterData={{ order_status: 'Delivered' }}
    />
  );
}
