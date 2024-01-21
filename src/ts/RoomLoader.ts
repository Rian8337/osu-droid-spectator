import { setPickedBeatmap } from "./settings/BeatmapSettings";
import { BeatmapChangedHandler } from "./spectator/handlers/BeatmapChangedHandler";
import { RoundStartHandler } from "./spectator/handlers/RoundStartHandler";
import { Socket, io } from "socket.io-client";
import { SpectatorClientEvents } from "./spectator/SpectatorClientEvents";
import { dataProcessor } from "./settings/SpectatorSettings";
import { ChatMessageHandler } from "./spectator/handlers/ChatMessageHandler";
import { RoundEndHandler } from "./spectator/handlers/RoundEndHandler";
import { SkipPerformedHandler } from "./spectator/handlers/SkipPerformedHandler";

let socket: Socket<SpectatorClientEvents> | null = null;
let disconnectTimeout: NodeJS.Timeout | undefined;

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
        reconnectionAttempts: 8,
    });

    socket
        .on("connect_error", (err) => {
            console.error(err);
            askRoomID("Unable to connect to the room.");
        })
        .on("disconnect", (reason) => {
            const msg = "Disconnected from the room.";

            switch (reason) {
                case "io server disconnect":
                case "io client disconnect":
                    askRoomID(msg);
                    break;
                default:
                    console.log(
                        "Disconnected from the server, attempting to reconnect",
                    );

                    disconnectTimeout = setTimeout(
                        askRoomID.bind(null, msg),
                        35000,
                    );
            }
        })
        .on("connect", () => {
            clearTimeout(disconnectTimeout);
            console.log(`Connected to room ${roomId}`);
        })
        .on("chatMessage", ChatMessageHandler.handle.bind(ChatMessageHandler))
        .on("spectatorData", dataProcessor.process.bind(dataProcessor))
        .on(
            "beatmapChanged",
            BeatmapChangedHandler.handle.bind(BeatmapChangedHandler),
        )
        .on("roundStarted", RoundStartHandler.handle.bind(RoundStartHandler))
        .on("roundEnded", RoundEndHandler.handle.bind(RoundEndHandler))
        .on(
            "skipPerformed",
            SkipPerformedHandler.handle.bind(SkipPerformedHandler),
        )
        .once("initialConnection", async (room) => {
            console.log("Room info received:");
            console.log(room);

            ChatMessageHandler.emptyChat();

            setPickedBeatmap(room.beatmap);

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
