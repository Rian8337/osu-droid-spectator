import { BlobWriter, Entry, TextWriter } from "./zip-js";

// eslint-disable-next-line no-control-regex
const fileNameCleanerRegex = /[^\x00-\x7F]/g;

/**
 * Gets an .osu file from the beatmap.
 *
 * @param entries The zip entry of the beatmap.
 * @param osuFilename The name of the .osu file.
 * @returns The .osu file.
 */
export async function getOsuFile(
    entries: Entry[],
    osuFilename: string
): Promise<string> {
    let osuFile = "";

    for (const entry of entries) {
        if (entry.filename !== osuFilename) {
            continue;
        }

        osuFile = await entry.getData(new TextWriter());

        break;
    }

    if (!osuFile) {
        // If not found, try cleaning the file name.
        for (const entry of entries) {
            const cleanedFilename1 = entry.filename
                .replace(/[^a-zA-Z]/g, "")
                .toLowerCase();
            const cleanedFilename2 = osuFilename
                .replace(/[^a-zA-Z]/g, "")
                .toLowerCase();

            if (cleanedFilename1 !== cleanedFilename2) {
                continue;
            }

            osuFile = await entry.getData(new TextWriter());

            break;
        }
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
export async function getBackgroundBlob(
    entries: Entry[],
    osuFile: string
): Promise<string> {
    let backgroundBlob = "";
    const backgroundMatch = osuFile.match(/(?<=0,0,").+(?=")/);

    if (!backgroundMatch) {
        return backgroundBlob;
    }

    const backgroundFilename = backgroundMatch[0];

    for (const entry of entries) {
        if (entry.filename !== backgroundFilename) {
            continue;
        }

        const extension = backgroundFilename.split(".").pop()!;
        backgroundBlob = URL.createObjectURL(
            await entry.getData(new BlobWriter(`image/${extension}`))
        );

        break;
    }

    if (!backgroundBlob) {
        // If not found, try cleaning file name first.
        for (const entry of entries) {
            if (
                entry.filename
                    .replace(fileNameCleanerRegex, "")
                    .toLowerCase() !==
                backgroundFilename
                    .replace(fileNameCleanerRegex, "")
                    .toLowerCase()
            ) {
                continue;
            }

            const extension = backgroundFilename.split(".").pop()!;
            backgroundBlob = URL.createObjectURL(
                await entry.getData(new BlobWriter(`image/${extension}`))
            );

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
export async function getAudioBlob(
    entries: Entry[],
    osuFile: string
): Promise<string> {
    let audioBlob = "";
    const audioMatch = osuFile.match(/(?<=AudioFilename: ).+(?=)/);

    if (!audioMatch) {
        return audioBlob;
    }

    const audioFilename = audioMatch[0];

    for (const entry of entries) {
        if (entry.filename !== audioFilename) {
            continue;
        }

        const extension = audioFilename.split(".").pop()!;
        audioBlob = URL.createObjectURL(
            await entry.getData(new BlobWriter(`audio/${extension}`))
        );

        break;
    }

    if (!audioBlob) {
        // If not found, try cleaning file name first.
        for (const entry of entries) {
            if (
                entry.filename
                    .replace(fileNameCleanerRegex, "")
                    .toLowerCase() !==
                audioFilename.replace(fileNameCleanerRegex, "").toLowerCase()
            ) {
                continue;
            }

            const extension = audioFilename.split(".").pop()!;
            audioBlob = URL.createObjectURL(
                await entry.getData(new BlobWriter(`audio/${extension}`))
            );

            break;
        }
    }

    return audioBlob;
}
