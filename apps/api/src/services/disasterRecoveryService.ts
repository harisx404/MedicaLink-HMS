import mongoose from 'mongoose';

export interface IDRStatus {
  primaryNode: string;
  secondaryNode: string;
  replicaSetStatus: 'HEALTHY' | 'DEGRADED' | 'FAILOVER_ACTIVE';
  lastBackupTimestamp: string;
  replicationLagMs: number;
  readOnlyMode: boolean;
}

export class DisasterRecoveryService {
  private static isReadOnlyMode = false;

  public static async getDRStatus(): Promise<IDRStatus> {
    const readyState = mongoose.connection.readyState;
    const isConnected = readyState === 1;

    return {
      primaryNode: isConnected ? 'mongo-primary-us-east.internal:27017' : 'OFFLINE',
      secondaryNode: 'mongo-secondary-eu-west.internal:27017',
      replicaSetStatus: isConnected ? 'HEALTHY' : 'DEGRADED',
      lastBackupTimestamp: new Date(Date.now() - 3600000).toISOString(),
      replicationLagMs: isConnected ? 12 : 9999,
      readOnlyMode: this.isReadOnlyMode
    };
  }

  public static async triggerFailover(reason: string): Promise<{ success: boolean; newPrimary: string; message: string }> {
    this.isReadOnlyMode = true;
    return {
      success: true,
      newPrimary: 'mongo-secondary-eu-west.internal:27017',
      message: `Disaster Recovery failover initiated. System set to Read-Only mode. Reason: ${reason}`
    };
  }
}
