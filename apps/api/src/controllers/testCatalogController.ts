import { Request, Response } from 'express';
import { getTestCatalogModel } from '../models/TestCatalog';
import { sendSuccess, sendError } from '../utils/apiResponse';

export const listTestCatalog = async (req: Request, res: Response) => {
  try {
    const TestCatalog = getTestCatalogModel(req.tenantDb!);
    const { search, category, activeOnly } = req.query;
    
    const query: any = { tenantId: req.user?.tenantId };
    
    if (activeOnly === 'true') {
      query.isActive = true;
    }
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ];
    }
    
    const tests = await TestCatalog.find(query).sort({ name: 1 });
    
    return sendSuccess(res, 'Test catalog retrieved', tests);
  } catch (error: any) {
    return sendError(res, 'Failed to fetch test catalog', 500, [{ field: 'server', message: error.message }]);
  }
};

export const createTest = async (req: Request, res: Response) => {
  try {
    const TestCatalog = getTestCatalogModel(req.tenantDb!);
    const testData = req.body;
    
    const existingTest = await TestCatalog.findOne({ 
      tenantId: req.user?.tenantId,
      code: testData.code 
    });
    
    if (existingTest) {
      return sendError(res, 'Test with this code already exists', 400);
    }
    
    const newTest = new TestCatalog({
      ...testData,
      tenantId: req.user?.tenantId
    });
    
    await newTest.save();
    
    return sendSuccess(res, 'Test created successfully', newTest, 201);
  } catch (error: any) {
    return sendError(res, 'Failed to create test', 500, [{ field: 'server', message: error.message }]);
  }
};

export const updateTest = async (req: Request, res: Response) => {
  try {
    const TestCatalog = getTestCatalogModel(req.tenantDb!);
    const { id } = req.params;
    const testData = req.body;
    
    // Ensure code uniqueness if changing code
    if (testData.code) {
      const existingTest = await TestCatalog.findOne({ 
        tenantId: req.user?.tenantId,
        code: testData.code,
        _id: { $ne: id }
      });
      
      if (existingTest) {
        return sendError(res, 'Another test with this code already exists', 400);
      }
    }
    
    const updatedTest = await TestCatalog.findOneAndUpdate(
      { _id: id, tenantId: req.user?.tenantId },
      { $set: testData },
      { new: true, runValidators: true }
    );
    
    if (!updatedTest) {
      return sendError(res, 'Test not found', 404);
    }
    
    return sendSuccess(res, 'Test updated successfully', updatedTest);
  } catch (error: any) {
    return sendError(res, 'Failed to update test', 500, [{ field: 'server', message: error.message }]);
  }
};

export const getTestDetails = async (req: Request, res: Response) => {
  try {
    const TestCatalog = getTestCatalogModel(req.tenantDb!);
    const { id } = req.params;
    
    const test = await TestCatalog.findOne({ _id: id, tenantId: req.user?.tenantId });
    
    if (!test) {
      return sendError(res, 'Test not found', 404);
    }
    
    return sendSuccess(res, 'Test details retrieved', test);
  } catch (error: any) {
    return sendError(res, 'Failed to fetch test details', 500, [{ field: 'server', message: error.message }]);
  }
};
