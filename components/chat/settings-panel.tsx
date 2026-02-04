"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { RippleButton } from "@/components/ui/ripple-button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomSlider } from "@/components/ui/custom-slider";
import { Switch } from "@/components/ui/switch";
import {
  X,
  Save,
  RotateCcw,
  Sparkles,
  Code,
  FileText,
  Zap,
} from "lucide-react";

export interface ChatSettings {
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

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ChatSettings;
  onSave: (settings: ChatSettings) => void;
}

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

const PRESET_PROMPTS = [
  {
    name: "Creative Writer",
    icon: Sparkles,
    prompt:
      "You are a creative writing assistant. Help users craft compelling stories, poems, and creative content. Be imaginative and inspiring.",
  },
  {
    name: "Code Expert",
    icon: Code,
    prompt:
      "You are an expert programmer. Help users write, debug, and optimize code. Explain concepts clearly and provide working examples.",
  },
  {
    name: "Document Helper",
    icon: FileText,
    prompt:
      "You are a document assistant. Help users write, edit, and improve documents. Focus on clarity, grammar, and effective communication.",
  },
  {
    name: "Quick Assistant",
    icon: Zap,
    prompt:
      "You are a fast, efficient assistant. Provide brief, direct answers. Skip unnecessary explanations unless asked for more detail.",
  },
];

export function SettingsPanel({
  isOpen,
  onClose,
  settings,
  onSave,
}: SettingsPanelProps) {
  const [localSettings, setLocalSettings] = useState<ChatSettings>(settings);

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  const handleReset = () => {
    setLocalSettings(DEFAULT_SETTINGS);
  };

  const applyPreset = (prompt: string) => {
    setLocalSettings((prev) => ({ ...prev, systemPrompt: prompt }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-xl max-h-[85vh] overflow-y-auto mx-4 rounded-xl glass border border-border/50 shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-border/50 glass rounded-t-xl">
          <h2 className="text-lg font-semibold text-foreground">Settings</h2>
          <RippleButton
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-lg hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </RippleButton>
        </div>

        <div className="p-4 space-y-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">System Instructions</Label>
              <RippleButton
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-xs text-muted-foreground rounded-md h-7 px-2"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset
              </RippleButton>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {PRESET_PROMPTS.map((preset) => (
                <RippleButton
                  key={preset.name}
                  variant="outline"
                  onClick={() => applyPreset(preset.prompt)}
                  className={cn(
                    "justify-start gap-2 rounded-lg h-auto py-2.5 px-3 border-border/50 bg-transparent text-foreground",
                    localSettings.systemPrompt === preset.prompt &&
                      "border-primary/50 bg-primary/5"
                  )}
                >
                  <preset.icon className="h-4 w-4 text-primary" />
                  <span className="text-sm">{preset.name}</span>
                </RippleButton>
              ))}
            </div>

            <Textarea
              value={localSettings.systemPrompt}
              onChange={(e) =>
                setLocalSettings((prev) => ({
                  ...prev,
                  systemPrompt: e.target.value,
                }))
              }
              placeholder="Enter system instructions for the AI..."
              className="min-h-[100px] rounded-lg bg-input/50 border-border/50 resize-none text-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Custom Instructions</Label>
            <p className="text-xs text-muted-foreground">
              Additional context about yourself or how you want responses formatted.
            </p>
            <Textarea
              value={localSettings.customInstructions}
              onChange={(e) =>
                setLocalSettings((prev) => ({
                  ...prev,
                  customInstructions: e.target.value,
                }))
              }
              placeholder="e.g., I'm a software developer working with React..."
              className="min-h-[80px] rounded-lg bg-input/50 border-border/50 resize-none text-foreground"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Temperature</Label>
              <span className="text-sm text-muted-foreground font-mono">
                {localSettings.temperature.toFixed(1)}
              </span>
            </div>
            <CustomSlider
              value={[localSettings.temperature]}
              onValueChange={([value]) =>
                setLocalSettings((prev) => ({ ...prev, temperature: value }))
              }
              min={0}
              max={1}
              step={0.1}
            />
            <p className="text-xs text-muted-foreground">
              Lower = more focused, Higher = more creative
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Max Response Length</Label>
            <Input
              type="number"
              value={localSettings.maxTokens}
              onChange={(e) =>
                setLocalSettings((prev) => ({
                  ...prev,
                  maxTokens: parseInt(e.target.value) || 4000,
                }))
              }
              min={100}
              max={16000}
              className="rounded-lg bg-input/50 border-border/50 text-foreground"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Code Generation</Label>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div>
                  <p className="text-sm font-medium text-foreground">Use snake_case</p>
                  <p className="text-xs text-muted-foreground">
                    Variable and function names use snake_case
                  </p>
                </div>
                <Switch
                  checked={localSettings.useSnakeCase}
                  onCheckedChange={(checked) =>
                    setLocalSettings((prev) => ({
                      ...prev,
                      useSnakeCase: checked,
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div>
                  <p className="text-sm font-medium text-foreground">No Comments</p>
                  <p className="text-xs text-muted-foreground">
                    Generated code will not include comments
                  </p>
                </div>
                <Switch
                  checked={localSettings.noComments}
                  onCheckedChange={(checked) =>
                    setLocalSettings((prev) => ({
                      ...prev,
                      noComments: checked,
                    }))
                  }
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Features</Label>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div>
                  <p className="text-sm font-medium text-foreground">Code Execution</p>
                  <p className="text-xs text-muted-foreground">
                    Allow AI to suggest runnable code snippets
                  </p>
                </div>
                <Switch
                  checked={localSettings.enableCodeExecution}
                  onCheckedChange={(checked) =>
                    setLocalSettings((prev) => ({
                      ...prev,
                      enableCodeExecution: checked,
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div>
                  <p className="text-sm font-medium text-foreground">File Editing</p>
                  <p className="text-xs text-muted-foreground">
                    Enable AI to suggest file modifications
                  </p>
                </div>
                <Switch
                  checked={localSettings.enableFileEditing}
                  onCheckedChange={(checked) =>
                    setLocalSettings((prev) => ({
                      ...prev,
                      enableFileEditing: checked,
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div>
                  <p className="text-sm font-medium text-foreground">Conversation Memory</p>
                  <p className="text-xs text-muted-foreground">
                    Include previous messages as context
                  </p>
                </div>
                <Switch
                  checked={localSettings.memoryEnabled}
                  onCheckedChange={(checked) =>
                    setLocalSettings((prev) => ({
                      ...prev,
                      memoryEnabled: checked,
                    }))
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 flex items-center justify-end gap-2 p-4 border-t border-border/50 glass rounded-b-xl">
          <RippleButton
            variant="outline"
            onClick={onClose}
            className="rounded-lg border-border/50 bg-transparent text-foreground"
          >
            Cancel
          </RippleButton>
          <RippleButton
            onClick={handleSave}
            className="rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </RippleButton>
        </div>
      </div>
    </div>
  );
}
