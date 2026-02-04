"use client";

import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, Zap, Rocket, Star } from "lucide-react";

const MODELS = [
  {
    id: "claude-opus-4-5-20251101",
    name: "Claude Opus 4.5",
    description: "Most capable",
    icon: Star,
    color: "text-amber-500",
  },
  {
    id: "claude-sonnet-4-5-20250929",
    name: "Claude Sonnet 4.5",
    description: "Balanced",
    icon: Sparkles,
    color: "text-primary",
  },
  {
    id: "claude-sonnet-4-20250514",
    name: "Claude Sonnet 4",
    description: "Fast & capable",
    icon: Zap,
    color: "text-blue-500",
  },
  {
    id: "claude-3-7-sonnet-20250219",
    name: "Claude 3.7 Sonnet",
    description: "Previous gen",
    icon: Rocket,
    color: "text-muted-foreground",
  },
];

interface ModelSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

export function ModelSelector({
  value,
  onValueChange,
  disabled,
}: ModelSelectorProps) {
  const selectedModel = MODELS.find((m) => m.id === value);
  const SelectedIcon = selectedModel?.icon || Zap;

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger
        className={cn(
          "w-[200px] rounded-lg border-border/50 bg-input/50 backdrop-blur-sm",
          "hover:bg-muted transition-all duration-200"
        )}
      >
        <div className="flex items-center gap-2">
          <SelectedIcon className={cn("h-4 w-4", selectedModel?.color)} />
          <SelectValue>
            {selectedModel?.name || "Select model"}
          </SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent className="rounded-lg border-border/50 glass">
        {MODELS.map((model) => {
          const Icon = model.icon;
          return (
            <SelectItem
              key={model.id}
              value={model.id}
              className="rounded-md focus:bg-muted cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Icon className={cn("h-4 w-4", model.color)} />
                <div className="flex flex-col">
                  <span className="font-medium">{model.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {model.description}
                  </span>
                </div>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
