import {
    DroidDifficultyCalculator,
    OsuDifficultyCalculator,
} from "@rian8337/osu-difficulty-calculator";
import { audioState, resetAudio } from "../../elements/Audio";
import {
    calculateMaxScore,
    parsedBeatmap,
    setDroidStarRating,
    setStandardStarRating,
} from "../../settings/BeatmapSettings";
import {
    setIgnoredPlayersFromRoomName,
    setPlayers,
} from "../../settings/PlayerSettings";
import { previews, reloadPreviews } from "../../settings/PreviewSettings";
import {
    mods,
    setMods,
    setSpeedMultiplier,
    setTeamMode,
} from "../../settings/RoomSettings";
import { dataProcessor, infoDisplay } from "../../settings/SpectatorSettings";
import { StartingRoundMultiplayerRoom } from "../rawdata/StartingRoundMultiplayerRoom";
import { ChatMessageHandler } from "./ChatMessageHandler";

/**
 * A handler responsible for handling round start events.
 */
export abstract class RoundStartHandler {
    /**
     * Handles the event when a round starts.
     *
     * @param room The room state when the round starts.
     */
    static handle(room: StartingRoundMultiplayerRoom): void {
        if (!parsedBeatmap) {
            return;
        }

        console.log("Round started");
        console.log(room);

        setIgnoredPlayersFromRoomName(room.name);
        setPlayers(room.playingPlayers);
        setMods(room.mods.mods ?? "");
        setSpeedMultiplier(room.mods.speedMultiplier);
        setTeamMode(room.teamMode);
        calculateMaxScore();
        reloadPreviews();

        const droidDifficultyCalculator = new DroidDifficultyCalculator(
            parsedBeatmap,
        ).calculate({ mods: mods });

        const standardDifficultyCalculator = new OsuDifficultyCalculator(
            parsedBeatmap,
        ).calculate({ mods: mods });

        setDroidStarRating(droidDifficultyCalculator.total);
        setStandardStarRating(standardDifficultyCalculator.total);

        dataProcessor.reset();
        dataProcessor.addPlayers();

        for (const manager of dataProcessor.managers.values()) {
            const preview = previews.get(manager.uid);
            if (!preview) {
                continue;
            }

            preview.load(manager);
            preview.attachToContainer();
        }

        infoDisplay.draw(0);

        resetAudio(false);

        ChatMessageHandler.onRoundStart();

        $(audioState.audio).trigger("manualpause");
    }
}
