import { DrawableTeamScoreDisplay } from "../drawables/DrawableTeamScoreDisplay";
import { ModDoubleTime, ModHardRock, ModHidden, RGBColor } from "../osu-base";
import { FayeClientManager } from "../spectator/FayeClientManager";
import { SpectatorDataProcessor } from "../spectator/SpectatorDataProcessor";
import { HitResult } from "../spectator/structures/HitResult";
import { MultiplayerTeam } from "../spectator/structures/MultiplayerTeam";
import { MultiplayerTeamMode } from "../spectator/structures/MultiplayerTeamMode";
import { maxScore, parsedBeatmap } from "./BeatmapSettings";
import { scorePortion, teamMode } from "./RoomSettings";

/**
 * The Faye client manager.
 */
export const fayeClient = new FayeClientManager();

/**
 * Whether the user has interacted with the play button.
 */
export let userHasInteracted: boolean = false;

/**
 * The spectator data processor.
 */
export let dataProcessor: SpectatorDataProcessor | null = null;

/**
 * The team score display. Not `null` if the team mode is TeamVS.
 */
export let teamScoreDisplay: DrawableTeamScoreDisplay | null = null;

/**
 * Whether to display score V2 value in player and team score display.
 */
export let displayScoreV2 = false;

/**
 * Colors for each team.
 */
export const teamColors: Record<MultiplayerTeam, RGBColor> = {
    [MultiplayerTeam.red]: new RGBColor(255, 112, 112),
    [MultiplayerTeam.blue]: new RGBColor(86, 109, 245),
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
 * Resets the spectator data processor.
 */
export function resetProcessor(): void {
    dataProcessor = null;
}

/**
 * Initializes the spectator data processor.
 */
export function initProcessor(): void {
    dataProcessor = new SpectatorDataProcessor();
}

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
 * Sets the display score v2 setting value.
 *
 * @param value The new value.
 */
export function setDisplayScoreV2(value: boolean): void {
    displayScoreV2 = value;
}

/**
 * Sets the user has interacted setting value.
 *
 * @param value The new value.
 */
export function setUserHasInteracted(value: boolean): void {
    userHasInteracted = value;
}

/**
 * Calculates the ScoreV2 of a player at a given time.
 *
 * @param uid The uid of the player.
 * @param time The time at which to calculate.
 * @returns The ScoreV2 value of the player.
 */
export function calculateScoreV2(uid: number, time: number): number {
    if (!parsedBeatmap) {
        throw new Error("No beatmaps have been loaded yet");
    }

    const manager = dataProcessor?.managers.get(uid);

    if (!manager) {
        return 0;
    }

    /**
     * Calculates the miss penalty of the player.
     *
     * @param tempScoreV2 The temporary score V2 value.
     * @returns The score V2 value with miss penalty.
     */
    const calculateMissPenalty = (tempScoreV2: number): number => {
        return tempScoreV2 * 5e-3 * (manager.events.objectData.misses ?? 0);
    };

    const scoreEvent = manager.events.score.eventAtOrDefault(time);
    const syncedScoreEvent = manager.events.syncedScore.eventAtOrDefault(time);

    let score = scoreEvent.score;
    if (syncedScoreEvent.time > scoreEvent.time) {
        score = syncedScoreEvent.score;
    }

    let accuracyEvent = manager.events.accuracy.eventAtOrDefault(time);
    const syncedAccuracyEvent =
        manager.events.syncedAccuracy.eventAtOrDefault(time);

    if (syncedAccuracyEvent.time > accuracyEvent.time) {
        accuracyEvent = syncedAccuracyEvent;
    }

    // Remove original score multiplier from the score first to preserve NoMod scorev1.
    for (const mod of manager.mods) {
        if (mod.droidScoreMultiplier > 0) {
            score /= mod.droidScoreMultiplier;
        }
    }

    const maxScoreV2 = 1e6;
    const tempScorePortionScoreV2 =
        Math.sqrt(score / maxScore) * scorePortion * maxScoreV2;
    const tempAccPortionScoreV2 =
        (Math.pow(accuracyEvent.accuracy, 2) *
            (1 - scorePortion) *
            maxScoreV2 *
            (accuracyEvent.objectIndex + 1)) /
        parsedBeatmap.hitObjects.objects.length;

    const scorePortionScoreV2 =
        tempScorePortionScoreV2 - calculateMissPenalty(tempScorePortionScoreV2);
    const accPortionScoreV2 =
        tempAccPortionScoreV2 - calculateMissPenalty(tempAccPortionScoreV2);

    let totalScore =
        (scorePortionScoreV2 + accPortionScoreV2) * manager.scoreMultiplier;

    if (manager.mods.some((m) => m instanceof ModHardRock)) {
        totalScore *= 1.1 / new ModHardRock().droidScoreMultiplier;
    }

    if (
        manager.mods.filter(
            (m) => m instanceof ModHidden || m instanceof ModDoubleTime
        ).length === 2
    ) {
        totalScore /= new ModHidden().droidScoreMultiplier;
    }

    return Math.max(0, Math.round(totalScore));
}
