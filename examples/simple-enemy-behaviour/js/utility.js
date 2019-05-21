
/**
 * Calculates whether two squares intersect.
 * @param aX      The X position of the first box.
 * @param aY      The Y position of the first box.
 * @param aWidth  The width of the first box.
 * @param aHeight The height of the first box.
 * @param bX      The X position of the second box.
 * @param bY      The Y position of the second box.
 * @param bWidth  The width of the second box.
 * @param bHeight The height of the second box.
 * @return Whether an intersection exists.
 */
function doSquaresIntersect(aX, aY, aWidth, aHeight, bX, bY, bWidth, bHeight) {
    return (aX < (bX + bWidth) && (aX + aWidth) > bX && aY < (bY + bHeight) && (aY + aHeight) > bY);
};