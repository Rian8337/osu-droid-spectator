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
} from "../../settings/BeatmapSettings";
import {
    getBeatmapsetFromDB,
    storeBeatmapsetToDB,
} from "../../settings/DatabaseSettings";
import { reloadPreview } from "../../settings/PreviewSettings";
import {
    resetProcessor,
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
    static async handle(newBeatmap: PickedBeatmap): Promise<void> {
        resetProcessor();
        reloadPreview();

        $("#title a").text("Loading...").removeProp("href");

        let alreadyAttemptDownload = false;

        if (!parsedBeatmap || newBeatmap.setId !== pickedBeatmap?.setId) {
            console.log("Beatmap changed to beatmapset ID", newBeatmap.setId);

            resetBeatmapset();
            resetAudio(true);
            clearBackground();

            let beatmapsetBlob = await getBeatmapsetFromDB(newBeatmap.setId);

            if (!beatmapsetBlob) {
                beatmapsetBlob = await downloadBeatmapset(newBeatmap.setId);
                alreadyAttemptDownload = true;

                if (beatmapsetBlob) {
                    await storeBeatmapsetToDB(newBeatmap.setId, beatmapsetBlob);
                }
            }

            if (!beatmapsetBlob) {
                $("#title a").text("Beatmap not found in mirror, sorry!");
                return;
            }

            await beatmapset.loadAsync(beatmapsetBlob);
        }

        setParsedBeatmap(null);
        let entries = Object.values(beatmapset.files);
        let osuFile = await this.getOsuFile(entries, newBeatmap.hash);

        if (!osuFile) {
            if (alreadyAttemptDownload) {
                $("#title a").text("Beatmap not found in mirror, sorry!");
                return;
            }

            console.log(".osu file not found, redownloading beatmapset");

            const beatmapsetBlob = await downloadBeatmapset(newBeatmap.setId);
            if (!beatmapsetBlob) {
                $("#title a").text("Beatmap not found in mirror, sorry!");
                return;
            }

            await storeBeatmapsetToDB(newBeatmap.setId, beatmapsetBlob);
            await beatmapset.loadAsync(beatmapsetBlob);

            entries = Object.values(beatmapset.files);
            osuFile = await this.getOsuFile(entries, newBeatmap.hash);
        }

        if (!osuFile) {
            $("#title a").text("Beatmap not found in mirror, sorry!");
            return;
        }

        const backgroundBlob = await this.getBackgroundBlob(entries, osuFile);
        const audioBlob = await this.getAudioBlob(entries, osuFile);

        if (!backgroundBlob || !audioBlob) {
            $("#title a").text("An error has occurred, sorry!");
            return;
        }

        setPickedBeatmap(newBeatmap);
        setParsedBeatmap(new BeatmapDecoder().decode(osuFile).result);
        calculateMaxScore();

        background.src = backgroundBlob;
        audioState.audio.src = audioBlob;
        audioState.audio.load();

        $("#title a")
            .prop("href", `//osu.ppy.sh/b/${newBeatmap.id}`)
            .text(newBeatmap.name);

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
        hash: string
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
        osuFile: string
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
        osuFile: string
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
