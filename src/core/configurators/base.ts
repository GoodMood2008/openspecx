/**
 * Base configurator interface for AI tools
 */
export abstract class ToolConfigurator {
  abstract readonly toolId: string;
  abstract readonly isAvailable: boolean;

  /**
   * Configure the tool for the given project
   * @param projectPath - Root path of the project
   * @param openspecDir - Name of the openspec directory (usually 'openspec')
   */
  abstract configure(projectPath: string, openspecDir: string): Promise<void>;
}


