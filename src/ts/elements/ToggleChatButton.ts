$<HTMLButtonElement>("#toggleChat").on("click", (e) => {
    e.preventDefault();

    const el = $<HTMLDivElement>("#chat-container");
    const className = "chat-container-hide";

    if (el.hasClass(className)) {
        el.removeClass(className);
    } else {
        el.addClass(className);
    }
});
