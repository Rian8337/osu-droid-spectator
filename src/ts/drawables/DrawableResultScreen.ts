import { Accuracy } from "@rian8337/osu-base";
import { dataProcessor, hitResultColors } from "../settings/SpectatorSettings";
import { HitResult } from "../spectator/structures/HitResult";

/**
 * Represents the result screen of a player.
 */
export class DrawableResultScreen {
    /**
     * The uid of the player this screen is for.
     */
    readonly uid: number;

    constructor(uid: number) {
        this.uid = uid;
    }

    /**
     * Draws this screen to the canvas.
     *
     * @param ctx The canvas rendering context to draw to.
     */
    draw(ctx: CanvasRenderingContext2D) {
        const manager = dataProcessor.managers.get(this.uid);

        if (!manager?.result) {
            return;
        }

        this.drawBackgroundDim(ctx);
        this.drawScore(ctx);
        this.drawHitResults(ctx);
        this.drawMaxCombo(ctx);
        this.drawAccuracy(ctx);
    }

    private drawBackgroundDim(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.restore();
    }

    private drawScore(ctx: CanvasRenderingContext2D) {
        const manager = dataProcessor.managers.get(this.uid);

        if (!manager?.result) {
            return;
        }

        ctx.save();

        ctx.fillStyle = "#FFFFFF";
        ctx.font = `bold ${(ctx.canvas.height / 10).toString()}px Torus, sans-serif`;

        ctx.fillText(
            manager.result.score.toString(),
            ctx.canvas.width / 4,
            ctx.canvas.height / 5,
        );

        ctx.restore();
    }

    private drawHitResults(ctx: CanvasRenderingContext2D) {
        const manager = dataProcessor.managers.get(this.uid);

        ctx.save();

        let yPosition = ctx.canvas.height / 4;

        const drawResult = (
            result: string,
            count: number | undefined,
            position: "left" | "right",
        ) => {
            let color: string;

            switch (result) {
                case "300":
                case "激":
                    color = hitResultColors[HitResult.great].toString();
                    break;

                case "100":
                case "喝":
                    color = hitResultColors[HitResult.good].toString();
                    break;

                case "50":
                    color = hitResultColors[HitResult.meh].toString();
                    break;

                default:
                    color = hitResultColors[HitResult.miss].toString();
            }

            let xPosition = ctx.canvas.width / 5;

            if (position === "right") {
                xPosition *= 2.5;
            }

            ctx.fillStyle = `rgb(${color})`;
            ctx.font = `bold ${(ctx.canvas.height / 15).toString()}px Torus, sans-serif`;
            ctx.fillText(result, xPosition, yPosition);

            ctx.fillStyle = "#FFFFFF";
            ctx.font = `${(ctx.canvas.height / 20).toString()}px Torus, sans-serif`;
            ctx.fillText(
                (count ?? 0).toString(),
                xPosition + ctx.canvas.width / 10,
                yPosition,
            );

            if (position === "right") {
                yPosition += ctx.canvas.height / 7.5;
            }
        };

        drawResult("300", manager?.result?.perfect, "left");
        drawResult("激", manager?.result?.geki, "right");
        drawResult("100", manager?.result?.good, "left");
        drawResult("喝", manager?.result?.katu, "right");
        drawResult("50", manager?.result?.bad, "left");
        drawResult("❌", manager?.result?.miss, "right");

        ctx.restore();
    }

    private drawMaxCombo(ctx: CanvasRenderingContext2D) {
        const manager = dataProcessor.managers.get(this.uid);

        ctx.save();

        ctx.fillStyle = "#FFFFFF";
        ctx.font = `bold ${(ctx.canvas.height / 15).toString()}px Torus, sans-serif`;

        ctx.fillText(
            "Max Combo",
            ctx.canvas.width / 4,
            (ctx.canvas.height * 3) / 4,
        );

        ctx.font = `${(ctx.canvas.height / 20).toString()}px Torus, sans-serif`;

        ctx.fillText(
            (manager?.result?.maxCombo ?? 0).toString(),
            ctx.canvas.width / 4,
            (ctx.canvas.height * 3) / 4 + ctx.canvas.height / 10,
        );

        ctx.restore();
    }

    private drawAccuracy(ctx: CanvasRenderingContext2D) {
        const manager = dataProcessor.managers.get(this.uid);

        const accuracy = new Accuracy({
            n300: manager?.result?.perfect ?? 0,
            n100: manager?.result?.good ?? 0,
            n50: manager?.result?.bad ?? 0,
            nmiss: manager?.result?.miss ?? 0,
        });

        ctx.save();

        ctx.fillStyle = "#FFFFFF";
        ctx.font = `bold ${(ctx.canvas.height / 15).toString()}px Torus, sans-serif`;

        ctx.fillText(
            "Accuracy",
            (ctx.canvas.width * 3) / 4,
            (ctx.canvas.height * 3) / 4,
        );

        ctx.font = `${(ctx.canvas.height / 20).toString()}px Torus, sans-serif`;

        ctx.fillText(
            ((accuracy.value() || 0) * 100).toFixed(2) + "%",
            (ctx.canvas.width * 3) / 4,
            (ctx.canvas.height * 3) / 4 + ctx.canvas.height / 10,
        );

        ctx.restore();
    }
}
