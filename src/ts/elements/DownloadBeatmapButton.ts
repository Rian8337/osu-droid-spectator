import { SayobotAPIResponse } from "../sayobot/SayobotAPIResponse";
import { downloadBeatmapset } from "../settings/BeatmapSettings";
import { storeBeatmapsetToDB } from "../settings/DatabaseSettings";

$<HTMLButtonElement>("#downloadBeatmapset").on("click", (e) => {
    e.preventDefault();

    const beatmapsetLinkOrId = prompt(
        "Enter the beatmapset link or ID that you want to pre-download.",
    );

    if (!beatmapsetLinkOrId) {
        return;
    }

    let beatmapsetId = parseInt(beatmapsetLinkOrId);

    if (isNaN(beatmapsetId)) {
        if (
            !beatmapsetLinkOrId.startsWith("https://osu.ppy.sh/") &&
            !beatmapsetLinkOrId.startsWith("https://dev.ppy.sh/")
        ) {
            alert(
                "The provided beatmapset link must be from https://osu.ppy.sh or https://dev.ppy.sh.",
            );

            return;
        }

        if (
            [
                beatmapsetLinkOrId.indexOf("/beatmapsets/"),
                beatmapsetLinkOrId.indexOf("/s/"),
            ].every((v) => v === -1)
        ) {
            alert("Could not parse a beatmapset ID from the given link.");

            return;
        }

        const split = beatmapsetLinkOrId.split("/");
        const index =
            split.indexOf("beatmapsets") + 1 || split.indexOf("s") + 1;
        beatmapsetId = parseInt(split[index]);
    }

    if (isNaN(beatmapsetId)) {
        alert("Could not parse a beatmapset ID from the given input.");

        return;
    }

    fetch(`https://api.sayobot.cn/beatmapinfo?1=${beatmapsetId.toString()}`)
        .then((res) => {
            if (!res.ok) {
                throw new Error("Failed to fetch beatmap info from Sayobot.");
            }

            return res.json() as Promise<SayobotAPIResponse>;
        })
        .then((json) => {
            if (json.status === -1) {
                throw new Error(
                    "Could not find a beatmap with the given link or ID.",
                );
            }

            const { artist, title, creator } = json.data[0];
            const beatmapText = `"${artist} - ${title}" by ${creator}`;
            const confirmation = confirm(
                `Downloading ${beatmapText}.\n\nPress OK to start the pre-download process.`,
            );

            if (!confirmation) {
                return;
            }

            return downloadBeatmapset(beatmapsetId);
        })
        .then((blob) => {
            if (!blob) {
                throw new Error(
                    `Failed to pre-download beatmapset ID ${beatmapsetId.toString()}.`,
                );
            }

            return storeBeatmapsetToDB(beatmapsetId, blob);
        })
        .then(() => {
            alert(
                `Successfully pre-downloaded beatmapset ID ${beatmapsetId.toString()}.`,
            );
        })
        .catch((e: unknown) => {
            console.error(e);

            alert("Failed to fetch beatmap info from Sayobot.");
        });
});
