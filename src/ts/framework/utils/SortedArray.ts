/**
 * A sorted array.
 *
 * @template T The type of the elements in the array.
 */
export class SortedArray<T> {
    private readonly _array: T[] = [];

    /**
     * The sorted array.
     */
    get array(): readonly T[] {
        return this._array;
    }

    /**
     * The length of the sorted array.
     */
    get length(): number {
        return this._array.length;
    }

    private readonly comparer: SortedArrayComparer<T>;

    /**
     * Creates a new `SortedArray`.
     *
     * @param comparer The comparer function to use for sorting.
     */
    constructor(comparer: SortedArrayComparer<T>) {
        this.comparer = comparer;
    }

    /**
     * Adds an element to the sorted array.
     *
     * @param element The element to add.
     */
    add(element: T) {
        const index = this.findInsertionIndex(element);

        if (index === -1) {
            this._array.push(element);
        } else {
            this._array.splice(index, 0, element);
        }
    }

    /**
     * Obtains an element from the sorted array.
     *
     * @param index The index of the element to obtain.
     * @returns The element at the given index.
     */
    get(index: number): T {
        return this._array[index];
    }

    /**
     * Removes an element from the sorted array.
     *
     * @param index The index of the element to remove.
     */
    removeAt(index: number) {
        this._array.splice(index, 1);
    }

    private findInsertionIndex(item: T): number {
        let low = 0;
        let high = this._array.length;

        while (low < high) {
            const mid = (low + high) >>> 1;
            const comparison = this.comparer(item, this._array[mid]);

            if (comparison < 0) {
                high = mid;
            } else if (comparison > 0) {
                low = mid + 1;
            } else {
                return mid;
            }
        }

        return low;
    }
}

/**
 * A comparer function for comparing elements in a sorted array.
 *
 * @template T The type of the elements to compare.
 */
export type SortedArrayComparer<T> = (a: T, b: T) => number;
