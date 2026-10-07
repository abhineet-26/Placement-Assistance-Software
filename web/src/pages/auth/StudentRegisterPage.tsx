import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../lib/api';

export default function StudentRegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    roll_number: '',
    full_name: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await api.post('/auth/register/student', formData);
      // On success, redirect to login
      navigate('/login', { state: { message: 'Registration successful! Please sign in.' } });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 bg-surface rounded-xl shadow-lg border border-border">
        <h2 className="text-xl font-medium text-text-primary mb-6 text-center">Student Registration</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded border border-red-200 text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Full Name</label>
            <input 
              type="text" 
              name="full_name"
              required
              value={formData.full_name}
              onChange={handleChange}
              className="w-full p-2 rounded bg-background border border-border text-text-primary focus:outline-none focus:border-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Roll Number</label>
            <input 
              type="text" 
              name="roll_number"
              required
              value={formData.roll_number}
              onChange={handleChange}
              className="w-full p-2 rounded bg-background border border-border text-text-primary focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Email</label>
            <input 
              type="email" 
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 rounded bg-background border border-border text-text-primary focus:outline-none focus:border-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Password</label>
            <input 
              type="password" 
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full p-2 rounded bg-background border border-border text-text-primary focus:outline-none focus:border-primary"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-2 px-4 bg-primary text-white rounded font-medium hover:bg-opacity-90 disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Registering...' : 'Register as Student'}
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm text-text-secondary">
          Already have an account? <Link to="/login" className="text-primary hover:underline">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
