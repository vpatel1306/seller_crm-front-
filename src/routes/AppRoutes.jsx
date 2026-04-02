import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import Dashboard from '../pages/Dashboard';
import SkuList from "../pages/SkuList";
import ProtectedRoute from '../components/common/ProtectedRoute';
import SKUReport from '../pages/Reports/SKUReport';
import DateWiseReport from '../pages/Reports/DateWiseReport';
import BusinessGrowthChart from '../pages/Reports/BusinessGrowthChart';
import PayoutGraph from '../pages/Reports/PayoutGraph';
import ReturnEntryAccountWise from '../components/layout/ReturnEntryAccountWise';
import PickUpEntry from '../components/layout/PickUpEntry';
import AllOrders from '../pages/Orders/AllOrders';
import BankCreditStatement from '../pages/Orders/BankCreditStatement';
import CancelledOrders from '../pages/Orders/CancelledOrders';
import CancelPickup from '../pages/Orders/CancelPickup';
import OutForDelivery from '../pages/Orders/OutForDelivery';
import PaymentMismatch from '../pages/Orders/PaymentMismatch';
import PendingPaymentOrders from '../pages/Orders/PendingPaymentOrders';
import ReceivedPaymentOrders from '../pages/Orders/ReceivedPaymentOrders';
import ReceivedReturns from '../pages/Orders/ReceivedReturns';
import SmartTickets from '../pages/Orders/SmartTickets';
import ReturnMismatch from '../pages/Orders/ReturnMismatch';
import ReturnsNotReceived from '../pages/Orders/ReturnsNotReceived';
import ReturnInTransit from '../pages/Orders/ReturnInTransit';
import UnsettledPickup from '../pages/Orders/UnsettledPickup';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/sku-list" element={<ProtectedRoute><SkuList /></ProtectedRoute>} />
      <Route path="/sku-report" element={<ProtectedRoute><SKUReport /></ProtectedRoute>} />
      <Route path="/date-wise-report" element={<ProtectedRoute><DateWiseReport /></ProtectedRoute>} />
      <Route path="/business-growth-chart" element={<ProtectedRoute><BusinessGrowthChart /></ProtectedRoute>} />
      <Route path="/payout-graph" element={<ProtectedRoute><PayoutGraph /></ProtectedRoute>} />
      <Route path="/return-entry-account-wise" element={<ProtectedRoute><ReturnEntryAccountWise /></ProtectedRoute>} />
      <Route path="/pick-up-entry" element={<ProtectedRoute><PickUpEntry /></ProtectedRoute>} />
      <Route path="/all-orders" element={<ProtectedRoute><AllOrders /></ProtectedRoute>} />
      <Route path="/bank-credit-statement" element={<ProtectedRoute><BankCreditStatement /></ProtectedRoute>} />
      <Route path="/cancel-pickup" element={<ProtectedRoute><CancelPickup /></ProtectedRoute>} />
      <Route path="/cancelled-orders" element={<ProtectedRoute><CancelledOrders /></ProtectedRoute>} />
      <Route path="/out-for-delivery" element={<ProtectedRoute><OutForDelivery /></ProtectedRoute>} />
      <Route path="/payment-mismatch" element={<ProtectedRoute><PaymentMismatch /></ProtectedRoute>} />
      <Route path="/pending-payment-orders" element={<ProtectedRoute><PendingPaymentOrders /></ProtectedRoute>} />
      <Route path="/received-payment-orders" element={<ProtectedRoute><ReceivedPaymentOrders /></ProtectedRoute>} />
      <Route path="/received-returns" element={<ProtectedRoute><ReceivedReturns /></ProtectedRoute>} />
      <Route path="/smart-tickets" element={<ProtectedRoute><SmartTickets /></ProtectedRoute>} />
      <Route path="/return-mismatch" element={<ProtectedRoute><ReturnMismatch /></ProtectedRoute>} />
      <Route path="/returns-not-received" element={<ProtectedRoute><ReturnsNotReceived /></ProtectedRoute>} />
      <Route path="/return-in-transit" element={<ProtectedRoute><ReturnInTransit /></ProtectedRoute>} />
      <Route path="/unsettled-pickup" element={<ProtectedRoute><UnsettledPickup /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
