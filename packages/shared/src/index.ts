export enum Role {
  SUPER_ADMIN = "SUPER_ADMIN",
  HOSPITAL_ADMIN = "HOSPITAL_ADMIN",
  DOCTOR = "DOCTOR",
  SENIOR_DOCTOR = "SENIOR_DOCTOR",
  NURSE = "NURSE",
  PHARMACIST = "PHARMACIST",
  LAB_TECHNICIAN = "LAB_TECHNICIAN",
  RADIOLOGIST = "RADIOLOGIST",
  RECEPTIONIST = "RECEPTIONIST",
  BILLING_STAFF = "BILLING_STAFF",
  INVENTORY_MANAGER = "INVENTORY_MANAGER",
  HR_MANAGER = "HR_MANAGER",
  BLOOD_BANK_OFFICER = "BLOOD_BANK_OFFICER",
  EMERGENCY_STAFF = "EMERGENCY_STAFF",
  PATIENT = "PATIENT"
}

export enum AppointmentStatus {
  SCHEDULED = "SCHEDULED",
  CONFIRMED = "CONFIRMED",
  CHECKED_IN = "CHECKED_IN",
  IN_CONSULTATION = "IN_CONSULTATION",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  NO_SHOW = "NO_SHOW"
}

export enum AppointmentType {
  OPD = "OPD",
  IPD = "IPD",
  EMERGENCY = "EMERGENCY",
  TELEMEDICINE = "TELEMEDICINE",
  FOLLOW_UP = "FOLLOW_UP"
}

export enum Priority {
  NORMAL = "NORMAL",
  URGENT = "URGENT",
  EMERGENCY = "EMERGENCY"
}

export enum PatientStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  PENDING = "PENDING"
}

export enum BedStatus {
  AVAILABLE = "AVAILABLE",
  OCCUPIED = "OCCUPIED",
  RESERVED = "RESERVED",
  MAINTENANCE = "MAINTENANCE"
}

export enum BloodGroup {
  A_POSITIVE = "A+",
  A_NEGATIVE = "A-",
  B_POSITIVE = "B+",
  B_NEGATIVE = "B-",
  AB_POSITIVE = "AB+",
  AB_NEGATIVE = "AB-",
  O_POSITIVE = "O+",
  O_NEGATIVE = "O-",
  UNKNOWN = "UNKNOWN"
}

export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER"
}

export enum TenantPlan {
  FREE = "FREE",
  BASIC = "BASIC",
  PROFESSIONAL = "PROFESSIONAL",
  ENTERPRISE = "ENTERPRISE"
}

export enum TenantStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
  TRIAL = "TRIAL"
}

// --- Pharmacy Enums ---
export enum DrugCategory {
  TABLET = "TABLET",
  CAPSULE = "CAPSULE",
  SYRUP = "SYRUP",
  INJECTION = "INJECTION",
  TOPICAL = "TOPICAL",
  INHALER = "INHALER",
  DROPS = "DROPS",
  OINTMENT = "OINTMENT",
  SUPPOSITORY = "SUPPOSITORY",
  PATCH = "PATCH"
}

export enum DrugSchedule {
  OTC = "OTC",
  H = "H",
  H1 = "H1",
  X = "X",
  NARCOTIC = "NARCOTIC"
}

export enum DispensingStatus {
  PENDING = "PENDING",
  PARTIAL = "PARTIAL",
  COMPLETED = "COMPLETED",
  RETURNED = "RETURNED"
}

export enum PurchaseOrderStatus {
  DRAFT = "DRAFT",
  ORDERED = "ORDERED",
  RECEIVED = "RECEIVED",
  PARTIAL = "PARTIAL",
  CANCELLED = "CANCELLED"
}

export enum StockStatus {
  IN_STOCK = "IN_STOCK",
  LOW_STOCK = "LOW_STOCK",
  OUT_OF_STOCK = "OUT_OF_STOCK"
}

export enum LabOrderStatus {
  ORDERED = "ORDERED",
  SAMPLE_COLLECTED = "SAMPLE_COLLECTED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  REPORTED = "REPORTED"
}

// --- Billing Enums ---
export enum BillStatus {
  DRAFT = "DRAFT",
  GENERATED = "GENERATED",
  PARTIAL = "PARTIAL",
  PAID = "PAID",
  VOID = "VOID",
  REFUNDED = "REFUNDED"
}

export enum BillType {
  OPD = "OPD",
  IPD = "IPD",
  EMERGENCY = "EMERGENCY",
  DAY_CARE = "DAY_CARE",
  PACKAGE = "PACKAGE"
}

export enum BillItemCategory {
  CONSULTATION = "CONSULTATION",
  PROCEDURE = "PROCEDURE",
  LAB = "LAB",
  RADIOLOGY = "RADIOLOGY",
  PHARMACY = "PHARMACY",
  ROOM = "ROOM",
  SERVICE = "SERVICE",
  PACKAGE = "PACKAGE"
}

export enum PaymentMode {
  CASH = "CASH",
  CARD = "CARD",
  UPI = "UPI",
  NEFT = "NEFT",
  INSURANCE = "INSURANCE",
  CREDIT = "CREDIT",
  WALLET = "WALLET"
}

export enum InsuranceClaimStatus {
  PENDING = "PENDING",
  PRE_AUTH_PENDING = "PRE_AUTH_PENDING",
  PRE_AUTH_APPROVED = "PRE_AUTH_APPROVED",
  SUBMITTED = "SUBMITTED",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  SETTLED = "SETTLED"
}

export enum InsurancePanelType {
  TPA = "TPA",
  GOVERNMENT = "GOVERNMENT",
  CORPORATE = "CORPORATE"
}

export enum CreditNoteStatus {
  PENDING = "PENDING",
  APPLIED = "APPLIED",
  REFUNDED = "REFUNDED"
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  errors?: Array<{ field: string; message: string }>;
}

// Base Entity Interfaces
export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  address?: Address;
}

export interface SharedUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  tenantId?: string;
  departmentId?: string;
  isActive: boolean;
  profileImage?: string;
  lastLogin?: string;
  createdAt: string;
}

export interface SharedAllergy {
  allergen: string;
  type: string;
  severity: 'MILD' | 'MODERATE' | 'SEVERE';
  reaction: string;
  addedBy: string;
}

export interface SharedChronicCondition {
  condition: string;
  icdCode?: string;
  diagnosedDate?: string;
  status: 'ACTIVE' | 'RESOLVED' | 'MANAGED';
}

export interface SharedCurrentMedication {
  drug: string;
  dose: string;
  frequency: string;
  prescribedBy: string;
}

export interface SharedImmunization {
  vaccine: string;
  date: string;
  nextDue?: string;
  batchNumber?: string;
}

export interface SharedInsurance {
  provider: string;
  policyNumber: string;
  memberName: string;
  validFrom: string;
  validTo: string;
  cardImage?: string;
  preauthRequired: boolean;
  tpaName?: string;
}

export interface SharedPatient {
  id: string;
  _id?: string;
  uhid: string;
  tenantId: string;
  
  // Personal Info
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: string;
  gender: Gender;
  bloodGroup: BloodGroup;
  maritalStatus: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED' | 'OTHER';
  religion?: string;
  nationality: string;
  photo?: string;
  
  // Contact
  phone: string;
  altPhone?: string;
  email?: string;
  address: Address;
  
  // Emergency Contact
  emergencyContact: EmergencyContact;
  
  // Medical Info
  allergies: SharedAllergy[];
  chronicConditions: SharedChronicCondition[];
  currentMedications: SharedCurrentMedication[];
  immunizations: SharedImmunization[];
  
  // Insurance
  insurances: SharedInsurance[];
  
  // Registration
  registrationType: 'OPD' | 'IPD' | 'EMERGENCY';
  referredBy?: {
    type: 'DOCTOR' | 'HOSPITAL' | 'SELF';
    name?: string;
  };
  createdBy: string;
  registrationDate: string;
  isActive: boolean;
  
  // Patient Portal
  portalUserId?: string;
  isPortalEnabled: boolean;
  
  // Analytics
  totalVisits: number;
  lastVisitDate?: string;
  totalBilled: number;
  outstandingBalance: number;
  
  createdAt: string;
  updatedAt: string;
}

export interface Specialization {
  specialty: string;
  subSpecialty?: string;
  isPrimary: boolean;
}

export interface Qualification {
  degree: string;
  institution: string;
  year: number;
  certificate?: string;
}

export interface Shift {
  startTime: string;
  endTime: string;
  appointmentDuration: number; // in minutes
  maxPatients: number;
  type: 'OPD' | 'IPD' | 'EMERGENCY';
}

export interface DailySchedule {
  day: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';
  isWorking: boolean;
  shifts: Shift[];
}

export interface ConsultationFee {
  opd: number;
  ipd: number;
  emergency: number;
  followUp: number;
  telemedicine: number;
}

export interface SharedDoctor {
  id: string;
  _id?: string;
  userId: string;
  user?: SharedUser; // when populated
  tenantId: string;
  
  registrationNumber: string;
  specializations: Specialization[];
  qualifications: Qualification[];
  experience: number;
  
  weeklySchedule: DailySchedule[];
  consultationFee: ConsultationFee;
  
  biography?: string;
  languages: string[];
  awards: string[];
  publications: string[];
  photo?: string;
  
  avgRating: number;
  totalRatings: number;
  totalConsultations: number;
  
  isAvailableToday: boolean;
  currentStatus: 'AVAILABLE' | 'IN_CONSULTATION' | 'ON_LEAVE' | 'OFFLINE';
  
  createdAt: string;
  updatedAt: string;
}

export interface SharedDoctorLeave {
  id: string;
  doctorId: string;
  tenantId: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  createdAt: string;
}

export interface SharedAppointment {
  _id?: string;
  id?: string;
  appointmentNumber: string;
  tenantId: string;
  patient: SharedPatient | string;
  doctor: SharedDoctor | string;
  department: string | Record<string, unknown>;
  appointmentDate: string;
  timeSlot: { start: string; end: string };
  type: AppointmentType;
  status: AppointmentStatus;
  tokenNumber?: number;
  reasonForVisit?: string;
  notes?: string;
  priority: Priority;
  bookedBy?: string;
  bookedAt?: string;
  checkedInAt?: string;
  consultationStartAt?: string;
  consultationEndAt?: string;
  reminders?: Array<{ type: string; sentAt?: string; status: string }>;
  cancellation?: { reason?: string; cancelledBy?: string; cancelledAt?: string; refundStatus?: string };
  createdAt?: string;
  updatedAt?: string;
}

// Constants
export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 10,
  MAX_LIMIT: 100,
};

export const API_ROUTES = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh-token",
    ME: "/auth/me",
  },
  TENANTS: {
    BASE: "/tenants",
  },
  PATIENTS: {
    BASE: "/patients",
  },
  APPOINTMENTS: {
    BASE: "/appointments",
  },
};

// Utility types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? DeepPartial<U>[]
    : T[P] extends object
    ? DeepPartial<T[P]>
    : T[P];
};

export interface SharedTenant {
  id: string;
  name: string;
  slug: string;
  plan: TenantPlan;
  status: TenantStatus;
  adminEmail: string;
  phone?: string;
  address?: Address;
  logo?: string;
  primaryColor: string;
  features: {
    pharmacy: boolean;
    lab: boolean;
    radiology: boolean;
    telemedicine: boolean;
    bloodBank: boolean;
    ai: boolean;
  };
  subscription: {
    planId?: string;
    startDate?: string;
    endDate?: string;
    status: string;
  };
  database: {
    name: string;
    connectionString?: string;
  };
  settings: {
    currency: string;
    timezone: string;
    dateFormat: string;
    language: string;
  };
  createdAt: string;
}

export interface AuthUser extends Omit<SharedUser, 'id'> {
  id: string;
}

export interface LoginRequest {
  email: string;
  password?: string; // Optional if using 2FA only or other methods later
}

export interface LoginResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken?: string;
  requires2FA?: boolean;
}

export interface RegisterHospitalRequest {
  hospitalName: string;
  slug: string;
  adminEmail: string;
  password?: string;
  plan: TenantPlan;
}

export interface SharedConsultation {
  _id?: string;
  id?: string;
  tenantId: string;
  consultationNumber: string;
  patient: SharedPatient | string;
  doctor: SharedDoctor | string;
  appointment: SharedAppointment | string;
  visitDate: string;
  visitType: 'OPD' | 'IPD' | 'EMERGENCY' | 'TELEMEDICINE';
  department: string | Record<string, unknown>;
  
  subjective?: {
    symptoms?: Array<{ symptom: string; duration: string; severity: string; notes?: string }>;
    reviewOfSystems?: Record<string, string>;
  };
  
  objective?: {
    vitals?: {
      bp?: { systolic: number; diastolic: number };
      pulse?: number;
      temperature?: number;
      respRate?: number;
      spO2?: number;
      weight?: number;
      height?: number;
      bmi?: number;
      painScore?: number;
      bloodGlucose?: number;
    };
    physicalExam?: Record<string, string>;
    anthropometry?: { waistCircumference?: number; hipCircumference?: number };
  };
  
  assessment?: {
    diagnoses?: Array<{
      icdCode: string;
      description: string;
      type: 'PRIMARY' | 'SECONDARY' | 'COMORBIDITY';
      severity?: string;
      status: 'PROVISIONAL' | 'CONFIRMED' | 'DIFFERENTIAL';
    }>;
    clinicalNotes?: string;
    aiSummary?: string;
  };
  
  plan?: {
    prescriptions?: SharedPrescription[] | string[];
    labOrders?: string[];
    radiologyOrders?: string[];
    procedures?: Array<{ name: string; notes?: string; scheduledDate?: string }>;
    referrals?: Array<{ speciality: string; doctorName?: string; urgency?: string; notes?: string }>;
    instructions?: string;
    followUpDate?: string;
    followUpReason?: string;
    sickLeave?: { days: number; fromDate: string; toDate: string; reason: string };
  };
  
  consultationFee?: number;
  status: 'DRAFT' | 'COMPLETED' | 'SIGNED';
  signedAt?: string;
  signedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SharedVitals {
  _id?: string;
  id?: string;
  tenantId: string;
  patient: SharedPatient | string;
  ward?: string | Record<string, unknown>;
  bed?: string | Record<string, unknown>;
  recordedBy: SharedUser | string;
  bp?: { systolic: number; diastolic: number };
  pulse?: number;
  temp?: number;
  respRate?: number;
  spO2?: number;
  weight?: number;
  height?: number;
  bloodGlucose?: number;
  urine?: string;
  pain?: number;
  timestamp: string;
  notes?: string;
  createdAt?: string;
}

export interface SharedPrescription {
  _id?: string;
  id?: string;
  tenantId: string;
  prescriptionNumber: string;
  consultation: SharedConsultation | string;
  patient: SharedPatient | string;
  doctor: SharedDoctor | string;
  medications: Array<{
    drugId?: string;
    drugName: string;
    genericName?: string;
    strength?: string;
    form?: string;
    dose: string;
    doseUnit?: string;
    frequency?: { times: number; period: string; instructions?: string };
    route?: string;
    duration: string;
    quantity: number;
    whenToTake?: string;
    instructions?: string;
    isSubstitutable: boolean;
  }>;
  generalInstructions?: string;
  followUpDate?: string;
  digitalSignature?: string;
  qrCode?: string;
  pharmacyStatus: 'PENDING' | 'DISPENSED' | 'PARTIAL';
  createdAt?: string;
}

export interface ICD10Code {
  _id?: string;
  id?: string;
  code: string;
  description: string;
  category: string;
  isBillable: boolean;
}

export interface DrugFormulary {
  _id?: string;
  id?: string;
  tenantId: string;
  name: string;
  genericName: string;
  brand: string;
  category: string;
  therapeuticClass?: string;
  form: string;
  strength: string;
  unit?: string;
  isActive: boolean;
  isFormulary: boolean;
}

export interface IDrug {
  _id?: string;
  id?: string;
  tenantId: string;
  name: string;
  genericName: string;
  brand?: string;
  category: DrugCategory;
  therapeuticClass?: string;
  form: string;
  strength: string;
  unit?: string;
  hsnCode?: string;
  barcode?: string;
  drugSchedule?: DrugSchedule;
  purchaseRate: number;
  sellingRate: number;
  mrp: number;
  taxCategory?: number;
  currentStock: number;
  minimumStock: number;
  maximumStock: number;
  reorderLevel: number;
  isFormulary: boolean;
  isActive: boolean;
  manufacturer?: string;
  importerName?: string;
}

export interface IDrugBatch {
  _id?: string;
  id?: string;
  drug: IDrug | string;
  batchNumber: string;
  expiryDate: string;
  manufacturingDate?: string;
  purchaseDate?: string;
  quantity: number;
  remainingQuantity: number;
  purchaseRate: number;
  mrp: number;
  rackLocation?: string;
  supplierId?: string;
  purchaseOrderId?: string;
}

export interface IDispensing {
  _id?: string;
  id?: string;
  dispensingNumber: string;
  prescription: SharedPrescription | string;
  patient: SharedPatient | string;
  dispensedBy: SharedUser | string;
  items: Array<{
    drug: IDrug | string;
    batch: IDrugBatch | string;
    quantity: number;
    dose?: string;
    unitPrice: number;
    totalPrice: number;
    instructions?: string;
  }>;
  totalAmount: number;
  paidAmount: number;
  dispensedAt?: string;
  returnedAt?: string;
  status: DispensingStatus;
}

export interface IPurchaseOrder {
  _id?: string;
  id?: string;
  poNumber: string;
  supplier: ISupplier | string;
  items: Array<{
    drug: IDrug | string;
    quantity: number;
    rate: number;
    total: number;
  }>;
  totalAmount: number;
  status: PurchaseOrderStatus;
  orderedBy: SharedUser | string;
  orderedAt: string;
  expectedDelivery?: string;
  goodsReceiptNotes?: string[];
}

export interface IGoodsReceiptNote {
  _id?: string;
  id?: string;
  grnNumber: string;
  purchaseOrder: IPurchaseOrder | string;
  receivedBy: SharedUser | string;
  items: Array<{
    drug: IDrug | string;
    receivedQty: number;
    batchNumber: string;
    expiryDate: string;
    rackLocation?: string;
  }>;
  discrepancies?: string;
  status: string;
  createdAt?: string;
}

export interface ISupplier {
  _id?: string;
  id?: string;
  tenantId: string;
  name: string;
  contactPerson?: string;
  phone?: string;
}

export interface SharedVitals {
  _id?: string;
  id?: string;
  tenantId: string;
  patient: SharedPatient | string;
  ward?: string | Record<string, unknown>;
  bed?: string | Record<string, unknown>;
  recordedBy: SharedUser | string;
  bp?: { systolic: number; diastolic: number };
  pulse?: number;
  temp?: number;
  respRate?: number;
  spO2?: number;
  weight?: number;
  height?: number;
  bloodGlucose?: number;
  urine?: string;
  pain?: number;
  timestamp: string;
  notes?: string;
  createdAt?: string;
}

export interface SharedPrescription {
  _id?: string;
  id?: string;
  tenantId: string;
  prescriptionNumber: string;
  consultation: SharedConsultation | string;
  patient: SharedPatient | string;
  doctor: SharedDoctor | string;
  medications: Array<{
    drugId?: string;
    drugName: string;
    genericName?: string;
    strength?: string;
    form?: string;
    dose: string;
    doseUnit?: string;
    frequency?: { times: number; period: string; instructions?: string };
    route?: string;
    duration: string;
    quantity: number;
    whenToTake?: string;
    instructions?: string;
    isSubstitutable: boolean;
  }>;
  generalInstructions?: string;
  followUpDate?: string;
  digitalSignature?: string;
  qrCode?: string;
  pharmacyStatus: 'PENDING' | 'DISPENSED' | 'PARTIAL';
  createdAt?: string;
}

export interface ICD10Code {
  _id?: string;
  id?: string;
  code: string;
  description: string;
  category: string;
  isBillable: boolean;
}

export interface DrugFormulary {
  _id?: string;
  id?: string;
  tenantId: string;
  name: string;
  genericName: string;
  brand: string;
  category: string;
  therapeuticClass?: string;
  form: string;
  strength: string;
  unit?: string;
  isActive: boolean;
  isFormulary: boolean;
}

export interface IDrug {
  _id?: string;
  id?: string;
  tenantId: string;
  name: string;
  genericName: string;
  brand?: string;
  category: DrugCategory;
  therapeuticClass?: string;
  form: string;
  strength: string;
  unit?: string;
  hsnCode?: string;
  barcode?: string;
  drugSchedule?: DrugSchedule;
  purchaseRate: number;
  sellingRate: number;
  mrp: number;
  taxCategory?: number;
  currentStock: number;
  minimumStock: number;
  maximumStock: number;
  reorderLevel: number;
  isFormulary: boolean;
  isActive: boolean;
  manufacturer?: string;
  importerName?: string;
}

export interface IDrugBatch {
  _id?: string;
  id?: string;
  drug: IDrug | string;
  batchNumber: string;
  expiryDate: string;
  manufacturingDate?: string;
  purchaseDate?: string;
  quantity: number;
  remainingQuantity: number;
  purchaseRate: number;
  mrp: number;
  rackLocation?: string;
  supplierId?: string;
  purchaseOrderId?: string;
}

export interface IDispensing {
  _id?: string;
  id?: string;
  dispensingNumber: string;
  prescription: SharedPrescription | string;
  patient: SharedPatient | string;
  dispensedBy: SharedUser | string;
  items: Array<{
    drug: IDrug | string;
    batch: IDrugBatch | string;
    quantity: number;
    dose?: string;
    unitPrice: number;
    totalPrice: number;
    instructions?: string;
  }>;
  totalAmount: number;
  paidAmount: number;
  dispensedAt?: string;
  returnedAt?: string;
  status: DispensingStatus;
}

export interface IPurchaseOrder {
  _id?: string;
  id?: string;
  poNumber: string;
  supplier: ISupplier | string;
  items: Array<{
    drug: IDrug | string;
    quantity: number;
    rate: number;
    total: number;
  }>;
  totalAmount: number;
  status: PurchaseOrderStatus;
  orderedBy: SharedUser | string;
  orderedAt: string;
  expectedDelivery?: string;
  goodsReceiptNotes?: string[];
}

export interface IGoodsReceiptNote {
  _id?: string;
  id?: string;
  grnNumber: string;
  purchaseOrder: IPurchaseOrder | string;
  receivedBy: SharedUser | string;
  items: Array<{
    drug: IDrug | string;
    receivedQty: number;
    batchNumber: string;
    expiryDate: string;
    rackLocation?: string;
  }>;
  discrepancies?: string;
  status: string;
  createdAt?: string;
}

export interface ISupplier {
  _id?: string;
  id?: string;
  tenantId: string;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  gstNumber?: string;
  licenseNumber?: string;
  drugs?: string[] | IDrug[];
  isActive: boolean;
}

// --- Lab Interfaces ---
export interface ITestCatalog {
  _id?: string;
  id?: string;
  code: string;
  name: string;
  shortName?: string;
  category: string;
  sampleType: string;
  container?: string;
  volume?: string;
  instructions?: string;
  turnaroundTime: number;
  parameters: Array<{
    name: string;
    unit?: string;
    referenceRanges: Array<{
      ageMin?: number;
      ageMax?: number;
      gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'ALL';
      minValue?: number;
      maxValue?: number;
      normalText?: string;
    }>;
    criticalLow?: number;
    criticalHigh?: number;
    dataType: 'NUMERIC' | 'TEXT' | 'OPTION';
  }>;
  preparation: 'FASTING' | 'RANDOM' | '2HR_POSTPRANDIAL' | 'NONE';
  price: number;
  isActive: boolean;
}

export interface ILabOrder {
  _id?: string;
  id?: string;
  orderNumber: string;
  patient: any; // Populated Patient
  doctor?: any; // Populated Doctor
  tests: Array<{
    testId: string | ITestCatalog;
    testName: string;
    status: LabOrderStatus;
    priority: 'ROUTINE' | 'URGENT' | 'STAT';
  }>;
  urgency: 'ROUTINE' | 'URGENT' | 'STAT';
  clinicalInfo?: string;
  orderDate: string;
  sampleBarcode?: string;
  collectedBy?: any; // Populated User
  collectedAt?: string;
  status: LabOrderStatus;
  orderedAt: string;
  resultEnteredAt?: string;
  verifiedAt?: string;
  reportedAt?: string;
}

export interface ILabResult {
  _id?: string;
  id?: string;
  labOrder: string | ILabOrder;
  test: string | ITestCatalog;
  parameters: Array<{
    name: string;
    value: string;
    unit?: string;
    isAbnormal: boolean;
    isCritical: boolean;
    referenceRange?: {
      min?: number;
      max?: number;
      normalText?: string;
    };
    criticalAcknowledged?: boolean;
    criticalAcknowledgedBy?: unknown;
    criticalAcknowledgedAt?: string;
  }>;
  interpretation?: string;
  comments?: string;
  performedBy?: any; // Populated User
  verifiedBy?: any; // Populated User
  performedAt?: string;
  verifiedAt?: string;
  reportedAt?: string;
  reportPdfUrl?: string;
  status: 'PENDING' | 'ENTERED' | 'VERIFIED' | 'REPORTED';
  hasDeltaCheck?: boolean;
  deltaWarning?: string;
}

// --- Billing Interfaces ---

export interface IBillItem {
  _id?: string;
  category: BillItemCategory;
  description: string;
  refId?: string; // Reference to Consultation, LabOrder, Dispensing etc.
  quantity: number;
  unitPrice: number;
  discountPct: number;     // 0–100 percent
  taxRate: number;         // e.g. 18 for 18%
  amount: number;          // qty * unitPrice - discount
  cgstAmount: number;      // amount * taxRate/2 / 100
  sgstAmount: number;      // amount * taxRate/2 / 100
  taxAmount: number;       // cgst + sgst
  total: number;           // amount + taxAmount
  performedBy?: string;
  serviceDate?: string;
}

export interface IPaymentRecord {
  _id?: string;
  mode: PaymentMode;
  amount: number;
  reference?: string;      // Card last-4, UPI ref, cheque no.
  date: string;
  receivedBy?: string;
}

export interface IInsuranceClaim {
  insuranceId?: string;
  policyNumber?: string;
  tpaName?: string;
  preAuthNumber?: string;
  preAuthDate?: string;
  preAuthAmount?: number;
  claimNumber?: string;
  claimDate?: string;
  claimedAmount?: number;
  approvedAmount?: number;
  settledAmount?: number;
  rejectionReason?: string;
  status: InsuranceClaimStatus;
}

export interface IBill {
  _id?: string;
  id?: string;
  tenantId: string;
  billNumber: string;
  patient: any;               // Populated Patient
  encounter?: any;            // Populated Consultation
  billType: BillType;
  billDate: string;
  items: IBillItem[];
  grossAmount: number;
  discountAmount: number;
  discountReason?: string;
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  taxAmount: number;
  roundOff: number;
  netAmount: number;
  payments: IPaymentRecord[];
  totalPaid: number;
  balance: number;
  insuranceClaim?: IInsuranceClaim;
  status: BillStatus;
  voidReason?: string;
  createdBy?: any;
  updatedBy?: any;
  creditNoteRef?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IServiceCharge {
  _id?: string;
  id?: string;
  tenantId: string;
  code: string;
  name: string;
  category: BillItemCategory;
  price: number;
  taxRate: number;           // 0, 5, 12, 18
  department?: string;
  isPackageable: boolean;
  isActive: boolean;
}

export interface IInsurancePanel {
  _id?: string;
  id?: string;
  tenantId: string;
  name: string;
  type: InsurancePanelType;
  contactPerson?: string;
  phone?: string;
  email?: string;
  empanelledSpecialties?: string[];
  discountRate?: number;     // Percentage discount for this panel
  billingFormat?: string;
  claimSubmissionMethod?: string;
  isActive: boolean;
}

export interface ICreditNote {
  _id?: string;
  id?: string;
  tenantId: string;
  creditNoteNumber: string;
  originalBill: string | IBill;
  patient: unknown;
  amount: number;
  reason: string;
  issuedBy?: unknown;
  issuedAt: string;
  status: CreditNoteStatus;
}

// Billing Report Interfaces
export interface IDailyCollectionReport {
  date: string;
  totalCollection: number;
  byMode: { mode: PaymentMode; amount: number; count: number }[];
  byCashier: { userId: string; name: string; amount: number }[];
  bills: { billNumber: string; patient: string; amount: number; paidAmount: number; balance: number }[];
}

export interface IRevenueTrend {
  date: string;
  revenue: number;
}

export interface IDeptRevenue {
  department: string;
  revenue: number;
}

export interface IOutstandingEntry {
  patient: string;
  uhid: string;
  billNumber: string;
  billDate: string;
  netAmount: number;
  totalPaid: number;
  balance: number;
  agingBucket: '0-30' | '31-60' | '61-90' | '90+';
  daysSinceBill: number;
}

export * from './types/emergency.types';
export * from './types/icu.types';
export * from './types/ot.types';
export * from './types/bloodbank.types';
export * from './types/telemedicine.types';
export * from './types/hr.types';
export * from './types/notification.types';
export * from './types/audit.types';
