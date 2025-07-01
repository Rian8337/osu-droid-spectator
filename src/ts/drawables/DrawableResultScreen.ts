import {
    Accuracy,
    ModFlashlight,
    ModHidden,
    ScoreRank,
} from "@rian8337/osu-base";
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
        this.drawRank(ctx);
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
        ctx.font = `bold ${(ctx.canvas.height / 7.5).toString()}px Torus, sans-serif`;

        ctx.fillText(
            manager.result.score.toLocaleString("en-US"),
            ctx.canvas.width / 10,
            ctx.canvas.height / 6,
        );

        ctx.restore();
    }

    private drawHitResults(ctx: CanvasRenderingContext2D) {
        const manager = dataProcessor.managers.get(this.uid);

        ctx.save();

        ctx.textBaseline = "middle";

        let yPosition = ctx.canvas.height / 3.75;

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

            let xPosition = ctx.canvas.width / 10;

            if (position === "right") {
                xPosition += ctx.canvas.width / 4;
            }

            ctx.fillStyle = `rgb(${color})`;
            ctx.font = `bold ${(ctx.canvas.height / 10).toString()}px Torus, sans-serif`;
            ctx.fillText(result, xPosition, yPosition);

            ctx.fillStyle = "#FFFFFF";
            ctx.font = `${(ctx.canvas.height / 15).toString()}px Torus, sans-serif`;
            ctx.fillText(
                (count ?? 0).toString(),
                xPosition +
                    (position === "left"
                        ? ctx.canvas.width / 10
                        : ctx.canvas.width / 15),
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
        drawResult("X", manager?.result?.miss, "right");

        ctx.restore();
    }

    private drawMaxCombo(ctx: CanvasRenderingContext2D) {
        const manager = dataProcessor.managers.get(this.uid);

        ctx.save();

        ctx.fillStyle = "#FFFFFF";
        ctx.font = `bold ${(ctx.canvas.height / 10).toString()}px Torus, sans-serif`;

        ctx.fillText(
            "Max Combo",
            ctx.canvas.width / 10,
            (ctx.canvas.height * 4) / 5,
        );

        ctx.font = `${(ctx.canvas.height / 15).toString()}px Torus, sans-serif`;

        ctx.fillText(
            (manager?.result?.maxCombo ?? 0).toString() + "x",
            ctx.canvas.width / 10,
            (ctx.canvas.height * 4) / 5 + ctx.canvas.height / 10,
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
        ctx.font = `bold ${(ctx.canvas.height / 10).toString()}px Torus, sans-serif`;

        ctx.fillText(
            "Accuracy",
            (ctx.canvas.width * 4) / 10,
            (ctx.canvas.height * 4) / 5,
        );

        ctx.font = `${(ctx.canvas.height / 15).toString()}px Torus, sans-serif`;

        ctx.fillText(
            ((accuracy.value() || 0) * 100).toFixed(2) + "%",
            (ctx.canvas.width * 4) / 10,
            (ctx.canvas.height * 4) / 5 + ctx.canvas.height / 10,
        );

        ctx.restore();
    }

    private drawRank(ctx: CanvasRenderingContext2D) {
        const manager = dataProcessor.managers.get(this.uid);

        const accuracy = new Accuracy({
            n300: manager?.result?.perfect ?? 0,
            n100: manager?.result?.good ?? 0,
            n50: manager?.result?.bad ?? 0,
            nmiss: manager?.result?.miss ?? 0,
        });

        let rank: ScoreRank | "F" = "F";

        ctx.save();
        ctx.textAlign = "right";
        ctx.font = `bold ${(ctx.canvas.height / 1.25).toString()}px Torus, sans-serif`;
        ctx.fillStyle = "#ad1010";
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#FFFFFF";

        if (manager?.result && accuracy.value()) {
            const totalHits =
                accuracy.n300 + accuracy.n100 + accuracy.n50 + accuracy.nmiss;

            const isHidden =
                manager.mods.has(ModHidden) || manager.mods.has(ModFlashlight);

            const hit300Ratio = accuracy.n300 / totalHits;

            switch (true) {
                case accuracy.value() === 1:
                    rank = "X";
                    ctx.fillStyle = isHidden ? "#a8a8a8" : "#eba731";
                    break;

                case hit300Ratio > 0.9 &&
                    accuracy.n50 / totalHits < 0.01 &&
                    !accuracy.nmiss:
                    rank = "S";
                    ctx.fillStyle = isHidden ? "#a8a8a8" : "#eba731";
                    break;

                case (hit300Ratio > 0.8 && !accuracy.nmiss) ||
                    hit300Ratio > 0.9:
                    rank = "A";
                    ctx.fillStyle = "#37d422";
                    break;

                case (hit300Ratio > 0.7 && !accuracy.nmiss) ||
                    hit300Ratio > 0.8:
                    rank = "B";
                    ctx.fillStyle = "#2255e3";
                    break;

                case hit300Ratio > 0.6:
                    rank = "C";
                    ctx.fillStyle = "#e022e3";
                    break;

                default:
                    rank = "D";
                    ctx.fillStyle = "#f02e2e";
                    break;
            }
        }

        ctx.fillText(
            rank,
            (ctx.canvas.width * 9) / 10,
            (ctx.canvas.height * 6) / 10,
        );

        ctx.strokeText(
            rank,
            (ctx.canvas.width * 9) / 10,
            (ctx.canvas.height * 6) / 10,
        );

        ctx.restore();
    }
}
