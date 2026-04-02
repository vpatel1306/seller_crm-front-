import { useState, useEffect } from 'react';
import {
  FiX, FiSave, FiUser, FiMail, FiPhone, FiMapPin,
  FiFileText, FiCalendar, FiHash, FiLock, FiCreditCard,
} from 'react-icons/fi';
import api from '../../services/api';
import StatusMessage from '../ui/StatusMessage';

const GST_PATTERN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const MOBILE_PATTERN = /^[6-9]\d{9}$/;

const EMPTY = {
  supplier_id: '', account_name: '', gst_no: '', mail_id: '',
  mobile_no: '', person_name: '', order_data_from: '',
  label_text_file_folder: '', address: '',
  username: '', password: '', bank_name: '', bank_account_no: '',
};

const mainFields = [
  { key: 'supplier_id', label: 'Supplier ID', icon: <FiHash size={13} />, type: 'text', required: true },
  { key: 'account_name', label: 'Account Name', icon: <FiUser size={13} />, type: 'text', required: true },
  { key: 'gst_no', label: 'GST Number', icon: <FiFileText size={13} />, type: 'text', required: true },
  { key: 'mail_id', label: 'Email ID', icon: <FiMail size={13} />, type: 'email', required: true },
  { key: 'mobile_no', label: 'Mobile No', icon: <FiPhone size={13} />, type: 'tel', required: true },
  { key: 'person_name', label: 'Contact Person', icon: <FiUser size={13} />, type: 'text', required: true },
  { key: 'order_data_from', label: 'Order Data From', icon: <FiCalendar size={13} />, type: 'date', required: true },
  { key: 'label_text_file_folder', label: 'Label / File Folder', icon: <FiFileText size={13} />, type: 'text', required: false },
  { key: 'address', label: 'Address', icon: <FiMapPin size={13} />, type: 'text', required: false, textarea: true },
];

const optionalFields = [
  { key: 'username', label: 'Username', icon: <FiUser size={13} />, type: 'text', required: false },
  { key: 'password', label: 'Password', icon: <FiLock size={13} />, type: 'password', required: false },
  { key: 'bank_name', label: 'Bank Name', icon: <FiCreditCard size={13} />, type: 'text', required: false },
  { key: 'bank_account_no', label: 'Bank Account No', icon: <FiHash size={13} />, type: 'text', required: false },
];

export default function AccountModal({ mode = 'add', initialData = null, onClose, onSuccess }) {
  const [form, setForm] = useState(mode === 'edit' && initialData ? { ...EMPTY, ...initialData } : EMPTY);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    setForm(mode === 'edit' && initialData ? { ...EMPTY, ...initialData } : EMPTY);
    setFeedback({ type: '', message: '' });
  }, [initialData, mode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (feedback.message) {
      setFeedback({ type: '', message: '' });
    }
    setForm((f) => ({
      ...f,
      [name]: name === 'gst_no' ? value.toUpperCase() : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });

    const gstNo = form.gst_no.trim().toUpperCase();
    const mobileNo = form.mobile_no.trim();

    setLoading(true);
    try {
      const payload = {
        ...form,
        gst_no: gstNo,
        mobile_no: mobileNo,
        label_text_file_folder: form.label_text_file_folder || null,
      };
      if (mode === 'edit') {
        await api.post(`/account-edit/${initialData.id}`, payload);
      } else {
        await api.post('/account-register', payload);
      }
      setFeedback({
        type: 'success',
        message: mode === 'edit' ? 'Account updated successfully.' : 'Account added successfully.',
      });
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 900);
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || err.response?.data?.detail || 'Something went wrong. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderField = ({ key, label, icon, type, required, textarea }) => (
    <div key={key} className={textarea ? 'col-span-2' : 'col-span-1'}>
      <label className="text-[0.875rem] font-medium text-gray-700 flex items-center gap-1 mb-2">
        <span className="text-primary">{icon}</span>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {textarea ? (
        <textarea
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors bg-white"
          name={key}
          value={form[key]}
          onChange={handleChange}
          required={required}
          placeholder={label}
          rows={3}
        />
      ) : (
        <input
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors bg-white"
          type={type}
          name={key}
          value={form[key]}
          onChange={handleChange}
          required={required}
          placeholder={label}
          autoComplete={type === 'password' ? 'new-password' : 'off'}
          maxLength={key === 'gst_no' ? 15 : key === 'mobile_no' ? 10 : undefined}
        />
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[1050] p-4 animate-fade-in" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-xl shadow-2xl max-w-[95%] w-[800px] max-h-[90vh] overflow-hidden flex flex-col animate-slide-up">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div>
              <h5 className="font-bold text-base text-gray-900 leading-tight">
                {mode === 'edit' ? 'Edit Account' : 'Add New Account'}
              </h5>
              <p className="text-gray-500 text-xs mt-0.5">
                {mode === 'edit' ? 'Update the account information below' : 'Fill in the details to create a new account'}
              </p>
            </div>
          </div>
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" onClick={onClose}>
            <FiX size={18} />
          </button>
        </div>

        <StatusMessage type={feedback.type} message={feedback.message} className="mx-6 mt-4 mb-0 flex-shrink-0" />

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-grow overflow-hidden">

          {/* Two Panels */}
          <div className="flex flex-col md:flex-row flex-grow overflow-hidden">

            {/* LEFT — Account Details */}
            <div className="flex-1 flex flex-col overflow-hidden border-r border-gray-100">
              <div className="p-6 overflow-y-auto flex-grow">
                <div className="grid grid-cols-2 gap-4">
                  {mainFields.map(renderField)}
                </div>
              </div>
            </div>

            {/* RIGHT — Optional Details */}
            <div className="flex-1 flex flex-col overflow-hidden bg-gray-50/50">
              <div className="p-6 overflow-y-auto flex-grow">
                <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm mb-4">
                  <span className="block text-sm font-bold text-gray-900 mb-4 pb-2 border-b border-gray-50">Optional Details</span>
                  <div className="grid grid-cols-1 gap-4">
                    {optionalFields.map(renderField)}
                  </div>
                </div>
              </div>
            </div>
          </div>


          {/* Footer */}
          <div className="flex justify-end items-center gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
            <button type="button" className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-white transition-colors" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="px-6 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-hover shadow-lg shadow-primary/20 disabled:opacity-60 transition-all flex items-center gap-2" disabled={loading}>
              {loading
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <FiSave size={14} />
              }
              {loading ? 'Saving...' : mode === 'edit' ? 'Update Account' : 'Add Account'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
