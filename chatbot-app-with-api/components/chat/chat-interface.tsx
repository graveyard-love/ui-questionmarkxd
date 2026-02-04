"use client";

import React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { ChatMessage } from "./chat-message";
import { ModelSelector } from "./model-selector";
import {
  ConversationSidebar,
  type Conversation,
} from "./conversation-sidebar";
import { RippleButton } from "@/components/ui/ripple-button";
import {
  Send,
  Loader2,
  Bot,
  Menu,
  Paperclip,
  Settings,
  MessageSquare,
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatSettings {
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  enableCodeExecution: boolean;
  enableFileEditing: boolean;
  memoryEnabled: boolean;
  customInstructions: string;
  useSnakeCase: boolean;
  noComments: boolean;
}

interface StoredConversation extends Conversation {
  messages: Message[];
}

const STORAGE_KEY = "chatbot-conversations";

const DEFAULT_SETTINGS: ChatSettings = {
  systemPrompt:
    "You are a helpful AI assistant. Be concise, friendly, and informative.",
  temperature: 0.7,
  maxTokens: 4000,
  enableCodeExecution: true,
  enableFileEditing: true,
  memoryEnabled: true,
  customInstructions: "",
  useSnakeCase: true,
  noComments: true,
};

const WELCOME_SUGGESTIONS = [
  { text: "Help me write code", icon: "code" },
  { text: "Explain a concept", icon: "lightbulb" },
  { text: "Create a document", icon: "file" },
  { text: "Brainstorm ideas", icon: "sparkles" },
];

export function ChatInterface() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState("claude-sonnet-4-20250514");
  const [settings, setSettings] = useState<ChatSettings>(DEFAULT_SETTINGS);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    null
  );
  const [conversationMessages, setConversationMessages] = useState<Record<string, Message[]>>({});
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load conversations from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: StoredConversation[] = JSON.parse(stored);
        const convs: Conversation[] = parsed.map(({ messages: _, ...conv }) => ({
          ...conv,
          timestamp: new Date(conv.timestamp),
        }));
        const msgMap: Record<string, Message[]> = {};
        parsed.forEach((conv) => {
          msgMap[conv.id] = conv.messages || [];
        });
        setConversations(convs);
        setConversationMessages(msgMap);
      }
    } catch (e) {
      console.error("Failed to load conversations from localStorage:", e);
    }
  }, []);

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    try {
      const toStore: StoredConversation[] = conversations.map((conv) => ({
        ...conv,
        messages: conversationMessages[conv.id] || [],
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    } catch (e) {
      console.error("Failed to save conversations to localStorage:", e);
    }
  }, [conversations, conversationMessages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`;
    }
  }, [input]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0 && activeConversationId) {
      // Update conversation metadata
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === activeConversationId
            ? {
                ...conv,
                lastMessage: messages[messages.length - 1].content.slice(0, 50),
                timestamp: new Date(),
              }
            : conv
        )
      );
      // Persist messages for the active conversation
      setConversationMessages((prev) => ({
        ...prev,
        [activeConversationId]: messages,
      }));
    }
  }, [messages, activeConversationId]);

  const createNewConversation = useCallback(() => {
    const newId = Date.now().toString();
    const newConv: Conversation = {
      id: newId,
      title: "New Chat",
      lastMessage: "Start a conversation...",
      timestamp: new Date(),
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newId);
    setMessages([]);
    setInput("");
  }, []);

  const selectConversation = (id: string) => {
    setActiveConversationId(id);
    // Load messages for this conversation from storage
    setMessages(conversationMessages[id] || []);
    setMobileSidebarOpen(false);
  };

  const deleteConversation = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    // Also remove stored messages for this conversation
    setConversationMessages((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
    if (activeConversationId === id) {
      setActiveConversationId(null);
      setMessages([]);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!input.trim() && attachedFiles.length === 0) || isLoading) return;

    if (!activeConversationId) {
      const newId = Date.now().toString();
      const newConv: Conversation = {
        id: newId,
        title: input.slice(0, 30) + (input.length > 30 ? "..." : ""),
        lastMessage: input.slice(0, 50),
        timestamp: new Date(),
      };
      setConversations((prev) => [newConv, ...prev]);
      setActiveConversationId(newId);
    } else {
      if (messages.length === 0) {
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === activeConversationId
              ? {
                  ...conv,
                  title: input.slice(0, 30) + (input.length > 30 ? "..." : ""),
                }
              : conv
          )
        );
      }
    }

    // Process attached files
    let fileContents = "";
    for (const file of attachedFiles) {
      try {
        const content = await file.text();
        fileContents += `\n\n--- File: ${file.name} ---\n${content}`;
      } catch (error) {
        console.error(`Failed to read file ${file.name}:`, error);
        fileContents += `\n\n--- File: ${file.name} ---\n[Failed to read file content]`;
      }
    }

    const userMessage = input.trim(); // Display message without file contents
    const apiMessage = (input.trim() + fileContents).trim(); // API message with file contents
    setInput("");
    setAttachedFiles([]);
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: apiMessage }],
          model,
          systemPrompt: settings.systemPrompt,
          customInstructions: settings.customInstructions,
          temperature: settings.temperature,
          maxTokens: settings.maxTokens,
          enableCodeExecution: settings.enableCodeExecution,
          enableFileEditing: settings.enableFileEditing,
          memoryEnabled: settings.memoryEnabled,
          useSnakeCase: settings.useSnakeCase,
          noComments: settings.noComments,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.content },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `Error: ${data.error || "Something went wrong"}`,
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error: Failed to connect to the server" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    textareaRef.current?.focus();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachedFiles((prev) => [...prev, ...files]);
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const removeAttachedFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <div
        className={`fixed lg:relative z-50 lg:z-auto h-full transition-transform duration-300 lg:translate-x-0 ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <ConversationSidebar
          conversations={conversations}
          activeId={activeConversationId}
          onSelect={selectConversation}
          onNew={createNewConversation}
          onDelete={deleteConversation}
          onOpenSettings={() => router.push("/settings")}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between px-4 py-3 border-b border-border/50 glass">
          <div className="flex items-center gap-3">
            <RippleButton
              variant="ghost"
              size="icon"
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden rounded-lg"
            >
              <Menu className="h-5 w-5" />
            </RippleButton>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <h1 className="text-base font-semibold text-foreground">Claude AI</h1>
                <p className="text-xs text-muted-foreground">
                  powered by diwness api
                </p>
              </div>
            </div>
          </div>
          <ModelSelector
            value={model}
            onValueChange={setModel}
            disabled={isLoading}
          />
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-3">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 mb-5">
                  <Bot className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  How can I help you today?
                </h2>
                <p className="text-muted-foreground max-w-md mb-6 text-sm">
                  I can help you write code, explain concepts, create documents, or
                  just chat about anything.
                </p>

                <div className="grid grid-cols-2 gap-2 w-full max-w-md">
                  {WELCOME_SUGGESTIONS.map((suggestion, index) => (
                    <RippleButton
                      key={index}
                      variant="outline"
                      onClick={() => handleSuggestionClick(suggestion.text)}
                      className="h-auto py-3 px-3 rounded-lg border-border/50 hover:bg-muted/50 hover:border-primary/30 transition-all duration-200 flex flex-col items-start gap-1.5 text-left bg-transparent text-foreground"
                    >
                      <span className="text-sm font-medium">
                        {suggestion.text}
                      </span>
                    </RippleButton>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((message, index) => (
                  <ChatMessage key={index} {...message} />
                ))}
                {isLoading && (
                  <div className="flex gap-3 p-3 rounded-lg glass border border-border/30">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        <span className="h-2 w-2 rounded-full bg-primary/60 typing-dot" />
                        <span className="h-2 w-2 rounded-full bg-primary/60 typing-dot" />
                        <span className="h-2 w-2 rounded-full bg-primary/60 typing-dot" />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        Claude is thinking...
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="border-t border-border/50 glass p-4">
          {attachedFiles.length > 0 && (
            <div className="mx-auto max-w-3xl mb-4">
              <div className="flex flex-wrap gap-2">
                {attachedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg border border-border/50"
                  >
                    <Paperclip className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm text-foreground truncate max-w-[200px]">
                      {file.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeAttachedFile(index)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
            <div className="relative rounded-lg border border-border/50 bg-input/70 backdrop-blur-sm shadow-lg shadow-foreground/5 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-200">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message Claude..."
                disabled={isLoading}
                rows={1}
                className="min-h-[52px] max-h-[200px] resize-none border-0 bg-transparent px-4 py-3.5 pr-24 text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
              />

              <div className="absolute right-2 bottom-2 flex items-center gap-1">
                <RippleButton
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleAttachClick}
                  className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                  disabled={isLoading}
                >
                  <Paperclip className="h-4 w-4" />
                </RippleButton>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="image/*,text/*,.pdf,.doc,.docx,.txt,.js,.ts,.py,.html,.css,.json,.xml,.md"
                />
                <RippleButton
                  type="submit"
                  size="icon"
                  disabled={!input.trim() || isLoading}
                  className="h-8 w-8 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </RippleButton>
              </div>
            </div>

            <p className="text-xs text-muted-foreground text-center mt-2.5">
              Claude can make mistakes. Consider checking important information.
            </p>
          </form>
        </div>
      </div>


    </div>
  );
}
