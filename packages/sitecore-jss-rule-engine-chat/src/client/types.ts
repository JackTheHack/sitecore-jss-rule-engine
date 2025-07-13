import { Message } from "react-chatbotify";


export type CommandExecutionContext = {
    action: Action;
    messageApis: {
      injectMessage: (content: string | JSX.Element, sender?: string) => Promise<Message | null>;
      simulateStreamMessage: (content: string, sender?: string, simulateStreamChunker?: ((content: string) => Array<string>) | null) => Promise<Message | null>;
      toggleIsBotTyping: (active?: boolean) => Promise<void>;
    }
};

export type Action = {
  type: string;
  content: string;
};

export type Metadata = {
  timestamp: string;
  messageLength?: number;
  newStateId?: string;
  prevStateId?: string;
  visitorId?: string;
  triggerName?: string;
};

export type SuccessResponse = {
  success: true;
  actions: Action[];
  metadata: Metadata;
};

export type ErrorResponse = {
  success: false;
  error: string;
};