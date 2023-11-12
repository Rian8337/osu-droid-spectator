import { openDatabase } from "./settings/DatabaseSettings";
import { setPickedBeatmap } from "./settings/BeatmapSettings";
import { BeatmapChangedHandler } from "./spectator/handlers/BeatmapChangedHandler";
import { RoundStartHandler } from "./spectator/handlers/RoundStartHandler";
import { Socket, io } from "socket.io-client";
import { SpectatorClientEvents } from "./spectator/SpectatorClientEvents";
import { dataProcessor } from "./settings/SpectatorSettings";

export async function askRoomID(messagePrefix?: string): Promise<void> {
    const message =
        (messagePrefix ? `${messagePrefix}\n\n` : "") +
        "Enter the ID of the multiplayer room that you want to spectate.";

    let roomId: string | null = null;
    while (!roomId) {
        roomId = prompt(message);
    }

    const socket: Socket<SpectatorClientEvents> = io(
        `https://droidpp.osudroid.moe/api/tournament/${roomId}`,
        {
            path: "/api/tournament/socket.io",
            auth: {
                type: "1",
            },
        },
    )
        .once("connect_error", (err) => {
            console.error(err);
            socket.close();
            askRoomID("Unable to connect to the room.");
        })
        .once("disconnect", () => askRoomID("Disconnected from the room."))
        .once("connect", () => console.log(`Connected to room ${roomId}`))
        .once("initialConnection", async (room) => {
            console.log("Room info received:");
            console.log(room);

            socket
                .on(
                    "beatmapChanged",
                    BeatmapChangedHandler.handle.bind(BeatmapChangedHandler),
                )
                .on("chatMessage", (uid, message) => {
                    // TODO: chat tab?
                    console.log(`Chat message from ${uid}: ${message}`);
                })
                .on(
                    "roundStarted",
                    RoundStartHandler.handle.bind(RoundStartHandler),
                )
                .on(
                    "spectatorData",
                    (data) => dataProcessor?.processData(data),
                );

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
