---
sidebar_position: 18
---

# Guards

**Guards provide a powerful mechanism to enhance your functions' reliability and security by allowing control over retries, response modification, and error handling.** Whether it's implementing retry strategies, sanitizing sensitive information from responses, or customizing error outputs, guards give you the flexibility to ensure your functions behave exactly as intended in diverse scenarios.

The [guard function](/api/modules/#guard) wraps any existing function, e.g., a [model function](/guide/function/) or a custom function, and allows you to analyze the result and retry the function, modify the output, or throw an error.

## Understanding the Guard Function

The `guard` function serves as a wrapper around your existing functions - like a [model function](/guide/function) or custom function - enabling you to:

- Analyze the results once computed.
- Retry the function if necessary, with a limit on the number of retries.
- Modify the output that is returned.
- Throw custom errors.

```ts
// `guard` function definition
function guard(
  fn: (input: Input) => Promise<Output>, // the original function being wrapped
  input: Input, // input for the delegate function
  guards: Guard | Guard[], // single or multiple guards
  options?: { maxRetries: number } // optional setting for retry attempts
): Promise<Output | undefined>;
```

Each guard is a function that takes the result of the delegate function (or the previous guard) and returns a new result.

```ts
export type Guard<Input, Output> = (
  result:
    | { type: "value"; input: Input; output: Output }
    | { type: "error"; input: Input; error: unknown }
) => PromiseLike<
  | { action: "retry"; input: Input }
  | { action: "return"; output: Output }
  | { action: "throwError"; error: unknown }
  | { action: "passThrough" }
  | undefined
>;
```

Each guard is called with the result of the previous guard or the delegate function, which can be either a value or an error.

The guard can return one of the following actions:

- `retry`: Retry the delegate function with the return input. This allows you to modify the input for the next retry.
- `return`: Return the output. This allows you to modify the output, e.g. to redact sensitive information.
- `throwError`: Throw an error. This allows you to throw a custom error.
- `passThrough`: Pass through the result. This allows you to skip the guard. `undefined` is treated as `passThrough`.

## Usage

[Examples](https://github.com/lgrammel/modelfusion/tree/main/examples/basic/src/guard)

### Retry structure parsing with error message

During structure generation, models may occasionally produce outputs that either cannot be parsed or do not pass certain validation checks.
With the [`fixStructure`](/api/modules/#fixstructure) guard, you can retry generating the structure with a modified input that includes the error message.

```ts
const result = await guard(
  (input) =>
    generateStructure(
      new OpenAIChatModel({
        // ...
      }),
      new ZodStructureDefinition({
        // ...
      }),
      input
    ),
  [
    // ...
  ],
  fixStructure({
    modifyInputForRetry: async ({ input, error }) => [
      ...input,
      OpenAIChatMessage.functionCall(null, {
        name: error.structureName,
        arguments: error.valueText,
      }),
      OpenAIChatMessage.user(error.message),
      OpenAIChatMessage.user("Please fix the error and try again."),
    ],
  })
);
```

### Retry structure parsing with stronger model

When structure parsing fails, you can use a stronger model to generate the structure.

In this example, `gpt-3.5-turbo` is used initially. If structure parsing fails, `gpt-4` is used instead.

```ts
const result = await guard(
  (input: { model: OpenAIChatModelType; prompt: OpenAIChatMessage[] }) =>
    generateStructure(
      new OpenAIChatModel({
        model: input.model,
      }),
      new ZodStructureDefinition({
        //...
      }),
      input.prompt
    ),
  {
    model: "gpt-3.5-turbo",
    prompt: [
      // ...
    ],
  },
  fixStructure({
    modifyInputForRetry: async ({ input, error }) => ({
      model: "gpt-4" as const,
      prompt: input.prompt,
    }),
  })
);
```