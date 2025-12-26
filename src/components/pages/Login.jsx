import React, { useState, useEffect } from 'react';
import { authAPI } from '../../services/api';
import logo from '../../assets/images/logo1.png';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Initialize error from sessionStorage
  const [error, setError] = useState(() => {
    const savedError = sessionStorage.getItem('loginError');
    return savedError || '';
  });

  useEffect(() => {
    console.log('Login component mounted');
    
    // Clear error from sessionStorage when component mounts
    return () => {
      console.log('Login component unmounting');
    };
  }, []);

  useEffect(() => {
    console.log('Error state changed:', error);
    // Save error to sessionStorage whenever it changes
    if (error) {
      sessionStorage.setItem('loginError', error);
    } else {
      sessionStorage.removeItem('loginError');
    }
  }, [error]);

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const authPayload = await authAPI.login(email, password);
    onLogin(authPayload); // purely state / navigation
  } catch (err) {
    const errorMessage =
      err.response?.data?.message ||
      "Invalid credentials. Please try again.";

    setError(errorMessage);
  } finally {
    setLoading(false);
  }
};


  const clearError = () => {
    setError('');
    sessionStorage.removeItem('loginError');
  };

  return (
    <div className="min-h-screen bg-cyan-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-cyan-500 p-8 text-center">
          <div className="w-24 h-24 bg-white rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
            <div className="w-16 h-16 rounded-xl"><img src={logo} alt="" /></div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-cyan-100">Blingoo</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8">
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) clearError();
              }}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-cyan-500 focus:outline-none transition"
              placeholder="admin@example.com"
              required
              disabled={loading}
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) clearError();
              }}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-cyan-500 focus:outline-none transition"
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>
          
          {error && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg">
              <p className="font-semibold">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-400 text-white py-3 rounded-lg font-semibold hover:bg-cyan-500 transition shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </span>
            ) : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;