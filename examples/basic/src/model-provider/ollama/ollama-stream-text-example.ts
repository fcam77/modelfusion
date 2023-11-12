import dotenv from "dotenv";
import { OllamaTextGenerationModel, streamText } from "modelfusion";

dotenv.config();

async function main() {
  const textStream = await streamText(
    new OllamaTextGenerationModel({
      model: "mistral",
      maxCompletionTokens: 500,
    }),
    "Write a short story about a robot learning to love:\n\n"
  );

  for await (const textPart of textStream) {
    process.stdout.write(textPart);
  }
}

main().catch(console.error);
