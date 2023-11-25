import { MultiModalInput } from "../../../model-function/generate-text/prompt-format/Content.js";
import { ToolCall } from "../../../tool/ToolCall.js";

export type OpenAIChatMessage =
  | {
      role: "system";
      content: string;
      name?: string;
    }
  | {
      role: "user";
      content:
        | string
        | Array<
            | { type: "text"; text: string }
            | {
                type: "image_url";
                image_url:
                  | string
                  | {
                      url: string;
                      detail: "low" | "high" | "auto";
                    };
              }
          >;
      name?: string;
    }
  | {
      role: "assistant";
      content: string | null;
      name?: string;
      tool_calls?: Array<{
        id: string;
        type: "function";
        function: {
          name: string;
          arguments: string;
        };
      }>;
      function_call?: {
        name: string;
        arguments: string;
      };
    }
  | {
      role: "tool";
      tool_call_id: string;
      content: string | null;
    }
  | {
      role: "function";
      content: string;
      name: string;
    };

export const OpenAIChatMessage = {
  system(content: string): OpenAIChatMessage {
    return { role: "system", content };
  },

  user(
    content: string | MultiModalInput,
    options?: { name?: string }
  ): OpenAIChatMessage {
    return {
      role: "user",
      content:
        typeof content === "string"
          ? content
          : content.map((element) => {
              switch (element.type) {
                case "text": {
                  return { type: "text", text: element.text };
                }
                case "image": {
                  return {
                    type: "image_url",
                    image_url: `data:${
                      element.mimeType ?? "image/jpeg"
                    };base64,${element.base64Image}`,
                  };
                }
              }
            }),
      name: options?.name,
    };
  },

  /**
   * Creates an assistant chat message. The assistant message can optionally contain tool calls.
   */
  assistant(
    content: string | null,
    options?: {
      toolCalls: Array<ToolCall<string, unknown>> | null | undefined;
    }
  ): OpenAIChatMessage {
    return {
      role: "assistant",
      content,
      tool_calls:
        options?.toolCalls?.map((toolCall) => ({
          id: toolCall.id,
          type: "function",
          function: {
            name: toolCall.name,
            arguments: JSON.stringify(toolCall.args),
          },
        })) ?? undefined,
    };
  },

  /**
   * Creates a tool result chat message with the result of a tool call.
   */
  tool({
    toolCallId,
    content,
  }: {
    toolCallId: string;
    content: unknown;
  }): OpenAIChatMessage {
    return {
      role: "tool" as const,
      tool_call_id: toolCallId,
      content: JSON.stringify(content),
    };
  },
};
