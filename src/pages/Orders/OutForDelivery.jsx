import CommonOrderPage from '../../components/orders/CommonOrderPage';

export default function CancelledOrders() {
  return (
    <CommonOrderPage
      title="Out For Delivery Orders"
      breadcrumbLabel="Out For Delivery Orders"
      recordTitle="Out For Delivery Order Records"
      loadingText="Loading Out For Delivery orders..."
      emptyText="No Out For Delivery orders found."
      fixedFilterData={{ order_status: 'Delivering Today' }}
    />
  );
}
