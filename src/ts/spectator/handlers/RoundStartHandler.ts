import { audioState, resetAudio } from "../../elements/Audio";
import { calculateMaxScore } from "../../settings/BeatmapSettings";
import {
    setIgnoredPlayersFromRoomName,
    setPlayers,
} from "../../settings/PlayerSettings";
import { previews, reloadPreviews } from "../../settings/PreviewSettings";
import {
    setMods,
    setSpeedMultiplier,
    setTeamMode,
} from "../../settings/RoomSettings";
import { dataProcessor, setIsPlaying } from "../../settings/SpectatorSettings";
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
        console.log("Round started");
        console.log(room);

        setIsPlaying(true);
        setIgnoredPlayersFromRoomName(room.name);
        setPlayers(room.playingPlayers);
        setMods(room.mods.mods ?? "");
        setSpeedMultiplier(room.mods.speedMultiplier);
        setTeamMode(room.teamMode);
        calculateMaxScore();
        reloadPreviews();

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

        resetAudio(false);

        ChatMessageHandler.onRoundStart();

        $(audioState.audio).trigger("manualpause");
    }
}
