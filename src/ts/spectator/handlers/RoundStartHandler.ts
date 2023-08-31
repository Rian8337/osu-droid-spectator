import { audioState, resetAudio } from "../../elements/Audio";
import { calculateMaxScore } from "../../settings/BeatmapSettings";
import {
    addPlayer,
    players,
    removePlayer,
    setIgnoredPlayersFromRoomName,
} from "../../settings/PlayerSettings";
import { addPreview, removePreview } from "../../settings/PreviewSettings";
import {
    setForcedAR,
    setMods,
    setSpeedMultiplier,
    setTeamMode,
} from "../../settings/RoomSettings";
import {
    dataProcessor,
    initProcessor,
    initTeamScoreDisplay,
} from "../../settings/SpectatorSettings";
import { MultiplayerRoom } from "../rawdata/MultiplayerRoom";

/**
 * A handler responsible for handling round start events.
 */
export abstract class RoundStartHandler {
    /**
     * Handles the event when a round starts.
     *
     * @param room The room state when the round starts.
     */
    static handle(room: MultiplayerRoom): void {
        console.log("Round started");
        console.log(room);

        // Remove existing players before loading new room settings.
        for (const player of players.values()) {
            removePlayer(player.uid);
            removePreview(player.uid);
        }

        setIgnoredPlayersFromRoomName(room.name);
        setMods(room.mods.mods ?? "");
        setForcedAR(room.mods.forceAR ?? null);
        setSpeedMultiplier(room.mods.speedMultiplier);
        setTeamMode(room.teamMode);
        calculateMaxScore();

        for (const player of room.playingPlayers) {
            addPlayer(player);
        }

        initProcessor();

        if (!dataProcessor) {
            return alert("The spectator client failed to launch.");
        }

        for (const manager of dataProcessor.managers.values()) {
            const preview = addPreview(manager.uid);
            if (!preview) {
                continue;
            }

            preview.load(manager);
            preview.attachToContainer();
        }

        initTeamScoreDisplay();
        resetAudio(false);

        $(audioState.audio).trigger("manualpause");
    }
}
