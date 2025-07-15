# Using `@jss-rule-engine/workflow` in a Next.js App

## Overview

The `@jss-rule-engine/workflow` package provides workflow automation, database utilities, and integration points for Sitecore JSS Next.js applications. It is used for:
- Running workflows in response to API requests.
- Initializing and managing workflow-related databases.
- Handling scheduled tasks and Sitecore publish events.

---

## 1. Database Initialization

**File:** `scripts/init-workflow-db.ts`

This script initializes the workflow database using environment variables.

**Example:**
```ts
import { DatabaseService, getDatabaseServiceOptions } from '@jss-rule-engine/workflow';
import * as dotenv from 'dotenv';

dotenv.config({ override: true }); // Load environment variables

const dbServiceOptions = getDatabaseServiceOptions(process.env);
const databaseService = new DatabaseService(dbServiceOptions);

databaseService.init().then(() => {
  console.log('Database initialized successfully');
}).catch((error) => {
  console.error('Error initializing database:', error);
});
```
- **Purpose:** Run this script to set up the workflow database before using workflow features.

---

## 2. Running Workflows via API

**File:** `src/pages/api/contact/submit.ts`

This API route uses `handleWorkflowRun` to process workflow logic for contact form submissions.

**Example:**
```ts
import { handleWorkflowRun } from '@jss-rule-engine/workflow';

const runResult = await handleWorkflowRun({
  message,
  visitorId,
  workflowId
});
```
- **Purpose:** Processes a workflow run and returns the result to the client.

---

## 3. Handling Sitecore Publish Events

**File:** `src/pages/api/sitecore/publish.ts`

This API route uses `ragItemsIndexingHandler` to handle Sitecore publish webhooks and trigger indexing.

**Example:**
```ts
import { ragItemsIndexingHandler } from '@jss-rule-engine/workflow';

const runResult = await ragItemsIndexingHandler({ itemId: rootItemId });
```
- **Purpose:** Responds to Sitecore publish events and triggers workflow-based indexing.

---

## 4. Scheduled Tasks

**File:** `src/pages/api/schedule/run.ts`

This API route uses `handleScheduledTasks` to execute scheduled workflow tasks.

**Example:**
```ts
import { handleScheduledTasks } from '@jss-rule-engine/workflow';

const runResult = await handleScheduledTasks();
```
- **Purpose:** Runs scheduled tasks and returns execution results.

---

## 5. Environment Variables

- The workflow database and handlers rely on environment variables for configuration (e.g., database connection strings, secrets).

---

## Summary

- **Database:** Use `DatabaseService` and `getDatabaseServiceOptions` to initialize and manage workflow databases.
- **API Workflows:** Use `handleWorkflowRun` to process workflow logic in API routes.
- **Sitecore Events:** Use `ragItemsIndexingHandler` to respond to Sitecore publish webhooks.
- **Scheduled Tasks:** Use `handleScheduledTasks` to run scheduled jobs. 