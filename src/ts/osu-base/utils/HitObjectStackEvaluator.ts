import { PlaceableHitObject } from "../beatmap/hitobjects/PlaceableHitObject";

/**
 * An evaluator for evaluating stack heights of hitobjects.
 */
export abstract class HitObjectStackEvaluator {
    /**
     * Applies note stacking to hitobjects using osu!droid algorithm.
     *
     * @param hitObjects The hitobjects to apply stacking to.
     * @param stackLeniency The multiplier for the threshold in time where hit objects placed close together stack, ranging from 0 to 1.
     */
    static applyDroidStacking(
        hitObjects: readonly PlaceableHitObject[],
        stackLeniency: number
    ): void {
        if (hitObjects.length === 0) {
            return;
        }

        hitObjects[0].stackHeight = 0;

        for (let i = 0; i < hitObjects.length - 1; ++i) {
            const currentObject: PlaceableHitObject = hitObjects[i];
            const nextObject: PlaceableHitObject = hitObjects[i + 1];

            if (
                nextObject.startTime - currentObject.startTime <
                    2000 * stackLeniency &&
                nextObject.position.getDistance(currentObject.position) <
                    Math.sqrt(currentObject.scale)
            ) {
                nextObject.stackHeight = currentObject.stackHeight + 1;
            } else {
                nextObject.stackHeight = 0;
            }
        }
    }
}
