import { ModMap, ModUtil, Vector2 } from "@rian8337/osu-base";
import { modIcons, windowScale } from "../settings/SpectatorSettings";
import { DrawableAccuracyCounter } from "./counters/DrawableAccuracyCounter";

/**
 * Represents mods indicator.
 */
export class DrawableModsIndicator {
    private static readonly paddingX = 125;

    private static get paddingY() {
        return DrawableAccuracyCounter.paddingY + 50 * windowScale.y;
    }

    private static readonly allMods = [...ModUtil.allMods.entries()].reverse();

    constructor(
        private readonly mods: ModMap,
        private readonly sizeScale: Vector2,
    ) {}

    /**
     * Draws this mods indicator into the screen.
     *
     * @param ctx The canvas context.
     */
    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();

        ctx.globalAlpha = 1;

        ctx.translate(
            ctx.canvas.width -
                DrawableModsIndicator.paddingX * this.sizeScale.x,
            DrawableModsIndicator.paddingY * this.sizeScale.y,
        );

        ctx.scale(this.sizeScale.x, this.sizeScale.y);

        let extraPadding = 0;

        for (const [acronym, mod] of DrawableModsIndicator.allMods) {
            if (!this.mods.has(mod)) {
                continue;
            }

            const icon = modIcons.get(acronym);

            if (!icon) {
                continue;
            }

            ctx.drawImage(icon, extraPadding, 0, icon.width, icon.height);
            extraPadding -= 50;
        }

        ctx.restore();
    }
}
