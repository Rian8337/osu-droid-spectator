import { Anchor } from "../osu-base";
import { Preview } from "../Preview";
import { MultiplayerTeam } from "../spectator/structures/MultiplayerTeam";
import { MultiplayerTeamMode } from "../spectator/structures/MultiplayerTeamMode";
import { players } from "./PlayerSettings";
import { teamMode } from "./RoomSettings";

/**
 * Supported anchor types for a preview.
 */
export type PreviewAnchor =
    | Anchor.topLeft
    | Anchor.topCenter
    | Anchor.centerLeft
    | Anchor.center;

/**
 * Supported anchor types for the red team.
 */
export type RedPreviewAnchor = Anchor.topLeft | Anchor.centerLeft;

/**
 * Supported anchor types for the red team.
 */
export type BluePreviewAnchor = Anchor.topCenter | Anchor.center;

/**
 * Available anchors for all players.
 */
export const availableAnchors: PreviewAnchor[] = [
    Anchor.topLeft,
    Anchor.topCenter,
    Anchor.centerLeft,
    Anchor.center,
];

/**
 * Available anchors for red team.
 */
export const redAvailableAnchors: RedPreviewAnchor[] = [
    Anchor.topLeft,
    Anchor.centerLeft,
];

/**
 * Available anchors for blue team.
 */
export const blueAvailableAnchors: BluePreviewAnchor[] = [
    Anchor.topCenter,
    Anchor.center,
];

/**
 * Previews that are currently active.
 */
export const previews = new Map<number, Preview>();

/**
 * Reloads the preview with a list of new players.
 */
export function reloadPreview(): void {
    removePreviewsFromScreen();

    for (const uid of previews.keys()) {
        removePreview(uid);
    }

    for (const uid of players.keys()) {
        addPreview(uid);
    }
}

/**
 * Removes all previews from the container.
 */
export function removePreviewsFromScreen(): void {
    $("#container").empty();
}

/**
 * Adds a preview to the screen.
 *
 * @param uid The uid of the player in the preview.
 * @returns Whether the preview was successfully added.
 */
export function addPreview(uid: number): boolean {
    const player = players.get(uid);

    if (!player) {
        return false;
    }

    let anchor: PreviewAnchor | undefined;

    switch (player.team) {
        case MultiplayerTeam.red:
            // Use blue team anchor if there's no available anchor anymore.
            anchor = redAvailableAnchors.shift() ?? blueAvailableAnchors.shift();

            if (!anchor) {
                return false;
            }

            availableAnchors.splice(availableAnchors.indexOf(anchor), 1);
            break;
        case MultiplayerTeam.blue:
            // Use red team anchor if there's no available anchor anymore.
            anchor = blueAvailableAnchors.shift() ?? redAvailableAnchors.shift();

            if (!anchor) {
                return false;
            }

            availableAnchors.splice(availableAnchors.indexOf(anchor), 1);
            break;
        default:
            anchor = availableAnchors.shift();
    }

    if (!anchor) {
        return false;
    }

    previews.set(uid, new Preview(uid, anchor));

    return true;
}

/**
 * Removes a preview from the screen.
 *
 * @param uid The uid of the preview to remove.
 */
export function removePreview(uid: number): void {
    const preview = previews.get(uid);
    const player = players.get(uid);

    if (!preview || !player) {
        return;
    }

    preview.deattachFromContainer();
    previews.delete(preview.uid);
    availableAnchors.unshift(preview.anchor);

    if (teamMode === MultiplayerTeamMode.teamVS) {
        if (preview.anchor === Anchor.topLeft || preview.anchor === Anchor.centerLeft) {
            redAvailableAnchors.unshift(preview.anchor);
        } else {
            blueAvailableAnchors.unshift(preview.anchor);
        }
    }
}
