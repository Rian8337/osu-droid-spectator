$(document.body).on("mousemove", function (e) {
    if (e.clientY < 0.95 * innerHeight && e.clientY > 0.05 * innerHeight) {
        return;
    }

    toggleControlBar();
});

/**
 * Toggles the control bar.
 */
export function toggleControlBar() {
    const body = $(document.body);

    clearTimeout(body.data("h"));

    body.addClass("h").data(
        "h",
        setTimeout(() => {
            body.removeClass("h");
        }, 1500),
    );
}
