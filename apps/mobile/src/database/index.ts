import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { schema } from './schema';
import { Appointment, Patient } from './models';

// Setup adapter
const adapter = new SQLiteAdapter({
  schema,
  dbName: 'medicalink', // optional database name or file system path
  jsi: true, // optional, but recommended to have good performance
  onSetUpError: error => {
    console.error('Database setup error', error);
  }
});

// Setup database
export const database = new Database({
  adapter,
  modelClasses: [
    Appointment,
    Patient,
  ],
});
