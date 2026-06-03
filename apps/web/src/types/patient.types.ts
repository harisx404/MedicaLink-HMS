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

export interface Patient {
  id: string;
  uhid: string;
  tenantId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  bloodGroup: string;
  phone: string;
  email?: string;
  address: Address;
  emergencyContact: EmergencyContact;
  photo?: string;
  isActive: boolean;
  createdAt: string;
}
