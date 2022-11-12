import { SpectatorObjectData } from "../rawdata/SpectatorObjectData";
import { SpectatorEvent } from "./SpectatorEvent";

/**
 * Emitted when an object was hit or missed.
 */
export type SpectatorObjectDataEvent = SpectatorEvent & SpectatorObjectData;
