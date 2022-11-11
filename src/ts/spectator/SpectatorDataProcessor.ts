import {
    Beatmap,
    IModApplicableToDroid,
    Mod,
    ModUtil,
    Slider,
    Vector2,
} from "../osu-base";
import { PlayerInfo } from "./rawdata/PlayerInfo";
import { SpectatorData } from "./rawdata/SpectatorData";
import { SpectatorDataManager } from "./SpectatorDataManager";

/**
 * A handler for holding and processing spectator data.
 */
export class SpectatorDataProcessor {
    /**
     * The managers of spectator data, mapped by players' uid.
     */
    readonly managers = new Map<number, SpectatorDataManager>();

    /**
     * The beatmap being played by the players.
     */
    readonly beatmap: Beatmap;

    constructor(beatmap: Beatmap, playerInfo: PlayerInfo[]) {
        this.beatmap = beatmap;

        for (const player of playerInfo) {
            this.managers.set(
                player.uid,
                new SpectatorDataManager(
                    player,
                    <(Mod & IModApplicableToDroid)[]>(
                        ModUtil.pcStringToMods(player.mods)
                    )
                )
            );
        }
    }

    /**
     * Adds spectator data for a player.
     *
     * @param uid The uid of the player.
     * @param data The data to add.
     * @returns Whether the data addition was successful.
     */
    processData(uid: number, data: SpectatorData): boolean {
        const manager = this.managers.get(uid);

        if (!manager) {
            return false;
        }

        manager.events.score.add({
            time: data.secPassed,
            score: data.currentScore,
        });

        manager.events.accuracy.add({
            time: data.secPassed,
            accuracy: data.currentAccuracy,
        });

        manager.events.combo.add({
            time: data.secPassed,
            combo: data.currentCombo,
        });

        for (const objectData of data.hitObjectData) {
            const object = this.beatmap.hitObjects.objects[objectData.index];
            let time = object.endTime;

            if (object instanceof Slider) {
                time += Slider.legacyLastTickOffset;
            }

            manager.events.objectData.add({
                time: time,
                accuracy: objectData.accuracy,
                result: objectData.result,
                tickset: objectData.tickset,
                currentAccuracy: objectData.currentAccuracy,
                currentCombo: objectData.currentCombo,
                currentScore: objectData.currentScore,
            });
        }

        for (let i = 0; i < data.cursorMovement.length; ++i) {
            const cursorMovement = data.cursorMovement[i];

            for (const cursorData of cursorMovement) {
                manager.events.cursor[i].add({
                    time: cursorData.time,
                    position: new Vector2(
                        cursorData.position.x,
                        cursorData.position.y
                    ),
                    id: cursorData.id,
                });
            }
        }

        return true;
    }
}
