import { Server } from "socket.io";
import { logger } from "../utils/Logger.js";
import { NoteSoceket } from "./note.socket.js";

const connectedUsers = {};

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    logger.info("A user connected: " + socket.id);

    socket.on("register", (userId) => {
      connectedUsers[userId] = socket.id;
    });

    socket.on("noteRoom", (noteId) => {
      socket.join(noteId);
      console.log(
        `User with socket ID: ${socket.id} joined note room: ${noteId}`
      );
      io.in(noteId).emit("roomMessage", {
        message: "A new user has joined the note room",
      });
    });

    NoteSoceket(io, socket);

    socket.on("NoteRoomMessage", (data) => {
      const { noteId, message, from } = data;
      io.in(noteId).emit("roomMessage", { message, from });
      console.log(`Message sent to room ${noteId}: ${message}`);
    });

    socket.on("JoinRoom", (room) => {
      socket.join(room);
      io.in(room).emit("roomMessage", {
        message: "A new user has joined the room",
      });
      console.log(`User with socket ID: ${socket.id} joined room: ${room}`);
    });

    // socket.on("roomMessage", (data) => {
    //   const { room, message } = data;
    //   io.in(room).emit("roomMessage", { message });
    //   console.log(`Message sent to room ${room}: ${message}`);
    // });
    socket.on("roomMessage", (data) => {
      // Broadcast to ALL users in the room
      io.to(data.room).emit("roomMessage", {
        message: data.message,
        from: socket.data.name,
      });
    });

    socket.on("LeaveRoom", (room) => {
      socket.leave(room);
      io.in(room).emit("roomMessage", {
        message: "A user has left the room",
      });
      console.log(`User with socket ID: ${socket.id} left room: ${room}`);
    });

    socket.on("disconnect", () => {
      logger.info("A user disconnected: " + socket.id);
      for (const [userId, socketId] of Object.entries(connectedUsers)) {
        if (socketId === socket.id) {
          delete connectedUsers[userId];
          console.log(`----------------------->User disconnected: ${userId}`);
          break;
        }
      }
    });
  });

  return io;
};

export const getConnectedUsers = () => connectedUsers;
