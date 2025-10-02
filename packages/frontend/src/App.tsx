import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import Login from './pages/Login';
import Register from './pages/Register';
import ContentList from './pages/ContentList';
import ContentDetail from './pages/ContentDetail';
import CreatorDashboard from './pages/CreatorDashboard';
import ViewerDashboard from './pages/ViewerDashboard';

function PrivateRoute({ children, role }: { children: React.ReactNode; role?: string }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<ContentList />} />
      <Route path="/content/:id" element={<ContentDetail />} />
      <Route
        path="/creator/dashboard"
        element={
          <PrivateRoute role="CREATOR">
            <CreatorDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/viewer/dashboard"
        element={
          <PrivateRoute role="VIEWER">
            <ViewerDashboard />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Header />
        <div className="container">
          <AppRoutes />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
