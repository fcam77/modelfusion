import { ModelInformation } from "./ModelInformation.js";
import { RunFunctionObserver } from "../run/RunFunctionObserver.js";

export interface ModelSettings {
  observers?: Array<RunFunctionObserver>;
}

export interface Model<SETTINGS> {
  modelInformation: ModelInformation;
  readonly settings: SETTINGS;

  /**
   * The `withSettings` method creates a new model with the same configuration as the original model, but with the specified settings changed.
   *
   * @example
   * const model = new OpenAITextGenerationModel({
   *   model: "text-davinci-003",
   *   maxTokens: 500,
   * });
   *
   * const modelWithMoreTokens = model.withSettings({
   *   maxTokens: 1000,
   * });
   */
  withSettings(additionalSettings: Partial<SETTINGS>): this;
}
