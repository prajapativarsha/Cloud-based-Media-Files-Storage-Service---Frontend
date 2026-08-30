import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function DashboardPlaceholder() {
  const { user, logout } = useAuth();
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Welcome, {user?.name || user?.display_name || user?.email}</h1>
      <p className="text-slate-500 mt-1">Ready for Day 9: Dashboard Layout & File Explorer UI.</p>
      <button
        onClick={logout}
        className="mt-4 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg"
      >
        Sign Out
      </button>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardPlaceholder />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}