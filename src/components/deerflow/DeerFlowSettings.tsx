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
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Settings2 } from "lucide-react";

export const DeerFlowSettings = () => {
  const { 
    isSettingsOpen, 
    setSettingsOpen, 
    settings, 
    updateSettings,
    resetSettings,
    addMCPServer,
    updateMCPServer,
    removeMCPServer,
    toggleMCPServer
  } = useDeerFlowStore();

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
                  onValueChange={(value: "academic" | "popular_science" | "news" | "social_media") =>
                    updateSettings({ reportStyle: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="popular_science">Popular Science</SelectItem>
                    <SelectItem value="news">News</SelectItem>
                    <SelectItem value="social_media">Social Media</SelectItem>
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
                    value={settings.maxStepNum}
                    onChange={(e) =>
                      updateSettings({
                        maxStepNum: parseInt(e.target.value) || 10,
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

          {/* Advanced Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Advanced Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto Accept Plan</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically accept research plans without confirmation
                  </p>
                </div>
                <Switch
                  checked={settings.autoAcceptedPlan}
                  onCheckedChange={(checked) =>
                    updateSettings({ autoAcceptedPlan: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* MCP Servers */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings2 className="h-5 w-5" />
                MCP Servers
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure Model Context Protocol servers for multi-agent capabilities
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {settings.mcpServers.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Settings2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No MCP servers configured</p>
                  <p className="text-xs">Add servers to enable multi-agent research</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {settings.mcpServers.map((server) => (
                    <div
                      key={server.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{server.name}</span>
                          <Badge variant={server.enabled ? "default" : "secondary"}>
                            {server.enabled ? "Enabled" : "Disabled"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{server.url}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={server.enabled}
                          onCheckedChange={() => toggleMCPServer(server.id)}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMCPServer(server.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  const name = prompt("Server name:");
                  const url = prompt("Server URL:");
                  if (name && url) {
                    addMCPServer({ name, url, enabled: true });
                  }
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add MCP Server
              </Button>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => resetSettings()}
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