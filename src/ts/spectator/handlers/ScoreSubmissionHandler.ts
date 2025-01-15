import { dataProcessor } from "../../settings/SpectatorSettings";
import { MultiplayerScore } from "../rawdata/MultiplayerScore";

export default function (score: MultiplayerScore) {
    const manager = dataProcessor.managers.get(parseInt(score.uid));

    if (!manager) {
        return;
    }

    manager.result = score;
}
