# Spec: Cursor Command File Format

## Purpose

Defines the format for Cursor command files that read RULE documents and guide proposal generation for specific module rules.

## Requirements

### Requirement: File Metadata
**ID**: CMD-META-001
**Priority**: P0

Cursor command files SHALL include YAML frontmatter with required metadata.

#### Scenario: Frontmatter Structure
- **GIVEN** a Cursor command file
- **WHEN** parsing its frontmatter
- **THEN** it MUST contain:
  - `name`: Command name
  - `description`: Brief description
  - `tags`: Array of tags (must include "openspecx" and the rule name)

### Requirement: Context Files Section
**ID**: CMD-CONTEXT-001
**Priority**: P0

Cursor command files SHALL specify which RULE.md file to read.

#### Scenario: RULE File Reference
- **GIVEN** a Cursor command file
- **WHEN** reading its content
- **THEN** it MUST specify:
  - The path to the RULE.md file
  - Instructions to read the RULE.md file first
  - Reference to RULE_SPEC.md for format understanding

### Requirement: Workflow Steps
**ID**: CMD-WORKFLOW-001
**Priority**: P0

Cursor command files SHALL include structured workflow steps.

#### Scenario: Workflow Structure
- **GIVEN** a Cursor command file
- **WHEN** following its workflow
- **THEN** it MUST include:
  - Step 1: Understand the user's request
  - Step 2: Read the RULE.md file
  - Step 3: Generate proposal structure
  - Step 4: Review and refine
  - Step 5: Implementation guidance

### Requirement: Proposal Template
**ID**: CMD-PROPOSAL-001
**Priority**: P0

Cursor command files SHALL provide a proposal template that follows the RULE checklist.

#### Scenario: Proposal Content
- **GIVEN** a Cursor command file
- **WHEN** generating a proposal
- **THEN** it MUST include:
  - Overview section
  - Components to create (from RULE required components)
  - Naming conventions (from RULE naming rules)
  - Phase-by-phase tasks (from RULE checklist)
  - Validation checklist
  - References (from RULE examples)

