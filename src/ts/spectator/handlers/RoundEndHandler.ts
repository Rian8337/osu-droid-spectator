import { audioState } from "../../elements/Audio";
import { onRoundEnd } from "./ChatMessageHandler";

export default function () {
    audioState.audio.addEventListener("ended", onRoundEnd, { once: true });
}
