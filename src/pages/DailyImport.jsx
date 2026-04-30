import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiAlertCircle, FiArrowRight, FiCheck, FiClock, FiFileText, FiUploadCloud } from 'react-icons/fi';
import Button from '../components/ui/Button';
import OrdersPageHeader from '../components/orders/OrdersPageHeader';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import AppShell from '../components/layout/AppShell';

export default function DailyImport() {
    const navigate = useNavigate();
    const { activeAccount } = useAuth();

    const [selectedImportData, setSelectedImportData] = useState('order');
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
        if (uploading) return;
        setSelectedImportData(importDataId);
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

    return (
        <AppShell>
            <div className="w-full max-w-6xl mx-auto py-6 px-4">
                <OrdersPageHeader 
                    breadcrumbs={[
                        { label: 'Dashboard', onClick: () => navigate('/dashboard') },
                        { label: 'Daily Import Suite', current: true }
                    ]}
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left Column: Import Type Selection */}
                    <div className="lg:col-span-5 flex flex-col gap-3">
                        <h3 className="font-semibold text-gray-700 mb-2 uppercase tracking-wider text-xs">1. Select Import Type</h3>
                        {importDataOptions.map((option) => {
                            const isActive = selectedImportData === option.id;
                            return (
                                <div
                                    key={option.id}
                                    className={`group flex items-center justify-between rounded-xl border-2 p-4 transition-all cursor-pointer ${isActive ? 'border-primary bg-primary/5 shadow-sm shadow-primary/10' : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'} ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
                                    onClick={() => handleImportDataSelect(option.id)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <div className={`text-sm font-bold tracking-tight ${isActive ? 'text-primary' : 'text-gray-700'}`}>{option.name}</div>
                                            <div className="text-xs text-gray-500">{option.note}</div>
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

                    {/* Right Column: Upload Panel */}
                    <div className="lg:col-span-7">
                        <h3 className="font-semibold text-gray-700 mb-4 uppercase tracking-wider text-xs">2. Upload & Process</h3>

                        <div className="space-y-6 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">

                            <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-5">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                        <FiUploadCloud size={24} />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-lg font-extrabold text-gray-900">{activeOption.name}</div>
                                        <div className="text-sm text-gray-500">{activeOption.note}</div>
                                        <div className="text-xs font-semibold uppercase tracking-widest text-gray-400 mt-2 block">
                                            Accepted file type: {activeOption.acceptedTypesLabel}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <label className="block">
                                <span className="mb-2 block text-xs font-extrabold uppercase tracking-widest text-gray-500">Choose File</span>
                                <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-6 transition-colors hover:border-primary/50 hover:bg-primary/5 cursor-pointer">
                                    <input
                                        type="file"
                                        accept={(importAcceptConfig[selectedImportData] || ['.csv']).join(',')}
                                        onChange={handleFileChange}
                                        disabled={uploading}
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-xl file:border-0 file:bg-primary file:px-6 file:py-2.5 file:text-sm file:font-bold file:text-white hover:file:bg-primary-hover file:cursor-pointer file:transition-colors disabled:opacity-50"
                                    />
                                    <div className="mt-4 text-xs text-gray-400">Upload one daily file at a time for better issue tracking.</div>
                                </div>
                            </label>

                            {selectedFile ? (
                                <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                                    <div className="flex items-center gap-3">
                                        <FiFileText size={18} />
                                        <span className="font-semibold truncate max-w-[200px] sm:max-w-xs">{selectedFile.name}</span>
                                    </div>
                                    <div className="text-xs font-bold uppercase tracking-wider shrink-0">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</div>
                                </div>
                            ) : null}

                            {uploading ? (
                                <div className="rounded-xl border border-primary/20 bg-primary/5 px-5 py-4">
                                    <div className="flex items-center gap-3 text-sm font-medium text-primary">
                                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
                                        File is uploading. Please wait...
                                    </div>
                                </div>
                            ) : null}

                            {uploadError ? (
                                <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                                    <FiAlertCircle size={18} className="mt-0.5 shrink-0" />
                                    {uploadError}
                                </div>
                            ) : null}

                            {uploadSuccess ? (
                                <div className="space-y-4">
                                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 flex items-center gap-2">
                                        <FiCheck size={18} /> {uploadSuccess}
                                    </div>

                                    {uploadSummary ? (
                                        <div className="grid gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 sm:grid-cols-3">
                                            <div className="rounded-lg bg-gray-100 px-3 py-2">
                                                <div className="text-[0.65rem] font-extrabold uppercase tracking-widest text-gray-500">Total Rows</div>
                                                <div className="mt-1 text-xl font-black text-gray-800">{uploadSummary.totalRows ?? '-'}</div>
                                            </div>
                                            <div className="rounded-lg bg-emerald-100/50 border border-emerald-100 px-3 py-2">
                                                <div className="text-[0.65rem] font-extrabold uppercase tracking-widest text-emerald-700">Imported</div>
                                                <div className="mt-1 text-xl font-black text-emerald-700">{uploadSummary.successRows ?? '-'}</div>
                                            </div>
                                            <div className="rounded-lg bg-amber-100/50 border border-amber-100 px-3 py-2">
                                                <div className="text-[0.65rem] font-extrabold uppercase tracking-widest text-amber-700">Needs Review</div>
                                                <div className="mt-1 text-xl font-black text-amber-700">{uploadSummary.failedRows ?? '-'}</div>
                                            </div>
                                        </div>
                                    ) : null}

                                    {uploadSummary?.batchId ? (
                                        <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-700">
                                            <span className="font-bold uppercase tracking-widest text-gray-400">Batch ID:</span> {uploadSummary.batchId}
                                        </div>
                                    ) : null}

                                    {(uploadSummary?.insertedRows != null || uploadSummary?.updatedRows != null || uploadSummary?.skippedRows != null || uploadSummary?.duplicateRows != null) ? (
                                        <div className="grid gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 sm:grid-cols-2 lg:grid-cols-4">
                                            <div className="rounded-lg bg-gray-100 px-3 py-2 text-xs">
                                                <div className="font-extrabold uppercase tracking-widest text-gray-500">Inserted</div>
                                                <div className="mt-1 text-base font-black text-emerald-700">{uploadSummary.insertedRows ?? '-'}</div>
                                            </div>
                                            <div className="rounded-lg bg-gray-100 px-3 py-2 text-xs">
                                                <div className="font-extrabold uppercase tracking-widest text-gray-500">Updated</div>
                                                <div className="mt-1 text-base font-black text-sky-700">{uploadSummary.updatedRows ?? '-'}</div>
                                            </div>
                                            <div className="rounded-lg bg-gray-100 px-3 py-2 text-xs">
                                                <div className="font-extrabold uppercase tracking-widest text-gray-500">Skipped</div>
                                                <div className="mt-1 text-base font-black text-amber-700">{uploadSummary.skippedRows ?? '-'}</div>
                                            </div>
                                            <div className="rounded-lg bg-gray-100 px-3 py-2 text-xs">
                                                <div className="font-extrabold uppercase tracking-widest text-gray-500">Duplicate</div>
                                                <div className="mt-1 text-base font-black text-violet-700">{uploadSummary.duplicateRows ?? '-'}</div>
                                            </div>
                                        </div>
                                    ) : null}

                                    {uploadSummary?.warning ? (
                                        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
                                            <FiClock size={16} className="mt-0.5 shrink-0" />
                                            {uploadSummary.warning}
                                        </div>
                                    ) : null}

                                    <div className="grid gap-3 sm:grid-cols-2 pt-2">
                                        <Button type="button" variant="secondary" onClick={() => activeOption?.reviewRoute && navigate(activeOption.reviewRoute)}>
                                            Review Imported Records
                                        </Button>
                                        <Button type="button" variant="warning" onClick={() => activeOption?.issueRoute && navigate(activeOption.issueRoute)}>
                                            Open Possible Issues
                                        </Button>
                                    </div>
                                </div>
                            ) : null}

                            <div className="pt-2 flex justify-end gap-3 border-t border-gray-100">
                                <Button variant="secondary" onClick={() => navigate('/dashboard')} disabled={uploading}>
                                    Cancel
                                </Button>
                                <Button variant="primary" onClick={handleUpload} disabled={!selectedFile || uploading || uploadSuccess} loading={uploading}>
                                    {uploading ? 'Processing...' : 'Start Upload'}
                                </Button>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </AppShell>
    );
}
