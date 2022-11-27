const background = new Image();
const container = $("#container")[0];
background.setAttribute("crossOrigin", "anonymous");

let originalImageURL: string = "";

background.addEventListener("load", () => {
    originalImageURL = background.src;

    const canvas = document.createElement("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext("2d")!;

    // background-size: cover height
    const sWidth = background.height * (window.innerWidth / window.innerHeight);
    ctx.drawImage(
        background,
        (background.width - sWidth) / 2,
        0,
        sWidth,
        background.height,
        0,
        0,
        window.innerWidth,
        window.innerHeight
    );

    // background dim
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

    container.style.backgroundImage = `url(${canvas.toDataURL()})`;
});

background.addEventListener("error", clearBackground);

/**
 * Clears the current background.
 */
export function clearBackground(): void {
    URL.revokeObjectURL(originalImageURL);

    container.style.backgroundImage = "none";
    originalImageURL = "";
}

export { background };
