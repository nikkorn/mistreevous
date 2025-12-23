## Idea
Have mistreevous export dome decorators that can be used in agents.

## First Pass
Adding some basic ones to test practicality

### @Alias
Unnamed decorators force you to leak JS naming conventions into your DSL.
This alias can be used to define a custom identifier for a getter or method.

This alias is a general one that can be used for any function called from mistreevous, including action and condition functions.

``` ts
@alias("move_towards_target")
public moveToTarget(): void {
    // ... Do the stuff
}
```

### @Action
Works the same as @alias but is explicitly used for action functions.

### @Condition 
Works the same as @alias but is explicitly used for condition functions and getters.

### @BindAgent
Forces the the method to be bound to the agent instance.

function BindAgent(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const original = descriptor.value;

  return {
    configurable: true,
    get() {
      const bound = original.bind(this);
      Object.defineProperty(this, propertyKey, {
        value: bound,
        configurable: true,
        writable: true
      });
      return bound;
    }
  };
}

