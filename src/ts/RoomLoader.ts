import { setPickedBeatmap } from "./settings/BeatmapSettings";
import { addPlayer } from "./settings/PlayerSettings";
import {
    setForceARAllowRule,
    setForceARMaximumValue,
    setForceARMinimumValue,
    setModMultipliers,
    setRequiredMods,
    setRoomId,
    setSpeedMultiplier,
} from "./settings/RoomSettings";
import { fayeClient } from "./settings/SpectatorSettings";
import { BeatmapChangedHandler } from "./spectator/handlers/BeatmapChangedHandler";
import { SpeedMultiplierChangedHandler } from "./spectator/handlers/SpeedMultiplierChangedHandler";
import { MultiplayerRoomInfo } from "./spectator/rawdata/MultiplayerRoomInfo";

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
    setSpeedMultiplier(roomInfo.speedMultiplier);

    for (const player of roomInfo.players) {
        addPlayer(player);
    }

    setModMultipliers(roomInfo.modMultipliers);
    setForceARAllowRule(roomInfo.forcedAR.allowed);
    setForceARMinimumValue(roomInfo.forcedAR.minValue);
    setForceARMaximumValue(roomInfo.forcedAR.maxValue);

    await BeatmapChangedHandler.handle();

    SpeedMultiplierChangedHandler.handle(roomInfo.speedMultiplier);

    fayeClient.beginSubscription();
}
