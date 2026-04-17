import React, { useState } from 'react';
import CommonModal from '../common/CommonModal';
import { useNavigate } from 'react-router-dom';
import { FiCheck, FiArrowRight } from 'react-icons/fi';

const ReportModal = ({ isOpen, onClose }) => {
  const [selectedReport, setSelectedReport] = useState('sku');
  const navigate = useNavigate();

  const reports = [
    { id: 'sku', name: 'SKU Wise Report', icon: '📊' },
    // { id: 'date', name: 'Date Wise Report', icon: '📅' },
    // { id: 'courier', name: 'Courier Wise Pickup And Return Report', icon: '🚚' },
    // { id: 'state', name: 'State Wise Report', icon: '🗺️' },
    // { id: 'multiple', name: 'Multiple Account Report', icon: '👥' },
    // { id: 'ledger', name: 'Account Ledger', icon: '📒' },
    { id: 'exit', name: 'EXIT', icon: '🚪' }
  ];

  const reportRoutes = {
    sku: '/sku-report',
    // date: '/date-wise-report',
    // courier: '/business-growth-chart',
    // state: '/payout-graph',
    // multiple: '/multiple-account-report',
    // ledger: '/account-ledger',
    exit: '/dashboard'
  };

  const handleReportSelect = (reportId) => {
    setSelectedReport(reportId);

    if (reportId === 'exit') {
      navigate('/dashboard');
      onClose();
      return;
    }

    const path = reportRoutes[reportId];
    if (path) {
      navigate(path);
      onClose();
    }
  };

  const footerButtons = [
    { label: 'Cancel', type: 'secondary', onClick: onClose },
    {
      label: 'Generate Report',
      type: 'primary',
      onClick: () => {
        if (selectedReport === 'exit') {
          navigate('/dashboard');
          onClose();
        } else {
          const path = reportRoutes[selectedReport];
          if (path) {
            navigate(path);
            onClose();
          }
        }
      }
    }
  ];

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title="Report Selection"
      size="md"
      footerButtons={footerButtons}
      headerStyle="gradient"
    >
      <div className="space-y-2 p-1">
        {reports.map(report => {
          const isActive = selectedReport === report.id;
          return (
            <div
              key={report.id}
              className={`group flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all border-2 ${isActive ? 'bg-primary/5 border-primary shadow-sm shadow-primary/10' : 'bg-white border-gray-100 hover:bg-gray-50 hover:border-gray-200'}`}
              onClick={() => handleReportSelect(report.id)}
            >
              <div className="flex items-center gap-4">
                <span className={`text-2xl transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}>{report.icon}</span>
                <span className={`text-sm font-bold tracking-tight ${isActive ? 'text-primary' : 'text-gray-600'}`}>{report.name}</span>
              </div>
              <div className="flex items-center">
                {isActive ? (
                  <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center animate-in zoom-in duration-200">
                    <FiCheck size={14} />
                  </div>
                ) : (
                  <FiArrowRight size={16} className="text-gray-200 group-hover:text-gray-400 group-hover:translate-x-1 transition-all" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </CommonModal>
  );
};

export default ReportModal;