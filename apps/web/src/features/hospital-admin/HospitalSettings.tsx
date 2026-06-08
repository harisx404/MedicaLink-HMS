import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, Palette, DollarSign, Bell, Puzzle, 
  Save, Loader2, Image as ImageIcon, MapPin, Phone, Mail, 
  Hash 
} from 'lucide-react';
import { 
  useGetSettingsQuery, 
  useUpdateSettingsMutation 
} from './hospitalAdminApi';

// Tabs configuration
const TABS = [
  { id: 'general', label: 'General', icon: Building2 },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'financial', label: 'Financial', icon: DollarSign },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'integrations', label: 'Integrations', icon: Puzzle },
];

export function HospitalSettings() {
  const [activeTab, setActiveTab] = useState('general');
  const { data: response, isLoading: isFetching } = useGetSettingsQuery({});
  const [updateSettings, { isLoading: isUpdating }] = useUpdateSettingsMutation();

  const settings = response?.data;

  // React Hook Form for state management
  const { register, handleSubmit, reset, watch } = useForm();

  // Populate form when data loads
  useEffect(() => {
    if (settings) {
      reset(settings);
    }
  }, [settings, reset]);

  const onSubmit = async (data: any) => {
    try {
      await updateSettings(data).unwrap();
      toast.success('Settings updated successfully!');
    } catch (err: any) {
      toast.error(err.data?.message || 'Failed to update settings');
    }
  };

  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-100px)]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Hospital Settings</h1>
          <p className="text-slate-500 text-sm mt-1">Configure your hospital's profile, financial rules, and integrations.</p>
        </div>
        <button
          onClick={handleSubmit(onSubmit)}
          disabled={isUpdating}
          className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm shadow-indigo-200 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isUpdating ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
          {isUpdating ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 flex-shrink-0">
          <nav className="flex md:flex-col space-x-2 md:space-x-0 md:space-y-1 overflow-x-auto pb-2 md:pb-0">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                  }`}
                >
                  <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[500px]">
          <form className="p-8">
            <AnimatePresence mode="wait">
              {/* === GENERAL SETTINGS === */}
              {activeTab === 'general' && (
                <motion.div
                  key="general"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-8"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center">
                        <Building2 className="w-4 h-4 mr-2 text-slate-400" /> Hospital Name
                      </label>
                      <input
                        {...register('general.hospitalName')}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 bg-slate-50 text-slate-900"
                        placeholder="e.g. City General Hospital"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center">
                        <Hash className="w-4 h-4 mr-2 text-slate-400" /> Tagline
                      </label>
                      <input
                        {...register('general.tagline')}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 bg-slate-50 text-slate-900"
                        placeholder="e.g. Care you can trust"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-slate-400" /> Address
                    </label>
                    <textarea
                      {...register('general.address')}
                      rows={3}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 bg-slate-50 text-slate-900 resize-none"
                      placeholder="Full hospital address"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-slate-400" /> Official Email
                      </label>
                      <input
                        type="email"
                        {...register('general.email')}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 bg-slate-50 text-slate-900"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center">
                        <Phone className="w-4 h-4 mr-2 text-slate-400" /> Primary Contact
                      </label>
                      <input
                        {...register('general.contactNumbers.0')}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 bg-slate-50 text-slate-900"
                        placeholder="+1 234 567 8900"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* === APPEARANCE SETTINGS === */}
              {activeTab === 'appearance' && (
                <motion.div
                  key="appearance"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-8"
                >
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-slate-900">Brand Identity</h3>
                      <p className="text-sm text-slate-500 mt-1">Customize how your hospital appears to patients.</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center">
                        <ImageIcon className="w-4 h-4 mr-2 text-slate-400" /> Logo URL
                      </label>
                      <input
                        {...register('general.logoUrl')}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 bg-slate-50 text-slate-900"
                        placeholder="https://example.com/logo.png"
                      />
                      {watch('general.logoUrl') && (
                        <div className="mt-4 p-4 border border-slate-200 rounded-lg inline-block bg-slate-50">
                          <img 
                            src={watch('general.logoUrl')} 
                            alt="Logo preview" 
                            className="h-16 object-contain"
                            onError={(e) => (e.currentTarget.style.display = 'none')}
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center">
                        <Palette className="w-4 h-4 mr-2 text-slate-400" /> Primary Brand Color (Hex)
                      </label>
                      <div className="flex gap-3">
                        <input
                          type="color"
                          {...register('appearance.primaryColor')}
                          className="h-10 w-16 p-1 border border-slate-300 rounded-lg cursor-pointer"
                        />
                        <input
                          type="text"
                          {...register('appearance.primaryColor')}
                          className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 bg-slate-50 text-slate-900 uppercase font-mono"
                          placeholder="#0F172A"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* === FINANCIAL SETTINGS === */}
              {activeTab === 'financial' && (
                <motion.div
                  key="financial"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-8"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Default Currency</label>
                      <select
                        {...register('financial.defaultCurrency')}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 bg-slate-50 text-slate-900"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="INR">INR (₹)</option>
                        <option value="AUD">AUD ($)</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Hospital Tax Number (TIN/VAT)</label>
                      <input
                        {...register('general.taxNumber')}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 bg-slate-50 text-slate-900"
                        placeholder="e.g. TAX-12345678"
                      />
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-6">
                    <h3 className="text-lg font-medium text-slate-900 mb-4">Accepted Payment Methods</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Insurance', 'Mobile Wallet'].map((method) => (
                        <label key={method} className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                          <input
                            type="checkbox"
                            value={method}
                            {...register('financial.acceptedPaymentModes')}
                            className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-600"
                          />
                          <span className="text-sm font-medium text-slate-700">{method}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* === NOTIFICATION SETTINGS === */}
              {activeTab === 'notifications' && (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-8"
                >
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-slate-900">SMS Provider</h3>
                      <p className="text-sm text-slate-500 mt-1">Configure SMS notifications for patients (appointments, billing).</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Provider</label>
                        <select
                          {...register('notifications.smsProvider')}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 bg-slate-50 text-slate-900"
                        >
                          <option value="twilio">Twilio</option>
                          <option value="aws-sns">AWS SNS</option>
                          <option value="custom">Custom Webhook</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-6 space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-slate-900">Email SMTP Configuration</h3>
                      <p className="text-sm text-slate-500 mt-1">Configure SMTP settings to send emails from your hospital domain.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">SMTP Host</label>
                        <input
                          {...register('notifications.smtpConfig.host')}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 bg-slate-50"
                          placeholder="smtp.gmail.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">SMTP Port</label>
                        <input
                          type="number"
                          {...register('notifications.smtpConfig.port')}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 bg-slate-50"
                          placeholder="587"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">SMTP Username</label>
                        <input
                          {...register('notifications.smtpConfig.user')}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 bg-slate-50"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">SMTP Password</label>
                        <input
                          type="password"
                          {...register('notifications.smtpConfig.pass')}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 bg-slate-50"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">From Address</label>
                        <input
                          {...register('notifications.smtpConfig.fromAddress')}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 bg-slate-50"
                          placeholder="noreply@hospital.com"
                        />
                      </div>
                      <div className="space-y-2 flex flex-col justify-end">
                        <label className="flex items-center space-x-2 cursor-pointer pb-2">
                          <input type="checkbox" {...register('notifications.smtpConfig.secure')} className="w-4 h-4 rounded text-indigo-600" />
                          <span className="text-sm font-medium text-slate-700">Use Secure Connection (TLS/SSL)</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* === INTEGRATION SETTINGS === */}
              {activeTab === 'integrations' && (
                <motion.div
                  key="integrations"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-8"
                >
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-slate-900">HL7 Integration</h3>
                      <p className="text-sm text-slate-500 mt-1">Configure connection to Lab Analyzers and third-party systems.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2 flex flex-col justify-end pb-2">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input type="checkbox" {...register('integrations.hl7Config.isActive')} className="w-4 h-4 rounded text-indigo-600" />
                          <span className="text-sm font-medium text-slate-700">Enable HL7 Listener</span>
                        </label>
                      </div>
                      <div className="space-y-2"></div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Server IP / Host</label>
                        <input
                          {...register('integrations.hl7Config.serverIp')}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 bg-slate-50"
                          placeholder="192.168.1.100"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Port</label>
                        <input
                          type="number"
                          {...register('integrations.hl7Config.port')}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 bg-slate-50"
                          placeholder="2575"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-6 space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-slate-900">DICOM / PACS Integration</h3>
                      <p className="text-sm text-slate-500 mt-1">Configure connection to Radiology PACS servers.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2 flex flex-col justify-end pb-2">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input type="checkbox" {...register('integrations.dicomConfig.isActive')} className="w-4 h-4 rounded text-indigo-600" />
                          <span className="text-sm font-medium text-slate-700">Enable DICOM Integration</span>
                        </label>
                      </div>
                      <div className="space-y-2"></div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">AE Title</label>
                        <input
                          {...register('integrations.dicomConfig.aeTitle')}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 bg-slate-50"
                          placeholder="PACS_SERVER"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Server IP / Host</label>
                        <input
                          {...register('integrations.dicomConfig.serverIp')}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 bg-slate-50"
                          placeholder="192.168.1.101"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Port</label>
                        <input
                          type="number"
                          {...register('integrations.dicomConfig.port')}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 bg-slate-50"
                          placeholder="104"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </form>
        </div>
      </div>
    </div>
  );
}
