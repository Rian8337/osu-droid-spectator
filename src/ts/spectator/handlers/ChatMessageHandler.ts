/**
 * A handler responsible for handling new chat messages.
 */
export abstract class ChatMessageHandler {
    /**
     * Handles a new chat message.
     *
     * @param username The username of the player. If `null`, this message is a system message.
     * @param message The message that was sent.
     */
    static handle(username: string | null, message: string): void {
        const paragraph = document.createElement("p");
        message = message.replace(/</g, "&lt;").replace(/>/g, "&gt;");

        if (username !== null) {
            const usernameSpan = document.createElement("span");
            usernameSpan.style.fontWeight = "bold";
            usernameSpan.style.color = "#f299b7";
            usernameSpan.textContent = username;

            paragraph.appendChild(usernameSpan);
            paragraph.insertAdjacentText("beforeend", `: ${message}`);
        } else {
            paragraph.style.color = "#77a0e0";
            paragraph.textContent = message;
        }

        $<HTMLDivElement>("#chat-container").append(paragraph);
    }

    /**
     * Removes all messages from the chat box.
     */
    static emptyChat() {
        $<HTMLDivElement>("#chat-container p").remove();
    }
}
