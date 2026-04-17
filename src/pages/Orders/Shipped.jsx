import CommonOrderPage from '../../components/orders/CommonOrderPage';

export default function Shipped() {
  return (
    <CommonOrderPage
      title="Shipped"
      breadcrumbLabel="Shipped"
      recordTitle="Shipped Order Records"
      loadingText="Loading shipped orders..."
      emptyText="No shipped orders found."
      fixedFilterData={{ order_status: 'SHIPPED' }}
    />
  );
}
