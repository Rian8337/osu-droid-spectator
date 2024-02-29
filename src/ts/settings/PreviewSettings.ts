import { Vector2 } from "@rian8337/osu-base";
import { Preview } from "../Preview";
import { MultiplayerPlayer } from "../spectator/structures/MultiplayerPlayer";
import { MultiplayerTeam } from "../spectator/structures/MultiplayerTeam";
import { MultiplayerTeamMode } from "../spectator/structures/MultiplayerTeamMode";
import { players } from "./PlayerSettings";
import { teamMode } from "./RoomSettings";

/**
 * Previews that are currently active.
 */
export const previews = new Map<number, Preview>();

/**
 * Deletes all previews.
 */
export function deletePreviews(): void {
    $("#container").empty();

    previews.clear();
}

/**
 * Reloads all previews.
 */
export function reloadPreviews(): void {
    deletePreviews();

    const addPlayers = (
        players: MultiplayerPlayer[],
        minWidthScale = 0,
        maxWidthScale = 1,
    ) => {
        // Divide previews into different layouts for varying cell counts in order to maximize dimensions.
        let rows = 1;
        let cells = 1;

        switch (players.length) {
            case 1:
                break;
            case 2:
                if (teamMode === MultiplayerTeamMode.teamVS) {
                    rows = 2;
                } else {
                    cells = 2;
                }
                break;
            case 3:
            case 4:
                cells = 2;
                rows = 2;
                break;
            case 5:
            case 6:
                cells = 3;
                rows = 2;
                break;
            case 7:
            case 8:
            case 9:
                cells = 3;
                rows = 3;
                break;
            case 10:
            case 11:
            case 12:
                cells = 4;
                rows = 3;
                break;
            default:
                cells = 4;
                rows = 4;
        }

        const widthScaleRange = maxWidthScale - minWidthScale;
        const sizeScale = new Vector2(
            Math.min(widthScaleRange / cells, 1 / rows),
        );

        // Center the previews in the Y axis.
        const yFilledScale = sizeScale.y * rows;
        const yScaleOffset = (1 - yFilledScale) / 2;

        for (let row = 0; row < rows; ++row) {
            const playersToAdd = players.slice(cells * row, cells * (1 + row));

            // Center the previews in the X axis.
            const xFilledScale = sizeScale.x * playersToAdd.length;
            const xScaleOffset = (widthScaleRange - xFilledScale) / 2;

            for (let cell = 0; cell < playersToAdd.length; ++cell) {
                const player = playersToAdd[cell];

                // Position the preview to the center if the row or cell is not filled entirely.
                const positionScale = new Vector2(
                    minWidthScale + sizeScale.x * cell + xScaleOffset,
                    sizeScale.y * row + yScaleOffset,
                );

                previews.set(
                    player.uid,
                    new Preview(player.uid, positionScale, sizeScale),
                );
            }
        }
    };

    const playersArray = [...players.values()];

    if (teamMode === MultiplayerTeamMode.headToHead) {
        addPlayers(playersArray);
    } else {
        addPlayers(
            playersArray.filter((p) => p.team === MultiplayerTeam.red),
            0,
            0.5,
        );

        addPlayers(
            playersArray.filter((p) => p.team === MultiplayerTeam.blue),
            0.5,
            1,
        );
    }
}
