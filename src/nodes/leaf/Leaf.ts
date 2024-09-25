import Node from "../Node";

/**
 * The type representing a resolved update promise.
 */
type AsyncUpdateResolved = {
    /**
     * Whether the promise was resolved rather than rejected.
     */
    isResolved: true;

    /**
     * The value that the promise resolved with.
     */
    value: any;
};

/**
 * The type representing a rejected update promise.
 */
type AsyncUpdateRejected = {
    /**
     * Whether the promise was resolved rather than rejected.
     */
    isResolved: false;

    /**
     * The reason that the promise rejected with.
     */
    reason: any;
};

/**
 * The type representing a settled update promise.
 */
export type AsyncUpdatePromiseResult = AsyncUpdateResolved | AsyncUpdateRejected;

/**
 * A leaf node.
 */
export default abstract class Leaf extends Node {}
