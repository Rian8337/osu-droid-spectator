const chatContainer = document.getElementById("chat-container")!;
const chatContainerHeader = document.getElementById("chat-container-header")!;

chatContainer.style.left = `${((innerWidth - chatContainer.offsetWidth) / 2).toString()}px`;
chatContainer.style.top = `${((innerHeight - chatContainer.offsetHeight) / 2).toString()}px`;

let offsetX = 0;
let offsetY = 0;

const move = (e: MouseEvent) => {
    chatContainer.style.left = `${(e.clientX - offsetX).toString()}px`;
    chatContainer.style.top = `${(e.clientY - offsetY).toString()}px`;
};

chatContainerHeader.addEventListener("mousedown", (e) => {
    offsetX = e.clientX - chatContainer.offsetLeft;
    offsetY = e.clientY - chatContainer.offsetTop;

    document.addEventListener("mousemove", move);
});

chatContainer.addEventListener("scroll", () =>
    $(chatContainer).prop("scrolled", true),
);
chatContainer.addEventListener("scrollend", () =>
    $(chatContainer).removeProp("scrolled"),
);

document.addEventListener("mouseup", () => {
    document.removeEventListener("mousemove", move);
});

export const chatContainerHideClassName = "chat-container-hide";

/**
 * Removes all messages from the chat box.
 */
export function emptyChat() {
    $<HTMLDivElement>("#chat-container p").remove();
}

/**
 * Displays the chat box.
 */
export function showChat() {
    $<HTMLDivElement>("#chat-container").removeClass(
        chatContainerHideClassName,
    );
}

/**
 * Hides the chat box.
 */
export function hideChat() {
    $<HTMLDivElement>("#chat-container").addClass(chatContainerHideClassName);
}
