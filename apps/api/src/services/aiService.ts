import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '../utils/logger';
import { SharedPatient } from '@medicalink/shared';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export class AIService {
  /**
   * Generates a clinical summary for a patient using Gemini AI.
   */
  static async generateClinicalSummary(patient: SharedPatient): Promise<string> {
    if (!GEMINI_API_KEY) {
      logger.warn('Gemini API key is missing. Returning fallback summary.');
      return `AI Summarization is currently disabled. Please configure the GEMINI_API_KEY in the environment variables. Patient ${patient.firstName} ${patient.lastName} has ${patient.allergies.length} recorded allergies and ${patient.chronicConditions.length} chronic conditions.`;
    }

    try {
      // Use the gemini-1.5-flash model for fast summarization
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      // Construct a safe prompt strictly based on provided patient data
      const prompt = `
        You are a highly professional medical AI assistant summarizing a patient's medical record for a doctor's quick review.
        
        Patient Name: ${patient.firstName} ${patient.lastName}
        Age/DOB: ${patient.dateOfBirth}
        Gender: ${patient.gender}
        Blood Group: ${patient.bloodGroup}
        Registration Type: ${patient.registrationType}
        
        Allergies: ${patient.allergies.length > 0 ? patient.allergies.map(a => `${a.allergen} (${a.severity})`).join(', ') : 'None reported'}
        Chronic Conditions: ${patient.chronicConditions.length > 0 ? patient.chronicConditions.map(c => `${c.condition} (${c.status})`).join(', ') : 'None reported'}
        Current Medications: ${patient.currentMedications.length > 0 ? patient.currentMedications.map(m => `${m.drug} - ${m.dose}`).join(', ') : 'None reported'}
        
        Please provide a concise, structured 2-paragraph clinical summary. 
        Highlight any critical risks (like severe allergies) in the first paragraph.
        Keep the tone strictly clinical, objective, and professional. Do NOT invent or hallucinate any medical data not provided above.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      logger.error('Failed to generate AI clinical summary', error);
      throw new Error('AI Summarization failed');
    }
  }

  /**
   * Generates a conversational response for the patient portal chatbot.
   */
  static async chatWithPatient(patient: SharedPatient, message: string): Promise<string> {
    if (!GEMINI_API_KEY) {
      return `I am currently operating in offline mode. Based on your records, your name is ${patient.firstName}. Please contact the clinic for specific medical advice.`;
    }

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const prompt = `
        You are the MedicaLink AI Health Assistant. You are talking directly to the patient.
        
        Patient Name: ${patient.firstName} ${patient.lastName}
        Age/DOB: ${patient.dateOfBirth}
        Allergies: ${patient.allergies.length > 0 ? patient.allergies.map((a: { allergen: string }) => `${a.allergen}`).join(', ') : 'None reported'}
        Medications: ${patient.currentMedications.length > 0 ? patient.currentMedications.map((m: { drug: string }) => `${m.drug}`).join(', ') : 'None reported'}
        
        The patient asks: "${message}"
        
        Respond clearly, concisely, and empathetically. Do not provide severe diagnostic medical advice; refer them to their doctor if needed.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      logger.error('Failed to generate AI chat response', error);
      return 'I am sorry, I am having trouble connecting to my knowledge base right now.';
    }
  }
  /**
   * Generates a visit summary for referring doctors based on consultation data.
   */
  static async generateVisitSummary(consultation: any, db?: any): Promise<string> {
    if (!GEMINI_API_KEY) return 'AI Summarization disabled.';
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `
        Summarize the following medical consultation for a referring doctor.
        Patient ID: ${consultation.patient}
        Complaint: ${consultation.subjective?.symptoms?.map((s: any) => s.symptom).join(', ')}
        Vitals: BP ${consultation.objective?.vitals?.bp?.systolic}/${consultation.objective?.vitals?.bp?.diastolic}, Temp ${consultation.objective?.vitals?.temp}
        Diagnoses: ${consultation.assessment?.diagnoses?.map((d: any) => d.description).join(', ')}
        Plan: ${consultation.plan?.instructions}
        
        Provide a concise, professional 3-sentence clinical summary.
      `;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      logger.error('Failed to generate visit summary', error);
      return '';
    }
  }

  /**
   * Suggests differential diagnoses based on symptoms and vitals.
   */
  static async suggestDiagnosis(symptoms: string[], vitals: any): Promise<any[]> {
    if (!GEMINI_API_KEY) return [];
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `
        Based on these symptoms: ${symptoms.join(', ')}
        And vitals: BP ${vitals.bp?.systolic}/${vitals.bp?.diastolic}, Pulse ${vitals.pulse}, Temp ${vitals.temp}
        
        Suggest top 3 differential diagnoses. 
        Format as JSON array with objects containing: { "icdCode": "...", "description": "...", "reasoning": "...", "confidence": 90 }
        Output ONLY valid JSON.
      `;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(text);
    } catch (error) {
      logger.error('Failed to suggest diagnosis', error);
      return [];
    }
  }

  /**
   * Checks for drug interactions.
   */
  static async checkDrugInteractions(drugList: string[]): Promise<string> {
    if (!GEMINI_API_KEY) return 'Interaction checking disabled.';
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `
        Check for drug interactions among the following medications: ${drugList.join(', ')}.
        If there are MAJOR or MODERATE interactions, list them clearly. If none, say "No known significant interactions."
      `;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      logger.error('Failed to check drug interactions', error);
      return 'Could not verify interactions at this time.';
    }
  }

  /**
   * Converts voice transcript to structured SOAP notes.
   */
  static async voiceToSoapNotes(transcript: string): Promise<any> {
    if (!GEMINI_API_KEY) throw new Error('AI disabled');
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `
        Convert the following doctor's dictation transcript into structured SOAP notes JSON.
        Transcript: "${transcript}"
        
        Format as JSON object with keys:
        {
          "subjective": { "symptoms": [{"symptom": "", "duration": "", "severity": "", "notes": ""}] },
          "objective": { "physicalExam": {"notes": ""} },
          "assessment": { "clinicalNotes": "" },
          "plan": { "instructions": "" }
        }
        Output ONLY valid JSON.
      `;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(text);
    } catch (error) {
      logger.error('Failed to structure SOAP notes', error);
      throw error;
    }
  }
}
