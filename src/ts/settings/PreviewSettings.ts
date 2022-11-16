import { Anchor } from "../osu-base";
import { Preview } from "../Preview";
import { players } from "./PlayerSettings";

/**
 * Supported anchor types for a preview.
 */
export type PreviewAnchor =
    | Anchor.topLeft
    | Anchor.topCenter
    | Anchor.centerLeft
    | Anchor.center;

export const availableAnchors: PreviewAnchor[] = [
    Anchor.topLeft,
    Anchor.topCenter,
    Anchor.centerLeft,
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
    $("#container").empty();

    for (const uid of previews.keys()) {
        removePreview(uid);
    }

    for (const uid of players.keys()) {
        if (!addPreview(uid)) {
            break;
        }
    }
}

/**
 * Adds a preview to the screen.
 *
 * @param uid The uid of the player in the preview.
 * @returns Whether the preview was successfully added.
 */
export function addPreview(uid: number): boolean {
    const anchor = availableAnchors.shift();

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

    if (!preview) {
        return;
    }

    previews.delete(preview.uid);
    availableAnchors.push(preview.anchor);
}
