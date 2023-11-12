import { openDatabase } from "./settings/DatabaseSettings";
import { setPickedBeatmap } from "./settings/BeatmapSettings";
import { BeatmapChangedHandler } from "./spectator/handlers/BeatmapChangedHandler";
import { RoundStartHandler } from "./spectator/handlers/RoundStartHandler";
import { Socket, io } from "socket.io-client";
import { SpectatorClientEvents } from "./spectator/SpectatorClientEvents";
import { dataProcessor } from "./settings/SpectatorSettings";
import { ChatMessageHandler } from "./spectator/handlers/ChatMessageHandler";

let socket: Socket<SpectatorClientEvents> | null = null;

export function askRoomID(messagePrefix?: string): void {
    const message =
        (messagePrefix ? `${messagePrefix}\n\n` : "") +
        "Enter the ID of the multiplayer room that you want to spectate.";

    let roomId: string | null = null;
    while (!roomId) {
        roomId = prompt(message);
    }

    // Close the existing connection, if present.
    socket?.disconnect();

    socket = io(`https://droidpp.osudroid.moe/api/tournament/${roomId}`, {
        path: "/api/tournament/socket.io",
        auth: {
            type: "1",
        },
        reconnection: false,
    });

    socket
        .once("connect_error", (err) => {
            console.error(err);
            askRoomID("Unable to connect to the room.");
        })
        .once("disconnect", () => askRoomID("Disconnected from the room."))
        .once("connect", () => console.log(`Connected to room ${roomId}`))
        .on("chatMessage", ChatMessageHandler.handle.bind(ChatMessageHandler))
        .once("initialConnection", async (room) => {
            console.log("Room info received:");
            console.log(room);

            ChatMessageHandler.emptyChat();

            socket
                ?.on(
                    "beatmapChanged",
                    BeatmapChangedHandler.handle.bind(BeatmapChangedHandler),
                )
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
