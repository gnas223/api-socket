import express, { Request, Response } from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import User from "./types/User";
let rooms = new Map<string, User[] | undefined>();
const app = express();
const server = http.createServer(app);
const io = new Server(server);
io.on("connection", (socket: Socket) => {
  socket.on("addUser", (data: User, room) => {
    socket.join(room);
    if (!rooms.get(room)) {
      let user: User = { ...data, idSocket: socket.id };
      rooms.set(room, [user]);
      io.to(room).emit("users", rooms.get(room));
    } else {
      const usersOfRoom: User[] | undefined = rooms.get(room);
      let user: User = { ...data, idSocket: socket.id };
      const filterUser = usersOfRoom?.filter(
        (userRoom) => userRoom.idUser === user.idUser
      );
      if (filterUser?.length === 0) {
        usersOfRoom?.push(user);
        rooms.set(room, usersOfRoom);
      } else {
        usersOfRoom?.forEach((userRoom, index) => {
          if (userRoom.idUser === user.idUser) {
            usersOfRoom[index] = user;
          }
        });
        rooms.set(room, usersOfRoom);
      }
      io.to(room).emit("users", rooms.get(room));
    }
  });
  socket.on("userMove", (data: User, room) => {
    let allUserInRoom: User[] | undefined = rooms.get(room);
    const user: User = { ...data, idSocket: socket.id };
    allUserInRoom?.forEach((userRoom, index) => {
      if (userRoom.idUser === user.idUser) {
        allUserInRoom ? (allUserInRoom[index] = user) : null;
      }
    });
    rooms.set(room, allUserInRoom);
    io.to(room).emit("users", rooms.get(room));
  });
  socket.on("disconnect", () => {
    rooms.forEach((room, key, rooms) => {
      let allUserInRoom = room;
      allUserInRoom?.forEach((user, index, users) => {
        if (user.idSocket === socket.id) {
          users.splice(index, 1);
        }
      });
      rooms.set(key, allUserInRoom);
      io.emit("users", rooms.get(key));
    });
  });
});

app.get("/", (_req: Request, res: Response) => {
  res.send("hello server");
});
server.listen(8080, () => {
  console.log("server start on port http://localhost:8080");
});
