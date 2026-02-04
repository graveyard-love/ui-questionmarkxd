import { NextRequest, NextResponse } from "next/server";

const API_URL = "https://diwness.cloud/v1/chat/completions";

export async function POST(request: NextRequest) {
  try {
    const {
      messages,
      model,
      systemPrompt,
      customInstructions,
      temperature,
      maxTokens,
      enableCodeExecution,
      enableFileEditing,
      memoryEnabled,
      useSnakeCase = true,
      noComments = true,
    } = await request.json();

    let systemContent = systemPrompt || "You are a helpful AI assistant.";

    const codeRules: string[] = [];
    if (useSnakeCase) {
      codeRules.push("use snake_case for all variable and function names");
    }
    if (noComments) {
      codeRules.push("do not include any comments in code");
    }
    if (codeRules.length > 0) {
      systemContent += `\n\nCode generation rules: ${codeRules.join("; ")}.`;
    }

    if (customInstructions) {
      systemContent += `\n\nUser's custom instructions:\n${customInstructions}`;
    }

    if (enableCodeExecution) {
      systemContent +=
        "\n\nYou can suggest code snippets. When providing code, use markdown code blocks with the language specified.";
    }

    if (enableFileEditing) {
      systemContent +=
        "\n\nYou can suggest file modifications. When suggesting file changes, clearly indicate the file path and the changes to make.";
    }

    // Build messages array with memory context
    const apiMessages = [];

    // Add system message
    apiMessages.push({
      role: "system",
      content: systemContent,
    });

    // If memory is enabled, include previous messages as context
    if (memoryEnabled && messages.length > 1) {
      // Add a context message summarizing the conversation
      const previousMessages = messages.slice(0, -1);
      if (previousMessages.length > 0) {
        const contextSummary = previousMessages
          .map(
            (m: { role: string; content: string }) =>
              `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`
          )
          .join("\n\n");

        apiMessages.push({
          role: "user",
          content: `[CONTEXT FROM PREVIOUS MESSAGES - Use this for continuity]\n\n${contextSummary}\n\n[END OF CONTEXT]`,
        });

        apiMessages.push({
          role: "assistant",
          content:
            "I understand the context from our previous conversation. I'll continue from where we left off.",
        });
      }
    }

    // Add the current message
    const lastMessage = messages[messages.length - 1];
    apiMessages.push(lastMessage);

    const payload = {
      model: model || "claude-sonnet-4-20250514",
      messages: apiMessages,
      temperature: temperature ?? 0.7,
      max_tokens: maxTokens ?? 4000,
      stream: false,
    };

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `API Error ${response.status}: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message.content;

    return NextResponse.json({ content: assistantMessage });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
