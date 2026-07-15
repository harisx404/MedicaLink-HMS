import { PatientDocument } from '../models/Patient';
import { VitalsDocument } from '../models/Vitals';
import { Types } from 'mongoose';

/**
 * Service to map internal Mongoose models to FHIR R4 standard resources
 */
export class FhirService {
  
  /**
   * Map HMS Patient to FHIR Patient Resource
   */
  static mapPatientToFhir(patient: any) {
    const resource: any = {
      resourceType: 'Patient',
      id: patient._id.toString(),
      identifier: [
        {
          use: 'usual',
          type: {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
                code: 'MR',
                display: 'Medical record number'
              }
            ]
          },
          system: `http://medicalink.app/tenant/${patient.tenantId}/uhid`,
          value: patient.uhid
        }
      ],
      active: true, // simplified
      name: [
        {
          use: 'official',
          family: patient.lastName,
          given: [patient.firstName, patient.middleName].filter(Boolean)
        }
      ],
      telecom: [],
      gender: this.mapGender(patient.gender),
      birthDate: patient.dateOfBirth.toISOString().split('T')[0],
      address: [
        {
          use: 'home',
          line: [patient.contact?.address || ''],
          city: patient.contact?.city || '',
          state: patient.contact?.state || '',
          postalCode: patient.contact?.zipCode || '',
          country: patient.contact?.country || ''
        }
      ],
      maritalStatus: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/v3-MaritalStatus',
            code: patient.maritalStatus ? patient.maritalStatus.charAt(0) : 'UNK'
          }
        ]
      }
    };

    if (patient.phone) {
      resource.telecom.push({ system: 'phone', value: patient.phone, use: 'mobile' });
    }
    if (patient.email) {
      resource.telecom.push({ system: 'email', value: patient.email, use: 'home' });
    }

    // Emergency Contact
    if (patient.emergencyContact) {
      resource.contact = [
        {
          relationship: [
            {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/v2-0131',
                  code: 'C',
                  display: 'Emergency Contact'
                }
              ]
            }
          ],
          name: { text: patient.emergencyContact.name },
          telecom: [{ system: 'phone', value: patient.emergencyContact.phone }]
        }
      ];
    }

    return resource;
  }

  /**
   * Map HMS Vitals to FHIR Observation Resource
   */
  static mapVitalsToFhir(vitals: any) {
    const components = [];
    
    if (vitals.temp) {
      components.push({
        code: { coding: [{ system: 'http://loinc.org', code: '8310-5', display: 'Body temperature' }] },
        valueQuantity: { value: vitals.temp, unit: 'C', system: 'http://unitsofmeasure.org', code: 'Cel' }
      });
    }

    if (vitals.bp && vitals.bp.systolic && vitals.bp.diastolic) {
      components.push({
        code: { coding: [{ system: 'http://loinc.org', code: '85354-9', display: 'Blood pressure panel with all children optional' }] },
        component: [
          {
            code: { coding: [{ system: 'http://loinc.org', code: '8480-6', display: 'Systolic blood pressure' }] },
            valueQuantity: { value: vitals.bp.systolic, unit: 'mmHg', system: 'http://unitsofmeasure.org', code: 'mm[Hg]' }
          },
          {
            code: { coding: [{ system: 'http://loinc.org', code: '8462-4', display: 'Diastolic blood pressure' }] },
            valueQuantity: { value: vitals.bp.diastolic, unit: 'mmHg', system: 'http://unitsofmeasure.org', code: 'mm[Hg]' }
          }
        ]
      });
    }

    if (vitals.pulse) {
      components.push({
        code: { coding: [{ system: 'http://loinc.org', code: '8867-4', display: 'Heart rate' }] },
        valueQuantity: { value: vitals.pulse, unit: 'beats/minute', system: 'http://unitsofmeasure.org', code: '/min' }
      });
    }

    if (vitals.respRate) {
      components.push({
        code: { coding: [{ system: 'http://loinc.org', code: '9279-1', display: 'Respiratory rate' }] },
        valueQuantity: { value: vitals.respRate, unit: 'breaths/minute', system: 'http://unitsofmeasure.org', code: '/min' }
      });
    }

    if (vitals.spO2) {
      components.push({
        code: { coding: [{ system: 'http://loinc.org', code: '2708-6', display: 'Oxygen saturation in Arterial blood' }] },
        valueQuantity: { value: vitals.spO2, unit: '%', system: 'http://unitsofmeasure.org', code: '%' }
      });
    }

    return {
      resourceType: 'Observation',
      id: vitals._id.toString(),
      status: 'final',
      category: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/observation-category',
              code: 'vital-signs',
              display: 'Vital Signs'
            }
          ]
        }
      ],
      code: {
        coding: [
          {
            system: 'http://loinc.org',
            code: '85353-1',
            display: 'Vital signs, weight, height, head circumference, oxygen saturation and BMI panel'
          }
        ]
      },
      subject: {
        reference: `Patient/${(vitals.patient as any).toString()}`
      },
      effectiveDateTime: vitals.timestamp || new Date().toISOString(),
      performer: [
        {
          reference: `Practitioner/${(vitals.recordedBy as any).toString()}`
        }
      ],
      component: components
    };
  }

  /**
   * Helper to map gender to FHIR
   */
  private static mapGender(gender: string): 'male' | 'female' | 'other' | 'unknown' {
    switch (gender.toUpperCase()) {
      case 'MALE': return 'male';
      case 'FEMALE': return 'female';
      case 'OTHER': return 'other';
      default: return 'unknown';
    }
  }

  /**
   * Bundle resources into a FHIR standard Bundle
   */
  static createBundle(resources: any[], type: 'collection' | 'searchset' = 'collection') {
    return {
      resourceType: 'Bundle',
      type,
      total: resources.length,
      entry: resources.map(r => ({
        fullUrl: `urn:uuid:${r.id}`,
        resource: r
      }))
    };
  }
}
