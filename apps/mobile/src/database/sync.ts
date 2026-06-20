import { synchronize } from '@nozbe/watermelondb/sync';
import { database } from './index';
import { api } from '../lib/api';
import { useOfflineStore } from '../store/offlineStore';

export async function syncDatabase() {
  const { isOnline, setLastSyncAt } = useOfflineStore.getState();

  if (!isOnline) {
    console.log('Skipping sync: Device is offline');
    return;
  }

  try {
    await synchronize({
      database,
      pullChanges: async ({ lastPulledAt, schemaVersion, migration }) => {
        const response = await api.get('/sync/pull', {
          params: { lastPulledAt, schemaVersion, migration }
        });
        
        if (!response.data) {
          return { changes: {}, timestamp: Date.now() };
        }
        
        const { changes, timestamp } = response.data;
        return { changes, timestamp };
      },
      pushChanges: async ({ changes, lastPulledAt }) => {
        await api.post('/sync/push', { changes, lastPulledAt });
      },
      migrationsEnabledAtVersion: 1,
    });
    
    setLastSyncAt(new Date().toISOString());
  } catch (error) {
    console.error('Sync failed', error);
  }
}
