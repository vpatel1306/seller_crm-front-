import React, { useState } from 'react';
import CommonModal from '../common/CommonModal';
import { useNavigate } from 'react-router-dom';
import { FiCheck, FiArrowRight } from 'react-icons/fi';

const ReturnModal = ({ isOpen, onClose }) => {
  const [selectedReport, setSelectedReport] = useState('sku');
  const navigate = useNavigate();

  const reports = [
    { id: 'sku', name: 'Return Entry - Account Wise' },
    { id: 'date', name: 'Return Entry - Multi Account' },
    { id: 'courier', name: 'Return Entry From File' },
    { id: 'exit', name: 'EXIT' }
  ];

  const reportRoutes = {
    sku: '/return-entry-account-wise',
    date: '/return-entry-multi-account',
    courier: '/return-entry-from-file',
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
      label: 'Select Mode',
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
      title="Return Mode Selection"
      size="sm"
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
              <div className="flex items-center gap-3">
                <span className={`text-sm font-bold tracking-tight ${isActive ? 'text-primary' : 'text-gray-600'}`}>{report.name}</span>
              </div>
              <div className="flex items-center">
                {isActive ? (
                  <div className="w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center animate-in zoom-in duration-200">
                    <FiCheck size={12} />
                  </div>
                ) : (
                  <FiArrowRight size={14} className="text-gray-200 group-hover:text-gray-400 group-hover:translate-x-1 transition-all" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </CommonModal>
  );
};

export default ReturnModal;