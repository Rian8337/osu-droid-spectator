import { createHash } from "crypto";
import { audioState, resetAudio } from "../../elements/Audio";
import { background, clearBackground } from "../../elements/Background";
import JSZip, { JSZipObject } from "../../jszip";
import { BeatmapDecoder } from "../../osu-base";
import {
    pickedBeatmap,
    parsedBeatmap,
    setPickedBeatmap,
    setParsedBeatmap,
    calculateMaxScore,
} from "../../settings/BeatmapSettings";
import { reloadPreview } from "../../settings/PreviewSettings";
import {
    initProcessor,
    resetProcessor,
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
     * @param newBeatmap The new beatmap, if any.
     */
    static async handle(newBeatmap?: PickedBeatmap): Promise<void> {
        if (
            !parsedBeatmap ||
            (newBeatmap && newBeatmap.id !== pickedBeatmap?.id)
        ) {
            console.log("Beatmap changed");

            resetProcessor();
            resetAudio(true);
            reloadPreview();
            clearBackground();

            const beatmapToLoad = newBeatmap ?? pickedBeatmap;

            $("#title a").text("Loading...").removeProp("href");

            if (!beatmapToLoad) {
                throw new Error("No beatmaps to load");
            }

            const { id: beatmapId, setId: beatmapSetId } = beatmapToLoad;
            let backgroundBlob = "";
            let audioBlob = "";
            let osuFile = "";

            const downloadResponse = await fetch(
                `https://txy1.sayobot.cn/beatmaps/download/novideo/${beatmapSetId}`
            );

            if (
                downloadResponse.status >= 400 &&
                downloadResponse.status < 200
            ) {
                $("#title a").text("Beatmap not found in mirror, sorry!");
                return;
            }

            const zip = new JSZip();
            await zip.loadAsync(await downloadResponse.blob());

            const entries = Object.values(zip.files);
            osuFile = await this.getOsuFile(entries, beatmapToLoad.hash);

            if (osuFile) {
                backgroundBlob = await this.getBackgroundBlob(entries, osuFile);
                audioBlob = await this.getAudioBlob(entries, osuFile);
            }

            if (backgroundBlob && osuFile) {
                setPickedBeatmap(beatmapToLoad);
                setParsedBeatmap(new BeatmapDecoder().decode(osuFile).result);
                calculateMaxScore();
                initProcessor();

                background.src = backgroundBlob;
                audioState.audio.src = audioBlob;

                $("#title a")
                    .prop("href", `//osu.ppy.sh/b/${beatmapId}`)
                    .text(beatmapToLoad.name);
                $("#play").addClass("e");
            } else {
                $("#title a").text("An error has occurred, sorry!");
            }
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
