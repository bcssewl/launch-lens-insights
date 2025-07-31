import { Settings } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DeerSettings } from "@/stores/deerFlowSettingsStore";
import type { Tab } from "./types";

const generalFormSchema = z.object({
  autoAcceptedPlan: z.boolean(),
  maxPlanIterations: z.number().min(1, {
    message: "Max plan iterations must be at least 1.",
  }),
  maxStepNum: z.number().min(1, {
    message: "Max step number must be at least 1.",
  }),
  maxSearchResults: z.number().min(1, {
    message: "Max search results must be at least 1.",
  }),
  // DeerFlow specific settings
  deepThinking: z.boolean(),
  backgroundInvestigation: z.boolean(),
  reportStyle: z.enum(["academic", "popular_science", "news", "social_media"]),
  language: z.enum(["en", "zh"]),
  theme: z.enum(["light", "dark", "system"]),
});

export const GeneralTab: Tab = ({
  settings,
  onChange,
}) => {
  const form = useForm<z.infer<typeof generalFormSchema>>({
    resolver: zodResolver(generalFormSchema),
    defaultValues: {
      autoAcceptedPlan: settings.autoAcceptedPlan,
      maxPlanIterations: settings.maxPlanIterations,
      maxStepNum: settings.maxStepNum,
      maxSearchResults: settings.maxSearchResults,
      deepThinking: settings.deepThinking,
      backgroundInvestigation: settings.backgroundInvestigation,
      reportStyle: settings.reportStyle,
      language: settings.language,
      theme: settings.theme,
    },
    mode: "all",
    reValidateMode: "onBlur",
  });

  const currentSettings = form.watch();
  
  useEffect(() => {
    let hasChanges = false;
    for (const key in currentSettings) {
      if (
        currentSettings[key as keyof typeof currentSettings] !==
        settings[key as keyof DeerSettings]
      ) {
        hasChanges = true;
        break;
      }
    }
    if (hasChanges) {
      onChange(currentSettings);
    }
  }, [currentSettings, onChange, settings]);

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="text-lg font-medium">General Settings</h1>
        <p className="text-sm text-muted-foreground">
          Configure core research and interface preferences
        </p>
      </header>
      <main>
        <Form {...form}>
          <form className="space-y-6">
            {/* Research Behavior */}
            <div className="space-y-4">
              <h3 className="text-base font-medium">Research Behavior</h3>
              
              <FormField
                control={form.control}
                name="autoAcceptedPlan"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Switch
                          id="autoAcceptedPlan"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <Label className="text-sm" htmlFor="autoAcceptedPlan">
                          Auto-accept research plans
                        </Label>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Automatically proceed with research plans without waiting for confirmation
                    </FormDescription>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deepThinking"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Switch
                          id="deepThinking"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <Label className="text-sm" htmlFor="deepThinking">
                          Enable deep thinking mode
                        </Label>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Use enhanced reasoning for more thorough analysis
                    </FormDescription>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="backgroundInvestigation"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Switch
                          id="backgroundInvestigation"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <Label className="text-sm" htmlFor="backgroundInvestigation">
                          Background investigation
                        </Label>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Perform additional background research for comprehensive coverage
                    </FormDescription>
                  </FormItem>
                )}
              />
            </div>

            {/* Research Limits */}
            <div className="space-y-4">
              <h3 className="text-base font-medium">Research Limits</h3>
              
              <FormField
                control={form.control}
                name="maxPlanIterations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max plan iterations</FormLabel>
                    <FormControl>
                      <Input
                        className="w-60"
                        type="number"
                        value={field.value}
                        min={1}
                        max={10}
                        onChange={(event) =>
                          field.onChange(parseInt(event.target.value || "1"))
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Maximum number of plan refinement iterations
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxStepNum"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max steps per plan</FormLabel>
                    <FormControl>
                      <Input
                        className="w-60"
                        type="number"
                        value={field.value}
                        min={1}
                        max={20}
                        onChange={(event) =>
                          field.onChange(parseInt(event.target.value || "1"))
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Maximum number of research steps in a single plan
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxSearchResults"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max search results</FormLabel>
                    <FormControl>
                      <Input
                        className="w-60"
                        type="number"
                        value={field.value}
                        min={1}
                        max={50}
                        onChange={(event) =>
                          field.onChange(parseInt(event.target.value || "1"))
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Maximum search results to process per query
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Output Preferences */}
            <div className="space-y-4">
              <h3 className="text-base font-medium">Output Preferences</h3>
              
              <FormField
                control={form.control}
                name="reportStyle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Report style</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-60">
                          <SelectValue placeholder="Select report style" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="academic">Academic</SelectItem>
                        <SelectItem value="popular_science">Popular Science</SelectItem>
                        <SelectItem value="news">News</SelectItem>
                        <SelectItem value="social_media">Social Media</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose the writing style for generated reports
                    </FormDescription>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Language</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-60">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="zh">中文</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Primary language for the interface and outputs
                    </FormDescription>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="theme"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Theme</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-60">
                          <SelectValue placeholder="Select theme" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose your preferred interface theme
                    </FormDescription>
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
      </main>
    </div>
  );
};

GeneralTab.displayName = "General";
GeneralTab.icon = Settings;
