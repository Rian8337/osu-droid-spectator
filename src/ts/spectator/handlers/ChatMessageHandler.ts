import {
    chatContainerHideClassName,
    hideChat,
    showChat,
} from "../../elements/ChatContainer";

export default function (username: string | null, message: string) {
    const paragraph = document.createElement("p");
    message = message.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    if (username !== null) {
        const date = new Date();

        const usernameSpan = document.createElement("span");
        usernameSpan.style.fontWeight = "bold";
        usernameSpan.style.color = "#f299b7";
        usernameSpan.textContent = `[${[date.getHours(), date.getMinutes(), date.getSeconds()].map((v) => v.toString().padStart(2, "0")).join(":")}] ${username}`;

        paragraph.appendChild(usernameSpan);
        paragraph.insertAdjacentText("beforeend", `: ${message}`);
    } else {
        paragraph.style.color = "#77a0e0";
        paragraph.textContent = message;
    }

    const container = $<HTMLDivElement>("#chat-container");
    container.append(paragraph);

    // Scroll down to the last message when the user isn't scrolling the chat.
    if (!container.prop("scrolled")) {
        container.animate(
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            { scrollTop: container.prop("scrollHeight") },
            500,
            "swing",
        );
    }
}

let wasShownBeforePlaying = false;

/**
 * Called when a round starts.
 */
export function onRoundStart() {
    wasShownBeforePlaying = !$<HTMLDivElement>("#chat-container").hasClass(
        chatContainerHideClassName,
    );

    hideChat();
}

/**
 * Called when a round ends.
 */
export function onRoundEnd() {
    if (wasShownBeforePlaying) {
        showChat();
    }
}
