import {
  OpenAITextEmbeddingModel,
  embedTexts,
  throttleMaxConcurrency,
} from "ai-utils.js";
import dotenv from "dotenv";

dotenv.config();

(async () => {
  const embeddings = await embedTexts(
    new OpenAITextEmbeddingModel({
      model: "text-embedding-ada-002",
      throttle: throttleMaxConcurrency({ maxConcurrentCalls: 10 }),
    }),
    [
      "At first, Nox didn't know what to do with the pup.",
      "He keenly observed and absorbed everything around him, from the birds in the sky to the trees in the forest.",
    ]
  );

  console.log(embeddings);
})();
