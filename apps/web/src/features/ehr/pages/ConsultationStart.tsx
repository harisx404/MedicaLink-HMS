import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useGetAppointmentsQuery, useUpdateAppointmentStatusMutation } from '../../appointments/api/appointmentApi';
import { useStartConsultationMutation, useUpdateConsultationMutation, useSignConsultationMutation } from '../api/ehrApi';
import { useVoiceToSoapMutation } from '../../ai/api/aiApi';
import type { SharedConsultation, SharedPatient } from '@medicalink/shared';
import { PageHeader } from '../../../components/common';
import { Button } from '../../../components/ui/Button';
import { SubjectiveForm } from '../components/SOAP/SubjectiveForm';
import { ObjectiveForm } from '../components/SOAP/ObjectiveForm';
import { AssessmentForm } from '../components/SOAP/AssessmentForm';
import { PlanForm } from '../components/SOAP/PlanForm';
import { Tabs, TabsList, TabsTrigger } from '../../../components/ui/Tabs';
import { Save, FileSignature, AlertCircle, Loader2, Mic, StopCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const ConsultationStart = () => {
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get('appointmentId');
  const navigate = useNavigate();

  const { data: apptsRes, isLoading: loadingAppt } = useGetAppointmentsQuery({}, { skip: !appointmentId });
  const appointmentRes = apptsRes?.data?.find((a: any) => a._id === appointmentId || a.id === appointmentId);
  const [startConsultation] = useStartConsultationMutation();
  const [updateConsultation] = useUpdateConsultationMutation();
  const [signConsultation, { isLoading: isSigning }] = useSignConsultationMutation();
  const [updateAppointment] = useUpdateAppointmentStatusMutation();

  const [consultation, setConsultation] = useState<SharedConsultation | null>(null);
  const [activeTab, setActiveTab] = useState('subjective');
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  const [voiceToSoap] = useVoiceToSoapMutation();

  useEffect(() => {
    if (appointmentRes && !consultation) {
      const initConsultation = async () => {
        try {
          const appt = appointmentRes;
          const patientId = typeof appt.patient === 'string' ? appt.patient : appt.patient._id || appt.patient.id;
          const departmentId = typeof appt.department === 'string' ? appt.department : appt.department?._id;
          
          const res = await startConsultation({
            appointmentId: String(appt._id || appt.id || ''),
            patientId: String(patientId),
            visitType: appt.type || 'IN_PERSON',
            departmentId: String(departmentId || '')
          }).unwrap();
          
          if (res.data) {
            setConsultation(res.data);
          }
          
          // Also update appointment status in background
          updateAppointment({ id: appt._id || appt.id, status: 'IN_CONSULTATION' });
        } catch (error) {
          toast.error('Failed to initialize consultation');
        }
      };
      initConsultation();
    }
  }, [appointmentRes, startConsultation, consultation, updateAppointment]);

  // Auto-save logic
  useEffect(() => {
    if (!consultation || consultation.status === 'SIGNED') return;
    
    const autoSaveTimer = setInterval(async () => {
      setIsAutoSaving(true);
      try {
        await updateConsultation({ id: consultation._id || consultation.id || '', data: consultation }).unwrap();
      } catch (e) {
        console.error('Auto-save failed', e);
      } finally {
        setIsAutoSaving(false);
      }
    }, 30000); // 30 seconds

    return () => clearInterval(autoSaveTimer);
  }, [consultation, updateConsultation]);

  const handleUpdate = (section: keyof SharedConsultation, data: any) => {
    setConsultation(prev => prev ? { ...prev, [section]: data } : null);
  };

  const handleSign = async () => {
    if (!consultation) return;
    try {
      // Final save before sign
      await updateConsultation({ id: consultation._id || consultation.id || '', data: consultation }).unwrap();
      await signConsultation(consultation._id || consultation.id || '').unwrap();
      toast.success('Consultation Signed & Completed');
      navigate('/dashboard/doctor');
    } catch (error: any) {
      toast.error(error.data?.message || 'Failed to sign consultation');
    }
  };

  const handleDictation = async () => {
    if (isRecording) {
      setIsRecording(false);
      // In a real implementation, we would stop MediaRecorder, get audioBlob, send to API.
      // Since browsers block microphone without HTTPS or localhost, we will use a simulated 
      // dictation using a prompt to get a simulated transcript from the doctor.
      const simulatedTranscript = window.prompt("Simulated Dictation: Enter the consultation transcript:");
      if (!simulatedTranscript) return;

      toast.loading('AI is transcribing and structuring SOAP notes...', { id: 'soap-ai' });
      try {
        const res = await voiceToSoap({ transcript: simulatedTranscript }).unwrap();
        const generatedSoap = res.data;
        
        // Merge generated data into consultation
        setConsultation(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            subjective: { ...prev.subjective, ...generatedSoap.subjective },
            objective: { ...prev.objective, ...generatedSoap.objective },
            assessment: { ...prev.assessment, ...generatedSoap.assessment },
            plan: { ...prev.plan, ...generatedSoap.plan }
          };
        });
        toast.success('SOAP Notes generated successfully!', { id: 'soap-ai' });
      } catch (e: any) {
        toast.error('Failed to generate SOAP notes.', { id: 'soap-ai' });
      }
    } else {
      setIsRecording(true);
      toast('Recording started... Click Stop Dictation when done.', { icon: '🎙️' });
    }
  };

  if (loadingAppt || !consultation) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Initializing EHR Workspace...</span>
      </div>
    );
  }

  const patient = appointmentRes?.patient as SharedPatient;

  const tabs = [
    { id: 'subjective', label: 'Subjective (S)' },
    { id: 'objective', label: 'Objective (O)' },
    { id: 'assessment', label: 'Assessment (A)' },
    { id: 'plan', label: 'Plan (P)' },
  ];

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col">
      <PageHeader
        title={`Consultation: ${consultation.consultationNumber}`}
        description="Electronic Health Record Workspace"
        action={
          <div className="flex space-x-2 items-center">
            {isAutoSaving && <span className="text-xs text-muted-foreground flex items-center"><Save className="h-3 w-3 mr-1" /> Auto-saving...</span>}
            
            <Button 
              variant={isRecording ? "danger" : "outline"} 
              className={isRecording ? "animate-pulse" : "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"}
              onClick={handleDictation}
            >
              {isRecording ? <StopCircle className="h-4 w-4 mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
              {isRecording ? "Stop Dictation" : "AI Dictation"}
            </Button>

            <Button variant="outline" onClick={() => updateConsultation({ id: consultation._id || consultation.id || '', data: consultation })}>
              <Save className="h-4 w-4 mr-2" /> Save Draft
            </Button>
            <Button onClick={handleSign} disabled={isSigning} className="bg-emerald-600 hover:bg-emerald-700">
              <FileSignature className="h-4 w-4 mr-2" /> Sign & Complete
            </Button>
          </div>
        }
      />

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Left Side: Patient Summary */}
        <div className="w-1/4 min-w-[280px] flex flex-col space-y-4 overflow-y-auto pr-2">
          <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                {patient?.firstName?.[0]}{patient?.lastName?.[0]}
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{patient?.firstName} {patient?.lastName}</h3>
                <p className="text-sm text-muted-foreground">{patient?.uhid}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Age/Sex:</span>
                <span className="font-medium">{patient?.gender}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Blood:</span>
                <span className="font-medium">{patient?.bloodGroup}</span>
              </div>
            </div>
          </div>

          <div className="bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-800/30 p-4 shadow-sm">
            <h4 className="font-semibold text-red-800 dark:text-red-400 flex items-center mb-2">
              <AlertCircle className="h-4 w-4 mr-2" /> Alerts
            </h4>
            {patient?.allergies?.length > 0 ? (
              <ul className="list-disc pl-5 text-sm text-red-700 dark:text-red-300 space-y-1">
                {patient.allergies.map((a: any, i: number) => (
                  <li key={i}>{a.allergen} ({a.severity})</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No known allergies</p>
            )}
          </div>
        </div>

        {/* Right Side: SOAP Notes */}
        <div className="flex-1 bg-card rounded-xl border border-border shadow-sm flex flex-col overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="border-b border-border">
              <TabsList className="w-full justify-start bg-transparent border-none">
                {tabs.map(tab => (
                  <TabsTrigger 
                    key={tab.id} 
                    value={tab.id} 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {activeTab === 'subjective' && (
                <SubjectiveForm data={consultation.subjective || {}} onChange={(d) => handleUpdate('subjective', d)} />
              )}
              {activeTab === 'objective' && (
                <ObjectiveForm data={consultation.objective || {}} onChange={(d) => handleUpdate('objective', d)} patientId={patient?._id || patient?.id} />
              )}
              {activeTab === 'assessment' && (
                <AssessmentForm data={consultation.assessment || {}} onChange={(d) => handleUpdate('assessment', d)} consultation={consultation} />
              )}
              {activeTab === 'plan' && (
                <PlanForm data={consultation.plan || {}} onChange={(d) => handleUpdate('plan', d)} consultation={consultation} patient={patient} />
              )}
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
