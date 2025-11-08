'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Login from '@/components/Login';
import { initializeAdminUser } from '@/lib/db';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Initialize admin user on app start
    initializeAdminUser()
      .catch(console.error)
      .finally(() => setInitialized(true));
  }, []);

  useEffect(() => {
    // Only redirect if user successfully logs in
    if (!loading && initialized && user) {
      const timer = setTimeout(() => {
        router.replace('/dashboard');
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [user, loading, initialized, router]);

  // Show loading briefly while initializing
  if (loading || !initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Always show login page - user will be redirected after successful login
  return <Login />;
}
