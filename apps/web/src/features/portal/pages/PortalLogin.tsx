import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartPulse, ArrowRight, ShieldCheck, Phone, Smartphone, Loader2 } from 'lucide-react';

export const PortalLogin: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) return;
    
    setIsLoading(true);
    // Simulate sending OTP SMS
    setTimeout(() => {
      setIsLoading(false);
      setStep('otp');
    }, 1000);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) return;

    setIsLoading(true);
    // Simulate verifying OTP. In the actual backend, this would call /api/v1/portal/auth
    setTimeout(() => {
      setIsLoading(false);
      // Navigate to portal dashboard
      navigate('/portal');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-indigo-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-200">
            <HeartPulse size={32} strokeWidth={2.5} />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
          MedicaLink Portal
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Secure access to your medical records
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-2xl shadow-indigo-100 sm:rounded-2xl sm:px-10 border border-gray-100 relative overflow-hidden">
          
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-indigo-50 blur-3xl"></div>
          
          {step === 'phone' ? (
            <form className="space-y-6 relative z-10" onSubmit={handleSendOtp}>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Registered Phone Number
                </label>
                <div className="mt-2 relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-3 py-3 sm:text-sm border-gray-300 rounded-xl bg-gray-50 border transition-all outline-none"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading || phone.length < 10}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-md shadow-indigo-200 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin h-5 w-5" />
                  ) : (
                    <>
                      Send One-Time Passcode <ArrowRight className="ml-2" size={18} />
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <form className="space-y-6 relative z-10" onSubmit={handleVerifyOtp}>
              <div className="text-center mb-6">
                <div className="mx-auto w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-3">
                  <Smartphone size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Enter Verification Code</h3>
                <p className="text-sm text-gray-500 mt-1">
                  We sent a code to <span className="font-semibold text-gray-700">{phone}</span>
                </p>
                <p className="text-xs text-indigo-500 mt-2 font-medium">(Mock Mode: Enter any 4-6 digits)</p>
              </div>

              <div>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block w-full text-center tracking-[0.5em] font-bold text-2xl py-4 sm:text-sm border-gray-300 rounded-xl bg-gray-50 border transition-all outline-none"
                  placeholder="------"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="w-1/3 flex justify-center items-center py-3 px-4 border border-gray-300 rounded-xl text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 transition-all"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading || otp.length < 4}
                  className="w-2/3 flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-md shadow-indigo-200 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin h-5 w-5" />
                  ) : (
                    <>
                      Verify & Login <ShieldCheck className="ml-2" size={18} />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
        
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>Protected by advanced AES-256 encryption.</p>
          <p className="mt-1">By logging in, you agree to the Privacy Policy.</p>
        </div>
      </div>
    </div>
  );
};
