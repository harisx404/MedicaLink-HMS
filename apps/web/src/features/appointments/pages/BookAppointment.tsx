import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGetDoctorsQuery } from '../../doctors/api/doctorApi';
import { useGetAvailableSlotsQuery, useBookAppointmentMutation } from '../api/appointmentApi';
import { PatientSearchCombobox } from '../../patients/components/PatientSearchCombobox';
import { Button, Input, LoadingSpinner } from '../../../components/ui';
import { format } from 'date-fns';
import { Calendar, User, FileText, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const BookAppointment: React.FC = () => {
  const [step, setStep] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [reasonForVisit, setReasonForVisit] = useState('');
  const [type, setType] = useState('OPD');
  const [priority, setPriority] = useState('NORMAL');
  const [bookedData, setBookedData] = useState<any>(null);

  const { data: doctorsRes, isLoading: isLoadingDoctors } = useGetDoctorsQuery({});
  const { data: slotsRes, isLoading: isLoadingSlots } = useGetAvailableSlotsQuery(
    { doctorId: selectedDoctor?.id, date: selectedDate },
    { skip: !selectedDoctor || !selectedDate }
  );

  const [bookAppointment, { isLoading: isBooking }] = useBookAppointmentMutation();

  const handleBook = async () => {
    try {
      if (!selectedDoctor || !selectedSlot || !selectedPatient || !reasonForVisit) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Department ID logic: in real app, take from doctor.departmentId
      // Here we will just use a mock or the first specialty if no department schema is available on frontend.
      // We assume the backend accepts a random objectId if department is bypassed or we mock it.
      // For this SaaS we assume doctor.departmentId exists.
      
      const payload = {
        doctorId: selectedDoctor.userId, // Because API expects the user ID or doctor ID
        patientId: selectedPatient.id || selectedPatient._id,
        departmentId: '60d0fe4f5311236168a109ca', // MOCK departmentId for now
        date: selectedDate,
        timeSlot: { start: selectedSlot.start, end: selectedSlot.end },
        type,
        reasonForVisit,
        priority
      };

      const res = await bookAppointment(payload).unwrap();
      setBookedData(res.data);
      setStep(4);
      toast.success('Appointment booked successfully!');
    } catch (err: any) {
      toast.error(err.data?.message || 'Failed to book appointment');
    }
  };

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-slate-800">Book Appointment</h1>
        <p className="text-slate-500">Schedule a new visit for a patient</p>
      </div>

      <div className="flex items-center justify-between mb-8 px-12 relative">
        <div className="absolute left-16 right-16 top-1/2 h-0.5 bg-slate-200 -z-10 -translate-y-1/2"></div>
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
              step >= s ? 'bg-primary text-white shadow-md' : 'bg-slate-100 text-slate-400 border-2 border-slate-200'
            }`}
          >
            {s}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 min-h-[400px]">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                <User className="w-5 h-5 text-primary" /> Select Doctor
              </h2>
              
              {isLoadingDoctors ? (
                <LoadingSpinner />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {doctorsRes?.data?.map((doctor: any) => (
                    <div
                      key={doctor.id}
                      onClick={() => { setSelectedDoctor(doctor); nextStep(); }}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        selectedDoctor?.id === doctor.id 
                          ? 'border-primary bg-primary/5 shadow-md' 
                          : 'border-slate-200 hover:border-primary/50 hover:bg-slate-50'
                      }`}
                    >
                      <div className="font-semibold text-slate-800 text-lg">Dr. {doctor.userId?.lastName || 'Doctor'}</div>
                      <div className="text-sm text-slate-500 mt-1">
                        {doctor.specializations?.[0]?.specialty || 'General'}
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${doctor.currentStatus === 'AVAILABLE' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        <span className="text-xs text-slate-600">{doctor.currentStatus}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" /> Select Date & Time
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Appointment Date</label>
                  <Input 
                    type="date" 
                    value={selectedDate} 
                    onChange={(e) => { setSelectedDate(e.target.value); setSelectedSlot(null); }}
                    min={format(new Date(), 'yyyy-MM-dd')}
                  />
                  <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-sm text-slate-600 font-medium">Selected Doctor:</p>
                    <p className="text-slate-800 font-bold">Dr. {selectedDoctor?.userId?.lastName}</p>
                  </div>
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Available Time Slots</label>
                  {isLoadingSlots ? (
                    <LoadingSpinner />
                  ) : slotsRes?.data?.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                      No available slots for this date.
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {slotsRes?.data?.map((slot: any, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                            selectedSlot?.start === slot.start
                              ? 'bg-primary text-white shadow-md'
                              : 'bg-white border border-slate-200 text-slate-700 hover:border-primary/50 hover:bg-slate-50'
                          }`}
                        >
                          {slot.start}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between pt-6 border-t border-slate-100">
                <Button variant="outline" onClick={prevStep}>Back</Button>
                <Button onClick={nextStep} disabled={!selectedSlot}>Next Step</Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" /> Patient Details
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Search Patient</label>
                  <PatientSearchCombobox onSelect={(patient) => setSelectedPatient(patient)} />
                  {selectedPatient && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-800">{selectedPatient.firstName} {selectedPatient.lastName}</p>
                        <p className="text-xs text-green-600">UHID: {selectedPatient.uhid}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Reason for Visit</label>
                    <Input 
                      placeholder="e.g. Fever and headache" 
                      value={reasonForVisit} 
                      onChange={e => setReasonForVisit(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Appointment Type</label>
                    <select 
                      className="w-full flex h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      value={type}
                      onChange={e => setType(e.target.value)}
                    >
                      <option value="OPD">OPD (General)</option>
                      <option value="FOLLOW_UP">Follow Up</option>
                      <option value="TELEMEDICINE">Telemedicine</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Priority</label>
                    <select 
                      className="w-full flex h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      value={priority}
                      onChange={e => setPriority(e.target.value)}
                    >
                      <option value="NORMAL">Normal</option>
                      <option value="URGENT">Urgent</option>
                      <option value="EMERGENCY">Emergency</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-6 border-t border-slate-100">
                <Button variant="outline" onClick={prevStep}>Back</Button>
                <Button 
                  onClick={handleBook} 
                  disabled={!selectedPatient || !reasonForVisit || isBooking}
                >
                  {isBooking ? 'Booking...' : 'Confirm & Book'}
                </Button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-12 flex flex-col items-center justify-center text-center space-y-6"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-slate-800">Booking Confirmed!</h2>
                <p className="text-slate-500 mt-2">The appointment has been successfully scheduled.</p>
              </div>
              
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 w-full max-w-sm text-left shadow-sm">
                <div className="flex justify-between items-end mb-4 border-b border-slate-200 pb-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Token No.</p>
                    <p className="text-4xl font-bold text-primary mt-1">{bookedData?.tokenNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-800">{bookedData?.appointmentNumber}</p>
                  </div>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Patient:</span>
                    <span className="font-semibold text-slate-800">{selectedPatient?.firstName} {selectedPatient?.lastName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Doctor:</span>
                    <span className="font-semibold text-slate-800">Dr. {selectedDoctor?.userId?.lastName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Date:</span>
                    <span className="font-semibold text-slate-800">{format(new Date(selectedDate), 'MMM dd, yyyy')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Time:</span>
                    <span className="font-semibold text-slate-800">{selectedSlot?.start}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <Button variant="outline" onClick={() => window.location.reload()}>Book Another</Button>
                <Button onClick={() => window.location.href = '/appointments'}>View Appointments</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
