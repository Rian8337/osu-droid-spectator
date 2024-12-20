import { Easing } from "@rian8337/osu-base";
import { TransformSequence } from "../transforms/TransformSequence";
import { Audio } from "./Audio";
import { IAudioTransform } from "./IAudioTransform";

/**
 * A `TransformSequence` for `Audio`s.
 */
export class AudioTransformSequence
    extends TransformSequence<Audio>
    implements IAudioTransform
{
    playbackRateTo(rate: number, duration = 0, easing = Easing.none): this {
        this.addTransform(
            AudioTransformSequenceTargetMember.playbackRate,
            duration,
            easing,
            () => this.target.playbackRate,
            (startValue, progress) => {
                this.target.playbackRate =
                    startValue + progress * (rate - startValue);
            },
        );

        return this;
    }

    volumeTo(volume: number, duration = 0, easing = Easing.none): this {
        this.addTransform(
            AudioTransformSequenceTargetMember.volume,
            duration,
            easing,
            () => this.target.volume,
            (startValue, progress) =>
                (this.target.volume =
                    startValue + progress * (volume - startValue)),
        );

        return this;
    }
}

enum AudioTransformSequenceTargetMember {
    playbackRate = "playbackRate",
    volume = "volume",
}
