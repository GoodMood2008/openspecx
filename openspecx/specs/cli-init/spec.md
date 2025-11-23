# CLI Init Specification

## Purpose

Defines the `openspecx init` command that initializes a new module rule with code analysis and file generation.

## Requirements

### Requirement: Command Syntax
**ID**: INIT-SYNTAX-001
**Priority**: P0

The init command SHALL accept module path and rule name as arguments.

#### Scenario: Basic Usage
- **GIVEN** a user wants to initialize a module rule
- **WHEN** running `openspecx init <modulePath> <ruleName>`
- **THEN** the command SHALL:
  - Validate the module path exists
  - Validate the rule name format
  - Check if RULE file already exists (prompt for overwrite)

### Requirement: Tool Selection
**ID**: INIT-TOOL-001
**Priority**: P0

The init command SHALL prompt for AI tool selection if not provided.

#### Scenario: Interactive Tool Selection
- **GIVEN** the init command is run without --tool option
- **WHEN** prompting for tool selection
- **THEN** it SHALL:
  - Display available tools (currently only Cursor)
  - Allow selection via interactive prompt
  - Default to Cursor if only one option

### Requirement: Module Analysis
**ID**: INIT-ANALYSIS-001
**Priority**: P0

The init command SHALL analyze the module code structure.

#### Scenario: Code Analysis
- **GIVEN** a valid module path
- **WHEN** analyzing the module
- **THEN** it SHALL:
  - Scan all source files
  - Identify classes, interfaces, functions
  - Detect test files
  - Detect design patterns (factory, singleton, etc.)
  - Generate analysis summary

### Requirement: File Generation
**ID**: INIT-GENERATE-001
**Priority**: P0

The init command SHALL generate required files.

#### Scenario: File Creation
- **GIVEN** analysis is complete
- **WHEN** generating files
- **THEN** it SHALL create:
  - Cursor command file: `.cursor/commands/openspecx-{ruleName}-proposal.md`
  - RULE template file: `.cursor/rule/{ruleName}-RULE.md`
  - Display AI prompt for RULE content generation

### Requirement: AI Prompt Generation
**ID**: INIT-PROMPT-001
**Priority**: P0

The init command SHALL generate an AI prompt for RULE content.

#### Scenario: Prompt Content
- **GIVEN** module analysis is complete
- **WHEN** generating the AI prompt
- **THEN** it SHALL include:
  - Module path and rule name
  - Code structure analysis results
  - Format requirements (reference to RULE_SPEC.md)
  - Content requirements
  - Output format template

