import CommonOrderPage from '../../components/orders/CommonOrderPage';

export default function ReadyToShip() {
  return (
    <CommonOrderPage
      title="Ready To Ship"
      breadcrumbLabel="Ready To Ship"
      recordTitle="Ready To Ship Order Records"
      loadingText="Loading ready to ship orders..."
      emptyText="No ready to ship orders found."
      fixedFilterData={{ order_status: 'READY_TO_SHIP' }}
    />
  );
}
