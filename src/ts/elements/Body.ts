$(document.body).on("mousemove", function (e) {
    const self = $(this);

    if (e.clientY >= 0.9 * innerHeight || e.clientY <= 0.1 * innerHeight) {
        self.addClass("h");
    } else {
        self.removeClass("h");
    }
});