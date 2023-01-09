import {
    downloadAbortController,
    parsedBeatmap,
    pickedBeatmap,
} from "../settings/BeatmapSettings";
import { storeBeatmapsetToDB } from "../settings/DatabaseSettings";
import { BeatmapChangedHandler } from "../spectator/handlers/BeatmapChangedHandler";

$<HTMLButtonElement>("#addBeatmapset").on("click", (e) => {
    e.preventDefault();

    $("#addBeatmapsetInput").trigger("click");
});

$<HTMLInputElement>("#addBeatmapsetInput").on("change", async (e) => {
    e.preventDefault();

    if (!e.target.files) {
        return;
    }

    const finalMessages: string[] = [];

    for (let i = 0; i < e.target.files.length; ++i) {
        const file = e.target.files[i];

        if (!file) {
            return;
        }

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
                        `Cannot read contents of beatmapset ID ${beatmapsetId}.`
                    );
                    return resolve();
                }

                await storeBeatmapsetToDB(
                    beatmapsetId,
                    new Blob([content], { type: file.type })
                );

                if (!parsedBeatmap && beatmapsetId === pickedBeatmap?.setId) {
                    downloadAbortController?.abort();
                    await BeatmapChangedHandler.handle(pickedBeatmap);
                }

                finalMessages.push(
                    `Successfully added beatmapset ID ${beatmapsetId} to cache.`
                );
                resolve();
            };

            reader.onerror = (e) => {
                console.error(e.target?.error);

                finalMessages.push(
                    `An error was encountered when attempting to load beatmapset ID ${beatmapsetId}.`
                );
                resolve();
            };
        });
    }

    alert(finalMessages.join("\n"));
});
