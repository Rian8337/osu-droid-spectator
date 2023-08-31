import { openDatabase } from "./settings/DatabaseSettings";
import { setPickedBeatmap } from "./settings/BeatmapSettings";
import { setRoomId } from "./settings/RoomSettings";
import { fayeClient } from "./settings/SpectatorSettings";
import { BeatmapChangedHandler } from "./spectator/handlers/BeatmapChangedHandler";
import { MultiplayerRoom } from "./spectator/rawdata/MultiplayerRoom";
import { RoundStartHandler } from "./spectator/handlers/RoundStartHandler";
import { setPlayerCount } from "./settings/PlayerSettings";

export async function askRoomID(): Promise<void> {
    const message =
        "Enter the ID of the multiplayer room that you want to spectate.";
    let roomId = prompt(message);

    while (!roomId) {
        roomId = prompt(message);
    }

    let roomInfoRequest = await fetch(
        `https://droidpp.osudroid.moe/api/droid/getRoomInfo?roomId=${roomId}`,
    );
    let roomInfo: MultiplayerRoom = await roomInfoRequest.json();

    while (roomInfoRequest.status !== 200) {
        roomId = prompt(
            (roomInfoRequest.status === 404
                ? "Room not found"
                : "You are being rate limited. Please try again later") +
                `.\n\n${message}`,
        );

        roomInfoRequest = await fetch(
            `https://droidpp.osudroid.moe/api/droid/getRoomInfo?roomId=${roomId}`,
        );
        roomInfo = await roomInfoRequest.json();
    }

    console.log("Room info received:");
    console.log(roomInfo);

    setRoomId(roomId!);
    loadRoom(roomInfo);
}

/**
 * Loads the room.
 *
 * @param roomInfo The room info.
 */
export async function loadRoom(roomInfo: MultiplayerRoom): Promise<void> {
    await fayeClient.beginSubscription();

    setPickedBeatmap(roomInfo.beatmap);
    setPlayerCount(roomInfo.playerCount);

    await openDatabase();

    if (roomInfo.beatmap) {
        await BeatmapChangedHandler.handle(roomInfo.beatmap);
    } else {
        $("#title a").text("No beatmaps selected yet");
    }

    if (roomInfo.isPlaying) {
        RoundStartHandler.handle(roomInfo);
    }
}
