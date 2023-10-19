import { Preview } from "../Preview";
import { Interpolation, Vector2 } from "../osu-base";
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
 * Reloads all previews.
 */
export function reloadPreviews(): void {
    $("#container").empty();
    previews.clear();

    const addPlayers = (
        players: MultiplayerPlayer[],
        minWidth: number,
        maxWidth: number,
    ) => {
        // Divide previews into different layouts for varying cell counts in order to maximize dimensions.
        let rows = 1;
        let cells = 1;

        switch (players.length) {
            case 2:
                cells = 2;
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

        const scaleX = 1 / cells;
        const scaleY = 1 / rows;

        for (let row = 0; row < rows; ++row) {
            for (let cell = 0; cell < cells; ++cell) {
                const player = playersArray.at(row * cells + cell);
                if (!player) {
                    break;
                }

                previews.set(
                    player.uid,
                    new Preview(
                        player.uid,
                        new Vector2(
                            Interpolation.lerp(
                                minWidth,
                                maxWidth,
                                cell / cells,
                            ),
                            Interpolation.lerp(
                                0,
                                innerHeight - Preview.heightPadding,
                                row / rows,
                            ),
                        ),
                        scaleX,
                        scaleY,
                    ),
                );
            }
        }
    };

    const playersArray = [...players.values()];

    if (teamMode === MultiplayerTeamMode.headToHead) {
        addPlayers(playersArray, 0, innerWidth);
    } else {
        addPlayers(
            playersArray.filter((p) => p.team === MultiplayerTeam.red),
            0,
            innerWidth / 2,
        );

        addPlayers(
            playersArray.filter((p) => p.team === MultiplayerTeam.blue),
            innerWidth / 2,
            innerWidth,
        );
    }
}
