import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CommonModal from '../common/CommonModal';
import { FiAlertCircle, FiArrowRight, FiCheck, FiClock, FiFileText, FiUploadCloud } from 'react-icons/fi';
import Button from '../ui/Button';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ImportDataModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { activeAccount } = useAuth();
  const [selectedImportData, setSelectedImportData] = useState('order');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [uploadSummary, setUploadSummary] = useState(null);

  const importDataOptions = [
    {
      id: 'order',
      name: 'Import Orders',
      note: 'Daily sales order file upload',
      reviewRoute: '/all-orders',
      issueRoute: '/payment-mismatch',
      acceptedTypesLabel: 'CSV',
    },
    {
      id: 'ofd',
      name: 'Import OFD & In-Transit',
      note: 'Delivery pipeline status updates',
      reviewRoute: '/out-for-delivery',
      issueRoute: '/return-in-transit',
      acceptedTypesLabel: 'CSV',
    },
    {
      id: 'com',
      name: 'Import Complete Orders',
      note: 'Delivered/closed order reconciliation',
      reviewRoute: '/received-payment-orders',
      issueRoute: '/return-mismatch',
      acceptedTypesLabel: 'CSV',
    },
    {
      id: 'payment',
      name: 'Import Payment Details',
      note: 'Settlement and payout matching',
      reviewRoute: '/bank-credit-statement',
      issueRoute: '/pending-payment-orders',
      acceptedTypesLabel: 'XLSX',
    },
    {
      id: 'claim',
      name: 'Import Claim Status File',
      note: 'Claim approval and pending tracking',
      reviewRoute: '/approve-claim',
      issueRoute: '/smart-tickets',
      acceptedTypesLabel: 'CSV',
    },
  ];

  const uploadEndpoints = {
    order: '/upload-order-file',
    ofd: '/upload-ofd-order-file',
    com: '/upload-com-order-file',
    payment: '/upload-payment-detail-file',
    claim: '/upload-claim-status-file'
  };

  const importAcceptConfig = {
    order: ['.csv'],
    ofd: ['.csv'],
    com: ['.csv'],
    payment: ['.xlsx'],
    claim: ['.csv'],
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
    setUploadSummary(null);
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
    setUploadSummary(null);
  };

  const validateFile = (file) => {
    if (!file) return 'Please select a file first.';
    const fileName = file.name?.toLowerCase() || '';
    const validExtensions = importAcceptConfig[selectedImportData] || ['.csv'];
    const isValid = validExtensions.some((ext) => fileName.endsWith(ext));

    if (!isValid) return `Only ${validExtensions.join(', ')} files are allowed for this import.`;
    if (file.size > 10 * 1024 * 1024) return 'File size must be below 10 MB.';

    return '';
  };

  const buildUploadSummary = (responseData) => {
    const payload = responseData || {};
    const totalRows = payload.total_rows ?? payload.totalRows ?? payload.total ?? payload.count ?? null;
    const successRows = payload.success_rows ?? payload.successRows ?? payload.processed ?? payload.inserted ?? null;
    const failedRows = payload.failed_rows ?? payload.failedRows ?? payload.rejected ?? payload.errors_count ?? null;

    return {
      batchId: payload.batch_id || payload.batchId || null,
      importType: payload.import_type || payload.importType || selectedImportData,
      totalRows,
      successRows,
      failedRows,
      insertedRows: payload.inserted_rows ?? payload.inserted ?? null,
      updatedRows: payload.updated_rows ?? payload.updated ?? null,
      duplicateRows: payload.duplicate_rows ?? payload.duplicateRows ?? null,
      skippedRows: payload.skipped_rows ?? payload.skippedRows ?? null,
      warning:
        payload.warning ||
        payload.warnings?.[0] ||
        payload.message_detail ||
        '',
    };
  };

  const handleUpload = async () => {
    const fileValidationError = validateFile(selectedFile);
    if (fileValidationError) {
      setUploadError(fileValidationError);
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
          'x-import-type': selectedImportData,
          'x-client-batch-ts': new Date().toISOString(),
        },
      });

      setUploadSuccess(response.data?.message || `${activeOption.name} uploaded successfully.`);
      setUploadSummary(buildUploadSummary(response.data));
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
                  <div>
                    <div className={`text-sm font-bold tracking-tight ${isActive ? 'text-primary' : 'text-gray-700'}`}>{option.name}</div>
                    <div className="text-xs text-text-muted">{option.note}</div>
                  </div>
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
          <div className="grid gap-2 rounded-[18px] border border-border bg-surface-alt/40 p-3 sm:grid-cols-3">
            {[
              { label: 'Step 1', text: 'Select Import Type', active: true },
              { label: 'Step 2', text: 'Upload Daily File', active: true },
              { label: 'Step 3', text: 'Review & Fix Issues', active: Boolean(uploadSuccess) },
            ].map((step) => (
              <div
                key={step.label}
                className={`rounded-[14px] border px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] ${
                  step.active ? 'border-primary/40 bg-primary/10 text-primary' : 'border-border bg-white text-text-muted'
                }`}
              >
                <div>{step.label}</div>
                <div className="mt-1 normal-case tracking-normal text-[0.74rem]">{step.text}</div>
              </div>
            ))}
          </div>

          <div className="rounded-[20px] border border-border bg-surface-alt/60 p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-primary/10 text-primary">
                <FiUploadCloud size={22} />
              </div>
              <div className="space-y-1">
                <div className="text-base font-extrabold text-text">{activeOption?.name}</div>
                <div className="text-sm text-text-muted">{activeOption?.note}</div>
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
                  Accepted file type: {activeOption?.acceptedTypesLabel}
                </div>
              </div>
            </div>
          </div>

          <label className="block">
            <span className="mb-2 block text-[0.72rem] font-extrabold uppercase tracking-[0.22em] text-text-muted">Choose File</span>
            <div className="rounded-[18px] border border-dashed border-border bg-white p-4">
              <input
                type="file"
                accept={(importAcceptConfig[selectedImportData] || ['.csv']).join(',')}
                onChange={handleFileChange}
                className="block w-full text-sm text-text file:mr-4 file:rounded-[12px] file:border-0 file:bg-primary file:px-4 file:py-2.5 file:text-sm file:font-bold file:text-white hover:file:bg-primary-hover"
              />
              <div className="mt-3 text-xs text-text-muted">Upload one daily file at a time for better issue tracking.</div>
            </div>
          </label>

          {selectedFile ? (
            <div className="flex items-center justify-between gap-3 rounded-[18px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <div className="flex items-center gap-3">
              <FiFileText size={16} />
                <span className="font-semibold">{selectedFile.name}</span>
              </div>
              <div className="text-xs font-bold uppercase tracking-[0.14em]">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</div>
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
            <div className="flex items-start gap-2 rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              <FiAlertCircle size={16} className="mt-0.5 shrink-0" />
              {uploadError}
            </div>
          ) : null}

          {uploadSuccess ? (
            <>
              <div className="rounded-[18px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                {uploadSuccess}
              </div>

              {uploadSummary ? (
                <div className="grid gap-2 rounded-[18px] border border-border bg-white p-3 sm:grid-cols-3">
                  <div className="rounded-[14px] bg-surface-alt px-3 py-2">
                    <div className="text-[0.65rem] font-extrabold uppercase tracking-[0.16em] text-text-muted">Total Rows</div>
                    <div className="mt-1 text-lg font-black text-text">{uploadSummary.totalRows ?? '-'}</div>
                  </div>
                  <div className="rounded-[14px] bg-emerald-50 px-3 py-2">
                    <div className="text-[0.65rem] font-extrabold uppercase tracking-[0.16em] text-emerald-700">Imported</div>
                    <div className="mt-1 text-lg font-black text-emerald-700">{uploadSummary.successRows ?? '-'}</div>
                  </div>
                  <div className="rounded-[14px] bg-amber-50 px-3 py-2">
                    <div className="text-[0.65rem] font-extrabold uppercase tracking-[0.16em] text-amber-700">Needs Review</div>
                    <div className="mt-1 text-lg font-black text-amber-700">{uploadSummary.failedRows ?? '-'}</div>
                  </div>
                </div>
              ) : null}

              {uploadSummary?.batchId ? (
                <div className="rounded-[14px] border border-border bg-surface-alt px-3 py-2 text-xs text-text">
                  <span className="font-bold uppercase tracking-[0.14em] text-text-muted">Batch ID:</span> {uploadSummary.batchId}
                </div>
              ) : null}

              {(uploadSummary?.insertedRows != null || uploadSummary?.updatedRows != null || uploadSummary?.skippedRows != null || uploadSummary?.duplicateRows != null) ? (
                <div className="grid gap-2 rounded-[18px] border border-border bg-white p-3 sm:grid-cols-2">
                  <div className="rounded-[14px] bg-surface-alt px-3 py-2 text-xs">
                    <div className="font-extrabold uppercase tracking-[0.14em] text-text-muted">Inserted Rows</div>
                    <div className="mt-1 text-base font-black text-emerald-700">{uploadSummary.insertedRows ?? '-'}</div>
                  </div>
                  <div className="rounded-[14px] bg-surface-alt px-3 py-2 text-xs">
                    <div className="font-extrabold uppercase tracking-[0.14em] text-text-muted">Updated Rows</div>
                    <div className="mt-1 text-base font-black text-sky-700">{uploadSummary.updatedRows ?? '-'}</div>
                  </div>
                  <div className="rounded-[14px] bg-surface-alt px-3 py-2 text-xs">
                    <div className="font-extrabold uppercase tracking-[0.14em] text-text-muted">Skipped Rows</div>
                    <div className="mt-1 text-base font-black text-amber-700">{uploadSummary.skippedRows ?? '-'}</div>
                  </div>
                  <div className="rounded-[14px] bg-surface-alt px-3 py-2 text-xs">
                    <div className="font-extrabold uppercase tracking-[0.14em] text-text-muted">Duplicate Rows</div>
                    <div className="mt-1 text-base font-black text-violet-700">{uploadSummary.duplicateRows ?? '-'}</div>
                  </div>
                </div>
              ) : null}

              {uploadSummary?.warning ? (
                <div className="flex items-start gap-2 rounded-[18px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
                  <FiClock size={16} className="mt-0.5 shrink-0" />
                  {uploadSummary.warning}
                </div>
              ) : null}

              <div className="grid gap-2 sm:grid-cols-2">
                <Button type="button" variant="secondary" onClick={() => activeOption?.reviewRoute && navigate(activeOption.reviewRoute)}>
                  Review Imported Records
                </Button>
                <Button type="button" variant="warning" onClick={() => activeOption?.issueRoute && navigate(activeOption.issueRoute)}>
                  Open Possible Issues
                </Button>
              </div>
            </>
          ) : null}
        </div>
      </CommonModal>
    </>
  );
};

export default ImportDataModal;
