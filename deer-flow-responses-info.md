# DeerFlow Streaming Event Structures & UI Presentation Guide

This report describes the various Server‑Sent Events (SSE) / WebSocket event types emitted by the DeerFlow back‑end during streaming and explains how each should be interpreted and rendered on the front‑end. The aim is to help the locable.dev implementation handle these event structures as gracefully as the official DeerFlow UI.

## 1. Core event definitions

In the launch‑lens‑insights repository (src/types/chat.ts), the event type ChatEvent is defined as a discriminated union. Each event carries an event name and a data object. A more detailed StreamEvent type in src/utils/mergeMessage.ts includes additional events used by the official DeerFlow merge logic. Below is an overview of all currently supported event names, along with their associated data structures and meaning.

| Event name | Data schema | Meaning | Presentation in DeerFlow UI |
|------------|-------------|---------|------------------------------|
| message_chunk | MessageChunkData: { content: string, role?: 'assistant', agent?: string } | A partial chunk of assistant response text. Multiple chunks form the full assistant reply. The optional role allows changing from assistant to another agent (e.g., planner or reporter) during the stream. | Append the content text to the current assistant message in the chat window. If role changes, update the message role accordingly. Keep displaying the message as streaming until a done or interrupt event arrives. |
| tool_call | ToolCallData: { id: string, name: string, args: object } | Indicates that the model is invoking a tool (search, code execution, retrieval, etc.). id uniquely identifies this tool invocation; name specifies which tool/function; args contains argument values. | In DeerFlow, tool calls generate a planner step. Display a step such as "Using tool: <name>" in the reasoning panel or as an entry in the "Deep thinking" section. Add a placeholder entry to the current message's toolCalls array so that subsequent tool_call_chunk or tool_call_result events can update it. |
| tool_call_chunk | Partial tool call info: { id: string, name?: string, args?: string, index?: number } | Some back‑ends send tool call arguments in chunks. args is a string fragment of JSON representing the tool arguments. Chunks must be concatenated and parsed to reconstruct the full args object. | Use the mergeMessage helper to accumulate argsChunks in the matching tool call, then try to parse the concatenated string into JSON. Update the tool call entry accordingly. Do not display chunks directly to users. |
| tool_call_result | { id: string, result: any, error?: string } | Indicates that the tool execution completed. result contains the tool output; error holds an error message if the tool failed. | Update the corresponding tool call in the message (toolCalls array) by storing result and error. In DeerFlow, tool results often appear as part of the research panel (e.g., web search results, code outputs) or update the conversation automatically. A success result might trigger new message_chunk events with the tool output. |
| thinking | { phase: string, content: string } | Used by agents to emit high‑level phases like planning, executing, etc. The content often contains natural‑language descriptions of what the agent is thinking. | Show the content in a "Deep thinking" collapsible section above the planner's final answer. In the DeerFlow UI, a "Deep thinking" badge appears on planner messages to let users expand and view internal reasoning. |
| reasoning | { step: string, content: string } | Represents a reasoning step in the planner's workflow. step may be an identifier (e.g., "step 1"), and content contains the reasoning text. | Add each reasoning step to a list in the planner message's collapsible section. Steps are usually numbered and can be displayed with checkmarks once completed. This helps users follow the multi‑step planning process. |
| search | SearchData: { query: string, results?: any[] } | Signals that the system is performing a web search. query is the search string; results may include an array of initial search results. | Log the query in the research panel's activity timeline (e.g., 🔍 Searching: {query}). If results are provided, list them as clickable links in the research panel or automatically attach them to the chat for context. |
| visit | Not explicitly defined in chat.ts but handled in useDeerStreaming as part of search events. | Represents a web visit to a specific URL. Data includes url and possibly title or content. | In DeerFlow, visits are listed under the research activities with a link icon and show the visited URL. The UI may allow users to open the page in a new tab. |
| done | Data is {} | Marks the end of a message's streaming sequence. No more message_chunk events will follow. | Finalize the current message: set isStreaming to false, mark the message as complete (finishReason = completed), and remove any loading indicators. |
| interrupt | Data is {} (defined in StreamEvent only) | Indicates that the generation was interrupted, either by the user or due to an error/time‑out. | Stop streaming, mark the message with finishReason = 'interrupt', and display a notice (e.g., "Generation interrupted."). The UI may allow the user to resume or revise the plan. |
| error | { error: string } | An error occurred during streaming. error contains a description. | Display an error message appended to the current message (e.g., as italic red text), mark the message as complete, and optionally provide a retry option. |

## Other event names from DeerFlow prototypes

In some branches of DeerFlow, additional event names may appear:

- **visit**: handled like search but emphasises visiting a URL rather than searching.
- **writing_report**: indicates that the reporter agent is generating the final report. The UI can show a progress bar or status badge ("Generating report…").
- **report / report_generated**: emitted when the report is complete. The reporter message appears in the chat and the Report tab of the research panel displays the formatted report with citations and editing tools.
- **podcast**: may appear once a podcast is generated. The UI attaches an audio player allowing playback.

These event names follow the same event / data structure and should be presented consistently.

## 2. How DeerFlow merges events into messages

The helper mergeMessage (in src/utils/mergeMessage.ts) demonstrates how the official DeerFlow UI builds a coherent message from streaming events:

1. Initialize a partial message when the first event arrives with default fields (role: 'assistant', empty content, empty toolCalls, etc.).
2. For message_chunk events, append content to the existing content and update the role or metadata.agent if provided.
3. For tool_call events, create or update a toolCall entry in toolCalls with the id, name and args.
4. For tool_call_chunk events, accumulate args fragments into an argsChunks array and attempt to parse them into a complete JSON args object.
5. For tool_call_result events, update the matching tool call with its result or error.
6. For interrupt, done and error events, update finishReason and isStreaming accordingly.

Finally, finalizeMessage (same module) converts a partial message into a fully fledged message with an id, timestamp and metadata. Implementing similar logic in your front‑end ensures that complex event sequences are merged correctly.

## 3. Presentation guidelines for each event type

To achieve a DeerFlow‑like experience in your UI:

- **Streamed assistant replies**: As message_chunk events arrive, update the displayed text in real‑time. Use a typing indicator or animate the text to simulate continuous generation. Mark the message as streaming until a done or interrupt event arrives.

- **Planner reasoning & thinking**: Collate thinking and reasoning events into a collapsible section labelled "Deep thinking" in planner messages. Display each reasoning step with bullet points or numbered items. Provide controls for users to accept the plan or request revisions. In DeerFlow, a planner message shows a step list, accepts feedback and can be accepted or revised.

- **Tool calls and tool results**: When a tool_call event is received, add a line such as "Using tool: <name>" to the planner's reasoning list. Keep track of the tool call so that tool_call_chunk and tool_call_result events can update it. Once a tool_call_result arrives, display the result in the research panel (e.g., show search results, Python code output or document retrieval results) or attach it as an inline message.

- **Search and visit events**: Create a research activities sidebar or panel. For each search or visit event, append an entry with the query or URL. Display an icon indicating the type (e.g., magnifying glass for search, link icon for visit). When results or page content become available (via tool results), provide an expandable view showing the contents with citations.

- **Report generation**: If your back‑end emits events like writing_report and report, reflect this in the UI by showing a status badge ("Generating report…") and, when finished, display the report in a dedicated tab. Use a rich‑text editor for editing and provide buttons to copy, download or convert the report into a podcast or PPT.

- **Podcast creation**: When the podcast event occurs (or after calling /api/podcast/generate), attach an audio player to the reporter message. Provide playback controls and download options.

- **Error and interruption**: If an error event is received, show an error alert in the chat and allow users to retry. For an interrupt event, indicate that the generation was aborted and let the user resume or revise the plan.

## 4. Handling unknown or future events

The DeerFlow back‑end may evolve and introduce new event types. The current implementation uses a default handler in useDeerStreaming that treats unknown events as plain content. It appends the unparsed data to the final answer or reasoning state and logs a warning. You should implement similar fallback logic:

```typescript
switch (eventName) {
  // known cases ...
  default: {
    console.warn('Unknown event:', eventName, data);
    // Append to current message or reasoning
    updateCurrentContent(parsedData.content || JSON.stringify(parsedData));
    break;
  }
}
```

This ensures robustness against unrecognized events while still displaying the underlying text to the user.

## 5. Summary

Handling DeerFlow's streaming events correctly is essential to replicating the polished experience of the official DeerFlow front‑end. The key points are:

1. Understand the event names and their data structures—especially message_chunk, tool_call, tool_call_chunk, tool_call_result, thinking, reasoning, search, visit, done, interrupt and error.

2. Merge events into coherent messages using logic similar to the mergeMessage helper, handling tool call chunks and results appropriately.

3. Render each event type in context: stream assistant replies in real‑time, list planner reasoning steps, show tool call statuses, log search/visit actions, and finalize messages on completion.

4. Provide fallbacks for unknown events and display error messages gracefully.