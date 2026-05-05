import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

import logoImage from '../../assets/favicon.png';

const PASSWORD_SPECIAL_CHAR_REGEX = /[@$!%*?&#^()\-_=+{}[\]|\\:;"'<>,./]/;

const getPasswordError = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters long';
  if (!/[A-Za-z]/.test(password)) return 'Password must contain at least one letter';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
  if (!PASSWORD_SPECIAL_CHAR_REGEX.test(password)) {
    return 'Password must contain at least one special character';
  }
  return '';
};

const validate = ({ name, email, password, contact }) => {
  const errors = {};
  if (!name) errors.name = 'Name is required';
  if (!email) errors.email = 'Email is required';
  else if (!/\S+@\S+\.\S+/.test(email)) errors.email = 'Invalid email';
  const passwordError = getPasswordError(password);
  if (passwordError) errors.password = passwordError;
  if (!contact) errors.contact = 'Contact is required';
  else if (!/^\d{10}$/.test(contact)) errors.contact = 'Must be 10 digits';
  return errors;
};

export default function Register() {
  const { register, token } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', contact: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);


  if (token) return <Navigate to="/dashboard" replace />;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'contact') {
      const digits = value.replace(/\D/g, '').slice(0, 10);
      setForm({ ...form, [name]: digits });
    } else {
      setForm({ ...form, [name]: value });
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) return setErrors(errs);
    setErrors({});
    setApiError('');
    setLoading(true);
    try {
      await register({ ...form, contact: Number(form.contact) });
    } catch (err) {
      setApiError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(135deg,#f9f6ee_0%,#eef8f5_45%,#fffdf8_100%)] font-sans">
      <div className="absolute inset-0">
        <div className="absolute -right-24 top-14 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute left-0 top-0 h-80 w-80 rounded-full bg-amber-300/20 blur-3xl" />
        <div className="absolute bottom-0 right-1/3 h-64 w-64 rounded-full bg-emerald-200/30 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">

        <div className="flex flex-1 items-center justify-center py-8 sm:py-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="relative w-full max-w-xl rounded-[32px] border border-white/70 bg-white/88 px-6 pb-8 pt-16 shadow-[0_24px_80px_rgba(23,32,51,0.12)] backdrop-blur-xl sm:px-8 sm:pb-10 sm:pt-18 lg:px-10"
          >
            <div className="absolute left-1/2 top-0 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center overflow-hidden rounded-[28px] border border-primary/10 bg-white shadow-[0_18px_30px_rgba(15,118,110,0.12)]">
              <img src={logoImage} alt="Seller CRM" className="h-full w-full object-contain p-2.5" />
            </div>

            <div className="mb-3 flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-amber-100 px-5 py-2 text-[0.68rem] font-extrabold uppercase tracking-[0.3em] text-amber-700">
                Create Your Account
              </div>
            </div>

            {apiError && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-6 flex items-center gap-2 rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600"
              >
                <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" />
                {apiError}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <label className="ml-1 text-sm font-extrabold text-text">Full Name</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className={`w-full rounded-[18px] border bg-[#fffdfa] px-4 py-3.5 text-sm text-text outline-none transition-all placeholder:text-text-muted/70 focus:ring-4 focus:ring-primary/10 ${errors.name ? 'border-red-400 bg-red-50' : 'border-border focus:border-primary'}`}
                    disabled={loading}
                  />
                  {errors.name && <span className="ml-1 text-xs font-bold text-red-500">{errors.name}</span>}
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="ml-1 text-sm font-extrabold text-text">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                    className={`w-full rounded-[18px] border bg-[#fffdfa] px-4 py-3.5 text-sm text-text outline-none transition-all placeholder:text-text-muted/70 focus:ring-4 focus:ring-primary/10 ${errors.email ? 'border-red-400 bg-red-50' : 'border-border focus:border-primary'}`}
                    disabled={loading}
                  />
                  {errors.email && <span className="ml-1 text-xs font-bold text-red-500">{errors.email}</span>}
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="ml-1 text-sm font-extrabold text-text">Mobile Number</label>
                  <input
                    type="text"
                    name="contact"
                    value={form.contact}
                    onChange={handleChange}
                    placeholder="Enter your mobile number"
                    className={`w-full rounded-[18px] border bg-[#fffdfa] px-4 py-3.5 text-sm text-text outline-none transition-all placeholder:text-text-muted/70 focus:ring-4 focus:ring-primary/10 ${errors.contact ? 'border-red-400 bg-red-50' : 'border-border focus:border-primary'}`}
                    disabled={loading}
                  />
                  {errors.contact && <span className="ml-1 text-xs font-bold text-red-500">{errors.contact}</span>}
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="ml-1 text-sm font-extrabold text-text">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      className={`w-full rounded-[18px] border bg-[#fffdfa] pl-4 pr-12 py-3.5 text-sm text-text outline-none transition-all placeholder:text-text-muted/70 focus:ring-4 focus:ring-primary/10 ${errors.password ? 'border-red-400 bg-red-50' : 'border-border focus:border-primary'}`}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary transition-colors"
                    >
                      {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                  <p className="ml-1 text-xs text-text-muted">
                    Use 8+ characters with at least 1 letter, 1 number, and 1 special character.
                  </p>
                  {errors.password && <span className="ml-1 text-xs font-bold text-red-500">{errors.password}</span>}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex h-13 w-full items-center justify-center rounded-[18px] bg-primary text-base font-extrabold text-white shadow-[0_18px_30px_rgba(15,118,110,0.28)] transition-all hover:bg-primary-hover active:scale-[0.99] disabled:pointer-events-none disabled:opacity-60"
              >
                {loading ? (
                  <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : 'Create Account'}
              </button>
            </form>

            <div className="mt-8 border-t border-border/70 pt-6 text-center">
              <p className="text-sm font-medium text-text-muted">
                Already have an account?{' '}
                <Link to="/" className="font-extrabold text-primary hover:text-primary-hover">
                  Sign In
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
