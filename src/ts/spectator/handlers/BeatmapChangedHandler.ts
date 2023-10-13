import { createHash } from "crypto";
import { audioState, resetAudio } from "../../elements/Audio";
import { background, clearBackground } from "../../elements/Background";
import { JSZipObject } from "../../jszip";
import { BeatmapDecoder } from "../../osu-base";
import {
    pickedBeatmap,
    setPickedBeatmap,
    setParsedBeatmap,
    calculateMaxScore,
    resetBeatmapset,
    beatmapset,
    downloadBeatmapset,
    parsedBeatmap,
    cancelBeatmapsetDownload,
} from "../../settings/BeatmapSettings";
import {
    getBeatmapsetFromDB,
    storeBeatmapsetToDB,
} from "../../settings/DatabaseSettings";
import { removePreviewsFromScreen } from "../../settings/PreviewSettings";
import {
    invalidateProcessor,
    userHasInteracted,
} from "../../settings/SpectatorSettings";
import { PickedBeatmap } from "../rawdata/PickedBeatmap";

/**
 * A handler responsible for handling beatmap changed events.
 */
export abstract class BeatmapChangedHandler {
    // eslint-disable-next-line no-control-regex
    private static readonly fileNameCleanerRegex = /[^\x00-\x7F]/g;

    /**
     * Handles a beatmap changed event.
     *
     * Includes logic for reloading of rooms (i.e. for another gameplay with the same beatmap).
     *
     * @param newBeatmap The new beatmap.
     */
    static async handle(newBeatmap?: PickedBeatmap): Promise<void> {
        const beatmapTitle = $("#title a");
        beatmapTitle.text("Loading...").removeProp("href");

        cancelBeatmapsetDownload();

        if (newBeatmap?.hash !== pickedBeatmap?.hash) {
            // Only reset the processor and previews if it's a new beatmap, in which case the spectator data is invalid.
            invalidateProcessor();
            removePreviewsFromScreen();
        }

        const currentBeatmapsetId = pickedBeatmap?.beatmapSetId;
        const newBeatmapsetId = newBeatmap?.beatmapSetId;

        if (!newBeatmapsetId) {
            console.log("Hi 1");
            $("#title a").text("Beatmap not found in mirror, sorry!");
            return;
        }

        let alreadyAttemptDownload = false;

        if (!parsedBeatmap || newBeatmapsetId !== currentBeatmapsetId) {
            console.log("Beatmap changed to beatmapset ID", newBeatmapsetId);

            if (newBeatmapsetId !== currentBeatmapsetId) {
                resetBeatmapset();
                resetAudio(true);
                clearBackground();
            }

            let beatmapsetBlob = await getBeatmapsetFromDB(newBeatmapsetId);

            if (!beatmapsetBlob) {
                beatmapsetBlob = await downloadBeatmapset(newBeatmapsetId);
                alreadyAttemptDownload = true;

                if (beatmapsetBlob) {
                    await storeBeatmapsetToDB(newBeatmapsetId, beatmapsetBlob);
                }
            }

            if (!beatmapsetBlob) {
                console.log("Hi 2");
                beatmapTitle.text("Beatmap not found in mirror, sorry!");
                return;
            }

            await beatmapset.loadAsync(beatmapsetBlob);
        }

        setParsedBeatmap(null);
        let entries = Object.values(beatmapset.files);
        let osuFile = await this.getOsuFile(entries, newBeatmap.hash);

        if (!osuFile) {
            if (alreadyAttemptDownload) {
                console.log("Hi 3");
                beatmapTitle.text("Beatmap not found in mirror, sorry!");
                return;
            }

            console.log(".osu file not found, redownloading beatmapset");

            const beatmapsetBlob = await downloadBeatmapset(newBeatmapsetId);
            if (!beatmapsetBlob) {
                console.log("Hi 4");
                beatmapTitle.text("Beatmap not found in mirror, sorry!");
                return;
            }

            await storeBeatmapsetToDB(newBeatmapsetId, beatmapsetBlob);
            await beatmapset.loadAsync(beatmapsetBlob);

            entries = Object.values(beatmapset.files);
            osuFile = await this.getOsuFile(entries, newBeatmap.hash);
        }

        if (!osuFile) {
            console.log("Hi 5");
            beatmapTitle.text("Beatmap not found in mirror, sorry!");
            return;
        }

        const backgroundBlob = await this.getBackgroundBlob(entries, osuFile);
        const audioBlob = await this.getAudioBlob(entries, osuFile);

        if (!backgroundBlob || !audioBlob) {
            beatmapTitle.text("An error has occurred, sorry!");
            return;
        }

        const newParsedBeatmap = new BeatmapDecoder().decode(osuFile).result;
        const { metadata: newMetadata } = newParsedBeatmap;

        setPickedBeatmap(newBeatmap);
        setParsedBeatmap(newParsedBeatmap);
        calculateMaxScore();

        background.src = backgroundBlob;
        audioState.audio.src = audioBlob;
        audioState.audio.load();

        beatmapTitle
            .prop(
                "href",
                `//osu.ppy.sh/${newMetadata.beatmapId ? "b" : "s"}/${
                    newMetadata.beatmapId ??
                    newMetadata.beatmapSetId ??
                    newBeatmapsetId
                }`,
            )
            .text(newParsedBeatmap.metadata.fullTitle);

        if (!userHasInteracted) {
            $("#play").addClass("e");
        }
    }

    /**
     * Gets an .osu file from the beatmap.
     *
     * @param entries The zip entry of the beatmap.
     * @param hash The MD5 hash of the .osu file
     * @returns The .osu file.
     */
    private static async getOsuFile(
        entries: JSZipObject[],
        hash: string,
    ): Promise<string> {
        let osuFile = "";

        for (const entry of entries) {
            if (!entry.name.endsWith(".osu")) {
                continue;
            }

            const file = await entry.async("string");
            const fileHash = createHash("md5").update(file).digest("hex");

            if (hash !== fileHash) {
                continue;
            }

            osuFile = file;

            break;
        }

        return osuFile;
    }

    /**
     * Gets the background blob of a beatmap.
     *
     * @param entries The zip entry of the beatmap.
     * @param osuFile The .osu file.
     * @returns The background blob.
     */
    private static async getBackgroundBlob(
        entries: JSZipObject[],
        osuFile: string,
    ): Promise<string> {
        let backgroundBlob = "";
        const backgroundMatch = osuFile.match(/(?<=0,0,").+(?=")/);

        if (!backgroundMatch) {
            return backgroundBlob;
        }

        const backgroundFilename = backgroundMatch[0];

        for (const entry of entries) {
            if (entry.name !== backgroundFilename) {
                continue;
            }

            backgroundBlob = URL.createObjectURL(await entry.async("blob"));

            break;
        }

        if (!backgroundBlob) {
            // If not found, try cleaning file name first.
            for (const entry of entries) {
                if (
                    entry.name
                        .replace(this.fileNameCleanerRegex, "")
                        .toLowerCase() !==
                    backgroundFilename
                        .replace(this.fileNameCleanerRegex, "")
                        .toLowerCase()
                ) {
                    continue;
                }

                backgroundBlob = URL.createObjectURL(await entry.async("blob"));

                break;
            }
        }

        return backgroundBlob;
    }

    /**
     * Gets the audio blob of a beatmap.
     *
     * @param entries The zip entry of the beatmap.
     * @param osuFile The .osu file.
     * @returns The audio blob.
     */
    private static async getAudioBlob(
        entries: JSZipObject[],
        osuFile: string,
    ): Promise<string> {
        let audioBlob = "";
        const audioMatch = osuFile.match(/(?<=AudioFilename: ).+(?=)/);

        if (!audioMatch) {
            return audioBlob;
        }

        const audioFilename = audioMatch[0];

        for (const entry of entries) {
            if (entry.name !== audioFilename) {
                continue;
            }

            audioBlob = URL.createObjectURL(await entry.async("blob"));

            break;
        }

        if (!audioBlob) {
            // If not found, try cleaning file name first.
            for (const entry of entries) {
                if (
                    entry.name
                        .replace(this.fileNameCleanerRegex, "")
                        .toLowerCase() !==
                    audioFilename
                        .replace(this.fileNameCleanerRegex, "")
                        .toLowerCase()
                ) {
                    continue;
                }

                audioBlob = URL.createObjectURL(await entry.async("blob"));

                break;
            }
        }

        return audioBlob;
    }
}
