export enum ConsentType {
  SURGICAL = 'SURGICAL',
  ANESTHESIA = 'ANESTHESIA',
  BLOOD_TRANSFUSION = 'BLOOD_TRANSFUSION',
  TREATMENT = 'TREATMENT',
  DATA_SHARING = 'DATA_SHARING',
  TELEMEDICINE = 'TELEMEDICINE',
  PHOTOGRAPHY = 'PHOTOGRAPHY',
  RESEARCH = 'RESEARCH',
}

export enum ComplianceFramework {
  HIPAA = 'HIPAA',
  GDPR = 'GDPR',
  HL7_FHIR = 'HL7_FHIR',
  NABH = 'NABH',
  JCI = 'JCI',
  ISO = 'ISO',
}

export enum ComplianceStatus {
  COMPLIANT = 'COMPLIANT',
  NON_COMPLIANT = 'NON_COMPLIANT',
  IN_PROGRESS = 'IN_PROGRESS',
  NOT_APPLICABLE = 'NOT_APPLICABLE',
}

export interface SharedDocument {
  _id: string;
  tenantId: string;
  patientId?: string;
  staffId?: string;
  title: string;
  category: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface SharedConsent {
  _id: string;
  tenantId: string;
  patientId: string;
  procedureId?: string;
  consentType: ConsentType;
  content: string;
  isSigned: boolean;
  signedAt?: string;
  signedBy?: string;
  signatureData?: string;
  witnessByStaffId?: string;
  isRevoked: boolean;
  revokedAt?: string;
  revokedReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SharedCompliance {
  _id: string;
  tenantId: string;
  framework: ComplianceFramework;
  category: string;
  requirement: string;
  description: string;
  status: ComplianceStatus;
  evidenceDocumentIds: string[];
  lastReviewedAt?: string;
  nextReviewDate?: string;
  reviewedBy?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
