# Using `@jss-rule-engine/chat` in a Next.js App

## Overview

The `@jss-rule-engine/chat` package provides backend and frontend utilities to add a chatbot to your Sitecore JSS Next.js application. It includes:
- An API handler for chat messages.
- A React component for embedding a chatbot widget in your UI.

---

## 1. Backend/API Usage

**File:** `src/pages/api/chat/message.ts`

This API route handles chat messages from the frontend. It uses the `handleChatMessage` function from `@jss-rule-engine/chat` to process incoming messages and return responses.

**Example:**
```ts
import { ErrorResponse, Metadata, SuccessResponse, handleChatMessage } from '@jss-rule-engine/chat';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { message, visitorId, workflowId } = req.body;
    // Validate input...
    const chatHandlerResult = await handleChatMessage({ message, visitorId, workflowId });
    // Return response...
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ success: false, error: `Method ${req.method} not allowed` });
  }
}
```
- **Purpose:** This endpoint receives chat messages from the frontend, processes them using the rule engine, and returns actions/metadata or errors.

---

## 2. Frontend/Component Usage

**File:** `src/components/ChatbotWidget.tsx`

The `ChatBotWidget` React component (from `@jss-rule-engine/chat/client`) is used to render the chatbot UI.

**Example:**
```tsx
import { ChatBotWidget } from '@jss-rule-engine/chat/client';

const workflowId = process.env.CHAT_WORKFLOW_ID || '{C880D84B-A088-454C-9FB0-78236A81B573}';

const ChatbotWidget = () => (
  <ChatBotWidget
    welcomeMessage="Hi! I'm Peter, your friendly chatbot, and ready to answer any of your questions."
    flowId={workflowId}
    title="Peter The Bot"
    iconUrl="/chatbotify/icons8-sitecore.svg"
  />
);

export default ChatbotWidget;
```
- **Props:**
  - `welcomeMessage`: Initial message shown to the user.
  - `flowId`: The workflow or rule engine ID to use.
  - `title`: Title for the chatbot window.
  - `iconUrl`: URL for the chatbot icon.

---

## 3. Integration

You can add the chatbot widget to your layout or any page/component. For example, in `src/Layout.tsx`:

```tsx
// import ChatbotWidget from 'src/components/ChatbotWidget';
// ...
<ChatbotWidget />
```
*(Uncomment and place where you want the chatbot to appear.)*

---

## 4. API Route

The frontend widget communicates with the `/api/chat/message` endpoint, which you must ensure is available and correctly configured.

---

## 5. Environment Variables

- `CHAT_WORKFLOW_ID`: (Optional) Set this in your environment to specify the workflow/rule engine for the chatbot.

---

## Summary

- **Backend:** Use `handleChatMessage` in your API route to process chat messages.
- **Frontend:** Use `ChatBotWidget` to render the chat UI.
- **Integration:** Place the widget in your layout or page, and ensure the API route is available. 