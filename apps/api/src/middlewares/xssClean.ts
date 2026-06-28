import { Request, Response, NextFunction } from 'express';
import { filterXSS } from 'xss';

/**
 * Clean data recursively to prevent XSS attacks.
 * OWASP A03 & A08 compliance.
 */
function clean(data: unknown): unknown {
  if (typeof data === 'string') {
    return filterXSS(data.trim());
  }
  if (Array.isArray(data)) {
    return data.map((item) => clean(item));
  }
  if (typeof data === 'object' && data !== null) {
    const cleanedData: Record<string, unknown> = {};
    for (const key in data as Record<string, unknown>) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        cleanedData[key] = clean((data as Record<string, unknown>)[key]);
      }
    }
    return cleanedData;
  }
  return data;
}

export const xssClean = () => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (req.body) req.body = clean(req.body);
    if (req.query) req.query = clean(req.query) as typeof req.query;
    if (req.params) req.params = clean(req.params) as typeof req.params;
    next();
  };
};
