"use client"
import { useState } from 'react';

export default function Register() {
  // 1. Store form input state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 2. Handle input changes dynamically
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 3. Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields.');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API Login Request
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log('Logging in with:', formData);
      alert('Login successful!');
    } catch (err) {
      setError('Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-md border border-gray-100">
        
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Please enter your details to sign in
          </p>
        </div>

        {/* Error Alert Panel */}
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100 animate-pulse">
            {error}
          </div>
        )}

        {/* Form Element */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
                placeholder="you@example.com"
              />
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <a href="#" className="text-xs font-medium text-blue-600 hover:text-blue-500">
                  Forgot password?
                </a>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Form Extras */}
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600 select-none">
              Remember me for 30 days
            </label>
          </div>

          {/* Submit Action Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm
                ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </div>
        </form>

        {/* Footer Prompt */}
        <p className="text-center text-sm text-gray-500 mt-4">
          Don't have an account?{' '}
          <a href="#" className="font-semibold text-blue-600 hover:text-blue-500">
            Sign up for free
          </a>
        </p>

      </div>
    </div>
  );
}
