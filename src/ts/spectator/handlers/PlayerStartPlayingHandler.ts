import { ModUtil } from "../../osu-base";
import settings from "../../Settings";

/**
 * A handler responsible for handling events when a player starts playing.
 */
export abstract class PlayerStartPlayingHandler {
    /**
     * Handles the event when a player starts playing.
     *
     * @param uid The uid of the player.
     * @param mods The mods applied by the player.
     * @param beatmapHash The MD5 hash of the beatmap played by the player.
     */
    static handle(uid: number, mods: string, beatmapHash: string): void {
        console.log("Player starts playing");

        if (!settings.processor) {
            return;
        }

        const manager = settings.processor.managers.get(uid);

        if (!manager) {
            return;
        }

        if (settings.beatmap?.hash !== beatmapHash) {
            manager.willBeSubmitted = false;
            return;
        }

        manager.applyMods(ModUtil.droidStringToMods(mods));
    }
}
