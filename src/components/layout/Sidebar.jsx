import { NavLink } from 'react-router-dom';
import '../../styles/layout.css';

const links = [
  { to: '/dashboard', label: '🏠 Dashboard' },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {links.map(({ to, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
