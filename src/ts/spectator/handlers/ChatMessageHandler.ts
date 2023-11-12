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

        paragraph.textContent = message
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

        if (username !== null) {
            const usernameSpan = document.createElement("span");
            usernameSpan.style.fontWeight = "bold";
            usernameSpan.textContent = username;

            paragraph.appendChild(usernameSpan);
        } else {
            paragraph.style.color = "#5288de";
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
