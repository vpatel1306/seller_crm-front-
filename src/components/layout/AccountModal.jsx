import { useState, useEffect } from 'react';
import {
  FiX, FiSave, FiUser, FiMail, FiPhone, FiMapPin,
  FiFileText, FiCalendar, FiHash, FiLock, FiCreditCard,
} from 'react-icons/fi';
import api from '../../services/api';
import '../../styles/AccountModal.css';

const EMPTY = {
  supplier_id: '', account_name: '', gst_no: '', mail_id: '',
  mobile_no: '', person_name: '', order_data_from: '',
  label_text_file_folder: '', address: '',
  username: '', password: '', bank_name: '', bank_account_no: '',
};

const mainFields = [
  { key: 'supplier_id',            label: 'Supplier ID',         icon: <FiHash size={13} />,     type: 'text',  required: true  },
  { key: 'account_name',           label: 'Account Name',        icon: <FiUser size={13} />,     type: 'text',  required: true  },
  { key: 'gst_no',                 label: 'GST Number',          icon: <FiFileText size={13} />, type: 'text',  required: true  },
  { key: 'mail_id',                label: 'Email ID',            icon: <FiMail size={13} />,     type: 'email', required: true  },
  { key: 'mobile_no',              label: 'Mobile No',           icon: <FiPhone size={13} />,    type: 'tel',   required: true  },
  { key: 'person_name',            label: 'Contact Person',      icon: <FiUser size={13} />,     type: 'text',  required: true  },
  { key: 'order_data_from',        label: 'Order Data From',     icon: <FiCalendar size={13} />, type: 'date',  required: true  },
  { key: 'label_text_file_folder', label: 'Label / File Folder', icon: <FiFileText size={13} />, type: 'text',  required: false },
  { key: 'address', label: 'Address', icon: <FiMapPin size={13} />, type: 'text', required: false, textarea: true },
];

const optionalFields = [
  { key: 'username',        label: 'Username',        icon: <FiUser size={13} />,       type: 'text',     required: false },
  { key: 'password',        label: 'Password',        icon: <FiLock size={13} />,       type: 'password', required: false },
  { key: 'bank_name',       label: 'Bank Name',       icon: <FiCreditCard size={13} />, type: 'text',     required: false },
  { key: 'bank_account_no', label: 'Bank Account No', icon: <FiHash size={13} />,       type: 'text',     required: false },
];

export default function AccountModal({ mode = 'add', initialData = null, onClose, onSuccess }) {
  const [form, setForm]       = useState(mode === 'edit' && initialData ? { ...EMPTY, ...initialData } : EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { ...form, label_text_file_folder: form.label_text_file_folder || null };
      if (mode === 'edit') {
        await api.put(`/account-update/${initialData.id}`, payload);
      } else {
        await api.post('/account-register', payload);
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderField = ({ key, label, icon, type, required, textarea }) => (
    <div key={key} className={`col-${textarea ? '12' : '6'}`}>
      <label className="form-label am-label d-flex align-items-center gap-1 mb-2">
        <span className="text-primary ms-1">{icon}</span>
        {label}
        {required && <span className="text-danger ms-1">*</span>}
      </label>
      {textarea ? (
        <textarea
          className="form-control form-control-sm"
          name={key}
          value={form[key]}
          onChange={handleChange}
          required={required}
          placeholder={label}
          rows={3}
        />
      ) : (
        <input
          className="form-control form-control-sm"
          type={type}
          name={key}
          value={form[key]}
          onChange={handleChange}
          required={required}
          placeholder={label}
          autoComplete={type === 'password' ? 'new-password' : 'off'}
        />
      )}
    </div>
  );

  return (
    <div className="am-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="am-modal-wrap d-flex flex-column">

        {/* Header */}
        <div className="d-flex align-items-center justify-content-between px-4 py-3 border-bottom bg-light flex-shrink-0">
          <div className="d-flex align-items-center gap-3">
            <div>
              <h5 className="fw-bold mb-0 fs-6">
                {mode === 'edit' ? 'Edit Account' : 'Add New Account'}
              </h5>
              <small className="text-muted">
                {mode === 'edit' ? 'Update the account information below' : 'Fill in the details to create a new account'}
              </small>
            </div>
          </div>
          <button className="btn btn-sm btn-outline-secondary d-flex align-items-center" onClick={onClose}>
            <FiX size={18} />
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="alert alert-danger alert-sm mx-4 mt-3 mb-0 py-2 px-3 flex-shrink-0" role="alert">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="d-flex flex-column flex-grow-1 overflow-hidden">

          {/* Two Panels */}
          <div className="am-panels flex-grow-1 overflow-hidden">

            {/* LEFT — Account Details */}
            <div className="d-flex flex-column overflow-hidden border-end">
              <div className="p-4 overflow-y-auto flex-grow-1">
                <div className="row g-3">
                  {mainFields.map(renderField)}
                </div>
              </div>
            </div>

            {/* RIGHT — Optional Details */}
            <div className="d-flex flex-column overflow-hidden px-3">
              <div className="custom-box mb-2">
                    <span className="title fw-bold">Optional Details</span>

                    <div className="p-4 overflow-y-auto flex-grow-1">
                  <div className="row g-3">
                    {optionalFields.map(renderField)}
                  </div>
                </div>
              </div>
            </div>
          </div>

         
          {/* Footer */}
          <div className="d-flex justify-content-end align-items-center gap-2 px-4 py-3 border-top bg-light flex-shrink-0">
            <button type="button" className="btn btn-outline-secondary px-4" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary px-4 d-flex align-items-center gap-2" disabled={loading}>
              {loading
                ? <span className="spinner-border spinner-border-sm" role="status" />
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
