import React, { useState } from 'react';
import CommonModal from '../common/CommonModal';
import { useNavigate } from 'react-router-dom';

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
    <>
      <CommonModal
        isOpen={isOpen}
        onClose={onClose}
        title="Return Account Selection"
        size="sm"
        footerButtons={footerButtons}
        headerStyle="gradient"
      >
        <div className="report-list">
          {reports.map(report => (
            <div
              key={report.id}
              className={`report-item ${selectedReport === report.id ? 'active' : ''}`}
              onClick={() => handleReportSelect(report.id)}
              style={{
                cursor: 'pointer',
                padding: '12px 16px',
                marginBottom: '8px',
                borderRadius: '8px',
                transition: 'all 0.3s ease',
                backgroundColor: selectedReport === report.id ? '#e7f1ff' : '#fff',
                border: selectedReport === report.id ? '1px solid #0d6efd' : '1px solid #e0e0e0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
              onMouseEnter={(e) => {
                if (selectedReport !== report.id) {
                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedReport !== report.id) {
                  e.currentTarget.style.backgroundColor = '#fff';
                }
              }}
            >
              <div className="d-flex align-items-center gap-3">
                <span className="report-name fw-medium">{report.name}</span>
              </div>
              {selectedReport === report.id && (
                <span className="text-primary" style={{ fontSize: '18px' }}>✓</span>
              )}
            </div>
          ))}
        </div>

      </CommonModal>

    </>
  );
};

export default ReturnModal;