/**
 * The beatmap database.
 *
 * Available object stores:
 * - Beatmapset files (name: `beatmaps`, `{beatmapsetId: number} => Blob`), contains all beatmapsets downloaded by the player.
 */
export let db: IDBDatabase | null = null;

/**
 * Opens the beatmap database.
 */
export function openDatabase(): Promise<void> {
    return new Promise((resolve) => {
        if (db) {
            return resolve();
        }

        const request = indexedDB.open("beatmaps");

        request.onsuccess = () => {
            console.log("Successfully opened database");
            db = request.result;
            resolve();
        };

        request.onupgradeneeded = () => {
            console.log("Database version upgrade is needed");

            db = request.result;
            db.createObjectStore("beatmaps");
        };

        request.onerror = () => {
            console.error(request.error);

            resolve();
        };
    });
}

/**
 * Gets a beatmapset from the database.
 *
 * @param beatmapsetId The ID of the beatmapset.
 * @returns The beatmapset in Blob, `null` if not found.
 */
export function getBeatmapsetFromDB(
    beatmapsetId: number
): Promise<Blob | null> {
    return new Promise((resolve, reject) => {
        if (!db) {
            return reject("The database has not been opened.");
        }

        const transaction = db.transaction("beatmaps", "readonly");
        transaction.onabort = () => {
            console.log("Beatmapset storing transaction aborted");

            resolve(null);
        };
        transaction.onerror = () => {
            console.error(transaction.error);

            resolve(null);
        };

        const objectStoreRequest: IDBRequest<Blob> = transaction
            .objectStore("beatmaps")
            .get(beatmapsetId);
        objectStoreRequest.onsuccess = () => {
            if (objectStoreRequest.result) {
                console.log(
                    `Beatmap set ID ${beatmapsetId} retrieved from database`
                );
            } else {
                console.log(
                    `Beatmap set ID ${beatmapsetId} not found in database`
                );
            }

            resolve(objectStoreRequest.result ?? null);
        };
        objectStoreRequest.onerror = () => {
            console.error(objectStoreRequest.error);

            resolve(null);
        };
    });
}

/**
 * Stores a beatmapset to the database.
 *
 * @param beatmapsetId The ID of the beatmapset.
 *
 */
export function storeBeatmapsetToDB(
    beatmapsetId: number,
    file: Blob
): Promise<void> {
    return new Promise((resolve, reject) => {
        if (!db) {
            return reject("The database has not been opened.");
        }

        const transaction = db.transaction("beatmaps", "readwrite");
        transaction.oncomplete = () => {
            console.log(`Beatmap set ID ${beatmapsetId} stored into database`);

            resolve();
        };
        transaction.onabort = () => {
            console.log("Beatmapset storing transaction aborted");

            resolve();
        };
        transaction.onerror = () => {
            console.error(transaction.error);

            resolve();
        };

        const objectStore = transaction.objectStore("beatmaps");
        objectStore.put(file, beatmapsetId);
    });
}
