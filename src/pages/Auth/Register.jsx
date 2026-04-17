import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const validate = ({ name, email, password, contact }) => {
  const errors = {};
  if (!name) errors.name = 'Name is required';
  if (!email) errors.email = 'Email is required';
  else if (!/\S+@\S+\.\S+/.test(email)) errors.email = 'Invalid email';
  if (!password) errors.password = 'Password is required';
  else if (password.length < 6) errors.password = 'Min 6 characters';
  if (!contact) errors.contact = 'Contact is required';
  else if (!/^\d{10}$/.test(contact)) errors.contact = 'Must be 10 digits';
  return errors;
};

import { motion } from 'framer-motion';

export default function Register() {
  const { register, token } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', contact: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  if (token) return <Navigate to="/dashboard" replace />;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

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
    <div className="min-h-screen bg-bg flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#0d6efd]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-3xl animate-pulse" />

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full max-w-md p-10 border border-[#e5e7eb] relative z-10"
      >
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-[#1a1a2e] mb-3 tracking-tight">Create Account</h1>
          <p className="text-[#6b7280] font-medium">Join us and start managing your business</p>
        </div>

        {apiError && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm mb-6 flex items-center gap-2"
          >
            <span className="w-1.5 h-1.5 bg-red-600 rounded-full shrink-0" />
            {apiError}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-[#1a1a2e] ml-0.5">Full Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              className={`w-full px-4 py-3 bg-white border rounded-xl text-sm transition-all focus:ring-4 focus:ring-[#0d6efd]/10 outline-none ${errors.name ? 'border-red-500 bg-red-50' : 'border-[#e5e7eb] focus:border-[#0d6efd]'}`}
              disabled={loading}
            />
            {errors.name && <span className="text-[11px] text-red-500 font-bold ml-1">{errors.name}</span>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-[#1a1a2e] ml-0.5">Email Address</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email address"
              className={`w-full px-4 py-3 bg-white border rounded-xl text-sm transition-all focus:ring-4 focus:ring-[#0d6efd]/10 outline-none ${errors.email ? 'border-red-500 bg-red-50' : 'border-[#e5e7eb] focus:border-[#0d6efd]'}`}
              disabled={loading}
            />
            {errors.email && <span className="text-[11px] text-red-500 font-bold ml-1">{errors.email}</span>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-[#1a1a2e] ml-0.5">Mobile Number</label>
            <input
              type="tel"
              name="contact"
              value={form.contact}
              onChange={handleChange}
              placeholder="Enter your mobile number"
              className={`w-full px-4 py-3 bg-white border rounded-xl text-sm transition-all focus:ring-4 focus:ring-[#0d6efd]/10 outline-none ${errors.contact ? 'border-red-500 bg-red-50' : 'border-[#e5e7eb] focus:border-[#0d6efd]'}`}
              disabled={loading}
            />
            {errors.contact && <span className="text-[11px] text-red-500 font-bold ml-1">{errors.contact}</span>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-[#1a1a2e] ml-0.5">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className={`w-full px-4 py-3 bg-white border rounded-xl text-sm transition-all focus:ring-4 focus:ring-[#0d6efd]/10 outline-none ${errors.password ? 'border-red-500 bg-red-50' : 'border-[#e5e7eb] focus:border-[#0d6efd]'}`}
              disabled={loading}
            />
            {errors.password && <span className="text-[11px] text-red-500 font-bold ml-1">{errors.password}</span>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 mt-6 bg-[#0d6efd] text-white rounded-xl font-bold text-lg hover:bg-[#0b5ed7] transition-all active:scale-[0.98] shadow-[0_4px_16px_rgba(13,110,253,0.3)] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center font-sans"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : "Create Account"}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-[#f3f4f6] text-center">
          <p className="text-sm text-[#6b7280]">
            Already have an account?{' '}
            <Link to="/" className="text-[#0d6efd] font-extrabold hover:text-[#0b5ed7] transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
