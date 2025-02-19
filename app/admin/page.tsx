'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import AtomLoader from '@/components/AtomLoader';
import ParticlesBackground from '@/components/ParticlesBackground';
import { FaUserShield, FaLock } from 'react-icons/fa';
import toast from 'react-hot-toast';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminSession();
  }, []);

  const checkAdminSession = async () => {
    try {
      // Check if admin is already logged in
      const adminId = localStorage.getItem('adminId');
      const adminUsername = localStorage.getItem('adminUsername');
      const adminToken = localStorage.getItem('adminToken');

      if (adminId && adminUsername && adminToken) {
        // Verify token with database
        const { data: admin, error } = await supabase
          .from('admins')
          .select()
          .eq('id', adminId)
          .eq('username', adminUsername)
          .single();

        if (admin && !error) {
          // Valid session, redirect to dashboard
          router.push('/admin/dashboard');
          return;
        }
      }
      setLoading(false);
    } catch (err) {
      console.error('Error checking admin session:', err);
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data: admin, error } = await supabase
        .from('admins')
        .select()
        .eq('username', username)
        .eq('password_hash', password)
        .single();

      if (error || !admin) {
        setLoading(false);
        setError('Only TeamGTC Officials Allowed');
        toast.error('Only TeamGTC Officials Allowed', {
          style: {
            background: '#FF3B30',
            color: '#fff',
            fontWeight: 'bold',
          },
          duration: 3000,
          position: 'top-center',
        });
        return;
      }

      // Store admin session
      const token = generateToken();
      localStorage.setItem('adminId', admin.id);
      localStorage.setItem('adminUsername', admin.username);
      localStorage.setItem('adminToken', token);

      // Redirect to dashboard
      router.push('/admin/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to login');
      toast.error('Only TeamGTC Officials Allowed', {
        style: {
          background: '#FF3B30',
          color: '#fff',
          fontWeight: 'bold',
        },
        duration: 3000,
        position: 'top-center',
      });
      setLoading(false);
    }
  };

  const generateToken = () => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <AtomLoader />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <ParticlesBackground />
      
      <div className="relative z-10 w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-24 h-24 relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse"></div>
              <div className="absolute inset-2 bg-primary/30 rounded-full"></div>
              <FaUserShield className="w-full h-full text-primary/80 relative z-10 p-5" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Portal</h1>
          <p className="text-gray-400 text-sm">--- BtechNode Panel ---</p>
        </div>

        {/* Login Card */}
        <div className="bg-dark-light/10 backdrop-blur-md rounded-xl p-8 shadow-2xl border border-gray-800/30">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="relative">
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
                Username
              </label>
              <div className="relative">
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-dark-light/30 text-white border border-gray-700 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200"
                  required
                />
                <FaUserShield className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
              </div>
            </div>

            <div className="relative">
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-dark-light/30 text-white border border-gray-700 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200"
                  required
                />
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center bg-red-500/10 py-2 px-4 rounded-lg border border-red-500/20">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-primary/80 hover:bg-primary text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-primary/20 relative overflow-hidden group"
            >
              <span className="relative z-10">Secure Login</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Authorized Personnel Only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
