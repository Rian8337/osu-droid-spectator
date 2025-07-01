import {
    DroidDifficultyCalculator,
    OsuDifficultyCalculator,
} from "@rian8337/osu-difficulty-calculator";
import { audioState, resetAudio } from "../../elements/Audio";
import {
    calculateMaxScore,
    parsedBeatmap,
    setDroidStarRating,
    setOsuStarRating,
} from "../../settings/BeatmapSettings";
import {
    setIgnoredPlayersFromRoomName,
    setPlayers,
} from "../../settings/PlayerSettings";
import { previews, reloadPreviews } from "../../settings/PreviewSettings";
import { mods, setMods, setTeamMode } from "../../settings/RoomSettings";
import { dataProcessor, infoDisplay } from "../../settings/SpectatorSettings";
import { StartingRoundMultiplayerRoom } from "../rawdata/StartingRoundMultiplayerRoom";
import { onRoundStart } from "./ChatMessageHandler";

const droidDifficultyCalculator = new DroidDifficultyCalculator();
const osuDifficultyCalculator = new OsuDifficultyCalculator();

export default function (room: StartingRoundMultiplayerRoom) {
    if (!parsedBeatmap) {
        return;
    }

    console.log("Round started");
    console.log(room);

    setIgnoredPlayersFromRoomName(room.name);
    setPlayers(room.playingPlayers);
    setMods(room.mods);
    setTeamMode(room.teamMode);
    calculateMaxScore();
    reloadPreviews();

    const droidDifficultyAttributes = droidDifficultyCalculator.calculate(
        parsedBeatmap,
        mods,
    );

    const osuDifficultyAttributes = osuDifficultyCalculator.calculate(
        parsedBeatmap,
        mods,
    );

    setDroidStarRating(droidDifficultyAttributes.starRating);
    setOsuStarRating(osuDifficultyAttributes.starRating);

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
