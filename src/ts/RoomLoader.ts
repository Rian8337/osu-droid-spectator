import { openDatabase } from "./settings/DatabaseSettings";
import { setPickedBeatmap } from "./settings/BeatmapSettings";
import { addPlayer, players } from "./settings/PlayerSettings";
import {
    setForceARAllowRule,
    setForceARMaximumValue,
    setForceARMinimumValue,
    setModMultipliers,
    setRequiredMods,
    setRoomId,
    setScorePortion,
    setSpeedMultiplier,
    setTeamMode,
} from "./settings/RoomSettings";
import { fayeClient } from "./settings/SpectatorSettings";
import { BeatmapChangedHandler } from "./spectator/handlers/BeatmapChangedHandler";
import { SpeedMultiplierChangedHandler } from "./spectator/handlers/SpeedMultiplierChangedHandler";
import { MultiplayerRoomInfo } from "./spectator/rawdata/MultiplayerRoomInfo";
import { addPreview } from "./settings/PreviewSettings";
import { RoundStartHandler } from "./spectator/handlers/RoundStartHandler";
import { PlayerStartPlayingHandler } from "./spectator/handlers/PlayerStartPlayingHandler";

export async function askRoomID(): Promise<void> {
    const message =
        "Enter the ID of the multiplayer room that you want to spectate.";
    let roomId = prompt(message);

    while (!roomId) {
        roomId = prompt(message);
    }

    let roomInfoRequest = await fetch(
        `https://droidpp.osudroid.moe/api/droid/getRoomInfo?id=${roomId}`
    );
    let roomInfo: MultiplayerRoomInfo = await roomInfoRequest.json();

    while (roomInfoRequest.status !== 200) {
        roomId = prompt(
            (roomInfo?.message ??
                "You are being rate limited. Please try again later") +
                `.\n\n${message}`
        );

        roomInfoRequest = await fetch(
            `https://droidpp.osudroid.moe/api/droid/getRoomInfo?id=${roomId}`
        );
        roomInfo = await roomInfoRequest.json();
    }

    setRoomId(roomId!);
    loadRoom(roomInfo);
}

/**
 * Loads the room.
 *
 * @param roomInfo The room info.
 */
export async function loadRoom(roomInfo: MultiplayerRoomInfo): Promise<void> {
    setPickedBeatmap(roomInfo.beatmap);
    setRequiredMods(roomInfo.requiredMods);
    setTeamMode(roomInfo.teamMode);
    setSpeedMultiplier(roomInfo.speedMultiplier);
    setScorePortion(roomInfo.scorePortion);

    for (const player of roomInfo.players) {
        addPlayer(player);
        addPreview(player.uid);
    }

    setModMultipliers(roomInfo.modMultipliers);
    setForceARAllowRule(roomInfo.forcedAR.allowed);
    setForceARMinimumValue(roomInfo.forcedAR.minValue);
    setForceARMaximumValue(roomInfo.forcedAR.maxValue);
    await openDatabase();

    if (roomInfo.beatmap) {
        await BeatmapChangedHandler.handle(roomInfo.beatmap);
    } else {
        $("#title a").text("No beatmaps selected yet");
    }

    SpeedMultiplierChangedHandler.handle(roomInfo.speedMultiplier);

    await fayeClient.beginSubscription();

    if (roomInfo.isPlaying) {
        RoundStartHandler.handle();

        for (const player of players.values()) {
            PlayerStartPlayingHandler.handle(
                player.uid,
                player.mods,
                roomInfo.beatmap!.hash,
                player.forcedAR
            );
        }
    }
}
