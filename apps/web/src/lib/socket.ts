import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const initSocket = (tenantSlug: string, token: string) => {
  if (!socket) {
    const url = import.meta.env.PROD ? window.location.origin : 'http://localhost:5000';

    socket = io(url, {
      auth: { token },
      query: { tenantSlug },
      transports: ['websocket'],
    });

    if (import.meta.env.DEV) {
      socket.on('connect', () => {
        // eslint-disable-next-line no-console
        console.debug('[Socket] Connected:', socket?.id);
      });

      socket.on('disconnect', () => {
        // eslint-disable-next-line no-console
        console.debug('[Socket] Disconnected');
      });
    }
  }
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
