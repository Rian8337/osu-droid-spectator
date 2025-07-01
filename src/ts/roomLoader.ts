import { Socket, io } from "socket.io-client";
import { emptyChat } from "./elements/ChatContainer";
import { setPickedBeatmap } from "./settings/BeatmapSettings";
import { setMods, setTeamMode } from "./settings/RoomSettings";
import { dataProcessor } from "./settings/SpectatorSettings";
import onBeatmapChanged from "./spectator/handlers/BeatmapChangedHandler";
import onChatMessage from "./spectator/handlers/ChatMessageHandler";
import onRoundAbort from "./spectator/handlers/RoundAbortHandler";
import onRoundEnd from "./spectator/handlers/RoundEndHandler";
import onRoundStart from "./spectator/handlers/RoundStartHandler";
import onScoreSubmission from "./spectator/handlers/ScoreSubmissionHandler";
import onSkipPerformed from "./spectator/handlers/SkipPerformedHandler";
import { SpectatorClientEvents } from "./spectator/SpectatorClientEvents";

let socket: Socket<SpectatorClientEvents> | null = null;
let disconnectTimeout: NodeJS.Timeout | undefined;

export function askRoomID(
    messagePrefix?: string,
    existingId?: string | null,
): void {
    const message =
        (messagePrefix ? `${messagePrefix}\n\n` : "") +
        "Enter the ID of the multiplayer room that you want to spectate.";

    let roomId = existingId ?? null;
    while (!roomId) {
        roomId = prompt(message);
    }

    // Close the existing connection, if present.
    socket?.disconnect();

    socket = io(`https://droidpp.osudroid.moe/api/tournament/${roomId}`, {
        path: "/api/tournament/socket.io",
        auth: { type: "1" },
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
        .on("chatMessage", onChatMessage)
        .on("spectatorData", dataProcessor.process.bind(dataProcessor))
        .on("beatmapChanged", onBeatmapChanged)
        .on("roundAborted", onRoundAbort)
        .on("roundStarted", onRoundStart)
        .on("roundEnded", onRoundEnd)
        .on("skipPerformed", onSkipPerformed)
        .on("scoreSubmission", onScoreSubmission)
        .once("initialConnection", async (room) => {
            console.log("Room info received:");
            console.log(room);

            emptyChat();

            setPickedBeatmap(room.beatmap);
            setMods(room.mods);
            setTeamMode(room.teamMode);

            if (room.beatmap) {
                await onBeatmapChanged(room.beatmap);
            } else {
                $("#title a").text("No beatmaps selected yet");
            }

            if (room.isPlaying) {
                onRoundStart(room);
            }
        });
}
