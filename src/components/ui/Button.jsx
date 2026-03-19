import { motion } from 'framer-motion';
export default function Button({ children, loading, variant = 'primary', ...props }) {
  return (
    <motion.button
      className={`btn btn-${variant}`}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <span className="btn-spinner" /> : children}
    </motion.button>
  );
}
