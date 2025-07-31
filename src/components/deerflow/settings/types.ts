import type { DeerSettings } from "@/stores/deerFlowSettingsStore";
import { LucideIcon } from "lucide-react";

export interface TabProps {
  settings: DeerSettings;
  onChange: (changes: Partial<DeerSettings>) => void;
}

export interface Tab {
  (props: TabProps): JSX.Element;
  displayName?: string;
  icon?: LucideIcon;
}
