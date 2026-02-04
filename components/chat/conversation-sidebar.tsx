"use client";

import { cn } from "@/lib/utils";
import { RippleButton } from "@/components/ui/ripple-button";
import {
  Plus,
  MessageSquare,
  Settings,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
}

interface ConversationSidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onOpenSettings: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function ConversationSidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  onOpenSettings,
  isCollapsed,
  onToggleCollapse,
}: ConversationSidebarProps) {
  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div
      className={cn(
        "h-full flex flex-col glass border-r border-border/50 transition-all duration-300",
        isCollapsed ? "w-16" : "w-72"
      )}
    >
      {/* Header */}
      <div className="p-3 flex items-center justify-between border-b border-border/50">
        {!isCollapsed && (
          <h2 className="text-sm font-semibold text-foreground">Conversations</h2>
        )}
        <RippleButton
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="h-8 w-8 rounded-lg hover:bg-muted"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </RippleButton>
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <RippleButton
          onClick={onNew}
          className={cn(
            "w-full rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground gap-2",
            isCollapsed && "px-0"
          )}
        >
          <Plus className="h-4 w-4" />
          {!isCollapsed && <span>New Chat</span>}
        </RippleButton>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1">
        {conversations.map((conv) => (
          <div
            key={conv.id}
            className={cn(
              "group relative rounded-lg transition-all duration-200",
              activeId === conv.id
                ? "bg-muted/80"
                : "hover:bg-muted/40"
            )}
          >
            <button
              onClick={() => onSelect(conv.id)}
              className={cn(
                "w-full text-left p-2.5 rounded-lg",
                isCollapsed && "flex justify-center"
              )}
            >
              {isCollapsed ? (
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              ) : (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground truncate pr-6">
                    {conv.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {conv.lastMessage}
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    {formatDate(conv.timestamp)}
                  </p>
                </div>
              )}
            </button>
            {!isCollapsed && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(conv.id);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Settings */}
      <div className="p-3 border-t border-border/50">
        <RippleButton
          variant="ghost"
          onClick={onOpenSettings}
          className={cn(
            "w-full rounded-lg justify-start gap-2 text-muted-foreground hover:text-foreground hover:bg-muted",
            isCollapsed && "justify-center px-0"
          )}
        >
          <Settings className="h-4 w-4" />
          {!isCollapsed && <span>Settings</span>}
        </RippleButton>
      </div>
    </div>
  );
}
