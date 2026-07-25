import { Request, Response } from 'express';
import { AIService } from '../services/aiService';
import { logger } from '../utils/logger';
import { getRedisClient } from '../config/redis';

export const getCachedOrFetch = async <T>(key: string, fetchFn: () => Promise<T>, ttlSeconds: number = 3600): Promise<T> => {
  const redis = getRedisClient();
  try {
    const cached = await redis.get(key);
    if (cached) return JSON.parse(cached);
    const data = await fetchFn();
    await redis.set(key, JSON.stringify(data), 'EX', ttlSeconds);
    return data;
  } catch (error) {
    logger.error('Redis cache error', error);
    return await fetchFn();
  }
};

export const chatWithAssistant = async (req: Request, res: Response) => {
  try {
    const { message, patientContext } = req.body;
    // For this mock implementation, we reuse chatWithPatient but provide context
    const response = await AIService.chatWithPatient(patientContext, message);
    res.json({ success: true, data: response });
  } catch (error: any) {
    logger.error('Error in chatWithAssistant', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const suggestDiagnosis = async (req: Request, res: Response) => {
  try {
    const { symptoms, vitals } = req.body;
    const cacheKey = `diagnosis:${JSON.stringify(symptoms)}:${JSON.stringify(vitals)}`;
    const data = await getCachedOrFetch(cacheKey, () => AIService.suggestDiagnosis(symptoms, vitals));
    res.json({ success: true, data });
  } catch (error: any) {
    logger.error('Error in suggestDiagnosis', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const checkDrugInteractions = async (req: Request, res: Response) => {
  try {
    const { drugs } = req.body;
    const cacheKey = `interactions:${drugs.sort().join(',')}`;
    const data = await getCachedOrFetch(cacheKey, () => AIService.checkDrugInteractions(drugs));
    res.json({ success: true, data });
  } catch (error: any) {
    logger.error('Error in checkDrugInteractions', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const calculateDosage = async (req: Request, res: Response) => {
  try {
    const { drug, weight, age, renalFunction } = req.body;
    const data = await AIService.dosageCalculator(drug, weight, age, renalFunction);
    res.json({ success: true, data });
  } catch (error: any) {
    logger.error('Error in calculateDosage', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getDrugInfo = async (req: Request, res: Response) => {
  try {
    const { drugName } = req.params;
    if (!drugName) {
      return res.status(400).json({ success: false, error: 'Drug name is required' });
    }
    const cacheKey = `druginfo:${drugName.toLowerCase()}`;
    const data = await getCachedOrFetch(cacheKey, () => AIService.getDrugInfo(drugName));
    res.json({ success: true, data });
  } catch (error: any) {
    logger.error('Error in getDrugInfo', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const voiceToSoap = async (req: Request, res: Response) => {
  try {
    // In a real implementation, we would accept audio blob, convert to base64 or upload,
    // and pass it to Gemini. For this phase, we'll assume the frontend might transcribe it 
    // using browser SpeechRecognition OR we'll use a mock if it's text.
    // If we wanted true Gemini audio handling, we'd use generative-ai's File API.
    const { transcript } = req.body; 
    const data = await AIService.voiceToSoapNotes(transcript);
    res.json({ success: true, data });
  } catch (error: any) {
    logger.error('Error in voiceToSoap', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getPatientRiskScore = async (req: Request, res: Response) => {
  try {
    const { history, vitals } = req.body;
    const data = await AIService.patientRiskScore(history, vitals);
    res.json({ success: true, data });
  } catch (error: any) {
    logger.error('Error in getPatientRiskScore', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getLabTrendsSummary = async (req: Request, res: Response) => {
  try {
    const { labResults } = req.body;
    const data = await AIService.summarizeLabTrends(labResults);
    res.json({ success: true, data });
  } catch (error: any) {
    logger.error('Error in getLabTrendsSummary', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const generateDischargeSummary = async (req: Request, res: Response) => {
  try {
    const { consultationData, hospitalCourse } = req.body;
    const data = await AIService.generateDischargeSummary(consultationData, hospitalCourse);
    res.json({ success: true, data });
  } catch (error: any) {
    logger.error('Error in generateDischargeSummary', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const suggestICD10 = async (req: Request, res: Response) => {
  try {
    const { clinicalNote } = req.body;
    const data = await AIService.suggestICD10Coding(clinicalNote);
    res.json({ success: true, data });
  } catch (error: any) {
    logger.error('Error in suggestICD10', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const patientTriageChat = async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;
    const data = await AIService.patientTriageBot(message, history);
    res.json({ success: true, data });
  } catch (error: any) {
    logger.error('Error in patientTriageChat', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
