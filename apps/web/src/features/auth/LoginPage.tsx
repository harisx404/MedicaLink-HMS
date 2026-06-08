import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, Building2, ShieldCheck, Mail, Lock, Loader2 } from 'lucide-react';
import { useLoginMutation, useVerify2FAMutation } from './authApi';
import { useDispatch } from 'react-redux';
import { setCredentials, setRequires2FA } from '../../store/slices/authSlice';

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<'LOGIN' | '2FA'>('LOGIN');
  const [tempUserId, setTempUserId] = useState<string | null>(null);
  const [totpCode, setTotpCode] = useState('');
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const [verify2FA, { isLoading: is2FALoading }] = useVerify2FAMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { rememberMe: false },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const response = await login({ email: data.email, password: data.password }).unwrap();
      
      if (response.data.requires2FA) {
        setTempUserId(response.data.user.id);
        dispatch(setRequires2FA({ tempUserId: response.data.user.id }));
        setStep('2FA');
        toast.success('Please enter your 2FA code');
      } else {
        const { user, accessToken, tenant } = response.data;
        dispatch(
          setCredentials({
            user,
            token: accessToken,
            tenantSlug: tenant?.slug,
          })
        );
        toast.success('Welcome back!');
        navigate('/');
      }
    } catch (err) {
      const error = err as { data?: { message?: string } };
      toast.error(error?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totpCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    try {
      const response = await verify2FA({ userId: tempUserId, totpCode }).unwrap();
      const { user, accessToken, tenant } = response.data;
      
      dispatch(
        setCredentials({
          user,
          token: accessToken,
          tenantSlug: tenant?.slug,
        })
      );
      toast.success('Authentication successful!');
      navigate('/');
    } catch (err) {
      const error = err as { data?: { message?: string } };
      toast.error(error?.data?.message || 'Invalid 2FA code.');
    }
  };

  return (
    <div className="flex min-h-screen bg-app">
      {/* Left Panel - Branding & Gradient */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-gradient-to-br from-indigo-900 via-indigo-800 to-teal-900 p-12 text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/20">
              <Building2 className="w-8 h-8 text-teal-300" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">MedicaLink HMS</h1>
          </div>
        </div>

        <div className="relative z-10 max-w-xl">
          <h2 className="text-4xl font-bold leading-tight mb-6">
            Intelligent Healthcare Management
          </h2>
          <p className="text-indigo-100 text-lg leading-relaxed mb-8">
            Empowering hospitals with seamless multi-tenant architecture, comprehensive patient care workflows, and predictive AI analytics.
          </p>
          <div className="flex items-center gap-4 text-sm font-medium text-teal-200">
            <ShieldCheck className="w-5 h-5" />
            <span>HIPAA Compliant</span>
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
            <span>Enterprise Grade Security</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-24 xl:px-32 relative bg-white">
        <div className="mx-auto w-full max-w-md">
          <div className="lg:hidden mb-10 flex items-center gap-3">
            <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100">
              <Building2 className="w-8 h-8 text-indigo-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">MedicaLink HMS</h1>
          </div>

          <AnimatePresence mode="wait">
            {step === 'LOGIN' ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-3xl font-bold tracking-tight text-gray-900">Welcome back</h2>
                <p className="mt-2 text-sm text-gray-500">
                  Please sign in to access your hospital workspace
                </p>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium leading-6 text-gray-900">
                        Email address
                      </label>
                      <div className="mt-2 relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <Mail className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                          {...register('email')}
                          type="email"
                          autoComplete="email"
                          className={`block w-full rounded-xl border-0 py-3 pl-10 pr-4 text-gray-900 shadow-sm ring-1 ring-inset ${errors.email ? 'ring-red-300 focus:ring-red-500' : 'ring-gray-300 focus:ring-indigo-600'} placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 transition-all`}
                          placeholder="admin@hospital.com"
                        />
                      </div>
                      {errors.email && (
                        <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium leading-6 text-gray-900">
                        Password
                      </label>
                      <div className="mt-2 relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <Lock className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                          {...register('password')}
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="current-password"
                          className={`block w-full rounded-xl border-0 py-3 pl-10 pr-12 text-gray-900 shadow-sm ring-1 ring-inset ${errors.password ? 'ring-red-300 focus:ring-red-500' : 'ring-gray-300 focus:ring-indigo-600'} placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 transition-all`}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        {...register('rememberMe')}
                        id="remember-me"
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                      />
                      <label htmlFor="remember-me" className="ml-3 block text-sm leading-6 text-gray-700 cursor-pointer">
                        Remember me
                      </label>
                    </div>

                    <div className="text-sm leading-6">
                      <Link to="/forgot-password" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
                        Forgot password?
                      </Link>
                    </div>
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={isLoginLoading}
                      className="flex w-full justify-center items-center rounded-xl bg-indigo-600 px-3 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0"
                    >
                      {isLoginLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin mr-2" />
                          Signing in...
                        </>
                      ) : (
                        'Sign in'
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="2fa"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="bg-indigo-50 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                  <ShieldCheck className="w-8 h-8 text-indigo-600" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-gray-900">Two-Factor Authentication</h2>
                <p className="mt-2 text-sm text-gray-500">
                  Enter the 6-digit code from your authenticator app to continue.
                </p>

                <form className="mt-8 space-y-6" onSubmit={handle2FASubmit}>
                  <div>
                    <label htmlFor="totpCode" className="sr-only">
                      Authentication Code
                    </label>
                    <input
                      id="totpCode"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={totpCode}
                      onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                      className="block w-full rounded-xl border-0 py-4 text-center text-3xl tracking-widest text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 transition-all"
                      placeholder="000000"
                      autoFocus
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setStep('LOGIN')}
                      className="flex-1 justify-center rounded-xl bg-white px-3 py-3 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-all"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={is2FALoading || totpCode.length !== 6}
                      className="flex-1 flex justify-center items-center rounded-xl bg-indigo-600 px-3 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0"
                    >
                      {is2FALoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        'Verify'
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
