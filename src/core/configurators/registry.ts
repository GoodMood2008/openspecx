import { ToolConfigurator } from './base.js';
import { CursorConfigurator } from './cursor.js';

/**
 * Registry for AI tool configurators
 */
export class ToolRegistry {
  private static tools: Map<string, ToolConfigurator> = new Map();

  static {
    const cursorConfigurator = new CursorConfigurator();
    this.tools.set('cursor', cursorConfigurator);
    // Future tools can be registered here
  }

  static register(tool: ToolConfigurator): void {
    this.tools.set(tool.toolId, tool);
  }

  static get(toolId: string): ToolConfigurator | undefined {
    return this.tools.get(toolId);
  }

  static getAll(): ToolConfigurator[] {
    return Array.from(this.tools.values());
  }

  static getAvailable(): ToolConfigurator[] {
    return this.getAll().filter((tool) => tool.isAvailable);
  }
}


