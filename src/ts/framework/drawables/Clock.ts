/**
 * Represents a clock.
 */
export class Clock {
    /**
     * The current time of this `Clock`, in milliseconds.
     */
    currentTime = 0;

    /**
     * The time that has elapsed since the last frame, in milliseconds.
     */
    elapsedFrameTime = 0;

    /**
     * Whether this `Clock` is currently rewinding.
     */
    get isRewinding(): boolean {
        return this.elapsedFrameTime < 0;
    }

    /**
     * Updates this `Clock` with the given time.
     *
     * @param time The time in milliseconds.
     */
    update(time: number) {
        this.elapsedFrameTime = time - this.currentTime;
        this.currentTime = time;
    }

    /**
     * Resets this `Clock`.
     */
    reset() {
        this.currentTime = 0;
        this.elapsedFrameTime = 0;
    }
}
