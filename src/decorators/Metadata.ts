const MISTREEVOUS_METADATA = Symbol("mistreevous:metadata");

export type MetadataTable<T> = Record<string | symbol, T>;

export interface MistreevousMetadata {
  aliases?: MetadataTable<string>;
  action_aliases?: MetadataTable<string>;
  condition_aliases?: MetadataTable<string>;
  // future:
  // bind?: Set<string | symbol>
  // cooldowns?: ...
}

export type MethodOrGetterDecorator = (
  value: Function,
  context:
    | ClassMethodDecoratorContext
    | ClassGetterDecoratorContext
) => Function;

export type MethodDecorator = (
  value: Function,
  context: ClassMethodDecoratorContext
) => Function;

/**
 * Gets the Mistreevous metadata for the given object prototype or creates it and returns it if it doesn't exist.
 * @param prototype The object prototype to get the metadata for.
 * @returns The Mistreevous metadata for the given object prototype.
 */
export function getMistreevousMetadata(prototype: object): MistreevousMetadata {
  let mistreevousMetadata = (prototype as any)[MISTREEVOUS_METADATA];

  // If we don't have metadata for this object prototype yet then create it.
  if (!mistreevousMetadata) {
    mistreevousMetadata = Object.create(null);

    Object.defineProperty(prototype, MISTREEVOUS_METADATA, {
      value: mistreevousMetadata,
      enumerable: false
    });
  }

  // Return the metadata object.
  return mistreevousMetadata;
}