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
    primary: '#800000',
    primaryDark: '#5A0000',
    primaryLight: '#FFE6E6',
    surfaceLight: '#FFFFFF',
    surfaceDark: '#E0E0E0',
    textPrimary: '#000000',
    textSecondary: '#333333',
    textTertiary: '#777777',
    textInverse: '#FFFFFF',
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data: user, error: profileError } = await supabase
        .from('profiles_db')
        .select('student_id, email, name, password, role')
        .eq('email', email)
        .single();

      if (profileError || !user || user.password !== password) {
        throw new Error('Invalid email or password');
      }

      // Store user info
      localStorage.setItem('user', JSON.stringify({
        id: user.student_id,
        email: user.email,
        name: user.name,
        role: user.role
      }));

      // Route based on role
      switch (user.role) {
        case 'Admin':
          router.push('/Admin/AdminDashboard');
          break;
        case 'Student':
          router.push('/Student/StudentDashboard');
          break;
        case 'Worker':
          router.push('/Worker/WorkerDashboard');
          break;
        case 'Grievances_Supervisor':
          router.push('/Supervisor/SupervisorDashboard');
          break;
        default:
          router.push('/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 relative"
      style={{ backgroundImage: 'url(/images/VJTI_Background.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <div className="absolute inset-0 bg-black opacity-70" />
      <div className="w-full max-w-lg rounded-xl shadow-2xl overflow-hidden relative z-10" style={{ backgroundColor: colors.surfaceLight }}>
        <div className="px-10 py-8" style={{ backgroundColor: colors.primary }}>
          <h1 className="text-3xl font-bold text-center" style={{ color: colors.textInverse }}>
            Sign In
          </h1>
        </div>

        <div className="px-10 py-12">
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
                  placeholder="Enter your email"
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
                  type={showPassword ? 'text' : 'password'}
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
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm p-3 rounded-lg bg-red-100">
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
              Don&apos;t have an account?{' '}
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