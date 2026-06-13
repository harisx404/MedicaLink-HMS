import { getSocketServer } from '../sockets';

export class AlertService {
  /**
   * Broadcast a Code Blue alert
   */
  static broadcastCodeBlue(tenantId: string, location: string, patientName?: string) {
    const io = getSocketServer();
    io.to(tenantId).emit('emergency:code-blue', {
      location,
      patientName,
      timestamp: new Date()
    });
  }

  /**
   * Broadcast a Code Red alert
   */
  static broadcastCodeRed(tenantId: string, location: string, details?: string) {
    const io = getSocketServer();
    io.to(tenantId).emit('emergency:code-red', {
      location,
      details,
      timestamp: new Date()
    });
  }

  /**
   * Broadcast Mass Casualty Incident (MCI) alert
   */
  static broadcastMCI(tenantId: string, details?: string) {
    const io = getSocketServer();
    io.to(tenantId).emit('emergency:mci', {
      details,
      timestamp: new Date()
    });
  }

  /**
   * Send a critical vital alert for a specific patient
   */
  static sendCriticalVitalAlert(tenantId: string, patientId: string, vitalName: string, value: string | number) {
    const io = getSocketServer();
    io.to(tenantId).emit('icu:critical-vital', {
      patientId,
      vitalName,
      value,
      timestamp: new Date()
    });
  }
}
