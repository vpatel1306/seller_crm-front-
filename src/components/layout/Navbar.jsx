import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
export default function Navbar() {
  const { user, logout } = useAuth();
  return (
    <header className="navbar">
      <span className="navbar-brand">Meesho Seller Insight</span>
      <div className="navbar-right">
        {user && <span className="navbar-user">👤 {user.name}</span>}
        <Button variant="outline" onClick={logout}>Logout</Button>
      </div>
    </header>
  );
}
