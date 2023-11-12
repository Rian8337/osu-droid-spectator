import { Beatmap } from "./Beatmap";
import { MapStats } from "../utils/MapStats";
import { Mod } from "../mods/Mod";
import { BeatmapHitObjectsDecoder } from "./decoder/beatmap/BeatmapHitObjectsDecoder";
import { BeatmapGeneralDecoder } from "./decoder/beatmap/BeatmapGeneralDecoder";
import { BeatmapEditorDecoder } from "./decoder/beatmap/BeatmapEditorDecoder";
import { BeatmapEventsDecoder } from "./decoder/beatmap/BeatmapEventsDecoder";
import { BeatmapDifficultyDecoder } from "./decoder/beatmap/BeatmapDifficultyDecoder";
import { BeatmapMetadataDecoder } from "./decoder/beatmap/BeatmapMetadataDecoder";
import { BeatmapControlPointsDecoder } from "./decoder/beatmap/BeatmapControlPointsDecoder";
import { BeatmapColorDecoder } from "./decoder/beatmap/BeatmapColorDecoder";
import { BeatmapSection } from "../constants/BeatmapSection";
import { Decoder } from "./Decoder";
import { SectionDecoder } from "./decoder/SectionDecoder";
import { HitObjectStackEvaluator } from "../utils/HitObjectStackEvaluator";
import { CircleSizeCalculator } from "../utils/CircleSizeCalculator";

/**
 * A beatmap decoder.
 */
export class BeatmapDecoder extends Decoder<Beatmap, SectionDecoder<Beatmap>> {
    protected finalResult: Beatmap = new Beatmap();
    protected override decoders: Partial<
        Record<BeatmapSection, SectionDecoder<Beatmap>>
    > = {};

    private previousSection: BeatmapSection = BeatmapSection.general;

    /**
     * @param str The string to decode.
     * @param mods The mods to decode for.
     * @param parseStoryboard Whether to parse the beatmap's storyboard.
     */
    override decode(str: string, mods: Mod[] = []): this {
        super.decode(str);

        const circleSize: number = new MapStats({
            cs: this.finalResult.difficulty.cs,
            mods,
        }).calculate().cs!;
        const scale: number =
            CircleSizeCalculator.standardCSToDroidScale(circleSize);

        this.finalResult.hitObjects.objects.forEach((h) => {
            h.scale = scale;
        });

        HitObjectStackEvaluator.applyDroidStacking(
            this.finalResult.hitObjects.objects,
            this.finalResult.general.stackLeniency,
        );

        return this;
    }

    protected override decodeLine(line: string): void {
        if (this.finalResult.formatVersion !== this.formatVersion) {
            this.finalResult.formatVersion = this.formatVersion;
        }

        // We need to track the previous section in case AR isn't specified in the beatmap file.
        if (this.previousSection !== this.section) {
            if (
                this.previousSection === BeatmapSection.difficulty &&
                this.finalResult.difficulty.ar === undefined
            ) {
                this.finalResult.difficulty.ar = this.finalResult.difficulty.od;
            }

            this.previousSection = this.section;
        }

        super.decodeLine(line);
    }

    protected override reset(): void {
        super.reset();

        this.finalResult = new Beatmap();

        this.decoders = {
            General: new BeatmapGeneralDecoder(this.finalResult),
            Editor: new BeatmapEditorDecoder(this.finalResult),
            Metadata: new BeatmapMetadataDecoder(this.finalResult),
            Difficulty: new BeatmapDifficultyDecoder(this.finalResult),
            Events: new BeatmapEventsDecoder(this.finalResult),
            TimingPoints: new BeatmapControlPointsDecoder(this.finalResult),
            Colours: new BeatmapColorDecoder(this.finalResult),
            HitObjects: new BeatmapHitObjectsDecoder(this.finalResult),
        };
    }
}
