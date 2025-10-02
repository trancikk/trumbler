import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <nav className="container">
        <div>
          <Link to="/">
            <h1>Trumbler</h1>
          </Link>
        </div>
        <div>
          {user ? (
            <>
              {user.role === 'CREATOR' && (
                <Link to="/creator/dashboard">Dashboard</Link>
              )}
              {user.role === 'VIEWER' && (
                <Link to="/viewer/dashboard">Dashboard</Link>
              )}
              <span style={{ marginLeft: '20px' }}>{user.email}</span>
              <button onClick={handleLogout} className="btn btn-secondary" style={{ marginLeft: '10px' }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Header;
