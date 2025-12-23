import { getMistreevousMetadata, MethodOrGetterDecorator } from "./Metadata";

/**
 * The Alias decorator allows you to specify an alternative name for a method or getter.
 * This can be useful in scenarios where you want to expose a different name for reference in behaviour trees.
 * @param name The name of the alias to be used.
 */
export function Alias(name: string): MethodOrGetterDecorator {
    // An alias name must be defined and be a non-empty string.
    if (typeof name !== "string" || name.length === 0) {
        throw new Error("@Alias requires a non-empty string");
    }

    return function (value, context) {
        // The Alias decorator can only be applied to methods or getters.
        if (context.kind !== "method" && context.kind !== "getter") {
            throw new Error("@Alias can only be applied to methods or getters");
        }

        context.addInitializer(function () {
            // Get the prototype of the decorated class instance.
            const proto = Object.getPrototypeOf(this);

            // Get the Mistreevous metadata for the prototype, this will create it if it doesn't exist.
            const mistreevousMetadata = getMistreevousMetadata(proto);

            // Create the aliases table if it doesn't exist yet.
            mistreevousMetadata.aliases ??= Object.create(null);

            // Store the alias for this decorated member in the metadata.
            mistreevousMetadata.aliases![context.name] = name;
        });

        return value;
    };
}
