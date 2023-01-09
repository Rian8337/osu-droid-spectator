import { setUserHasInteracted } from "../settings/SpectatorSettings";
import { audioState } from "./Audio";

$<HTMLButtonElement>("#play").on("click", function (e) {
    e.preventDefault();

    if ($(this).hasClass("e")) {
        setUserHasInteracted(true);

        $(audioState.audio).trigger("userinteraction");
    }
});
