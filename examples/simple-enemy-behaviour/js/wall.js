function Wall({ x, y }) {
    /**
     * The wall tile position.
     */
    this.tileX = x;
    this.tileY = y;
    /**
     * The wall absolute position.
     */
    this.x = x * TILE_SIZE;
    this.y = y * TILE_SIZE;

    /**
     * Gets the tile x position.
     */
    this.getTileX = function() {
        return this.tileX;
    };

    /**
     * Gets the tile y position.
     */
    this.getTileY = function() {
        return this.tileY;
    };

    /**
     * Gets the x position.
     */
    this.getX = function() {
        return this.x;
    };

    /**
     * Gets the y position.
     */
    this.getY = function() {
        return this.y;
    };

    /**
     * Gets the size.
     */
    this.getSize = function() {
        return TILE_SIZE;
    };
};