"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RippleButton } from "@/components/ui/ripple-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Palette, Settings, Zap } from "lucide-react";

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

const DEFAULT_SETTINGS: ChatSettings = {
  systemPrompt: "You are a helpful AI assistant. Be concise, friendly, and informative.",
  temperature: 0.7,
  maxTokens: 4000,
  enableCodeExecution: true,
  enableFileEditing: true,
  memoryEnabled: true,
  customInstructions: "",
  useSnakeCase: true,
  noComments: true,
};

const STORAGE_KEY = "chatbot-settings";

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<ChatSettings>(DEFAULT_SETTINGS);
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load settings:", e);
    }

    // Load theme
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | "system" || "system";
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (newTheme: "light" | "dark" | "system") => {
    const root = document.documentElement;
    if (newTheme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.classList.toggle("dark", systemTheme === "dark");
    } else {
      root.classList.toggle("dark", newTheme === "dark");
    }
    localStorage.setItem("theme", newTheme);
  };

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  const handleSave = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      router.push("/");
    } catch (e) {
      console.error("Failed to save settings:", e);
    }
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <RippleButton
            variant="ghost"
            size="icon"
            onClick={() => router.push("/")}
            className="rounded-lg"
          >
            <ArrowLeft className="h-5 w-5" />
          </RippleButton>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground">Customize your Claude AI experience</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Theme Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance
              </CardTitle>
              <CardDescription>Customize the look and feel of the application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select value={theme} onValueChange={handleThemeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* AI Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                AI Configuration
              </CardTitle>
              <CardDescription>Configure how Claude responds to your messages</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="systemPrompt">System Prompt</Label>
                <Textarea
                  id="systemPrompt"
                  value={settings.systemPrompt}
                  onChange={(e) => setSettings(prev => ({ ...prev, systemPrompt: e.target.value }))}
                  placeholder="Enter system prompt..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customInstructions">Custom Instructions</Label>
                <Textarea
                  id="customInstructions"
                  value={settings.customInstructions}
                  onChange={(e) => setSettings(prev => ({ ...prev, customInstructions: e.target.value }))}
                  placeholder="Additional instructions for Claude..."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Temperature: {settings.temperature}</Label>
                  <Slider
                    value={[settings.temperature]}
                    onValueChange={([value]) => setSettings(prev => ({ ...prev, temperature: value }))}
                    max={2}
                    min={0}
                    step={0.1}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Controls randomness. Lower = more focused, Higher = more creative
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Max Tokens: {settings.maxTokens}</Label>
                  <Slider
                    value={[settings.maxTokens]}
                    onValueChange={([value]) => setSettings(prev => ({ ...prev, maxTokens: value }))}
                    max={8000}
                    min={100}
                    step={100}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum response length
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Advanced Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Advanced Features
              </CardTitle>
              <CardDescription>Enable or disable advanced AI capabilities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Code Execution</Label>
                  <p className="text-xs text-muted-foreground">
                    Allow Claude to execute code snippets
                  </p>
                </div>
                <Switch
                  checked={settings.enableCodeExecution}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableCodeExecution: checked }))}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>File Editing</Label>
                  <p className="text-xs text-muted-foreground">
                    Allow Claude to suggest file modifications
                  </p>
                </div>
                <Switch
                  checked={settings.enableFileEditing}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableFileEditing: checked }))}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Memory</Label>
                  <p className="text-xs text-muted-foreground">
                    Maintain conversation context across sessions
                  </p>
                </div>
                <Switch
                  checked={settings.memoryEnabled}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, memoryEnabled: checked }))}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Snake Case</Label>
                  <p className="text-xs text-muted-foreground">
                    Use snake_case for variable names
                  </p>
                </div>
                <Switch
                  checked={settings.useSnakeCase}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, useSnakeCase: checked }))}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>No Comments</Label>
                  <p className="text-xs text-muted-foreground">
                    Generate code without comments
                  </p>
                </div>
                <Switch
                  checked={settings.noComments}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, noComments: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <RippleButton onClick={handleSave} className="flex-1">
              Save Settings
            </RippleButton>
            <RippleButton variant="outline" onClick={handleReset}>
              Reset to Defaults
            </RippleButton>
          </div>
        </div>
      </div>
    </div>
  );
}
