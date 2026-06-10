import CommonOrderPage from "../../components/orders/CommonOrderPage";

export default function ReturnsOreders() {
  return (
    <CommonOrderPage
      title="Returns Orders"
      breadcrumbLabel="Returns Orders"
      recordTitle="Returns Order Records"
      loadingText="Loading Returns orders..."
      emptyText="No Returns orders found."
      fixedFilterData={{
        order_status: [
          "Courier Return (RTO)",
          "Customer Return",
          "RTO",
          "CUSTOMER RETURN",
          "Return",
          "RTO_COMPLETE",
          "RTO_LOCKED",
          "LOST",
          "Returned",
        ],
      }}
    />
  );
}
