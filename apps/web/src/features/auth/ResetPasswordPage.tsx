import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Building2, Lock, Loader2, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useResetPasswordMutation } from './authApi';

const schema = z.object({
  password: z.string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .regex(/[A-Z]/, { message: 'Must contain at least one uppercase letter' })
    .regex(/[a-z]/, { message: 'Must contain at least one lowercase letter' })
    .regex(/[0-9]/, { message: 'Must contain at least one number' }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof schema>;

export const ResetPasswordPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const password = watch('password', '');
  
  const calculateStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length > 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[a-z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
    return Math.min(4, score);
  };

  const strength = calculateStrength(password);
  
  const getStrengthColor = (s: number) => {
    if (s === 0) return 'bg-gray-200';
    if (s === 1) return 'bg-red-400';
    if (s === 2) return 'bg-orange-400';
    if (s === 3) return 'bg-yellow-400';
    return 'bg-green-500';
  };

  const onSubmit = async (data: FormValues) => {
    if (!token) {
      toast.error('Invalid or missing reset token');
      return;
    }

    try {
      await resetPassword({ token, newPassword: data.password }).unwrap();
      toast.success('Password has been reset successfully!');
      navigate('/login');
    } catch (err) {
      const error = err as { data?: { message?: string } };
      toast.error(error?.data?.message || 'Failed to reset password. The link might have expired.');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-teal-400 rounded-full blur-3xl mix-blend-multiply"></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-6">
          <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
            <Building2 className="w-10 h-10 text-indigo-600" />
          </div>
        </div>
        <h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-gray-900">
          Create new password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Your new password must be different from previous used passwords.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white py-10 px-6 shadow-xl shadow-indigo-100/50 sm:rounded-2xl sm:px-10 border border-gray-100"
        >
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="block text-sm font-medium leading-6 text-gray-900">
                New Password
              </label>
              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
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
              
              {/* Password Strength Indicator */}
              {password.length > 0 && (
                <div className="mt-3">
                  <div className="flex gap-1 h-1.5 w-full">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`flex-1 rounded-full transition-colors duration-300 ${strength >= i ? getStrengthColor(strength) : 'bg-gray-200'}`}
                      />
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    {strength < 2 && "Weak password. "}
                    {strength === 2 && "Fair password. "}
                    {strength === 3 && "Good password. "}
                    {strength === 4 && "Strong password. "}
                    Use 8+ characters with a mix of letters and numbers.
                  </p>
                </div>
              )}
              
              {errors.password && (
                <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium leading-6 text-gray-900">
                Confirm Password
              </label>
              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <ShieldCheck className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  {...register('confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  className={`block w-full rounded-xl border-0 py-3 pl-10 pr-12 text-gray-900 shadow-sm ring-1 ring-inset ${errors.confirmPassword ? 'ring-red-300 focus:ring-red-500' : 'ring-gray-300 focus:ring-indigo-600'} placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 transition-all`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full justify-center items-center rounded-xl bg-indigo-600 px-3 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Resetting...
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>
            </div>
            
            <div className="text-center mt-6">
              <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">
                Cancel and return to login
              </Link>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};
