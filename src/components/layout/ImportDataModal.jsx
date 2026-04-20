import React, { useMemo, useState } from 'react';
import CommonModal from '../common/CommonModal';
import { FiArrowRight, FiCheck, FiFileText, FiUploadCloud } from 'react-icons/fi';
import Button from '../ui/Button';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ImportDataModal = ({ isOpen, onClose }) => {
  const { activeAccount } = useAuth();
  const [selectedImportData, setSelectedImportData] = useState('order');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');

  const importDataOptions = [
    { id: 'order', name: 'Import Orders' },
    { id: 'ofd', name: 'Import OFD-Order & In-Transit Order' },
    { id: 'com', name: 'Import Complete Orders' },
    { id: 'payment', name: 'Import Payment Details' },
    { id: 'claim', name: 'Import Claim Status file'}
  ];

  const uploadEndpoints = {
    order: '/upload-order-file',
    ofd: '/upload-ofd-order-file',
    com: '/upload-com-order-file',
    payment: '/upload-payment-detail-file',
    claim: '/upload-claim-status-file'
  };

  const activeOption = useMemo(
    () => importDataOptions.find((option) => option.id === selectedImportData) || importDataOptions[0],
    [importDataOptions, selectedImportData]
  );

  const resetUploadState = () => {
    setSelectedFile(null);
    setUploading(false);
    setUploadError('');
    setUploadSuccess('');
  };

  const handleImportDataSelect = (importDataId) => {
    setSelectedImportData(importDataId);
    resetUploadState();
    setShowUploadModal(true);
  };

  const handleCloseUploadModal = () => {
    setShowUploadModal(false);
    resetUploadState();
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    setUploadError('');
    setUploadSuccess('');
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError('Please select a PDF or CSV file first.');
      return;
    }

    if (!activeAccount?.id) {
      setUploadError('Please select an active account before uploading.');
      return;
    }

    const endpoint = uploadEndpoints[selectedImportData];
    if (!endpoint) {
      setUploadError('Upload endpoint is not configured for this import type.');
      return;
    }

    setUploading(true);
    setUploadError('');
    setUploadSuccess('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('import_type', selectedImportData);

      const response = await api.post(endpoint, formData, {
        headers: {
          account: activeAccount.id,
        },
      });

      setUploadSuccess(response.data?.message || `${activeOption.name} uploaded successfully.`);
    } catch (error) {
      setUploadError(error.response?.data?.message || error.response?.data?.detail || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const footerButtons = [
    { label: 'Cancel', type: 'secondary', onClick: onClose },
  ];

  return (
    <>
      <CommonModal
        isOpen={isOpen}
        onClose={onClose}
        title="Import Data"
        size="md"
        footerButtons={footerButtons}
        headerStyle="gradient"
      >
        <div className="space-y-2 p-1">
          {importDataOptions.map((option) => {
            const isActive = selectedImportData === option.id;
            return (
              <div
                key={option.id}
                className={`group flex items-center justify-between rounded-xl border-2 p-4 transition-all ${isActive ? 'border-primary bg-primary/5 shadow-sm shadow-primary/10' : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'}`}
                onClick={() => handleImportDataSelect(option.id)}
              >
                <div className="flex items-center gap-4">
                  <span className={`text-sm font-bold tracking-tight ${isActive ? 'text-primary' : 'text-gray-600'}`}>{option.name}</span>
                </div>
                <div className="flex items-center">
                  {isActive ? (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white animate-in zoom-in duration-200">
                      <FiCheck size={14} />
                    </div>
                  ) : (
                    <FiArrowRight size={16} className="text-gray-200 transition-all group-hover:translate-x-1 group-hover:text-gray-400" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CommonModal>

      <CommonModal
        isOpen={showUploadModal}
        onClose={handleCloseUploadModal}
        title={`${activeOption?.name || 'Import'} Upload`}
        size="md"
        headerStyle="default"
        footerButtons={[
          { label: 'Cancel', type: 'secondary', onClick: handleCloseUploadModal },
          {
            label: uploading ? 'Uploading...' : 'Upload File',
            type: 'primary',
            onClick: handleUpload,
            loading: uploading,
            disabled: uploading,
            autoClose: false,
          },
        ]}
      >
        <div className="space-y-5">
          <div className="rounded-[20px] border border-border bg-surface-alt/60 p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-primary/10 text-primary">
                <FiUploadCloud size={22} />
              </div>
              <div className="space-y-1">
                <div className="text-base font-extrabold text-text">{activeOption?.name}</div>
                <div className="text-sm text-text-muted">Upload files</div>
              </div>
            </div>
          </div>

          <label className="block">
            <span className="mb-2 block text-[0.72rem] font-extrabold uppercase tracking-[0.22em] text-text-muted">Choose File</span>
            <div className="rounded-[18px] border border-dashed border-border bg-white p-4">
              <input
                type="file"
                accept=".pdf,.csv,text/csv,application/pdf"
                onChange={handleFileChange}
                className="block w-full text-sm text-text file:mr-4 file:rounded-[12px] file:border-0 file:bg-primary file:px-4 file:py-2.5 file:text-sm file:font-bold file:text-white hover:file:bg-primary-hover"
              />
              <div className="mt-3 text-xs text-text-muted">Select a single file for upload.</div>
            </div>
          </label>

          {selectedFile ? (
            <div className="flex items-center gap-3 rounded-[18px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <FiFileText size={16} />
              <span className="font-semibold">{selectedFile.name}</span>
            </div>
          ) : null}

          {uploading ? (
            <div className="rounded-[18px] border border-primary/15 bg-primary/5 px-4 py-4">
              <div className="flex items-center gap-3 text-sm font-medium text-primary">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
                File is uploading. Please wait...
              </div>
            </div>
          ) : null}

          {uploadError ? (
            <div className="rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {uploadError}
            </div>
          ) : null}

          {uploadSuccess ? (
            <div className="rounded-[18px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              {uploadSuccess}
            </div>
          ) : null}
        </div>
      </CommonModal>
    </>
  );
};

export default ImportDataModal;
