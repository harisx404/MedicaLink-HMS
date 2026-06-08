import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Save, User, Phone, AlertCircle, HeartPulse, CheckCircle2, Loader2 } from 'lucide-react';
import { useRegisterPatientMutation } from '../api/patientApi';
import { Gender, BloodGroup } from '@medicalink/shared';
import type { SharedPatient } from '@medicalink/shared';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const steps = [
  { id: 'personal', label: 'Personal Info', icon: User },
  { id: 'contact', label: 'Contact Details', icon: Phone },
  { id: 'emergency', label: 'Emergency', icon: AlertCircle },
  { id: 'medical', label: 'Medical History', icon: HeartPulse },
  { id: 'review', label: 'Review & Submit', icon: CheckCircle2 },
];

export const PatientRegistrationPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [registeredPatient, setRegisteredPatient] = useState<SharedPatient | null>(null);
  const [registerPatient, { isLoading }] = useRegisterPatientMutation();
  const navigate = useNavigate();

  const methods = useForm<Partial<SharedPatient>>({
    defaultValues: {
      gender: Gender.MALE,
      bloodGroup: BloodGroup.UNKNOWN,
      maritalStatus: 'SINGLE',
      registrationType: 'OPD',
      allergies: [],
      chronicConditions: [],
      currentMedications: [],
      immunizations: [],
      insurances: [],
      address: { street: '', city: '', state: '', country: '', pincode: '' },
      emergencyContact: { name: '', relationship: '', phone: '' }
    },
    mode: 'onChange'
  });

  const { register, handleSubmit, formState: { errors }, trigger, watch } = methods;

  const nextStep = async () => {
    let isValid = false;
    
    // Trigger validation based on current step
    if (currentStep === 0) {
      isValid = await trigger(['firstName', 'lastName', 'dateOfBirth', 'nationality']);
    } else if (currentStep === 1) {
      isValid = await trigger(['phone', 'address.street', 'address.city', 'address.state', 'address.country', 'address.pincode']);
    } else if (currentStep === 2) {
      isValid = await trigger(['emergencyContact.name', 'emergencyContact.phone', 'emergencyContact.relationship']);
    } else {
      isValid = true;
    }

    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const onSubmit = async (data: Partial<SharedPatient>) => {
    try {
      const payload = {
        ...data,
        // Default empty arrays if undefined
        allergies: data.allergies || [],
        chronicConditions: data.chronicConditions || [],
        currentMedications: data.currentMedications || [],
        immunizations: data.immunizations || [],
        insurances: data.insurances || [],
      };

      const result = await registerPatient(payload).unwrap();
      toast.success('Patient registered successfully!');
      if (result.data?.patient) {
        setRegisteredPatient(result.data.patient);
      } else {
        navigate('/patients');
      }
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to register patient');
    }
  };

  if (registeredPatient) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-10 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Registration Successful</h1>
          <p className="text-gray-500 mb-8 max-w-md">
            Patient <strong>{registeredPatient.firstName} {registeredPatient.lastName}</strong> has been registered successfully.
          </p>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 w-full max-w-sm mb-8">
            <p className="text-sm text-gray-500 font-medium mb-1">Generated UHID</p>
            <p className="text-3xl font-mono font-bold text-blue-600 tracking-wider">{registeredPatient.uhid}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
            <button 
              onClick={() => navigate(`/patients/${registeredPatient.id}`)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors"
            >
              Go to Profile
            </button>
            <button 
              onClick={() => window.print()}
              className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-300 shadow-sm transition-colors"
            >
              Print Patient Card
            </button>
            <button 
              onClick={() => {
                setRegisteredPatient(null);
                setCurrentStep(0);
                methods.reset();
              }}
              className="sm:col-span-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-500 font-medium rounded-lg border border-transparent transition-colors mt-2"
            >
              Register Another Patient
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Field styling class
  const inputClass = "w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Register New Patient</h1>
        <p className="text-gray-500 mt-2">Enter patient details securely to create an electronic health record.</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-between mb-10 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 rounded-full z-0"></div>
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-600 rounded-full z-0 transition-all duration-500"
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        ></div>
        
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index <= currentStep;
          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 border-white shadow-sm transition-colors duration-300 ${isActive ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                <Icon size={20} />
              </div>
              <span className={`absolute -bottom-6 w-max text-xs font-medium ${isActive ? 'text-blue-700' : 'text-gray-500'}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Form Area */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 min-h-[400px]">
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Step 1: Personal Info */}
                {currentStep === 0 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-800 border-b pb-3">Personal Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className={labelClass}>First Name *</label>
                        <input {...register('firstName', { required: 'First name is required' })} className={inputClass} placeholder="John" />
                        {errors.firstName && <span className="text-red-500 text-xs mt-1">{errors.firstName.message}</span>}
                      </div>
                      <div>
                        <label className={labelClass}>Middle Name</label>
                        <input {...register('middleName')} className={inputClass} placeholder="A." />
                      </div>
                      <div>
                        <label className={labelClass}>Last Name *</label>
                        <input {...register('lastName', { required: 'Last name is required' })} className={inputClass} placeholder="Doe" />
                        {errors.lastName && <span className="text-red-500 text-xs mt-1">{errors.lastName.message}</span>}
                      </div>

                      <div>
                        <label className={labelClass}>Date of Birth *</label>
                        <input type="date" {...register('dateOfBirth', { required: 'DOB is required' })} className={inputClass} />
                        {errors.dateOfBirth && <span className="text-red-500 text-xs mt-1">{errors.dateOfBirth.message}</span>}
                      </div>
                      <div>
                        <label className={labelClass}>Gender *</label>
                        <select {...register('gender')} className={inputClass}>
                          <option value="MALE">Male</option>
                          <option value="FEMALE">Female</option>
                          <option value="OTHER">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>Blood Group *</label>
                        <select {...register('bloodGroup')} className={inputClass}>
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                          <option value="UNKNOWN">Unknown</option>
                        </select>
                      </div>

                      <div>
                        <label className={labelClass}>Marital Status *</label>
                        <select {...register('maritalStatus')} className={inputClass}>
                          <option value="SINGLE">Single</option>
                          <option value="MARRIED">Married</option>
                          <option value="DIVORCED">Divorced</option>
                          <option value="WIDOWED">Widowed</option>
                          <option value="OTHER">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>Nationality *</label>
                        <input {...register('nationality', { required: 'Nationality required' })} className={inputClass} placeholder="American" />
                        {errors.nationality && <span className="text-red-500 text-xs mt-1">{errors.nationality.message}</span>}
                      </div>
                      <div>
                        <label className={labelClass}>Registration Type *</label>
                        <select {...register('registrationType')} className={inputClass}>
                          <option value="OPD">Outpatient (OPD)</option>
                          <option value="IPD">Inpatient (IPD)</option>
                          <option value="EMERGENCY">Emergency</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Contact Details */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-800 border-b pb-3">Contact Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className={labelClass}>Primary Phone *</label>
                        <input type="tel" {...register('phone', { required: 'Phone is required' })} className={inputClass} placeholder="+1 (555) 000-0000" />
                        {errors.phone && <span className="text-red-500 text-xs mt-1">{errors.phone.message}</span>}
                      </div>
                      <div>
                        <label className={labelClass}>Email Address</label>
                        <input type="email" {...register('email')} className={inputClass} placeholder="john.doe@example.com" />
                      </div>
                    </div>

                    <h3 className="font-medium text-gray-700 mt-6 mb-4">Residential Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className={labelClass}>Street Address *</label>
                        <input {...register('address.street', { required: 'Street required' })} className={inputClass} placeholder="123 Main St" />
                      </div>
                      <div>
                        <label className={labelClass}>City *</label>
                        <input {...register('address.city', { required: 'City required' })} className={inputClass} placeholder="New York" />
                      </div>
                      <div>
                        <label className={labelClass}>State/Province *</label>
                        <input {...register('address.state', { required: 'State required' })} className={inputClass} placeholder="NY" />
                      </div>
                      <div>
                        <label className={labelClass}>Country *</label>
                        <input {...register('address.country', { required: 'Country required' })} className={inputClass} placeholder="USA" />
                      </div>
                      <div>
                        <label className={labelClass}>Zip/Pincode *</label>
                        <input {...register('address.pincode', { required: 'Pincode required' })} className={inputClass} placeholder="10001" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Emergency Contact */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-800 border-b pb-3">Emergency Contact</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className={labelClass}>Contact Name *</label>
                        <input {...register('emergencyContact.name', { required: 'Name required' })} className={inputClass} placeholder="Jane Doe" />
                        {errors.emergencyContact?.name && <span className="text-red-500 text-xs mt-1">{errors.emergencyContact.name.message}</span>}
                      </div>
                      <div>
                        <label className={labelClass}>Relationship *</label>
                        <input {...register('emergencyContact.relationship', { required: 'Relationship required' })} className={inputClass} placeholder="Spouse" />
                      </div>
                      <div>
                        <label className={labelClass}>Contact Phone *</label>
                        <input type="tel" {...register('emergencyContact.phone', { required: 'Phone required' })} className={inputClass} placeholder="+1 (555) 999-9999" />
                      </div>
                      <div>
                        <label className={labelClass}>Contact Address</label>
                        <input {...register('emergencyContact.address')} className={inputClass} placeholder="Same as residential" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Medical History (Simplified for Wizard) */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-800 border-b pb-3">Medical Initial Profile</h2>
                    <p className="text-sm text-gray-500 mb-4">You can add detailed allergies and chronic conditions later via the patient's full medical record profile.</p>
                    
                    <div className="bg-blue-50 text-blue-800 p-4 rounded-lg flex items-start gap-3 border border-blue-100">
                      <AlertCircle className="flex-shrink-0 mt-0.5" size={18} />
                      <p className="text-sm">For rapid registration, we only collect core demographic and emergency info. Doctors and nurses will populate the deep clinical history (Allergies, Meds, Vitals) during the triage phase.</p>
                    </div>
                  </div>
                )}

                {/* Step 5: Review */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-800 border-b pb-3">Review & Submit</h2>
                    <div className="bg-gray-50 rounded-xl p-6 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 border border-gray-200">
                      <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Personal</h4>
                        <p className="text-gray-900 font-medium text-lg">{watch('firstName')} {watch('lastName')}</p>
                        <p className="text-gray-600 text-sm mt-1">{watch('gender')} • {watch('dateOfBirth')}</p>
                        <p className="text-gray-600 text-sm">Blood: {watch('bloodGroup')}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Contact</h4>
                        <p className="text-gray-900">{watch('phone')}</p>
                        <p className="text-gray-600 text-sm mt-1">{watch('email') || 'No email'}</p>
                        <p className="text-gray-600 text-sm">{watch('address.city')}, {watch('address.country')}</p>
                      </div>
                      <div className="md:col-span-2 pt-4 border-t border-gray-200">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Emergency</h4>
                        <p className="text-gray-900">{watch('emergencyContact.name')} <span className="text-gray-500 text-sm">({watch('emergencyContact.relationship')})</span></p>
                        <p className="text-gray-600 text-sm mt-1">{watch('emergencyContact.phone')}</p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="mt-10 pt-6 border-t flex justify-between items-center">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
              >
                <ChevronLeft size={18} /> Back
              </button>
              
              {currentStep < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 flex items-center gap-2 shadow-sm shadow-blue-200 transition-all"
                >
                  Next Step <ChevronRight size={18} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-2.5 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 flex items-center gap-2 shadow-sm shadow-green-200 transition-all disabled:opacity-70 disabled:cursor-wait"
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  Confirm Registration
                </button>
              )}
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};
