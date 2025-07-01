import { createHash } from "crypto";
import { audioState, resetAudio } from "../../elements/Audio";
import { background, clearBackground } from "../../elements/Background";
import { JSZipObject } from "jszip";
import { BeatmapDecoder, Modes } from "@rian8337/osu-base";
import {
    pickedBeatmap,
    setPickedBeatmap,
    setParsedBeatmap,
    resetBeatmapset,
    beatmapset,
    downloadBeatmapset,
    parsedBeatmap,
    cancelBeatmapsetDownload,
    setDroidStarRating,
    setOsuStarRating,
} from "../../settings/BeatmapSettings";
import {
    getBeatmapsetFromDB,
    storeBeatmapsetToDB,
} from "../../settings/DatabaseSettings";
import {
    dataProcessor,
    infoDisplay,
    userHasInteracted,
} from "../../settings/SpectatorSettings";
import { PickedBeatmap } from "../rawdata/PickedBeatmap";
import { deletePreviews } from "../../settings/PreviewSettings";
import { toggleControlBar } from "../../elements/Body";
import {
    DroidDifficultyCalculator,
    OsuDifficultyCalculator,
} from "@rian8337/osu-difficulty-calculator";
import { mods } from "../../settings/RoomSettings";

// eslint-disable-next-line no-control-regex
const fileNameCleanerRegex = /[^\x00-\x7F]/g;

const droidDifficultyCalculator = new DroidDifficultyCalculator();
const osuDifficultyCalculator = new OsuDifficultyCalculator();

export default async function (
    newBeatmap?: PickedBeatmap | null,
): Promise<void> {
    if (!newBeatmap) {
        $("#title a").text("No beatmap is picked in room");
        return;
    }

    const beatmapTitle = $("#title a");
    beatmapTitle.text("Loading...").removeProp("href");

    cancelBeatmapsetDownload();

    if (newBeatmap.md5 !== pickedBeatmap?.md5) {
        // Only reset the processor and previews if it's a new beatmap, in which case the spectator data is invalid.
        dataProcessor.reset();
        deletePreviews();
    }

    const currentBeatmapsetId = pickedBeatmap?.beatmapSetId;
    const newBeatmapsetId = newBeatmap.beatmapSetId;

    if (!newBeatmapsetId) {
        $("#title a").text("Beatmap not found in mirror, sorry!");
        return;
    }

    beatmapTitle.prop(
        "href",
        `https://osu.ppy.sh/s/${newBeatmapsetId.toString()}`,
    );

    const beatmapText = `${newBeatmap.artist} - ${newBeatmap.title} (${newBeatmap.creator}) [${newBeatmap.version}]`;
    const notFoundText = `${beatmapText} (not found in mirror)`;

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
            console.error("Beatmapset not found (already attempted download)");
            beatmapTitle.text(notFoundText);

            return;
        }

        await beatmapset.loadAsync(beatmapsetBlob);
    }

    setParsedBeatmap(null);
    setDroidStarRating(null);
    setOsuStarRating(null);

    let entries = Object.values(beatmapset.files);
    let osuFile = await getOsuFile(entries, newBeatmap.md5);

    if (!osuFile) {
        if (alreadyAttemptDownload) {
            console.error("Beatmapset not found (already attempted download)");
            beatmapTitle.text(notFoundText);

            return;
        }

        console.log(".osu file not found, redownloading beatmapset");

        const beatmapsetBlob = await downloadBeatmapset(newBeatmapsetId);
        if (!beatmapsetBlob) {
            beatmapTitle.text(notFoundText);

            return;
        }

        await storeBeatmapsetToDB(newBeatmapsetId, beatmapsetBlob);
        await beatmapset.loadAsync(beatmapsetBlob);

        entries = Object.values(beatmapset.files);
        osuFile = await getOsuFile(entries, newBeatmap.md5);
    }

    if (!osuFile) {
        console.error("Beatmap not found in beatmapset");
        beatmapTitle.text(notFoundText);

        return;
    }

    const backgroundBlob = await getBackgroundBlob(entries, osuFile);
    const audioBlob = await getAudioBlob(entries, osuFile);

    if (!backgroundBlob || !audioBlob) {
        console.error("Background or audio not found in beatmapset");
        beatmapTitle.text(`${beatmapText} (an error has occurred)`);

        return;
    }

    const newParsedBeatmap = new BeatmapDecoder().decode(
        osuFile,
        Modes.droid,
        false,
    ).result;
    const { metadata: newMetadata } = newParsedBeatmap;

    const droidDifficultyAttributes = droidDifficultyCalculator.calculate(
        newParsedBeatmap,
        mods,
    );

    const osuDifficultyAttributes = osuDifficultyCalculator.calculate(
        newParsedBeatmap,
        mods,
    );

    setPickedBeatmap(newBeatmap);
    setParsedBeatmap(newParsedBeatmap);
    setDroidStarRating(droidDifficultyAttributes.starRating);
    setOsuStarRating(osuDifficultyAttributes.starRating);

    background.src = backgroundBlob;
    audioState.audio.src = audioBlob;
    audioState.audio.load();

    beatmapTitle
        .prop(
            "href",
            `https://osu.ppy.sh/${newMetadata.beatmapId ? "b" : "s"}/${(
                newMetadata.beatmapId ??
                newMetadata.beatmapSetId ??
                newBeatmapsetId
            ).toString()}`,
        )
        .text(newParsedBeatmap.metadata.fullTitle);

    if (!userHasInteracted) {
        $("#play").addClass("e");
    }

    infoDisplay.draw(0);
    toggleControlBar();
}

async function getOsuFile(
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

async function getBackgroundBlob(
    entries: JSZipObject[],
    osuFile: string,
): Promise<string> {
    let backgroundBlob = "";
    const backgroundMatch = /(?<=0,0,").+(?=")/.exec(osuFile);

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
                entry.name.replace(fileNameCleanerRegex, "").toLowerCase() !==
                backgroundFilename
                    .replace(fileNameCleanerRegex, "")
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

async function getAudioBlob(
    entries: JSZipObject[],
    osuFile: string,
): Promise<string> {
    let audioBlob = "";
    const audioMatch = /(?<=AudioFilename: ).+(?=)/.exec(osuFile);

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
                entry.name.replace(fileNameCleanerRegex, "").toLowerCase() !==
                audioFilename.replace(fileNameCleanerRegex, "").toLowerCase()
            ) {
                continue;
            }

            audioBlob = URL.createObjectURL(await entry.async("blob"));

            break;
        }
    }

    return audioBlob;
}
