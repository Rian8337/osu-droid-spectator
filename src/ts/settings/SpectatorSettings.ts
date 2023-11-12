import { DrawableTeamScoreDisplay } from "../drawables/DrawableTeamScoreDisplay";
import { RGBColor } from "../osu-base";
import { SpectatorDataProcessor } from "../spectator/SpectatorDataProcessor";
import { HitResult } from "../spectator/structures/HitResult";
import { MultiplayerTeam } from "../spectator/structures/MultiplayerTeam";
import { MultiplayerTeamMode } from "../spectator/structures/MultiplayerTeamMode";
import { teamMode } from "./RoomSettings";

/**
 * Whether the user has interacted with the play button.
 */
export let userHasInteracted = false;

/**
 * The spectator data processor.
 */
export const dataProcessor = new SpectatorDataProcessor();

/**
 * The team score display. Not `null` if the team mode is TeamVS.
 */
export let teamScoreDisplay: DrawableTeamScoreDisplay | null = null;

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

/**
 * The canvas that is used to dim the background if no spectator data is available.
 */
export const backgroundDim = document.createElement("canvas");

backgroundDim.id = "backgroundDim";
backgroundDim.width = innerWidth;
backgroundDim.height = innerHeight;

const backgroundDimContext = backgroundDim.getContext("2d")!;
backgroundDimContext.fillStyle = "#000000";
backgroundDimContext.globalAlpha = 0.35;
backgroundDimContext.fillRect(0, 0, backgroundDim.width, backgroundDim.height);

/**
 * Initializes the team score display.
 */
export function initTeamScoreDisplay(): void {
    if (teamMode === MultiplayerTeamMode.headToHead) {
        teamScoreDisplay?.delete();
        teamScoreDisplay = null;
    } else {
        teamScoreDisplay = new DrawableTeamScoreDisplay();
    }
}

/**
 * Sets the user has interacted setting value.
 *
 * @param value The new value.
 */
export function setUserHasInteracted(value: boolean): void {
    userHasInteracted = value;
}
