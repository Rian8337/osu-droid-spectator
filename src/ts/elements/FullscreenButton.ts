$<HTMLButtonElement>("#fullscreen").on("click", (e) => {
    e.preventDefault();

    if (!document.fullscreenElement) {
        void document.documentElement.requestFullscreen();
    } else {
        void document.exitFullscreen();
    }
});
