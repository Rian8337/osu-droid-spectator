import { askRoomID } from "./RoomLoader";
import { openDatabase } from "./settings/DatabaseSettings";

(async () => {
    await openDatabase();

    askRoomID();
})();
