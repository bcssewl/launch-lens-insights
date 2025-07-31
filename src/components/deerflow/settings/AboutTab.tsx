import { BadgeInfo } from "lucide-react";

import type { Tab } from "./types";

export const AboutTab: Tab = () => {
  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="text-lg font-medium">About</h1>
      </header>
      <main className="prose prose-slate dark:prose-invert max-w-none">
        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">DeerFlow</h2>
            <p className="text-muted-foreground leading-relaxed">
              DeerFlow is a deep research assistant built on cutting-edge language models that helps you search the web, 
              browse information, and handle complex research tasks with advanced AI capabilities.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-medium mb-2">Features</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>• <strong>Deep Thinking:</strong> Advanced reasoning and analysis capabilities</li>
              <li>• <strong>Background Investigation:</strong> Automatic related topic research</li>
              <li>• <strong>Multi-Agent Research:</strong> MCP server integration for extended capabilities</li>
              <li>• <strong>Flexible Report Styles:</strong> Academic, popular science, news, and social media formats</li>
              <li>• <strong>Customizable Limits:</strong> Control research depth and scope</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-medium mb-2">Model Context Protocol (MCP)</h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              DeerFlow supports the Model Context Protocol, enabling integration with external tools and services 
              for enhanced research capabilities. Configure MCP servers in the MCP tab to extend functionality.
            </p>
            <a
              href="https://modelcontextprotocol.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Learn more about MCP →
            </a>
          </section>

          <section>
            <h3 className="text-lg font-medium mb-2">Open Source</h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              DeerFlow is open source software, originated from and giving back to the open source community.
            </p>
            <div className="flex gap-4 text-sm">
              <span className="text-muted-foreground">Licensed under MIT License</span>
              <span className="text-muted-foreground">© DeerFlow</span>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

AboutTab.displayName = "About";
AboutTab.icon = BadgeInfo;
