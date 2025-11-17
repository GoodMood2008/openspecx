/**
 * OpenSpecX Configuration
 */

export const OPENSPEC_DIR_NAME = 'openspec';

export interface AIToolOption {
  name: string;
  value: string;
  available: boolean;
  successLabel?: string;
}

/**
 * Available AI tools for OpenSpecX
 * Currently only Cursor is supported, but structure allows for easy extension
 */
export const AI_TOOLS: AIToolOption[] = [
  { name: 'Cursor', value: 'cursor', available: true, successLabel: 'Cursor' },
  // Future tools can be added here:
  // { name: 'Claude Code', value: 'claude', available: false, successLabel: 'Claude Code' },
  // { name: 'Windsurf', value: 'windsurf', available: false, successLabel: 'Windsurf' },
];

export interface OpenSpecXConfig {
  aiTools: string[];
}


