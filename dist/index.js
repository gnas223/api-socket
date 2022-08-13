"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
let rooms = new Map();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server);
io.on("connection", (socket) => {
    socket.on("addUser", (data, room) => {
        socket.join(room);
        if (!rooms.get(room)) {
            let user = Object.assign(Object.assign({}, data), { idSocket: socket.id });
            rooms.set(room, [user]);
            io.to(room).emit("users", rooms.get(room));
        }
        else {
            const usersOfRoom = rooms.get(room);
            let user = Object.assign(Object.assign({}, data), { idSocket: socket.id });
            const filterUser = usersOfRoom === null || usersOfRoom === void 0 ? void 0 : usersOfRoom.filter((userRoom) => userRoom.idUser === user.idUser);
            if ((filterUser === null || filterUser === void 0 ? void 0 : filterUser.length) === 0) {
                usersOfRoom === null || usersOfRoom === void 0 ? void 0 : usersOfRoom.push(user);
                rooms.set(room, usersOfRoom);
            }
            else {
                usersOfRoom === null || usersOfRoom === void 0 ? void 0 : usersOfRoom.forEach((userRoom, index) => {
                    if (userRoom.idUser === user.idUser) {
                        usersOfRoom[index] = user;
                    }
                });
                rooms.set(room, usersOfRoom);
            }
            io.to(room).emit("users", rooms.get(room));
        }
    });
    socket.on("userMove", (data, room) => {
        let allUserInRoom = rooms.get(room);
        const user = Object.assign(Object.assign({}, data), { idSocket: socket.id });
        allUserInRoom === null || allUserInRoom === void 0 ? void 0 : allUserInRoom.forEach((userRoom, index) => {
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
            allUserInRoom === null || allUserInRoom === void 0 ? void 0 : allUserInRoom.forEach((user, index, users) => {
                if (user.idSocket === socket.id) {
                    users.splice(index, 1);
                }
            });
            rooms.set(key, allUserInRoom);
            io.emit("users", rooms.get(key));
        });
    });
});
app.get("/", (_req, res) => {
    res.send("hello server");
});
server.listen(8080, () => {
    console.log("server start on port http://localhost:8080");
});
//# sourceMappingURL=index.js.map