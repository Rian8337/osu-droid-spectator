$("#fullscreen").on("click", (e) => {
    e.preventDefault();

    const { document } = window;
    const { documentElement } = document;

    if (!document.fullscreenElement) {
        documentElement.requestFullscreen.call(documentElement);
    } else {
        document.exitFullscreen.call(document);
    }
});
