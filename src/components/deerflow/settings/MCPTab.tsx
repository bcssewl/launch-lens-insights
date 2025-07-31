import { Blocks, Plus, Trash2, Settings2 } from "lucide-react";
import { useCallback, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { MCPServer } from "@/stores/deerFlowSettingsStore";

import type { Tab } from "./types";

export const MCPTab: Tab = ({ settings, onChange }) => {
  const [servers, setServers] = useState<MCPServer[]>(settings.mcpServers);

  const handleAddServer = useCallback(() => {
    const name = prompt("Server name:");
    const url = prompt("Server URL:");
    if (name && url) {
      const newServer: MCPServer = {
        id: crypto.randomUUID(),
        name,
        url,
        enabled: true,
      };
      const updatedServers = [...servers, newServer];
      setServers(updatedServers);
      onChange({ mcpServers: updatedServers });
    }
  }, [servers, onChange]);

  const handleDeleteServer = useCallback(
    (serverId: string) => {
      const updatedServers = servers.filter((server) => server.id !== serverId);
      setServers(updatedServers);
      onChange({ mcpServers: updatedServers });
    },
    [servers, onChange]
  );

  const handleToggleServer = useCallback(
    (serverId: string, enabled: boolean) => {
      const updatedServers = servers.map((server) =>
        server.id === serverId ? { ...server, enabled } : server
      );
      setServers(updatedServers);
      onChange({ mcpServers: updatedServers });
    },
    [servers, onChange]
  );

  return (
    <div className="flex flex-col gap-4">
      <header>
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-lg font-medium">MCP Servers</h1>
          <Button variant="outline" onClick={handleAddServer}>
            <Plus className="h-4 w-4 mr-2" />
            Add Server
          </Button>
        </div>
        <div className="text-muted-foreground text-sm">
          The Model Context Protocol boosts DeerFlow by integrating external tools for tasks like private domain searches, web browsing, food ordering, and more.{" "}
          <a
            className="underline"
            target="_blank"
            href="https://modelcontextprotocol.io/"
            rel="noopener noreferrer"
          >
            Learn more about MCP.
          </a>
        </div>
      </header>
      <main>
        {servers.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Settings2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No MCP servers configured</p>
            <p className="text-sm mb-4">Add servers to enable multi-agent research capabilities</p>
            <Button variant="outline" onClick={handleAddServer}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Server
            </Button>
          </div>
        ) : (
          <ul className="flex flex-col gap-4">
            {servers.map((server) => (
              <li
                key={server.id}
                className="group relative overflow-hidden rounded-lg border bg-card p-4 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium truncate">{server.name}</h3>
                      <Badge variant={server.enabled ? "default" : "secondary"}>
                        {server.enabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{server.url}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Switch
                      checked={server.enabled}
                      onCheckedChange={(enabled) => handleToggleServer(server.id, enabled)}
                      aria-label={server.enabled ? "Disable server" : "Enable server"}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteServer(server.id)}
                      aria-label="Delete server"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
};

MCPTab.displayName = "MCP";
MCPTab.icon = Blocks;
