import { ModMap } from "@rian8337/osu-base";
import { modIcons } from "../settings/SpectatorSettings";
import { DrawableAccuracyCounter } from "./counters/DrawableAccuracyCounter";

/**
 * Represents mods indicator.
 */
export class DrawableModsIndicator {
    private static readonly paddingX = 75;
    private static readonly paddingY = DrawableAccuracyCounter.paddingY - 25;

    constructor(private readonly mods: ModMap) {}

    /**
     * Draws this mods indicator into the screen.
     *
     * @param ctx The canvas context.
     */
    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();

        ctx.globalAlpha = 1;

        ctx.translate(
            ctx.canvas.width - DrawableModsIndicator.paddingX,
            DrawableModsIndicator.paddingY,
        );

        let extraPadding = 0;

        for (const mod of this.mods.values()) {
            const icon = modIcons.get(mod.acronym);

            if (!icon) {
                continue;
            }

            // Draw image at half the size
            ctx.drawImage(
                icon,
                extraPadding,
                0,
                icon.width * 0.5,
                icon.height * 0.5,
            );

            extraPadding -= 25;
        }

        ctx.restore();
    }
}
