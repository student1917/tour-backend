// utils/socket.js
import { Server } from 'socket.io';

let ioInstance = null;

export const initSocket = (server) => {
  if (ioInstance) return ioInstance; 

  ioInstance = new Server(server, {
    cors: {
      origin: [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://travel-world-sooty.vercel.app"
      ],
      credentials: true
    }
  });

  ioInstance.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);
    socket.on('disconnect', () => console.log('Socket disconnected:', socket.id));
  });

  return ioInstance;
};

export const getIO = () => {
  if (!ioInstance) throw new Error("Socket.io not initialized!");
  return ioInstance;
};

export const notifyNewBooking = (booking) => {
  getIO().emit('new_booking', booking);
};
