import { select } from '@inquirer/prompts';

/**
 * Interactive utilities
 * Reference: ../openspec/src/utils/interactive.ts
 */

export interface ToolOption {
  value: string;
  name: string;
  description?: string;
}

export async function selectTool(): Promise<string> {
  const tools: ToolOption[] = [
    {
      value: 'cursor',
      name: 'Cursor',
      description: 'Cursor AI editor (recommended)',
    },
    // Future tools can be added here
  ];

  const selected = await select({
    message: 'Select AI tool:',
    choices: tools.map((tool) => ({
      value: tool.value,
      name: tool.name,
      description: tool.description,
    })),
  });

  return selected;
}

