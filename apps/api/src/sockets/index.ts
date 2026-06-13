import { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { env } from '../config/env';
import { logger } from '../utils/logger';

let io: SocketServer | null = null;

/**
 * Initializes the Socket.io server and registers all event namespaces.
 * Must be called once during application startup.
 */
export function initSocketServer(httpServer: HttpServer): SocketServer {
  io = new SocketServer(httpServer, {
    cors: {
      origin: env.CLIENT_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // ── Global Connection Handling ────────────────────────────────────────────
  io.on('connection', (socket) => {
    logger.debug(`[Socket] Client connected: ${socket.id}`);

    // Client sends its JWT on connect — join personal room
    socket.on('authenticate', (userId: string) => {
      socket.join(`user-${userId}`);
      logger.debug(`[Socket] User ${userId} joined personal room`);
    });

    // Join a specific tenant room (hospital-wide events)
    socket.on('join-tenant', (tenantId: string) => {
      socket.join(`hospital-${tenantId}`);
      logger.debug(`[Socket] Socket joined tenant room: ${tenantId}`);
    });

    // Join appointment queue room (real-time patient queue for doctors)
    socket.on('join-queue', (roomId: string) => {
      socket.join(`queue-${roomId}`);
    });

    // Join ward room (nursing, ICU updates)
    socket.on('join-ward', (wardId: string) => {
      socket.join(`ward-${wardId}`);
    });

    // ── Telemedicine / WebRTC Signaling ───────────────────────────────────────
    socket.on('join-telemed-room', (roomId: string) => {
      socket.join(`telemed-${roomId}`);
      logger.debug(`[Socket] User joined telemed room: ${roomId}`);
    });

    socket.on('webrtc-offer', ({ roomId, offer }: { roomId: string; offer: any }) => {
      socket.to(`telemed-${roomId}`).emit('webrtc-offer', offer);
    });

    socket.on('webrtc-answer', ({ roomId, answer }: { roomId: string; answer: any }) => {
      socket.to(`telemed-${roomId}`).emit('webrtc-answer', answer);
    });

    socket.on('webrtc-ice-candidate', ({ roomId, candidate }: { roomId: string; candidate: any }) => {
      socket.to(`telemed-${roomId}`).emit('webrtc-ice-candidate', candidate);
    });

    socket.on('patient-arrived', ({ roomId }: { roomId: string }) => {
      socket.to(`telemed-${roomId}`).emit('patient-arrived');
    });

    socket.on('doctor-ready', ({ roomId }: { roomId: string }) => {
      socket.to(`telemed-${roomId}`).emit('doctor-ready');
    });

    socket.on('call-ended', ({ roomId }: { roomId: string }) => {
      socket.to(`telemed-${roomId}`).emit('call-ended');
    });

    socket.on('disconnect', (reason) => {
      logger.debug(`[Socket] Client disconnected: ${socket.id} — ${reason}`);
    });
  });

  logger.info('✅ Socket.io server initialized');
  return io;
}

/**
 * Returns the Socket.io instance. Throws if not yet initialized.
 */
export function getSocketServer(): SocketServer {
  if (!io) {
    throw new Error('Socket.io server not initialized. Call initSocketServer() first.');
  }
  return io;
}

// ── Emission Helpers ──────────────────────────────────────────────────────────

/** Send a real-time event to a specific user. */
export function emitToUser(userId: string, event: string, data: unknown): void {
  getSocketServer().to(`user-${userId}`).emit(event, data);
}

/** Broadcast to all users in a hospital tenant. */
export function emitToTenant(tenantId: string, event: string, data: unknown): void {
  getSocketServer().to(`hospital-${tenantId}`).emit(event, data);
}

/** Broadcast to all users in a ward (nurses, ICU). */
export function emitToWard(wardId: string, event: string, data: unknown): void {
  getSocketServer().to(`ward-${wardId}`).emit(event, data);
}

/** Update patient queue in real-time for a doctor's appointment queue. */
export function emitQueueUpdate(queueRoomId: string, data: unknown): void {
  getSocketServer().to(`queue-${queueRoomId}`).emit('queue-updated', data);
}
