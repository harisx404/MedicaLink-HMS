import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'appointments',
      columns: [
        { name: 'server_id', type: 'string', isIndexed: true },
        { name: 'doctor_name', type: 'string' },
        { name: 'specialty', type: 'string' },
        { name: 'date', type: 'number' },
        { name: 'status', type: 'string' },
        { name: 'type', type: 'string' },
        { name: 'is_synced', type: 'boolean' },
      ]
    }),
    tableSchema({
      name: 'patients',
      columns: [
        { name: 'server_id', type: 'string', isIndexed: true },
        { name: 'first_name', type: 'string' },
        { name: 'last_name', type: 'string' },
        { name: 'gender', type: 'string' },
        { name: 'date_of_birth', type: 'number' },
        { name: 'is_synced', type: 'boolean' },
      ]
    })
  ]
});
