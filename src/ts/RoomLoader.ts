import { openDatabase } from "./settings/DatabaseSettings";
import { setPickedBeatmap } from "./settings/BeatmapSettings";
import { BeatmapChangedHandler } from "./spectator/handlers/BeatmapChangedHandler";
import { RoundStartHandler } from "./spectator/handlers/RoundStartHandler";
import { Socket, io } from "socket.io-client";
import { SpectatorClientEvents } from "./spectator/SpectatorClientEvents";

export async function askRoomID(messagePrefix?: string): Promise<void> {
    const message =
        (messagePrefix ? `${messagePrefix}\n\n` : "") +
        "Enter the ID of the multiplayer room that you want to spectate.";
    let roomId = prompt(message);

    while (!roomId) {
        roomId = prompt(message);
    }

    const socket: Socket<SpectatorClientEvents> = io(
        `https://droidpp.osudroid.moe/api/tournament/${roomId}`,
    );

    socket
        .once("connect_error", (err) => {
            console.error(err);
            askRoomID("Unable to connect to the room.");
        })
        .once("disconnect", () => askRoomID("Disconnected from the room."))
        .once("connect", () => console.log(`Connected to room ${roomId}`))
        .once("initialConnection", async (room) => {
            console.log("Room info received:");
            console.log(room);

            setPickedBeatmap(room.beatmap);

            await openDatabase();

            if (room.beatmap) {
                await BeatmapChangedHandler.handle(room.beatmap);
            } else {
                $("#title a").text("No beatmaps selected yet");
            }

            if (room.isPlaying) {
                RoundStartHandler.handle(room);
            }
        });
}
