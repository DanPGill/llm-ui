import { describe, expect, it } from "vitest";
import { z } from "zod";
import { jsonBlockPrompt } from "./jsonBlockPrompt";

describe("jsonBlockPrompt", () => {
  it("simple", () => {
    expect(
      jsonBlockPrompt({
        name: "simple",
        schema: z.object({ a: z.string() }),
        examples: [{ a: "example" }],
      }),
    ).toMatchInlineSnapshot(`
      "You can respond with a simple component by wrapping JSON in 【】. The schema is:
      {"type":"object","properties":{"a":{"type":"string"}},"required":["a"]}

      Examples: 
      【{"a":"example"}】"
    `);
  });

  it("complex", () => {
    expect(
      jsonBlockPrompt({
        name: "complex",
        schema: z.object({
          a: z.array(z.object({ a: z.string(), b: z.string() })),
        }),
        examples: [{ a: [{ a: "a", b: "b" }] }],
      }),
    ).toMatchInlineSnapshot(`
      "You can respond with a complex component by wrapping JSON in 【】. The schema is:
      {"type":"object","properties":{"a":{"type":"array","items":{"type":"object","properties":{"a":{"type":"string"},"b":{"type":"string"}},"required":["a","b"],"additionalProperties":false}}},"required":["a"]}

      Examples: 
      【{"a":[{"a":"a","b":"b"}]}】"
    `);
  });
});