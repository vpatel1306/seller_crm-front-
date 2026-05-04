import CommonOrderPage from '../../components/orders/CommonOrderPage';

export default function ReturnsOreders() {
  return (
    <CommonOrderPage
      title="Returns Orders"
      breadcrumbLabel="Returns Orders"
      recordTitle="Returns Order Records"
      loadingText="Loading Returns orders..."
      emptyText="No Returns orders found."
      fixedFilterData={{ status: ['Return In Transit', 'Return Received', 'Return Not Receive', 'Return', 'RTO'] }}
    />
  );
}
