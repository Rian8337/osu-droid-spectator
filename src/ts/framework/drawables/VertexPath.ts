import { Vector2 } from "@rian8337/osu-base";
import { DrawableWithPath } from "./DrawableWithPath";

/**
 * Represents a path that is connected together via vertices.
 */
export class VertexPath extends DrawableWithPath {
    /**
     * Vertices that make up this `VertexPath`.
     */
    readonly vertices: Vector2[] = [];

    override get size(): Vector2 {
        if (!this.isSizeValid) {
            this.isSizeValid = true;
            this.updateSize();
        }

        return super.size;
    }

    override set size(value: number | Vector2) {
        super.size = value;
    }

    /**
     * The width of this `VertexPath`.
     */
    width = 1;

    /**
     * The cap style of this `VertexPath`.
     */
    cap: CanvasLineCap = "round";

    private isSizeValid = false;

    /**
     * Adds a vertex to this `VertexPath`.
     *
     * @param vertex The vertex to add.
     */
    addVertex(vertex: Vector2) {
        this.vertices.push(vertex);
        this.isSizeValid = false;
    }

    /**
     * Adds multiple vertices to this `VertexPath`.
     *
     * @param vertices The vertices to add.
     */
    addVertices(...vertices: Vector2[]) {
        this.vertices.push(...vertices);
        this.isSizeValid = false;
    }

    /**
     * Removes a vertex from this `VertexPath`.
     *
     * @param vertex The vertex to remove.
     * @returns Whether the vertex was removed.
     */
    removeVertex(vertex: Vector2): boolean {
        const index = this.vertices.indexOf(vertex);

        if (index === -1) {
            return false;
        }

        this.vertices.splice(index, 1);

        return true;
    }

    /**
     * Removes all vertices from this `VertexPath`.
     */
    removeAllVertices() {
        this.vertices.length = 0;
        this.isSizeValid = false;
    }

    protected override onDraw() {
        const { ctx } = this;

        if (!ctx) {
            return;
        }

        ctx.stroke();
    }

    protected override applyCanvasConfigurations() {
        super.applyCanvasConfigurations();

        const { ctx } = this;

        if (!ctx) {
            return;
        }

        ctx.lineWidth = this.width;
        ctx.lineCap = this.cap;
    }

    protected override preparePath() {
        if (this.vertices.length === 0) {
            return;
        }

        const { ctx } = this;

        if (!ctx) {
            return;
        }

        ctx.beginPath();

        for (const vertex of this.vertices) {
            ctx.lineTo(vertex.x, vertex.y);
        }
    }

    override get topLeftBound(): Vector2 {
        return super.topLeftBound.subtract(new Vector2(this.width * 0.5));
    }

    override get bottomRightBound(): Vector2 {
        // Account for top-left bound offset.
        return super.bottomRightBound.add(new Vector2(this.width * 1.5));
    }

    private updateSize() {
        if (this.vertices.length < 2) {
            this.size = new Vector2(0);

            return;
        }

        const min = new Vector2(Number.POSITIVE_INFINITY);
        const max = new Vector2(Number.NEGATIVE_INFINITY);

        for (const vertex of this.vertices) {
            min.x = Math.min(min.x, vertex.x);
            min.y = Math.min(min.y, vertex.y);

            max.x = Math.max(max.x, vertex.x);
            max.y = Math.max(max.y, vertex.y);
        }

        this.size = max.subtract(min);
    }
}
