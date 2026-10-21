"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import PublishedPolicyLinks from "@/app/components/PublishedPolicyLinks";
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          token: credentialResponse.credential,
          rememberMe
        })
      });
      const data = await res.json();
      
      if (res.ok && data.data?.user) {
        setUser(data.data.user);
        router.push('/');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err: any) {
      console.error("Login fetch error:", err);
      setError('An error occurred during sign in: ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 bg-[url('/bg-pattern.svg')]">
      <div className="max-w-md w-full space-y-8 bg-white/80 backdrop-blur-xl p-10 rounded-3xl shadow-xl border border-white/50">
        <div>
          <div className="flex justify-center">
            <Image src="/mobile-rates-logo.svg" unoptimized alt="Mobile Rates" width={240} height={80} className="h-14 w-[280px] max-w-full object-contain" />
          </div>
          <h2 className="mt-4 text-center text-3xl font-extrabold text-gray-900">
            Sign in
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Compare prices, save your favorites, and manage your account.
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center border border-red-100">
            {error}
          </div>
        )}

        <div className="mt-8 space-y-6">
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me for 30 days
              </label>
            </div>
          </div>

          <div className="pt-4 flex justify-center">
            {loading ? (
              <div className="animate-pulse text-indigo-600 font-medium">Signing in...</div>
            ) : (
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google Login Failed')}
                useOneTap
                theme="outline"
                size="large"
                shape="pill"
                text="signin_with"
                width="100%"
              />
            )}
          </div>
        </div>

        <PublishedPolicyLinks />
      </div>
    </div>
  );
}
