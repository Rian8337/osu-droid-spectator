import { SayobotAPIResponse } from "../sayobot/SayobotAPIResponse";
import { downloadBeatmapset } from "../settings/BeatmapSettings";
import { storeBeatmapsetToDB } from "../settings/DatabaseSettings";

$<HTMLButtonElement>("#downloadBeatmapset").on("click", async (e) => {
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
            return alert(
                "The provided beatmapset link must be from https://osu.ppy.sh or https://dev.ppy.sh.",
            );
        }

        if (
            [
                beatmapsetLinkOrId.indexOf("/beatmapsets/"),
                beatmapsetLinkOrId.indexOf("/s/"),
            ].every((v) => v === -1)
        ) {
            return alert(
                "Could not parse a beatmapset ID from the given link.",
            );
        }

        const split = beatmapsetLinkOrId.split("/");
        const index =
            split.indexOf("beatmapsets") + 1 || split.indexOf("s") + 1;
        beatmapsetId = parseInt(split[index]);
    }

    if (isNaN(beatmapsetId)) {
        return alert("Could not parse a beatmapset ID from the given input.");
    }

    let apiResponse: Response;

    try {
        apiResponse = await fetch(
            `https://api.sayobot.cn/beatmapinfo?1=${beatmapsetId}`,
        );
    } catch {
        return alert("Contact with Sayobot failed.");
    }

    if (apiResponse.status >= 400 && apiResponse.status < 200) {
        return alert("Contact with Sayobot failed.");
    }

    const json: SayobotAPIResponse = await apiResponse.json();

    if (json.status === -1) {
        return alert("Could not find a beatmap with the given link or ID.");
    }

    const { artist, title, creator } = json.data[0];
    const beatmapText = `"${artist} - ${title}" by ${creator}`;
    const confirmation = confirm(
        `Downloading ${beatmapText}.\n\nPress OK to start the pre-download process.`,
    );

    if (!confirmation) {
        return;
    }

    const blob = await downloadBeatmapset(beatmapsetId);
    if (!blob) {
        return alert(`Failed to pre-download ${beatmapText}. Aborting.`);
    }

    await storeBeatmapsetToDB(beatmapsetId, blob);
    alert(`Successfully pre-downloaded ${beatmapText}.`);
});
