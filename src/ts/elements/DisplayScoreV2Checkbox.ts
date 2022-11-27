import { setDisplayScoreV2 } from "../settings/SpectatorSettings";

$<HTMLInputElement>("#displayScoreV2").on("change", (e) => {
    setDisplayScoreV2(e.currentTarget.checked);
});
