import http from "http";
import WebSocketServer from "ws";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.render("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`)

// HTTP server
const server = http.createServer(app);

// WebSockt server
const wss = new WebSocketServer.Server({server});

// 연결된 Socket들을 저장
const sockets = [];

// Client와 Socket이 연결되었을 때 동작
wss.on("connection", (socket) => {
  // 연결된 Socket을 배열에 저장
  sockets.push(socket);
  socket["nickname"] = "Anon";
  console.log("Connected to Client ✓");

  // Client와 Socket연결이 종료되었을 때 동작
  socket.on("close", () => {
    console.log("Disconnected from Client ⅹ");
  })

  // Client로 부터 Message를 수신할 때 동작
  socket.on("message", (msg) => {
    const message = JSON.parse(msg);
    switch (message.type) {
      case "new_message":
        sockets.forEach(aSocket => {aSocket.send(`${socket.nickname}: ${message.payload}`)});
        break;
      case "nickname" :
        socket["nickname"] = message.payload;
        break;
    }
  });
});

server.listen(3000, handleListen);

{
  type:"message";
  payload:"hello everyone";
}

{
  type:"nickname";
  payload:"nick";
}