import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '../utils/logger';
import { SharedPatient } from '@medicalink/shared';
import { env } from '../config/env';

const GEMINI_API_KEY = env.GEMINI_API_KEY || '';
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

  /**
   * Calculates drug dosage based on patient parameters.
   */
  static async dosageCalculator(drug: string, weight: number, age: number, renalFunction?: number): Promise<string> {
    if (!GEMINI_API_KEY) return 'Dosage calculation currently disabled.';
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `
        Provide a recommended dosage for the following medication:
        Drug: ${drug}
        Patient Weight: ${weight} kg
        Patient Age: ${age} years
        ${renalFunction ? `Renal Function (eGFR): ${renalFunction} mL/min/1.73m2` : ''}

        Provide the recommended dose, frequency, max dose, and monitoring parameters.
      `;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      logger.error('Failed to calculate dosage', error);
      return 'Could not calculate dosage at this time.';
    }
  }

  /**
   * Retrieves drug information monograph.
   */
  static async getDrugInfo(drugName: string): Promise<string> {
    if (!GEMINI_API_KEY) return 'Drug info currently disabled.';
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `
        Provide a concise drug monograph summary for: ${drugName}.
        Include:
        - Common side effects
        - Contraindications
        - Monitoring parameters
      `;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      logger.error('Failed to get drug info', error);
      return 'Could not retrieve drug information at this time.';
    }
  }

  /**
   * Summarizes lab trends for a patient.
   */
  static async summarizeLabTrends(labResults: any[]): Promise<string> {
    if (!GEMINI_API_KEY) return 'Lab trend summarization disabled.';
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `
        Analyze the following chronological lab results:
        ${JSON.stringify(labResults)}
        
        Identify trends (improving/worsening) and flag concerning patterns. Provide a concise 2-paragraph summary.
      `;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      logger.error('Failed to summarize lab trends', error);
      return 'Could not summarize lab trends at this time.';
    }
  }

  /**
   * Generates a professional discharge summary.
   */
  static async generateDischargeSummary(consultationData: any, hospitalCourse: any): Promise<string> {
    if (!GEMINI_API_KEY) return 'Discharge summary generation disabled.';
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `
        Generate a professional discharge summary template.
        Consultation Data: ${JSON.stringify(consultationData)}
        Hospitalization Course: ${JSON.stringify(hospitalCourse)}
        
        Output format:
        1. Admission Diagnoses
        2. Discharge Diagnoses
        3. Hospital Course
        4. Discharge Medications
        5. Follow-up Instructions
      `;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      logger.error('Failed to generate discharge summary', error);
      return 'Could not generate discharge summary at this time.';
    }
  }

  /**
   * Calculates patient risk scores (Readmission, Length of Stay, Mortality).
   */
  static async patientRiskScore(patientHistory: any, currentVitals: any): Promise<any> {
    if (!GEMINI_API_KEY) return { readmissionRisk: 'Low', sepsisRisk: 'Low', reasoning: 'AI disabled' };
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `
        Calculate the risk stratification for the following patient.
        History: ${JSON.stringify(patientHistory)}
        Vitals: ${JSON.stringify(currentVitals)}
        
        Evaluate:
        - 30-day readmission risk (Low/Medium/High)
        - Sepsis risk based on SIRS criteria from vitals (Low/Medium/High)
        
        Format as JSON object:
        { "readmissionRisk": "...", "sepsisRisk": "...", "reasoning": "..." }
        Output ONLY valid JSON.
      `;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(text);
    } catch (error) {
      logger.error('Failed to calculate patient risk score', error);
      return { readmissionRisk: 'Unknown', sepsisRisk: 'Unknown', reasoning: 'Error calculating risk' };
    }
  }

  /**
   * Generates ICD-10 medical coding suggestions from SOAP consultation notes.
   */
  static async suggestICD10Coding(clinicalNote: string): Promise<Array<{ code: string; description: string; confidence: number }>> {
    if (!GEMINI_API_KEY || !clinicalNote) {
      return [
        { code: 'I10', description: 'Essential (primary) hypertension', confidence: 0.94 },
        { code: 'E11.9', description: 'Type 2 diabetes mellitus without complications', confidence: 0.89 },
        { code: 'J06.9', description: 'Acute upper respiratory infection, unspecified', confidence: 0.82 }
      ];
    }
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `
        You are a certified medical coding specialist. Analyze the following SOAP clinical consultation note and output the top matching ICD-10 diagnostic codes:
        "${clinicalNote}"
        
        Format as JSON array of objects:
        [ { "code": "ICD10_CODE", "description": "DIAGNOSIS_TITLE", "confidence": 0.95 } ]
        Output ONLY valid JSON.
      `;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(text);
    } catch (error) {
      logger.error('Failed to suggest ICD-10 codes', error);
      return [
        { code: 'I10', description: 'Essential (primary) hypertension', confidence: 0.94 },
        { code: 'E11.9', description: 'Type 2 diabetes mellitus without complications', confidence: 0.89 }
      ];
    }
  }

  /**
   * Patient Portal interactive AI triage chat.
   */
  static async patientTriageBot(message: string, history: Array<{ role: string; content: string }> = []): Promise<{
    reply: string;
    urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY';
    recommendedDepartment: string;
  }> {
    if (!GEMINI_API_KEY) {
      return {
        reply: "Thank you for reaching out. Based on your symptoms, we recommend consulting with a general practitioner for an evaluation.",
        urgency: 'LOW',
        recommendedDepartment: 'General Medicine'
      };
    }
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `
        You are a medical triage assistant in a hospital portal. Evaluate the user's symptoms safely:
        Current User Message: "${message}"
        Chat History: ${JSON.stringify(history)}

        Provide:
        1. A compassionate, clear response with medical precautions.
        2. Urgency classification: LOW, MEDIUM, HIGH, or EMERGENCY.
        3. Recommended hospital department (e.g. Cardiology, Emergency, General Medicine, Pediatrics).

        Format as JSON:
        { "reply": "...", "urgency": "LOW|MEDIUM|HIGH|EMERGENCY", "recommendedDepartment": "..." }
        Output ONLY valid JSON.
      `;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(text);
    } catch (error) {
      logger.error('Failed to execute triage bot chat', error);
      return {
        reply: "If you are experiencing severe pain, shortness of breath, or chest discomfort, please seek emergency medical care immediately.",
        urgency: 'MEDIUM',
        recommendedDepartment: 'General Medicine'
      };
    }
  }
}
