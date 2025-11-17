# CLI Validate Specification

## Purpose

Defines the `openspecx validate` command that validates RULE.md files against the specification.

## Requirements

### Requirement: Command Syntax
**ID**: VALIDATE-SYNTAX-001
**Priority**: P0

The validate command SHALL accept a RULE file path as argument.

#### Scenario: Basic Usage
- **GIVEN** a user wants to validate a RULE file
- **WHEN** running `openspecx validate <ruleFile>`
- **THEN** the command SHALL:
  - Verify the file exists
  - Read and parse the file
  - Perform validation checks
  - Output validation results

### Requirement: Schema Validation
**ID**: VALIDATE-SCHEMA-001
**Priority**: P0

The validate command SHALL validate RULE structure using Zod schema.

#### Scenario: Structure Validation
- **GIVEN** a RULE file
- **WHEN** validating its structure
- **THEN** it SHALL check:
  - Required sections exist
  - Section content format
  - Field types and constraints
  - Minimum content lengths

### Requirement: Custom Rules Validation
**ID**: VALIDATE-RULES-001
**Priority**: P0

The validate command SHALL apply custom business rules.

#### Scenario: Business Rules
- **GIVEN** a RULE file passes schema validation
- **WHEN** applying custom rules
- **THEN** it SHALL check:
  - Overview section length (minimum)
  - Required components completeness
  - Checklist phase count (minimum 3)
  - Each phase has at least one task
  - Reference examples validity

### Requirement: Validation Report
**ID**: VALIDATE-REPORT-001
**Priority**: P0

The validate command SHALL generate a validation report.

#### Scenario: Report Format
- **GIVEN** validation is complete
- **WHEN** generating the report
- **THEN** it SHALL include:
  - Overall valid/invalid status
  - List of issues (ERROR, WARNING, INFO)
  - Summary counts by level
  - Path to each issue
  - Helpful error messages with guidance

### Requirement: Output Formats
**ID**: VALIDATE-OUTPUT-001
**Priority**: P1

The validate command SHALL support multiple output formats.

#### Scenario: JSON Output
- **GIVEN** the --json flag is provided
- **WHEN** outputting results
- **THEN** it SHALL output JSON format for programmatic use

#### Scenario: Human-Readable Output
- **GIVEN** no --json flag
- **WHEN** outputting results
- **THEN** it SHALL output formatted text with colors and symbols

