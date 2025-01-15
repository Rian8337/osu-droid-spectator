import {
    downloadAbortController,
    parsedBeatmap,
    pickedBeatmap,
} from "../settings/BeatmapSettings";
import { storeBeatmapsetToDB } from "../settings/DatabaseSettings";
import onBeatmapChanged from "../spectator/handlers/BeatmapChangedHandler";

$<HTMLButtonElement>("#addBeatmapset").on("click", (e) => {
    e.preventDefault();

    $("#addBeatmapsetInput").trigger("click");
});

// eslint-disable-next-line @typescript-eslint/no-misused-promises
$<HTMLInputElement>("#addBeatmapsetInput").on("change", async (e) => {
    e.preventDefault();

    if (!e.target.files) {
        return;
    }

    const finalMessages: string[] = [];

    for (const file of e.target.files) {
        const beatmapsetId = parseInt(file.name);

        if (isNaN(beatmapsetId)) {
            continue;
        }

        const reader = new FileReader();
        reader.readAsArrayBuffer(file);

        await new Promise<void>((resolve) => {
            reader.onload = async (readerEvent) => {
                const content = readerEvent.target?.result;

                if (!content) {
                    finalMessages.push(
                        `Cannot read contents of beatmapset ID ${beatmapsetId.toString()}.`,
                    );

                    resolve();
                    return;
                }

                await storeBeatmapsetToDB(
                    beatmapsetId,
                    new Blob([content], { type: file.type }),
                );

                if (
                    !parsedBeatmap &&
                    beatmapsetId === pickedBeatmap?.beatmapSetId
                ) {
                    downloadAbortController?.abort();
                    await onBeatmapChanged(pickedBeatmap);
                }

                finalMessages.push(
                    `Successfully added beatmapset ID ${beatmapsetId.toString()} to cache.`,
                );
                resolve();
            };

            reader.onerror = (e) => {
                console.error(e.target?.error);

                finalMessages.push(
                    `An error was encountered when attempting to load beatmapset ID ${beatmapsetId.toString()}.`,
                );
                resolve();
            };
        });
    }

    alert(finalMessages.join("\n"));
});
