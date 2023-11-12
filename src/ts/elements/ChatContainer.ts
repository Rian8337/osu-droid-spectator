const chatContainer = document.getElementById("chat-container")!;
const chatContainerHeader = document.getElementById("chat-container-header")!;

chatContainer.style.left = `${(innerWidth - chatContainer.offsetWidth) / 2}px`;
chatContainer.style.top = `${(innerHeight - chatContainer.offsetHeight) / 2}px`;

let offsetX = 0;
let offsetY = 0;

const move = (e: MouseEvent) => {
    chatContainer.style.left = `${e.clientX - offsetX}px`;
    chatContainer.style.top = `${e.clientY - offsetY}px`;
};

chatContainerHeader.addEventListener("mousedown", (e) => {
    offsetX = e.clientX - chatContainer.offsetLeft;
    offsetY = e.clientY - chatContainer.offsetTop;

    document.addEventListener("mousemove", move);
});

document.addEventListener("mouseup", () =>
    document.removeEventListener("mousemove", move),
);
