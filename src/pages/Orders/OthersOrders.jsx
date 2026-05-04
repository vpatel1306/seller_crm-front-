import CommonOrderPage from '../../components/orders/CommonOrderPage';

export default function OthersOrders() {
  return (
    <CommonOrderPage
      title="Others Orders"
      breadcrumbLabel="Others Orders"
      recordTitle="Others Order Records"
      loadingText="Loading Others orders..."
      emptyText="No Others orders found."
      fixedFilterData={{ 
        status: [
         'Processing', ' '
        ]
      }}
    />
  );
}
