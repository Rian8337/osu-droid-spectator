import { resetAudio } from "../../elements/Audio";
import { deletePreviews } from "../../settings/PreviewSettings";
import { dataProcessor } from "../../settings/SpectatorSettings";

export default function () {
    dataProcessor.reset();
    deletePreviews();
    resetAudio(false);
}
