import { RGBColor, Vector2 } from "@rian8337/osu-base";
import { SpectatorDataProcessor } from "../spectator/SpectatorDataProcessor";
import { HitResult } from "../spectator/structures/HitResult";
import { MultiplayerTeam } from "../spectator/structures/MultiplayerTeam";
import { DrawableInfoDisplay } from "../drawables/DrawableInfoDisplay";

/**
 * Whether the user has interacted with the play button.
 */
export let userHasInteracted = false;

/**
 * The scaling of the window with respect to a 1920x1080 resolution.
 */
export const windowScale = new Vector2(innerWidth / 1920, innerHeight / 1080);

addEventListener("resize", () => {
    windowScale.x = innerWidth / 1920;
    windowScale.y = innerHeight / 1080;
});

/**
 * A map of mod icons, with the acronym as the key and the image as the value.
 */
export const modIcons = new Map<string, HTMLImageElement>();

/**
 * The spectator data processor.
 */
export const dataProcessor = new SpectatorDataProcessor();

/**
 * The beatmap and team information display.
 */
export const infoDisplay = new DrawableInfoDisplay();

/**
 * Colors for each team.
 */
export const teamColors: Record<MultiplayerTeam, RGBColor> = {
    [MultiplayerTeam.red]: new RGBColor(255, 112, 112),
    [MultiplayerTeam.blue]: new RGBColor(141, 155, 242),
};

/**
 * Colors for each hit result.
 *
 * These colors are taken from osu!lazer [(source code)](https://github.com/ppy/osu/blob/daae560ff731bdf49970a5bc6588c0861fac760f/osu.Game/Graphics/OsuColour.cs#L105-L131).
 */
export const hitResultColors: Record<HitResult, RGBColor> = {
    [HitResult.great]: new RGBColor(102, 204, 255),
    [HitResult.good]: new RGBColor(179, 217, 68),
    [HitResult.meh]: new RGBColor(255, 204, 34),
    [HitResult.miss]: new RGBColor(237, 17, 33),
};

const backgroundDim = document.createElement("canvas");
backgroundDim.id = "backgroundDim";

/**
 * Gets the `HTMLCanvasElement` that is used to dim the background if no spectator data is available.
 */
export function getBackgroundDim(): HTMLCanvasElement {
    if (
        backgroundDim.width === innerWidth &&
        backgroundDim.height === innerHeight
    ) {
        return backgroundDim;
    }

    const { width: previousWidth, height: previousHeight } = backgroundDim;

    backgroundDim.width = innerWidth;
    backgroundDim.height = innerHeight;

    if (previousWidth < innerWidth || previousHeight < innerHeight) {
        // Redraw the dim.
        const backgroundDimContext = backgroundDim.getContext("2d")!;

        backgroundDimContext.clearRect(0, 0, previousWidth, previousHeight);
        backgroundDimContext.fillStyle = "#000000";
        backgroundDimContext.globalAlpha = 0.35;
        backgroundDimContext.fillRect(
            0,
            0,
            backgroundDim.width,
            backgroundDim.height,
        );
    }

    return backgroundDim;
}

/**
 * Sets the user has interacted setting value.
 *
 * @param value The new value.
 */
export function setUserHasInteracted(value: boolean): void {
    userHasInteracted = value;
}
