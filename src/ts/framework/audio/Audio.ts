import { Easing } from "@rian8337/osu-base";
import { Transformable } from "../transforms/Transformable";
import { AudioTransformSequence } from "./AudioTransformSequence";
import { IAudioTransform } from "./IAudioTransform";

/**
 * Represents a locally-sourced audio that is played via an {@link HTMLAudioElement}.
 *
 * Users of this class must call {@link dispose} when they are done with the audio to free up resources.
 */
export class Audio
    extends Transformable<AudioTransformSequence>
    implements IAudioTransform
{
    //#region Constructor and Properties

    private readonly audio = document.createElement("audio");

    /**
     * The duration of this `Audio` in milliseconds. Will be NaN if the duration is not yet known.
     */
    get duration(): number {
        return this.audio.duration * 1000;
    }

    /**
     * Whether this `Audio` is currently playing.
     */
    get isPlaying() {
        return !this.audio.paused;
    }

    /**
     * Whether the playback of this `Audio` has ended.
     */
    get hasEnded() {
        return this.audio.ended;
    }

    /**
     * The playback rate of this `Audio`.
     */
    get playbackRate(): number {
        return this.audio.playbackRate;
    }

    set playbackRate(value: number) {
        this.audio.playbackRate = value;
    }

    /**
     * The volume of this `Audio`, from 0 to 1.
     */
    get volume(): number {
        return this.audio.volume;
    }

    set volume(value: number) {
        this.audio.volume = value;
    }

    /**
     * Whether this `Audio` loops its playback.
     */
    get isLooping(): boolean {
        return this.audio.loop;
    }

    set isLooping(value: boolean) {
        this.audio.loop = value;
    }

    /**
     * Creates a new `Audio`.
     */
    constructor() {
        super();

        this.audio.preload = "auto";

        this.audio.ontimeupdate = () => {
            this.update();
        };
    }

    //#endregion

    //#region Playback Controls

    /**
     * Plays this `Audio`.
     */
    async play(): Promise<void> {
        await this.audio.play();
    }

    /**
     * Pauses this `Audio`.
     */
    pause() {
        this.audio.pause();
    }

    /**
     * Stops this `Audio`.
     */
    stop() {
        this.audio.pause();

        this.seekTo(0);
    }

    /**
     * Seeks to a specific time in this `Audio`.
     *
     * @param time The time in milliseconds to seek to.
     */
    seekTo(time: number) {
        this.audio.currentTime = time;
    }

    //#endregion

    //#region Transforms

    override get currentTime(): number {
        return this.audio.currentTime * 1000;
    }

    playbackRateTo(
        rate: number,
        duration?: number,
        easing?: Easing,
    ): AudioTransformSequence {
        return this.createTransformSequence().playbackRateTo(
            rate,
            duration,
            easing,
        );
    }

    volumeTo(
        volume: number,
        duration?: number,
        easing?: Easing,
    ): AudioTransformSequence {
        return this.createTransformSequence().volumeTo(
            volume,
            duration,
            easing,
        );
    }

    protected override createTransformSequence(): AudioTransformSequence {
        return new AudioTransformSequence(this);
    }

    //#endregion

    //#region Update

    private update() {
        if (this.audio.paused) {
            return;
        }

        this.updateTransforms();
    }

    //#endregion

    //#region Resource Management

    /**
     * Loads a resource into this `Audio`.
     *
     * @param src The resource to load.
     */
    load(src: Blob) {
        // Dispose the current resource first.
        this.dispose();

        this.audio.src = URL.createObjectURL(src);
        this.audio.load();
    }

    /**
     * Disposes of this `Audio`.
     */
    dispose() {
        this.stop();

        if (this.audio.src) {
            URL.revokeObjectURL(this.audio.src);
        }
    }

    //#endregion
}
