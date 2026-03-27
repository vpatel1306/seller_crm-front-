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
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
