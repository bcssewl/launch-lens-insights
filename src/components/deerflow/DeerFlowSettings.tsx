import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDeerFlowStore } from "@/stores/deerFlowStore";

export const DeerFlowSettings = () => {
  const { isSettingsOpen, setSettingsOpen, settings, updateSettings } = useDeerFlowStore();

  return (
    <Dialog open={isSettingsOpen} onOpenChange={setSettingsOpen}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>DeerFlow Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Research Behavior */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Research Behavior</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Deep Thinking</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable detailed reasoning and analysis
                  </p>
                </div>
                <Switch
                  checked={settings.deepThinking}
                  onCheckedChange={(checked) =>
                    updateSettings({ deepThinking: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Background Investigation</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically research related topics
                  </p>
                </div>
                <Switch
                  checked={settings.backgroundInvestigation}
                  onCheckedChange={(checked) =>
                    updateSettings({ backgroundInvestigation: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Report Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Report Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Default Report Style</Label>
                <Select
                  value={settings.reportStyle}
                  onValueChange={(value: "detailed" | "summary" | "technical") =>
                    updateSettings({ reportStyle: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="detailed">Detailed Report</SelectItem>
                    <SelectItem value="summary">Summary Report</SelectItem>
                    <SelectItem value="technical">Technical Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Research Limits */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Research Limits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Max Plan Iterations</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={settings.maxPlanIterations}
                    onChange={(e) =>
                      updateSettings({
                        maxPlanIterations: parseInt(e.target.value) || 3,
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum number of planning iterations
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Max Steps</Label>
                  <Input
                    type="number"
                    min="1"
                    max="50"
                    value={settings.maxStepNumber}
                    onChange={(e) =>
                      updateSettings({
                        maxStepNumber: parseInt(e.target.value) || 10,
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum steps per research plan
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Max Search Results</Label>
                  <Input
                    type="number"
                    min="1"
                    max="20"
                    value={settings.maxSearchResults}
                    onChange={(e) =>
                      updateSettings({
                        maxSearchResults: parseInt(e.target.value) || 5,
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum search results per query
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => updateSettings({})} // Reset to defaults
            >
              Reset to Defaults
            </Button>
            <Button onClick={() => setSettingsOpen(false)}>
              Save & Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};