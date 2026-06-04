import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { useVerifyEmailMutation } from './authApi';
import { toast } from 'react-hot-toast';

export const VerifyEmailPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [verifyEmail] = useVerifyEmailMutation();
  
  const [status, setStatus] = useState<'LOADING' | 'SUCCESS' | 'ERROR'>('LOADING');

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus('ERROR');
        return;
      }

      try {
        await verifyEmail(token).unwrap();
        setStatus('SUCCESS');
        toast.success('Email verified successfully!');
      } catch (err) {
        setStatus('ERROR');
        toast.error('Verification failed. The link might be expired or invalid.');
      }
    };

    verify();
  }, [token, verifyEmail]);

  return (
    <div className="flex min-h-screen bg-gray-50 flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-teal-400 rounded-full blur-3xl mix-blend-multiply"></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white py-12 px-6 shadow-xl shadow-indigo-100/50 sm:rounded-2xl sm:px-10 border border-gray-100 text-center"
        >
          <div className="flex justify-center mb-6">
            <div className="bg-indigo-50 p-3 rounded-2xl border border-indigo-100">
              <Building2 className="w-8 h-8 text-indigo-600" />
            </div>
          </div>

          {status === 'LOADING' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center"
            >
              <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying your email</h2>
              <p className="text-gray-500">Please wait while we verify your email address...</p>
            </motion.div>
          )}

          {status === 'SUCCESS' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center"
            >
              <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h2>
              <p className="text-gray-500 mb-8">
                Your email address has been successfully verified. You can now access all features of your account.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="flex w-full justify-center items-center rounded-xl bg-indigo-600 px-3 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-all hover:-translate-y-0.5"
              >
                Continue to Login
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </motion.div>
          )}

          {status === 'ERROR' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center"
            >
              <XCircle className="w-16 h-16 text-red-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
              <p className="text-gray-500 mb-8">
                We couldn't verify your email address. The link may have expired or is invalid.
              </p>
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
              >
                Request a new verification link
              </Link>
              <div className="mt-6 w-full">
                <button
                  onClick={() => navigate('/login')}
                  className="flex w-full justify-center items-center rounded-xl bg-white border border-gray-300 px-3 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-all"
                >
                  Return to Login
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
