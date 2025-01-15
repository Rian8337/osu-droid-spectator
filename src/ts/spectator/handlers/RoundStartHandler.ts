import {
    DroidDifficultyCalculator,
    OsuDifficultyCalculator,
} from "@rian8337/osu-difficulty-calculator";
import { audioState, resetAudio } from "../../elements/Audio";
import {
    calculateMaxScore,
    parsedBeatmap,
    setDroidStarRating,
    setStandardStarRating,
} from "../../settings/BeatmapSettings";
import {
    setIgnoredPlayersFromRoomName,
    setPlayers,
} from "../../settings/PlayerSettings";
import { previews, reloadPreviews } from "../../settings/PreviewSettings";
import {
    mods,
    setMods,
    setSpeedMultiplier,
    setTeamMode,
} from "../../settings/RoomSettings";
import { dataProcessor, infoDisplay } from "../../settings/SpectatorSettings";
import { StartingRoundMultiplayerRoom } from "../rawdata/StartingRoundMultiplayerRoom";
import { onRoundStart } from "./ChatMessageHandler";

export default function (room: StartingRoundMultiplayerRoom) {
    if (!parsedBeatmap) {
        return;
    }

    console.log("Round started");
    console.log(room);

    setIgnoredPlayersFromRoomName(room.name);
    setPlayers(room.playingPlayers);
    setMods(room.mods.mods ?? "");
    setSpeedMultiplier(room.mods.speedMultiplier);
    setTeamMode(room.teamMode);
    calculateMaxScore();
    reloadPreviews();

    const droidDifficultyCalculator = new DroidDifficultyCalculator(
        parsedBeatmap,
    ).calculate({ mods: mods });

    const standardDifficultyCalculator = new OsuDifficultyCalculator(
        parsedBeatmap,
    ).calculate({ mods: mods });

    setDroidStarRating(droidDifficultyCalculator.total);
    setStandardStarRating(standardDifficultyCalculator.total);

    dataProcessor.reset();
    dataProcessor.addPlayers();

    for (const manager of dataProcessor.managers.values()) {
        const preview = previews.get(manager.uid);
        if (!preview) {
            continue;
        }

        preview.load(manager);
        preview.attachToContainer();
    }

    infoDisplay.draw(0);

    resetAudio(false);
    onRoundStart();

    $(audioState.audio).trigger("manualpause");
}
