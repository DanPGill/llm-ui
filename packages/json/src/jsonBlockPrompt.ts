import z, { ZodSchema, ZodTypeAny } from "zod";
import { jsonBlockExample } from "./jsonBlockExample";
import { jsonBlockSchema } from "./jsonBlockSchema";
import { JsonBlockOptions, getOptions } from "./options";

export const jsonBlockPrompt = <
  Schema extends ZodTypeAny = ZodSchema<undefined>,
>({
  name,
  schema,
  examples,
  userOptions,
}: {
  name: string;
  schema: Schema;
  examples: z.infer<Schema>[];
  userOptions?: Partial<JsonBlockOptions>;
}): string => {
  const { startChar, endChar } = getOptions(userOptions);
  const schemaPrompt = jsonBlockSchema(schema);
  const examplePrompts = examples.map((example) =>
    jsonBlockExample(schema, example, userOptions),
  );
  return `You can respond with a ${name} component by wrapping JSON in ${startChar}${endChar}. The schema is:\n${schemaPrompt}\n\nExamples: \n${examplePrompts.join(`\n`)}`;
};