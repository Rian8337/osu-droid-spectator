import { Anchor } from "../osu-base";
import { Preview } from "../Preview";
import { MultiplayerTeam } from "../spectator/structures/MultiplayerTeam";
import { MultiplayerTeamMode } from "../spectator/structures/MultiplayerTeamMode";
import { players } from "./PlayerSettings";
import { teamMode } from "./RoomSettings";

/**
 * Supported anchor types for a preview.
 */
export type PreviewAnchor = RedPreviewAnchor | BluePreviewAnchor;

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
 * Removes all previews from the container.
 */
export function removePreviewsFromScreen(): void {
    $("#container").empty();
}

/**
 * Adds a preview to the screen.
 *
 * @param uid The uid of the player in the preview.
 * @returns The preview that was added, `null` if the addition was failed.
 */
export function addPreview(uid: number): Preview | null {
    const player = players.get(uid);

    if (!player) {
        return null;
    }

    let anchor: PreviewAnchor | undefined;

    switch (player.team) {
        case MultiplayerTeam.red:
            // Use blue team anchor if there's no available anchor anymore.
            anchor =
                redAvailableAnchors.shift() ?? blueAvailableAnchors.shift();

            if (!anchor) {
                return null;
            }

            availableAnchors.splice(availableAnchors.indexOf(anchor), 1);
            break;
        case MultiplayerTeam.blue:
            // Use red team anchor if there's no available anchor anymore.
            anchor =
                blueAvailableAnchors.shift() ?? redAvailableAnchors.shift();

            if (!anchor) {
                return null;
            }

            availableAnchors.splice(availableAnchors.indexOf(anchor), 1);
            break;
        default:
            anchor = availableAnchors.shift();
    }

    if (!anchor) {
        return null;
    }

    const preview = new Preview(uid, anchor);
    previews.set(uid, preview);

    return preview;
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

    preview.detachFromContainer();
    previews.delete(preview.uid);
    availableAnchors.unshift(preview.anchor);

    if (teamMode === MultiplayerTeamMode.teamVS) {
        if (
            preview.anchor === Anchor.topLeft ||
            preview.anchor === Anchor.centerLeft
        ) {
            redAvailableAnchors.unshift(preview.anchor);
        } else {
            blueAvailableAnchors.unshift(preview.anchor);
        }
    }
}
