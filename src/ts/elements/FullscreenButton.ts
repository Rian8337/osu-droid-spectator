$<HTMLButtonElement>("#fullscreen").on("click", (e) => {
    e.preventDefault();

    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
});
