export interface Tool {
  name: string;
  description?: string;
  inputSchema?: Record<string, unknown>;
}

export interface Resource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}

export interface Prompt {
  name: string;
  description?: string;
  arguments?: Array<{
    name: string;
    description?: string;
    required?: boolean;
  }>;
}

export interface ToolResult {
  content: Array<{
    type: string;
    text?: string;
    data?: string;
    mimeType?: string;
  }>;
  isError?: boolean;
}

export interface ResourceContent {
  uri: string;
  text?: string;
  blob?: string;
  mimeType?: string;
}

export interface PromptMessage {
  role: "user" | "assistant";
  content: {
    type: string;
    text?: string;
  };
}
