import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const initSocket = (tenantSlug: string, token: string) => {
  if (!socket) {
    // Determine backend URL - using relative path to let Vite proxy handle it, 
    // or absolute if running in production.
    const url = import.meta.env.PROD ? window.location.origin : 'http://localhost:5000';
    
    socket = io(url, {
      auth: { token },
      query: { tenantSlug },
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket?.id);
    });
    
    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
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
