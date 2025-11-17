# Spec: Module RULE Document Format

## Purpose

Defines the standard format for module RULE documents. These documents guide AI assistants and developers in implementing features that follow module-specific conventions.

## Requirements

### Requirement: Document Structure
**ID**: RULE-STRUCT-001
**Priority**: P0

RULE documents SHALL follow a standardized structure with required sections.

#### Scenario: Complete Document
- **GIVEN** a RULE document
- **WHEN** validating its structure
- **THEN** it MUST contain:
  - Title in format "# Module Rules: [Name]"
  - "## 范式概述" (Paradigm Overview) section
  - "## 核心约定" (Core Conventions) section
  - "## 实现检查清单" (Implementation Checklist) section
  - "## 参考示例" (Reference Examples) section

### Requirement: Overview Section
**ID**: RULE-OVERVIEW-001
**Priority**: P0

The overview section SHALL describe the paradigm's purpose and applicability.

#### Scenario: Overview Content
- **GIVEN** a RULE document
- **WHEN** reading the "## 范式概述" section
- **THEN** it MUST contain:
  - **适用场景** (Applicable Scenarios): Description of when to use this pattern
  - **目标** (Goals): What this pattern aims to achieve

### Requirement: Conventions Section
**ID**: RULE-CONVENTIONS-001
**Priority**: P0

The conventions section SHALL define required components and naming rules.

#### Scenario: Required Components
- **GIVEN** a RULE document
- **WHEN** reading the "## 核心约定" section
- **THEN** it MUST contain:
  - **必需组件** (Required Components): List of required files/classes/interfaces
  - **命名规范** (Naming Conventions): Table or list of naming patterns

### Requirement: Checklist Section
**ID**: RULE-CHECKLIST-001
**Priority**: P0

The checklist section SHALL provide phase-by-phase implementation guidance.

#### Scenario: Checklist Structure
- **GIVEN** a RULE document
- **WHEN** reading the "## 实现检查清单" section
- **THEN** it MUST contain:
  - At least 3 phases (e.g., Phase 1: Core Implementation, Phase 2: Integration, Phase 3: Testing)
  - Each phase with task items in checkbox format

### Requirement: References Section
**ID**: RULE-REFERENCES-001
**Priority**: P1

The references section SHOULD provide examples of existing implementations.

#### Scenario: Reference Examples
- **GIVEN** a RULE document
- **WHEN** reading the "## 参考示例" section
- **THEN** it SHOULD contain:
  - Links to standard implementation files
  - Links to test files
  - Links to related documentation

