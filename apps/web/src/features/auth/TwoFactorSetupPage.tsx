import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import { ShieldCheck, Copy, Check, Loader2 } from 'lucide-react';
import { useSetup2FAMutation, useEnable2FAMutation } from './authApi';
import { useAuth } from '../../hooks/useAuth';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/slices/authSlice';

export const TwoFactorSetupPage: React.FC = () => {
  const [setupData, setSetupData] = useState<{ secret: string; qrCodeDataUrl: string } | null>(null);
  const [totpCode, setTotpCode] = useState('');
  const [copied, setCopied] = useState(false);
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, token, tenantSlug } = useAuth();
  
  const [setup2FA, { isLoading: isSetupLoading }] = useSetup2FAMutation();
  const [enable2FA, { isLoading: isEnableLoading }] = useEnable2FAMutation();

  useEffect(() => {
    // Generate QR code on mount
    const initSetup = async () => {
      try {
        const response = await setup2FA({}).unwrap();
        setSetupData(response.data);
      } catch (err) {
        toast.error('Failed to initialize 2FA setup. Please try again later.');
      }
    };
    initSetup();
  }, [setup2FA]);

  const handleCopySecret = () => {
    if (setupData?.secret) {
      navigator.clipboard.writeText(setupData.secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Secret key copied to clipboard');
    }
  };

  const handleEnable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totpCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    try {
      await enable2FA({ totpCode }).unwrap();
      toast.success('Two-factor authentication enabled successfully!');
      
      // Update local state to reflect that 2FA is enabled
      if (user && token) {
        dispatch(setCredentials({
          user: { ...user, twoFactorEnabled: true },
          token,
          tenantSlug: tenantSlug || undefined
        }));
      }
      
      navigate('/admin/dashboard'); // Or wherever appropriate
    } catch (err: any) {
      toast.error(err?.data?.message || 'Invalid code. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 flex-col py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white py-10 px-6 shadow-xl shadow-indigo-100/50 sm:rounded-2xl sm:px-12 border border-gray-100"
        >
          <div className="flex flex-col items-center text-center mb-8">
            <div className="bg-indigo-50 p-4 rounded-full mb-4">
              <ShieldCheck className="w-10 h-10 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Protect Your Account</h2>
            <p className="mt-2 text-gray-600">
              Set up Two-Factor Authentication (2FA) to add an extra layer of security to your MedicaLink account.
            </p>
          </div>

          {!setupData || isSetupLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
          ) : (
            <div className="space-y-8">
              {/* Step 1: Scan QR */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-sm mr-2">1</span>
                  Scan QR Code
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Open your authenticator app (like Google Authenticator, Authy, or Microsoft Authenticator) and scan this QR code:
                </p>
                <div className="flex justify-center bg-white p-4 rounded-xl border border-gray-200 inline-block mx-auto max-w-fit shadow-sm">
                  {/* Using the string we get from backend, assuming it's an otpauth:// URL */}
                  <QRCodeSVG value={setupData.qrCodeDataUrl} size={180} />
                </div>
              </div>

              {/* Step 2: Manual Entry Option */}
              <div>
                <p className="text-sm text-gray-600 mb-2">Can't scan the QR code? Enter this secret key manually:</p>
                <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <code className="text-indigo-700 font-mono text-sm flex-1 tracking-wider">{setupData.secret}</code>
                  <button
                    onClick={handleCopySecret}
                    className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                    title="Copy to clipboard"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <hr className="border-gray-200" />

              {/* Step 3: Verify */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-sm mr-2">2</span>
                  Verify Code
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Enter the 6-digit code generated by your authenticator app to confirm setup.
                </p>
                
                <form onSubmit={handleEnable} className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label htmlFor="code" className="sr-only">6-digit code</label>
                    <input
                      id="code"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={totpCode}
                      onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                      className="block w-full rounded-xl border-0 py-3 px-4 text-2xl tracking-widest text-center text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 transition-all"
                      placeholder="000000"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isEnableLoading || totpCode.length !== 6}
                    className="flex justify-center items-center rounded-xl bg-indigo-600 px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 h-[56px] disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                  >
                    {isEnableLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Enable 2FA'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
