const messageList = document.querySelector("ul");
const nickForm = document.querySelector("#nick");
const messageForm = document.querySelector("#message");
const socket = new WebSocket(`ws://${window.location.host}`);

// JSON을 생성하고 String으로 변환
function makeMessage(type, payload) {
  const msg = {type, payload};
  return JSON.stringify(msg);
}

// Server와 Socket이 연결되었을 떄 동작
socket.addEventListener("open", () => {
  console.log("Connected to Server ✓");
});

// Server로 부터 Message를 수신할 때 동작
socket.addEventListener("message", (message) => {
  const li = document.createElement("li");
  li.innerText = message.data;
  messageList.appendChild(li);
});

// Server와 Socket연결이 종료되었을 때 동작
socket.addEventListener("close", () => {
  console.log("Disconnected from Server ⅹ")
});

function handleMessageSubmit(event) {
  event.preventDefault();
  const input = messageForm.querySelector("input");
  socket.send(makeMessage("new_message", input.value));
  input.value = "";
}

function handleNickSubmit(event) {
  event.preventDefault();
  const input = nickForm.querySelector("input");
  socket.send(makeMessage("nickname", input.value));
}

messageForm.addEventListener("submit", handleMessageSubmit);
nickForm.addEventListener("submit", handleNickSubmit);