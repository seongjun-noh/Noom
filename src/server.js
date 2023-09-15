import http from "http";
import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
// app.get("/*", (req, res) => res.render("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`)

// HTTP server
const server = http.createServer(app);
// SocketIO server
const io = new Server(server, {
  cors: {
    origin: ["http://admin.socket.io"],
    credentials: true
  }
});

instrument(io, {
  auth: false
})

// public room
function publicRooms() {
  const {
    sockets: {
      adapter: { sids, rooms }
    }
  } = io;

  const publicRooms = [];
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });

  return publicRooms;
}

function countRoom(roomName) {
  return io.sockets.adapter.rooms.get(roomName)?.size;
}

io.on("connection", socket => {
  socket["nickname"] = "Anon";

  // 모든 요청에 대해 처리
  socket.onAny((event) => {
    console.log((`Socket Event: ${event}`));
  });

  // roomName을 가진 room에 socket을 연결
  socket.on("enter_room", (roomName, done) => {
    socket.join(roomName);
    done();
    socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
    io.sockets.emit("room_change", publicRooms());
  });

  // socket연결이 끊어지기 직전에 동작
  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) => {
      socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1);
    });
  });

  // socket연결이 끊어지면 동작
  socket.on("disconnect", () => {
    io.sockets.emit("room_change", publicRooms());
  });

  socket.on("nickname", (nickname) => {
    socket["nickname"] = nickname;
  })

  socket.on("new_message", (msg, roomName, done) => {
    socket.to(roomName).emit("new_message", `${socket.nickname}: ${msg}`);
    done();
  })
});


// // WebSockt server
// const wss = new WebSocketServer.Server({server});
// // 연결된 Socket들을 저장
// const sockets = [];
//
// // Client와 Socket이 연결되었을 때 동작
// wss.on("connection", (socket) => {
//   // 연결된 Socket을 배열에 저장
//   sockets.push(socket);
//   socket["nickname"] = "Anon";
//   console.log("Connected to Client ✓");
//
//   // Client와 Socket연결이 종료되었을 때 동작
//   socket.on("close", () => {
//     console.log("Disconnected from Client ⅹ");
//   })
//
//   // Client로 부터 Message를 수신할 때 동작
//   socket.on("message", (msg) => {
//     const message = JSON.parse(msg);
//     switch (message.type) {
//       case "new_message":
//         sockets.forEach(aSocket => {aSocket.send(`${socket.nickname}: ${message.payload}`)});
//         break;
//       case "nickname" :
//         socket["nickname"] = message.payload;
//         break;
//     }
//   });
// });

server.listen(3000, handleListen);