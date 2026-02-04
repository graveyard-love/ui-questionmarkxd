"use client";

import { cn } from "@/lib/utils";
import { Bot, User, Copy, Check, Code } from "lucide-react";
import { useState } from "react";
import { RippleButton } from "@/components/ui/ripple-button";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
  };

  return (
    <div
      className={cn(
        "group flex gap-3 p-3 rounded-lg message-animate transition-all duration-200",
        role === "user" ? "justify-start" : "justify-end"
      )}
    >
      <div
        className={cn(
          "flex gap-3 max-w-[80%]",
          role === "user" ? "flex-row" : "flex-row-reverse"
        )}
      >
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
            role === "user"
              ? "bg-muted text-foreground"
              : "bg-primary text-primary-foreground"
          )}
        >
          {role === "user" ? (
            <User className="h-4 w-4" />
          ) : (
            <Bot className="h-4 w-4" />
          )}
        </div>
        <div
          className={cn(
            "flex-1 space-y-1.5 overflow-hidden min-w-0 p-3 rounded-lg",
            role === "user" ? "bg-muted/40" : "glass border border-border/30"
          )}
        >
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">
            {role === "user" ? "You" : "Claude"}
          </p>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <RippleButton
              variant="ghost"
              size="icon"
              onClick={copyToClipboard}
              className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-primary" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </RippleButton>
          </div>
        </div>
        <div className="prose prose-sm max-w-none text-foreground prose-headings:text-foreground prose-p:text-foreground/90 prose-strong:text-foreground prose-code:text-foreground prose-pre:bg-transparent prose-pre:p-0">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || "");
                const codeContent = String(children).replace(/\n$/, "");
                const isInline = !match && !String(children).includes("\n");

                if (isInline) {
                  return (
                    <code
                      className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                }

                const language = match ? match[1] : "text";

                return (
                  <div className="my-2 rounded-xl overflow-hidden border border-border/50">
                    <div className="flex items-center justify-between px-3 py-1.5 bg-muted/50 border-b border-border/50">
                      <div className="flex items-center gap-2">
                        <Code className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs font-mono text-muted-foreground">
                          {language}
                        </span>
                      </div>
                      <RippleButton
                        variant="ghost"
                        size="sm"
                        onClick={() => copyCode(codeContent)}
                        className="h-6 px-2 text-xs rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </RippleButton>
                    </div>
                    <SyntaxHighlighter
                      style={oneDark}
                      language={language}
                      PreTag="div"
                      customStyle={{
                        margin: 0,
                        borderRadius: 0,
                        fontSize: "0.75rem",
                        padding: "0.75rem",
                      }}
                      codeTagProps={{
                        style: {
                          fontFamily: "var(--font-mono), ui-monospace, monospace",
                        },
                      }}
                    >
                      {codeContent}
                    </SyntaxHighlighter>
                  </div>
                );
              },
              p({ children }) {
                return (
              <p className="text-sm text-foreground/90 leading-relaxed mb-2 last:mb-0 [&>code]:rounded-md">
                    {children}
                  </p>
                );
              },
              ul({ children }) {
                return <ul className="list-disc pl-4 my-2 space-y-1">{children}</ul>;
              },
              ol({ children }) {
                return <ol className="list-decimal pl-4 my-2 space-y-1">{children}</ol>;
              },
              li({ children }) {
                return <li className="text-sm text-foreground/90">{children}</li>;
              },
              h1({ children }) {
                return <h1 className="text-lg font-semibold mt-3 mb-2">{children}</h1>;
              },
              h2({ children }) {
                return <h2 className="text-base font-semibold mt-3 mb-2">{children}</h2>;
              },
              h3({ children }) {
                return <h3 className="text-sm font-semibold mt-2 mb-1">{children}</h3>;
              },
              blockquote({ children }) {
                return (
                  <blockquote className="border-l-2 border-primary/50 pl-3 my-2 text-muted-foreground italic">
                    {children}
                  </blockquote>
                );
              },
              a({ children, href }) {
                return (
                  <a
                    href={href}
                    className="text-primary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                  </a>
                );
              },
              table({ children }) {
                return (
                  <div className="overflow-x-auto my-2">
              <table className="min-w-full border border-border/50 rounded-xl overflow-hidden">
                      {children}
                    </table>
                  </div>
                );
              },
              th({ children }) {
                return (
                  <th className="px-3 py-1.5 bg-muted/50 text-left text-xs font-medium border-b border-border/50">
                    {children}
                  </th>
                );
              },
              td({ children }) {
                return (
                  <td className="px-3 py-1.5 text-sm border-b border-border/50">
                    {children}
                  </td>
                );
              },
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
        </div>
      </div>
    </div>
  );
}
