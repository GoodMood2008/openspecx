import path from 'path';
import { ToolConfigurator } from './base.js';
import { writeFile, ensureDirectory } from '../../utils/file-system.js';
import { CursorCommandGenerator } from '../generators/cursor-command-generator.js';

/**
 * Cursor tool configurator
 * Generates Cursor command files in the openspec directory
 */
export class CursorConfigurator extends ToolConfigurator {
  readonly toolId = 'cursor';
  readonly isAvailable = true;

  /**
   * Configure Cursor for OpenSpecX
   * This method is called with additional parameters for OpenSpecX-specific configuration
   * Generates command files in .cursor/commands/ directory to work alongside openspec commands
   */
  async configure(
    projectPath: string,
    openspecDir: string,
    ruleName?: string,
    modulePath?: string,
    analysis?: any
  ): Promise<void> {
    // If called from OpenSpecX init, we have additional parameters
    if (ruleName && modulePath) {
      // Generate in .cursor/commands/ to work with Cursor IDE
      const cursorCommandsDir = path.join(projectPath, '.cursor', 'commands');
      
      await ensureDirectory(cursorCommandsDir);

      const generator = new CursorCommandGenerator();
      const content = generator.generate(ruleName, modulePath, analysis);

      const commandFileName = `openspecx-${ruleName}-proposal.md`;
      const commandFilePath = path.join(cursorCommandsDir, commandFileName);

      await writeFile(commandFilePath, content);
    } else {
      // Standard OpenSpec configuration (not used in OpenSpecX, but kept for interface compatibility)
      // This would be used if OpenSpecX were to support standard OpenSpec tool configuration
    }
  }
}

