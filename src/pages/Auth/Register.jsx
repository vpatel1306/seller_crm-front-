import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

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
    <div className="auth-page">
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Join Meesho Seller Insight</p>
        {apiError && <div className="auth-error">{apiError}</div>}
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <Input label="Full Name" name="name" value={form.name} onChange={handleChange} placeholder="Enter your name" error={errors.name} />
          <Input label="Email" type="email" name="email" value={form.email} onChange={handleChange} placeholder="Enter your email" error={errors.email} />
          <Input label="Password" type="password" name="password" value={form.password} onChange={handleChange} placeholder="••••••••" error={errors.password} />
          <Input label="Contact" type="tel" name="contact" value={form.contact} onChange={handleChange} placeholder="9876543210" error={errors.contact} />
          <Button type="submit" loading={loading}>Register</Button>
        </form>
        <p className="auth-footer">Already have an account? <Link to="/">Sign In</Link></p>
      </motion.div>
    </div>
  );
}
