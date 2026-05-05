import { useEffect, useState } from 'react';
import {
  FiCalendar,
  FiCreditCard,
  FiFileText,
  FiHash,
  FiLock,
  FiMail,
  FiMapPin,
  FiPhone,
  FiSave,
  FiShield,
  FiUser,
  FiEye,
  FiEyeOff,
} from 'react-icons/fi';

import CommonModal from '../common/CommonModal';
import api from '../../services/api';
import StatusMessage from '../ui/StatusMessage';
import Button from '../ui/Button';

const EMPTY = {
  supplier_id: '',
  account_name: '',
  gst_no: '',
  mail_id: '',
  mobile_no: '',
  person_name: '',
  order_data_from: '',
  label_text_file_folder: '',
  address: '',
  username: '',
  password: '',
  bank_name: '',
  bank_account_no: '',
};

const mainFields = [
  { key: 'supplier_id', label: 'Supplier ID', icon: <FiHash size={13} />, type: 'text', required: true },
  { key: 'account_name', label: 'Account Name', icon: <FiUser size={13} />, type: 'text', required: true },
  { key: 'gst_no', label: 'GST Number', icon: <FiFileText size={13} />, type: 'text', required: true },
  { key: 'mail_id', label: 'Email ID', icon: <FiMail size={13} />, type: 'email', required: true },
  { key: 'mobile_no', label: 'Mobile No', icon: <FiPhone size={13} />, type: 'number', required: true },
  { key: 'person_name', label: 'Contact Person', icon: <FiUser size={13} />, type: 'text', required: true },
  { key: 'order_data_from', label: 'Order Data From', icon: <FiCalendar size={13} />, type: 'date', required: true },
  /* { key: 'label_text_file_folder', label: 'Label / File Folder', icon: <FiFileText size={13} />, type: 'text', required: false }, */
  { key: 'address', label: 'Address', icon: <FiMapPin size={13} />, type: 'text', required: false, textarea: true },
];

const optionalFields = [
  { key: 'username', label: 'Username', icon: <FiUser size={13} />, type: 'text', required: false },
  { key: 'password', label: 'Password', icon: <FiLock size={13} />, type: 'password', required: false },
  { key: 'bank_name', label: 'Bank Name', icon: <FiCreditCard size={13} />, type: 'text', required: false },
  { key: 'bank_account_no', label: 'Bank Account No', icon: <FiHash size={13} />, type: 'number', required: false },
];

const normalizeInitialData = (data) => Object.entries({ ...EMPTY, ...(data || {}) }).reduce((acc, [key, value]) => ({
  ...acc,
  [key]: value ?? '',
}), {});

const fieldClassName = 'w-full rounded-default border border-border bg-white px-3.5 py-3 text-sm text-text outline-none transition-all placeholder:text-text-muted/70 focus:border-primary focus:ring-4 focus:ring-primary/10';

const textareaClassName = `${fieldClassName} min-h-[108px] resize-none`;

export default function AccountModal({ mode = 'add', initialData = null, onClose, onSuccess, disableClose = false }) {
  const [form, setForm] = useState(mode === 'edit' && initialData ? normalizeInitialData(initialData) : EMPTY);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });


  useEffect(() => {
    setForm(mode === 'edit' && initialData ? normalizeInitialData(initialData) : EMPTY);
    setFeedback({ type: '', message: '' });
  }, [initialData, mode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (feedback.message) {
      setFeedback({ type: '', message: '' });
    }
    
    let processedValue = value;
    if (name === 'gst_no') processedValue = value.toUpperCase();
    if (name === 'mobile_no') processedValue = value.replace(/\D/g, '').slice(0, 10);
    if (name === 'bank_account_no') processedValue = value.replace(/\D/g, '');

    setForm((prev) => ({
      ...prev,
      [name]: processedValue,
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
        onSuccess?.(payload);
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
    <div key={key} className={textarea ? 'sm:col-span-2' : ''}>
      <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-text">
        <span className="text-primary">{icon}</span>
        {label}
        {required ? <span className="text-red-500">*</span> : null}
      </label>

      {textarea ? (
        <textarea
          className={textareaClassName}
          name={key}
          value={form[key]}
          onChange={handleChange}
          required={required}
          placeholder={label}
          rows={3}
        />
      ) : (
        <>
        <div className="relative">
          <input
            className={`${fieldClassName} ${type === 'password' ? 'pr-12' : ''}`}
            type={type === 'password' ? (showPassword ? 'text' : 'password') : (type === 'number' ? 'text' : type)}
            name={key}
            value={form[key]}
            onChange={handleChange}
            required={required}
            placeholder={key === 'gst_no' ? 'Enter GST No.' : label}
            autoComplete={type === 'password' ? 'new-password' : 'off'}
          />
          {type === 'password' && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary transition-colors"
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          )}
          {key === 'gst_no' ? (
            <p className="mt-1 text-[11px] text-text-muted">Format example: `24ABCDE1234F1Z5`</p>
          ) : null}
        </div>
        </>
      )}
    </div>
  );

  const title = mode === 'edit' ? 'Edit Account' : 'Add New Account';
  const subtitle = mode === 'edit'
    ? 'Update account details, contact information and credentials.'
    : 'Create a new account with primary details and optional access information.';

  return (
    <CommonModal
      isOpen
      onClose={disableClose ? () => {} : onClose}
      title={title}
      size="lg"
      headerStyle="gradient"
      showFooter={false}
      showCloseButton={!disableClose}
      closeOnEsc={!disableClose}
      closeOnOverlayClick={!disableClose}
    >
      <form onSubmit={handleSubmit} className="space-y-5">

        <StatusMessage type={feedback.type} message={feedback.message} className="mb-0" />

        {disableClose ? (
          <div className="flex items-start gap-3 rounded-default border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">

            <FiShield size={18} className="mt-0.5 shrink-0" />
            <span>Create your first account to continue using the dashboard.</span>
          </div>
        ) : null}

        <div className="grid gap-5">
          <section className="rounded-default border border-border bg-white shadow-sm">

            <div className="border-b border-border px-5 py-4">
              <h3 className="text-base font-extrabold text-text">Primary Account Details</h3>
              <p className="mt-1 text-sm text-text-muted">Core information used for account registration and operations.</p>
            </div>
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              {mainFields.map(renderField)}
            </div>
          </section>

          {/* <section className="space-y-5">
            <div className="rounded-default border border-border bg-surface-alt shadow-sm">

              <div className="border-b border-border px-5 py-4">
                <h3 className="text-base font-extrabold text-text">Optional Access Details</h3>
                <p className="mt-1 text-sm text-text-muted">Add credentials and bank details if they are available right now.</p>
              </div>
              <div className="grid gap-4 p-5">
                {optionalFields.map(renderField)}
              </div>
            </div>

          </section> */}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border pt-5">
          {!disableClose ? (
            <Button size="md" variant="cancel" onClick={onClose}>Cancel</Button>
          ) : null}

         <Button
          size="md"
          variant="save"
          loading={loading}
        >
          {!loading && <FiSave size={15} />}
          {mode === 'edit' ? 'Update' : 'Save'}
        </Button>
        </div>
      </form>
    </CommonModal>
  );
}
