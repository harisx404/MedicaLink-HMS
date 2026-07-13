import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition: swaggerJSDoc.OAS3Definition = {
  openapi: '3.0.3',
  info: {
    title: 'MedicaLink HMS API',
    version: '1.0.0',
    description:
      'Enterprise-grade multi-tenant Hospital Management System REST API. ' +
      'Supports 25+ clinical modules, real-time WebSocket events, and AI-powered workflows.',
    contact: {
      name: 'MedicaLink HMS',
      url: 'https://github.com/harisx404/MedicaLink-HMS',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: '/api/v1',
      description: 'API v1',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Access token obtained from POST /auth/login',
      },
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'refreshToken',
        description: 'HttpOnly refresh token cookie set after login',
      },
    },
    schemas: {
      ApiResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Operation successful' },
          data: { type: 'object' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Resource not found' },
          errors: {
            type: 'array',
            items: { type: 'object' },
          },
        },
      },
      PaginatedResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string' },
          data: { type: 'array', items: { type: 'object' } },
          pagination: {
            type: 'object',
            properties: {
              page: { type: 'integer', example: 1 },
              limit: { type: 'integer', example: 20 },
              total: { type: 'integer', example: 150 },
              pages: { type: 'integer', example: 8 },
            },
          },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  tags: [
    { name: 'Authentication', description: 'Login, registration, token management, 2FA' },
    { name: 'Patients', description: 'Patient registration, profiles, and portal' },
    { name: 'Appointments', description: 'Scheduling, queue management, and reminders' },
    { name: 'Consultations', description: 'EHR, SOAP notes, and clinical workflows' },
    { name: 'Pharmacy', description: 'Drug inventory, dispensing, and procurement' },
    { name: 'Laboratory', description: 'Lab orders, sample collection, and results' },
    { name: 'Billing', description: 'Invoice generation, payments, and insurance' },
    { name: 'Emergency', description: 'Triage, ambulance tracking, and ICU' },
    { name: 'Users', description: 'Staff and doctor management' },
    { name: 'Departments', description: 'Department and ward administration' },
    { name: 'Notifications', description: 'Multi-channel notification hub' },
    { name: 'Super Admin', description: 'Platform-level SaaS management' },
    { name: 'Dashboard', description: 'KPI metrics and analytics' },
  ],
  paths: {
    '/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Authenticate user and obtain tokens',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'doctor@hospital.com' },
                  password: { type: 'string', format: 'password', example: 'SecurePass123!' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Login successful — access token in body, refresh token in HttpOnly cookie',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } },
          },
          '401': { description: 'Invalid credentials or account locked' },
          '429': { description: 'Too many login attempts — rate limited' },
        },
      },
    },
    '/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register a new user account',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'firstName', 'lastName', 'role'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 },
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  role: { type: 'string', enum: ['DOCTOR', 'NURSE', 'RECEPTIONIST', 'PHARMACIST', 'LAB_TECHNICIAN'] },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'User created successfully' },
          '409': { description: 'Email already registered' },
        },
      },
    },
    '/auth/refresh': {
      post: {
        tags: ['Authentication'],
        summary: 'Refresh access token using HttpOnly cookie',
        security: [{ cookieAuth: [] }],
        responses: {
          '200': { description: 'New access token issued' },
          '401': { description: 'Invalid or expired refresh token' },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Authentication'],
        summary: 'Invalidate refresh token and clear cookie',
        responses: {
          '200': { description: 'Logged out successfully' },
        },
      },
    },
    '/auth/2fa/setup': {
      post: {
        tags: ['Authentication'],
        summary: 'Generate TOTP secret and QR code for 2FA enrollment',
        responses: {
          '200': { description: 'QR code and secret returned' },
        },
      },
    },
    '/patients': {
      get: {
        tags: ['Patients'],
        summary: 'List all patients with pagination and search',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search by name, UHID, or phone' },
        ],
        responses: {
          '200': { description: 'Paginated patient list', content: { 'application/json': { schema: { $ref: '#/components/schemas/PaginatedResponse' } } } },
        },
      },
      post: {
        tags: ['Patients'],
        summary: 'Register a new patient',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['firstName', 'lastName', 'phone', 'gender', 'dob'],
                properties: {
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  phone: { type: 'string' },
                  gender: { type: 'string', enum: ['MALE', 'FEMALE', 'OTHER'] },
                  dob: { type: 'string', format: 'date' },
                  email: { type: 'string', format: 'email' },
                  bloodGroup: { type: 'string', enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Patient registered with auto-generated UHID' },
          '409': { description: 'Duplicate patient detected' },
        },
      },
    },
    '/patients/{id}': {
      get: {
        tags: ['Patients'],
        summary: 'Get patient profile by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Patient profile data' },
          '404': { description: 'Patient not found' },
        },
      },
    },
    '/appointments': {
      get: {
        tags: ['Appointments'],
        summary: 'List appointments with filters',
        parameters: [
          { name: 'date', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'doctor', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['SCHEDULED', 'CONFIRMED', 'CHECKED_IN', 'COMPLETED', 'CANCELLED'] } },
        ],
        responses: { '200': { description: 'Filtered appointment list' } },
      },
      post: {
        tags: ['Appointments'],
        summary: 'Book a new appointment',
        description: 'Uses Redis distributed locks to prevent double-booking',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['patient', 'doctor', 'date', 'timeSlot'],
                properties: {
                  patient: { type: 'string', description: 'Patient ObjectId' },
                  doctor: { type: 'string', description: 'Doctor ObjectId' },
                  date: { type: 'string', format: 'date' },
                  timeSlot: { type: 'string', example: '09:00-09:30' },
                  type: { type: 'string', enum: ['NEW', 'FOLLOW_UP', 'EMERGENCY'] },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Appointment booked' },
          '409': { description: 'Slot already taken' },
        },
      },
    },
    '/pharmacy/drugs': {
      get: {
        tags: ['Pharmacy'],
        summary: 'List drug inventory with stock levels',
        responses: { '200': { description: 'Drug inventory list with batch info' } },
      },
    },
    '/pharmacy/dispense': {
      post: {
        tags: ['Pharmacy'],
        summary: 'Dispense medication using FEFO batch selection',
        responses: {
          '200': { description: 'Medication dispensed and stock updated' },
          '400': { description: 'Insufficient stock' },
        },
      },
    },
    '/lab/orders': {
      get: {
        tags: ['Laboratory'],
        summary: 'List lab orders with status filtering',
        responses: { '200': { description: 'Lab order list' } },
      },
    },
    '/billing/bills': {
      get: {
        tags: ['Billing'],
        summary: 'List bills with financial summaries',
        responses: { '200': { description: 'Bill list with payment status' } },
      },
      post: {
        tags: ['Billing'],
        summary: 'Generate a new bill with line items',
        responses: { '201': { description: 'Bill created in DRAFT status' } },
      },
    },
    '/billing/bills/{id}/pay': {
      post: {
        tags: ['Billing'],
        summary: 'Record payment against a bill',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Payment recorded, bill status updated' } },
      },
    },
    '/emergency/patients': {
      get: {
        tags: ['Emergency'],
        summary: 'List emergency patients by triage priority',
        responses: { '200': { description: 'Emergency patients sorted by severity' } },
      },
    },
    '/dashboard/stats': {
      get: {
        tags: ['Dashboard'],
        summary: 'Get hospital KPI metrics',
        responses: { '200': { description: 'Dashboard statistics (patients, revenue, occupancy)' } },
      },
    },
    '/super-admin/hospitals': {
      get: {
        tags: ['Super Admin'],
        summary: 'List all tenant hospitals',
        description: 'Requires SUPER_ADMIN role',
        responses: { '200': { description: 'All registered hospitals with subscription status' } },
      },
    },
  },
};

const swaggerOptions: swaggerJSDoc.Options = {
  definition: swaggerDefinition,
  apis: [],
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);
