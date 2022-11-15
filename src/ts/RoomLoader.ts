import { Anchor } from "./osu-base";
import { Preview } from "./Preview";
import { PreviewAnchor } from "./PreviewAnchor";
import settings from "./Settings";
import { FayeClientManager } from "./spectator/FayeClientManager";
import { BeatmapChangedHandler } from "./spectator/handlers/BeatmapChangedHandler";
import { SpeedMultiplierChangedHandler } from "./spectator/handlers/SpeedMultiplierChangedHandler";
import { MultiplayerPlayer } from "./spectator/rawdata/MultiplayerPlayer";
import { MultiplayerRoomInfo } from "./spectator/rawdata/MultiplayerRoomInfo";
import { SpectatorDataProcessor } from "./spectator/SpectatorDataProcessor";

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

    settings.roomId = roomId!;

    loadRoom(roomInfo);
}

/**
 * Loads the room.
 *
 * @param roomInfo The room info.
 */
export async function loadRoom(roomInfo: MultiplayerRoomInfo): Promise<void> {
    delete roomInfo.message;

    Object.assign(settings, roomInfo);

    reloadPreview(settings.players);

    if (!settings.beatmap) {
        return;
    }

    await BeatmapChangedHandler.handle(settings.beatmap);

    if (!settings.parsedBeatmap) {
        return;
    }

    SpeedMultiplierChangedHandler.handle(settings.speedMultiplier);

    settings.processor = new SpectatorDataProcessor(
        settings.parsedBeatmap,
        settings.players.map((p) => {
            return {
                uid: p.uid,
                username: p.username,
                mods: settings.requiredMods,
            };
        })
    );

    for (const manager of settings.processor.managers.values()) {
        const preview = settings.previews.get(manager.uid);

        if (preview) {
            preview.load(settings.parsedBeatmap, manager);
        }
    }

    await settings.fayeClient?.endSubscriptions();

    settings.fayeClient = new FayeClientManager(settings.processor);
    settings.fayeClient.beginSubscriptions();
}

/**
 * Reloads the preview with a list of new players.
 *
 * @param players The new players.
 */
export function reloadPreview(players: MultiplayerPlayer[]): void {
    settings.previews.clear();

    for (let i = 0; i < Math.min(players.length, 4); ++i) {
        let anchor: PreviewAnchor;

        switch (i) {
            case 0:
                anchor = Anchor.topLeft;
                break;
            case 1:
                anchor = Anchor.topCenter;
                break;
            case 2:
                anchor = Anchor.centerLeft;
                break;
            default:
                anchor = Anchor.center;
                break;
        }

        settings.previews.set(players[i].uid, new Preview(anchor));
    }
}
