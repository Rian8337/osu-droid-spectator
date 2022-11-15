import { Beatmap } from "./osu-base";
import { Preview } from "./Preview";
import { FayeClientManager } from "./spectator/FayeClientManager";
import { MultiplayerRoomInfo } from "./spectator/rawdata/MultiplayerRoomInfo";
import { SpectatorDataProcessor } from "./spectator/SpectatorDataProcessor";

export interface Settings extends Exclude<MultiplayerRoomInfo, "message"> {
    /**
     * The ID of the room.
     */
    roomId: string;

    /**
     * The Faye client manager.
     */
    fayeClient: FayeClientManager | null;

    /**
     * The parsed beatmap from beatmap decoder.
     */
    parsedBeatmap: Beatmap | null;

    /**
     * The spectator data processor.
     */
    processor: SpectatorDataProcessor | null;

    /**
     * Custom mod multipliers that overrides the client's default mod multiplier.
     *
     * Each mod is mapped to their own mod multiplier.
     */
    modMultipliers: Record<string, number>;

    /**
     * The active previews.
     */
    readonly previews: Map<number, Preview>;
}

/**
 * Global settings.
 */
const settings: Settings = {
    roomId: "",
    fayeClient: null,
    beatmap: null,
    requiredMods: "",
    allowedMods: "",
    speedMultiplier: 1,
    players: [],
    parsedBeatmap: null,
    processor: null,
    modMultipliers: {},
    forcedAR: {
        allowed: false,
        minValue: 0,
        maxValue: 12.5,
    },
    previews: new Map(),
};

export default settings;
