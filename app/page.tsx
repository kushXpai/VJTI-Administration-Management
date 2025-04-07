// app/page.tsx

"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/supabase/supabaseClient';
import { User, Lock, Eye, EyeOff } from 'lucide-react';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const colors = {
    primary: '#800000',        // Maroon
    primaryDark: '#5A0000',    // Darker Maroon
    primaryLight: '#FFE6E6',   // Light Maroon
    secondary: '#800000',      // Maroon
    surfaceLight: '#FFFFFF',   // White
    surfaceMedium: '#F9F9F9',  // Light Gray
    surfaceDark: '#E0E0E0',    // Gray
    textPrimary: '#000000',    // Black
    textSecondary: '#333333',  // Dark Gray
    textTertiary: '#777777',   // Medium Gray
    textInverse: '#FFFFFF',    // White
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, name, password, role')
        .eq('email', email)
        .single();

      if (profileError) {
        throw new Error('Invalid email or password');
      }

      if (profileData.password !== password) {
        throw new Error('Invalid email or password');
      }

      localStorage.setItem('user', JSON.stringify({
        id: profileData.id,
        email: profileData.email,
        name: profileData.name,
        role: profileData.role
      }));

      if (profileData.role === 'admin') {
        router.push('/Admin/AdminDashboard');
      } else {
        router.push('/Student/StudentDashboard');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to sign in');
      }
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div
        className="w-full max-w-md rounded-xl shadow-2xl overflow-hidden"
        style={{
          backgroundColor: colors.surfaceLight,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
      >
        <div className="px-8 py-6" style={{ backgroundColor: colors.primary }}>
          <h1 className="text-3xl font-bold text-center" style={{ color: colors.textInverse }}>
            Sign In
          </h1>
        </div>

        <div className="px-8 py-10">
          <form onSubmit={handleSignIn} className="space-y-8">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium" style={{ color: colors.textPrimary }}>
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5" style={{ color: colors.textTertiary }} />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3 rounded-lg shadow-sm text-base"
                  style={{
                    borderColor: colors.surfaceDark,
                    color: colors.textPrimary,
                    backgroundColor: colors.surfaceLight
                  }}
                  placeholder="Enter your email address"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium" style={{ color: colors.textPrimary }}>
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5" style={{ color: colors.textTertiary }} />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-12 pr-12 py-3 rounded-lg shadow-sm text-base"
                  style={{
                    borderColor: colors.surfaceDark,
                    color: colors.textPrimary,
                    backgroundColor: colors.surfaceLight
                  }}
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" style={{ color: colors.textTertiary }} />
                  ) : (
                    <Eye className="h-5 w-5" style={{ color: colors.textTertiary }} />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm p-3 rounded-lg" style={{ backgroundColor: "rgba(254, 202, 202, 0.2)" }}>
                {error}
              </div>
            )}

            <div className="flex justify-end">
              <Link href="/Authentication/ForgotPassword" className="text-sm font-medium hover:underline" style={{ color: colors.primary }}>
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 rounded-lg shadow-lg text-base font-medium transition-all duration-200 hover:scale-[1.02]"
              style={{
                backgroundColor: colors.primary,
                color: colors.textInverse,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
              onMouseOver={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = colors.primaryDark;
              }}
              onMouseOut={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = colors.primary;
              }}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <span className="text-base" style={{ color: colors.textSecondary }}>
              Don&apos;t have an account?{" "}
            </span>
            <Link href="/Authentication/SignUp" className="text-base font-medium hover:underline" style={{ color: colors.primary }}>
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}