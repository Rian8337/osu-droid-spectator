/**
 * A handler responsible for handling new chat messages.
 */
export abstract class ChatMessageHandler {
    private static wasShownBeforePlaying = false;
    private static readonly className = "chat-container-hide";

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
                { scrollTop: container.prop("scrollHeight") },
                500,
                "swing",
            );
        }
    }

    /**
     * Removes all messages from the chat box.
     */
    static emptyChat() {
        $<HTMLDivElement>("#chat-container p").remove();
    }

    /**
     * Displays the chat box.
     */
    static showChat() {
        $<HTMLDivElement>("#chat-container").removeClass(this.className);
    }

    /**
     * Hides the chat box.
     */
    static hideChat() {
        $<HTMLDivElement>("#chat-container").addClass(this.className);
    }

    /**
     * Called when a round starts.
     */
    static onRoundStart() {
        this.wasShownBeforePlaying = !$<HTMLDivElement>(
            "#chat-container",
        ).hasClass(this.className);

        this.hideChat();
    }

    /**
     * Called when a round ends.
     */
    static onRoundEnd() {
        if (this.wasShownBeforePlaying) {
            this.showChat();
        }
    }
}
