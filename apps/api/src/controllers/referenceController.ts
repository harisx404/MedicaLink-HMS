import { Request, Response } from 'express';
import { getTenantDb } from '../config/db';
import { getICD10Model, getDrugFormularyModel } from '../models/Reference';
import mongoose from 'mongoose';

export const searchICD10 = async (req: Request, res: Response) => {
  const { q } = req.query;
  const db = mongoose.connection; // Assuming ICD10 is global for all tenants
  const ICD10 = getICD10Model(db) as any;

  let query = {};
  if (q && typeof q === 'string') {
    const searchRegex = new RegExp(q, 'i');
    query = {
      $or: [
        { code: searchRegex },
        { description: searchRegex }
      ]
    };
  }

  const results = await ICD10.find(query).limit(20);

  // If no results in DB, return mock data for MVP
  if (results.length === 0 && q) {
    const mockData = [
      { code: 'J01.90', description: 'Acute sinusitis, unspecified', category: 'Respiratory', isBillable: true },
      { code: 'I10', description: 'Essential (primary) hypertension', category: 'Circulatory', isBillable: true },
      { code: 'E11.9', description: 'Type 2 diabetes mellitus without complications', category: 'Endocrine', isBillable: true },
      { code: 'J02.9', description: 'Acute pharyngitis, unspecified', category: 'Respiratory', isBillable: true },
      { code: 'R50.9', description: 'Fever, unspecified', category: 'General', isBillable: true },
    ].filter(d => d.code.toLowerCase().includes((q as string).toLowerCase()) || d.description.toLowerCase().includes((q as string).toLowerCase()));
    
    return res.status(200).json({ success: true, data: mockData });
  }

  res.status(200).json({
    success: true,
    data: results
  });
};

export const searchDrugs = async (req: Request, res: Response) => {
  const { tenantId } = req.user!;
  const { q } = req.query;
  const tenantDb = await getTenantDb(tenantId);
  const DrugFormulary = getDrugFormularyModel(tenantDb) as any;

  const query: any = { tenantId, isActive: true };
  if (q && typeof q === 'string') {
    const searchRegex = new RegExp(q, 'i');
    query.$or = [
      { name: searchRegex },
      { genericName: searchRegex },
      { brand: searchRegex }
    ];
  }

  const results = await DrugFormulary.find(query).limit(20);

  // If no results in DB, return mock data for MVP
  if (results.length === 0 && q) {
    const mockData = [
      { name: 'Paracetamol 500mg Tablet', genericName: 'Paracetamol', brand: 'Panadol', category: 'TABLET', form: 'Tablet', strength: '500mg' },
      { name: 'Amoxicillin 500mg Capsule', genericName: 'Amoxicillin', brand: 'Amoxil', category: 'CAPSULE', form: 'Capsule', strength: '500mg' },
      { name: 'Ibuprofen 400mg Tablet', genericName: 'Ibuprofen', brand: 'Advil', category: 'TABLET', form: 'Tablet', strength: '400mg' },
      { name: 'Omeprazole 20mg Capsule', genericName: 'Omeprazole', brand: 'Prilosec', category: 'CAPSULE', form: 'Capsule', strength: '20mg' },
      { name: 'Cetirizine 10mg Tablet', genericName: 'Cetirizine', brand: 'Zyrtec', category: 'TABLET', form: 'Tablet', strength: '10mg' },
    ].filter(d => d.name.toLowerCase().includes((q as string).toLowerCase()) || d.genericName.toLowerCase().includes((q as string).toLowerCase()));
    
    return res.status(200).json({ success: true, data: mockData });
  }

  res.status(200).json({
    success: true,
    data: results
  });
};
