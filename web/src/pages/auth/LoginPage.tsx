import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname;

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', {
        email,
        password
      });

      login(response.data.access_token);
      
      // Navigate to the attempted URL or let ProtectedRoute handle default redirect
      if (from) {
        navigate(from, { replace: true });
      } else {
        // Just navigate to root, ProtectedRoute will catch it and redirect appropriately
        navigate('/', { replace: true });
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 bg-surface rounded-xl shadow-lg border border-border">
        <h1 className="text-h2 font-semibold text-primary mb-6 text-center">Placement Assistant</h1>
        <h2 className="text-xl font-medium text-text-primary mb-6">Sign In</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded border border-red-200 text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 rounded bg-background border border-border text-text-primary focus:outline-none focus:border-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 rounded bg-background border border-border text-text-primary focus:outline-none focus:border-primary"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-2 px-4 bg-primary text-white rounded font-medium hover:bg-opacity-90 disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm text-text-secondary space-y-2">
          <p>Don't have an account?</p>
          <div className="flex justify-center space-x-4">
            <Link to="/register/student" className="text-primary hover:underline">Register as Student</Link>
            <Link to="/register/company" className="text-primary hover:underline">Register as Company</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
