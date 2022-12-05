import { parsedBeatmap, pickedBeatmap } from "../settings/BeatmapSettings";
import { storeBeatmapsetToDB } from "../settings/DatabaseSettings";
import { BeatmapChangedHandler } from "../spectator/handlers/BeatmapChangedHandler";

$<HTMLButtonElement>("#addBeatmapset").on("click", (e) => {
    e.preventDefault();

    $("#addBeatmapsetInput").trigger("click");
});

$<HTMLInputElement>("#addBeatmapsetInput").on("change", (e) => {
    e.preventDefault();

    const file = e.target.files?.[0];

    if (!file) {
        return;
    }

    const beatmapsetId = parseInt(file.name);

    if (!beatmapsetId) {
        return;
    }

    const reader = new FileReader();
    reader.readAsArrayBuffer(file);

    reader.onload = async (readerEvent) => {
        const content = readerEvent.target?.result;

        if (!content) {
            return;
        }

        await storeBeatmapsetToDB(
            beatmapsetId,
            new Blob([content], { type: file.type })
        );

        alert(`Successfully added beatmapset ID ${beatmapsetId} to local.`);

        if (!parsedBeatmap && pickedBeatmap) {
            await BeatmapChangedHandler.handle(pickedBeatmap);
        }
    };
});
