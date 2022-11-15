import {
    getOsuFile,
    getBackgroundBlob,
    getAudioBlob,
} from "../../BeatmapParsingUtilities";
import { ChimuAPIResponse } from "../../ChimuAPIResponse";
import audio from "../../elements/Audio";
import background from "../../elements/Background";
import { BeatmapDecoder } from "../../osu-base";
import settings from "../../Settings";
import { ZipReader, BlobReader } from "../../zip-js";
import { PickedBeatmap } from "../rawdata/PickedBeatmap";

/**
 * A handler responsible for handling beatmap changed events.
 */
export abstract class BeatmapChangedHandler {
    /**
     * Handles a beatmap changed event.
     *
     * @param beatmap The new beatmap.
     */
    static async handle(beatmap: PickedBeatmap): Promise<void> {
        console.log("Beatmap changed");
        audio.pause();
        $("#play").removeClass("e");

        const beatmapId = beatmap.id;
        let backgroundBlob = "";
        let audioBlob = "";
        let osuFile = "";

        const apiResponse = await fetch(
            `https://api.chimu.moe/v1/map/${beatmapId}`
        );
        const data: ChimuAPIResponse = await apiResponse.json();

        if (data.FileMD5 !== beatmap.hash) {
            $("#title a").text("Beatmap not found in mirror, sorry!");
            return;
        }

        const { OsuFile: osuFileName, DownloadPath } = data;

        const downloadResponse = await fetch(
            `https://chimu.moe/${DownloadPath}`
        );

        if (downloadResponse.status >= 400 && downloadResponse.status < 200) {
            $("#title a").text("Beatmap not found in mirror, sorry!");
            return;
        }

        const blob = await downloadResponse.blob();
        const reader = new ZipReader(new BlobReader(blob));

        const entries = await reader.getEntries();
        osuFile = await getOsuFile(entries, osuFileName);

        if (osuFile) {
            backgroundBlob = await getBackgroundBlob(entries, osuFile);
            audioBlob = await getAudioBlob(entries, osuFile);
        }

        await reader.close();

        if (backgroundBlob && osuFile) {
            settings.parsedBeatmap = new BeatmapDecoder().decode(
                osuFile
            ).result;
            background.src = backgroundBlob;
            audio.src = audioBlob;
            $("#title a")
                .prop("href", `//osu.ppy.sh/b/${beatmapId}`)
                .text(beatmap.name);
        } else {
            $("#title a").text("An error has occurred, sorry!");
        }
    }
}
