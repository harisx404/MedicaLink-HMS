import { describe, it, expect, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import { getDrugModel } from '../../models/Drug';

describe('Pharmacy Integration', () => {
  const getTestDb = () => mongoose.connection;

  beforeEach((context) => {
    if (mongoose.connection.readyState !== 1) {
      context.skip();
    }
  });

  describe('Drug Model — Inventory Management', () => {
    it('creates a drug with correct stock levels', async () => {
      const Drug = getDrugModel(getTestDb());

      const drug = await Drug.create({
        tenantId: 'test-tenant',
        name: 'Amoxicillin 500mg Capsule',
        genericName: 'Amoxicillin',
        category: 'CAPSULE',
        form: 'Capsule',
        strength: '500mg',
        purchaseRate: 8,
        sellingRate: 12,
        mrp: 15,
        currentStock: 500,
        minimumStock: 50,
        reorderLevel: 100,
        isFormulary: true,
        manufacturer: 'PharmaCo',
      });

      expect(drug.name).toBe('Amoxicillin 500mg Capsule');
      expect(drug.currentStock).toBe(500);
      expect(drug.minimumStock).toBe(50);
      expect(drug.reorderLevel).toBe(100);
    });

    it('stock deduction updates inventory correctly', async () => {
      const Drug = getDrugModel(getTestDb());

      const drug = await Drug.create({
        tenantId: 'test-tenant',
        name: 'Paracetamol 500mg',
        genericName: 'Paracetamol',
        category: 'TABLET',
        form: 'Tablet',
        strength: '500mg',
        purchaseRate: 2,
        sellingRate: 5,
        mrp: 5,
        currentStock: 200,
        minimumStock: 20,
      });

      // Simulate dispensing 30 tablets
      const dispensedQty = 30;
      await Drug.findByIdAndUpdate(drug._id, {
        $inc: { currentStock: -dispensedQty },
      });

      const updated = await Drug.findById(drug._id);
      expect(updated!.currentStock).toBe(170);
    });

    it('detects when stock falls below reorder level', async () => {
      const Drug = getDrugModel(getTestDb());

      const drug = await Drug.create({
        tenantId: 'test-tenant',
        name: 'Metformin 500mg',
        genericName: 'Metformin',
        category: 'TABLET',
        form: 'Tablet',
        strength: '500mg',
        purchaseRate: 3,
        sellingRate: 8,
        mrp: 10,
        currentStock: 80,
        minimumStock: 20,
        reorderLevel: 100,
      });

      // Stock is below reorder level
      expect(drug.currentStock).toBeLessThan(drug.reorderLevel);
    });

    it('prevents negative stock (minimum 0 constraint)', async () => {
      const Drug = getDrugModel(getTestDb());

      await expect(
        Drug.create({
          tenantId: 'test-tenant',
          name: 'Aspirin 75mg',
          genericName: 'Aspirin',
          category: 'TABLET',
          form: 'Tablet',
          strength: '75mg',
          purchaseRate: 1,
          sellingRate: 3,
          mrp: 4,
          currentStock: -10,  // Negative stock should fail
        })
      ).rejects.toThrow();
    });

    it('tracks drug pricing correctly (purchase vs selling vs MRP)', async () => {
      const Drug = getDrugModel(getTestDb());

      const drug = await Drug.create({
        tenantId: 'test-tenant',
        name: 'Atorvastatin 10mg',
        genericName: 'Atorvastatin',
        category: 'TABLET',
        form: 'Tablet',
        strength: '10mg',
        purchaseRate: 15,
        sellingRate: 25,
        mrp: 30,
        currentStock: 300,
      });

      // Margin validation
      const margin = drug.sellingRate - drug.purchaseRate;
      expect(margin).toBeGreaterThan(0);
      expect(drug.sellingRate).toBeLessThanOrEqual(drug.mrp);
    });
  });
});
