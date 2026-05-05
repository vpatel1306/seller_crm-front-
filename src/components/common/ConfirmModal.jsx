import React from 'react';
import CommonModal from './CommonModal';
import Button from '../ui/Button';
import { FiAlertTriangle } from 'react-icons/fi';

const ConfirmModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title = 'Are you sure?', 
    message = 'This action cannot be undone.',
    confirmLabel = 'Delete',
    cancelLabel = 'Cancel',
    variant = 'danger' // danger, warning, primary
}) => {
    const footerButtons = [
        { 
            label: cancelLabel, 
            type: 'secondary', 
            onClick: onClose 
        },
        { 
            label: confirmLabel, 
            type: variant === 'danger' ? 'danger' : variant === 'warning' ? 'warning' : 'primary', 
            onClick: () => {
                onConfirm();
                onClose();
            }
        }
    ];


    return (
        <CommonModal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            size="sm"
            footerButtons={footerButtons}
            headerStyle="default"
        >
            <div className="flex items-start gap-4 py-2">
                <div className={`shrink-0 rounded-full p-3 ${
                    variant === 'danger' ? 'bg-red-50 text-red-600' : 
                    variant === 'warning' ? 'bg-amber-50 text-amber-600' : 
                    'bg-primary/10 text-primary'
                }`}>
                    <FiAlertTriangle size={24} />
                </div>
                <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-600 leading-relaxed">
                        {message}
                    </p>
                </div>
            </div>
        </CommonModal>
    );
};

export default ConfirmModal;
