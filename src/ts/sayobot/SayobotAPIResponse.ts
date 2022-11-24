import { SayobotBeatmap } from "./SayobotBeatmap";

export interface SayobotAPIResponse {
    readonly status: number;
    readonly data: SayobotBeatmap[];
}
