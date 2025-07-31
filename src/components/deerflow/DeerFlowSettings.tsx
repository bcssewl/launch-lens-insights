import { Settings, Blocks, BadgeInfo } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useDeerFlowStore } from "@/stores/deerFlowStore";
import { cn } from "@/lib/utils";
import type { DeerSettings } from "@/stores/deerFlowSettingsStore";

// Import tab components
import { GeneralTab } from "./settings/GeneralTab";
import { MCPTab } from "./settings/MCPTab";
import { AboutTab } from "./settings/AboutTab";

// Define the settings tabs structure
const SETTINGS_TABS = [GeneralTab, MCPTab, AboutTab].map((tab) => {
  const name = tab.displayName ?? tab.name;
  return {
    ...tab,
    id: name.replace(/Tab$/, "").toLowerCase(),
    label: name.replace(/Tab$/, ""),
    icon: tab.icon ?? Settings,
    component: tab,
  };
});

export const DeerFlowSettings = () => {
  const { 
    isSettingsOpen, 
    setSettingsOpen, 
    settings, 
    updateSettings,
  } = useDeerFlowStore();

  const [activeTabId, setActiveTabId] = useState(SETTINGS_TABS[0]!.id);
  const [tempSettings, setTempSettings] = useState(settings);
  const [changes, setChanges] = useState<Partial<DeerSettings>>({});

  const handleTabChange = useCallback(
    (newChanges: Partial<DeerSettings>) => {
      setTimeout(() => {
        if (isSettingsOpen) {
          setChanges((prev) => ({
            ...prev,
            ...newChanges,
          }));
        }
      }, 0);
    },
    [isSettingsOpen],
  );

  const handleSave = useCallback(() => {
    if (Object.keys(changes).length > 0) {
      const newSettings: DeerSettings = {
        ...tempSettings,
        ...changes,
      };
      setTempSettings(newSettings);
      setChanges({});
      updateSettings(newSettings);
    }
    setSettingsOpen(false);
  }, [tempSettings, changes, updateSettings, setSettingsOpen]);

  const handleOpen = useCallback(() => {
    setTempSettings(settings);
  }, [settings]);

  const handleClose = useCallback(() => {
    setChanges({});
  }, []);

  useEffect(() => {
    if (isSettingsOpen) {
      handleOpen();
    } else {
      handleClose();
    }
  }, [isSettingsOpen, handleOpen, handleClose]);

  const mergedSettings = useMemo<DeerSettings>(() => {
    return {
      ...tempSettings,
      ...changes,
    };
  }, [tempSettings, changes]);

  return (
    <Dialog open={isSettingsOpen} onOpenChange={setSettingsOpen}>
      <DialogContent className="w-[90vw] max-w-[850px] h-[85vh] max-h-[700px] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
          <DialogTitle>DeerFlow Settings</DialogTitle>
          <DialogDescription>
            Manage your DeerFlow settings here.
          </DialogDescription>
        </DialogHeader>
        <Tabs value={activeTabId} className="flex-1 flex flex-col min-h-0">
          <div className="flex flex-1 w-full overflow-hidden border-y min-h-0">
            <ul className="flex w-48 shrink-0 border-r p-1 bg-muted/30">
              <div className="size-full">
                {SETTINGS_TABS.map((tab) => (
                  <li
                    key={tab.id}
                    className={cn(
                      "hover:accent-foreground hover:bg-accent mb-1 flex h-9 w-full cursor-pointer items-center gap-1.5 rounded px-3 text-sm transition-colors",
                      activeTabId === tab.id &&
                        "!bg-primary !text-primary-foreground",
                    )}
                    onClick={() => setActiveTabId(tab.id)}
                  >
                    <tab.icon size={16} />
                    <span>{tab.label}</span>
                    {tab.id === "mcp" && (
                      <Badge
                        variant="outline"
                        className={cn(
                          "border-muted-foreground text-muted-foreground ml-auto px-1 py-0 text-xs",
                          activeTabId === tab.id &&
                            "border-primary-foreground text-primary-foreground",
                        )}
                      >
                        Beta
                      </Badge>
                    )}
                  </li>
                ))}
              </div>
            </ul>
            <div className="min-w-0 flex-1 flex flex-col">
              <div
                id="settings-content-scrollable"
                className="flex-1 overflow-y-auto p-6"
              >
                {SETTINGS_TABS.map((tab) => (
                  <TabsContent key={tab.id} value={tab.id}>
                    <tab.component
                      settings={mergedSettings}
                      onChange={handleTabChange}
                    />
                  </TabsContent>
                ))}
              </div>
            </div>
          </div>
        </Tabs>
        <DialogFooter className="px-6 py-4 border-t shrink-0">
          <Button variant="outline" onClick={() => setSettingsOpen(false)}>
            Cancel
          </Button>
          <Button className="w-24" type="submit" onClick={handleSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};