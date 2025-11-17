# OpenSpecX Project Context

## Purpose

OpenSpecX extends OpenSpec with module rules management capabilities. It helps teams define and enforce module-specific conventions through RULE documents and AI assistant integrations.

## Key Concepts

### RULE Documents

RULE documents define module-specific conventions, patterns, and checklists for implementing features. They guide both AI assistants and developers to maintain consistency.

### Cursor Commands

Cursor command files are workflows that read RULE documents and guide proposal generation for specific module rules.

## Integration with OpenSpec

OpenSpecX follows the same structure and conventions as OpenSpec:
- Same code style (TypeScript, Zod schemas)
- Same CLI patterns (Commander.js)
- Same validation approach (Zod + custom rules)
- Can be merged as a sub-command or published separately

