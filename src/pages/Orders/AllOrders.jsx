import CommonOrderPage from '../../components/orders/CommonOrderPage';

export default function AllOrders() {
  return (
    <CommonOrderPage
      title="All Orders"
      breadcrumbLabel="All Orders"
      recordTitle="Order Records"
      loadingText="Loading orders..."
      emptyText="No orders found."
      showStatusAndPaymentFilters
    />
  );
}
