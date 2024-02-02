import { Vector2 } from "../../osu-base";
import { SpectatorClickEventManager } from "../../spectator/managers/SpectatorClickEventManager";
import { SpectatorCursorEventManager } from "../../spectator/managers/SpectatorCursorEventManager";
import { MovementType } from "../../spectator/structures/MovementType";
import { DrawableCounter } from "./DrawableCounter";

/**
 * Represents a click counter.
 */
export class DrawableClickCounter extends DrawableCounter {
    private readonly cursorManagers: SpectatorCursorEventManager[];
    private readonly clickManagers: SpectatorClickEventManager[];
    private static readonly boxLength = 80;
    private static readonly boxPadding = 10;
    private static readonly fontSize = 30;

    constructor(
        cursorManagers: SpectatorCursorEventManager[],
        clickManagers: SpectatorClickEventManager[],
        sizeScale: Vector2,
    ) {
        super(sizeScale);

        this.cursorManagers = cursorManagers;
        this.clickManagers = clickManagers;
    }

    override draw(ctx: CanvasRenderingContext2D, time: number) {
        const { boxLength, boxPadding, fontSize } = DrawableClickCounter;

        // Only draw 3 counters for now.
        // TODO: maybe expand this further?
        const counterCount = Math.min(3, this.clickManagers.length);

        this.setupContext(
            ctx,
            new Vector2(
                ctx.canvas.width - boxLength - boxPadding * 2,
                (ctx.canvas.height -
                    counterCount * boxLength -
                    // Padding is only applied to n - 1 boxes.
                    (counterCount - 1) * boxPadding) /
                    2,
            ),
            fontSize,
        );

        for (let i = 0; i < counterCount; ++i) {
            const cursor = this.cursorManagers[i].eventAtOrDefault(time);
            const count = this.clickManagers[i].clickCountAt(time);
            const boxYPosition = (boxLength + boxPadding) * i;

            // Draw the box first, and then the counter on top.
            // The box is yellow when active and white otherwise.
            ctx.fillStyle = cursor.id === MovementType.up ? "#fff" : "#ffff00";
            ctx.fillRect(boxPadding, boxYPosition, boxLength, boxLength);

            ctx.fillStyle = "#000";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            ctx.fillText(
                count.toString(),
                boxPadding + boxLength / 2,
                boxYPosition + boxLength / 2,
            );
        }

        ctx.restore();
    }
}
