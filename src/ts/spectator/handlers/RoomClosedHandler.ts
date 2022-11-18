import { askRoomID } from "../../RoomLoader";

/**
 * A handler responsible for handling room closed events.
 */
export abstract class RoomClosedHandler {
    /**
     * Handles the event when the room closes.
     */
    static handle(): void {
        console.log("Room closed");

        askRoomID();
    }
}
