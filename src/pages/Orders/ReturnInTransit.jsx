import CommonOrderPage from '../../components/orders/CommonOrderPage';

export default function ReturnInTransit() {
  return (
    <CommonOrderPage
      title="Return In Transit"
      breadcrumbLabel="Return In Transit"
      recordTitle="Return In Transit Records"
      loadingText="Loading return in transit orders..."
      emptyText="No return-in-transit orders found."
      fixedFilterData={{ status: "Return In Transit" }}
    />
  );
}
