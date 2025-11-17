import { z, ZodError } from 'zod';
import { readFileSync } from 'fs';
import { RuleSchema, Rule } from '../schemas/rule.schema.js';
import { RuleParser } from '../parsers/rule-parser.js';
import { ValidationReport, ValidationIssue, ValidationLevel } from './types.js';
import {
  MIN_OVERVIEW_SCENARIO_LENGTH,
  MIN_OVERVIEW_GOAL_LENGTH,
  MIN_REQUIRED_COMPONENTS,
  MIN_PHASES,
  MIN_TASKS_PER_PHASE,
  VALIDATION_MESSAGES,
} from './constants.js';

export class RuleValidator {
  private strictMode: boolean;

  constructor(strictMode: boolean = false) {
    this.strictMode = strictMode;
  }

  /**
   * Validate a RULE file
   */
  async validateRule(filePath: string): Promise<ValidationReport> {
    const issues: ValidationIssue[] = [];
    const ruleName = this.extractNameFromPath(filePath);

    try {
      const content = readFileSync(filePath, 'utf-8');
      const parser = new RuleParser(content);

      const rule = parser.parse(ruleName);

      // Zod Schema validation
      const result = RuleSchema.safeParse(rule);

      if (!result.success) {
        issues.push(...this.convertZodErrors(result.error));
      }

      // Custom business rules validation
      issues.push(...this.applyRuleRules(rule, content));

    } catch (error) {
      const baseMessage = error instanceof Error ? error.message : 'Unknown error';
      const enriched = this.enrichTopLevelError(ruleName, baseMessage);
      issues.push({
        level: 'ERROR',
        path: 'file',
        message: enriched,
      });
    }

    return this.createReport(issues);
  }

  /**
   * Validate RULE content from a string
   */
  async validateRuleContent(ruleName: string, content: string): Promise<ValidationReport> {
    const issues: ValidationIssue[] = [];

    try {
      const parser = new RuleParser(content);
      const rule = parser.parse(ruleName);

      const result = RuleSchema.safeParse(rule);
      if (!result.success) {
        issues.push(...this.convertZodErrors(result.error));
      }

      issues.push(...this.applyRuleRules(rule, content));

    } catch (error) {
      const baseMessage = error instanceof Error ? error.message : 'Unknown error';
      const enriched = this.enrichTopLevelError(ruleName, baseMessage);
      issues.push({
        level: 'ERROR',
        path: 'file',
        message: enriched,
      });
    }

    return this.createReport(issues);
  }

  /**
   * Convert Zod errors to ValidationIssue
   */
  private convertZodErrors(error: ZodError): ValidationIssue[] {
    return error.issues.map((err) => {
      let message = err.message;
      
      // Enrich specific error messages
      if (message.includes('适用场景')) {
        message = `${message}. ${VALIDATION_MESSAGES.GUIDE_MISSING_SECTIONS}`;
      }

      return {
        level: 'ERROR' as ValidationLevel,
        path: err.path.join('.'),
        message,
      };
    });
  }

  /**
   * Apply custom business rules
   */
  private applyRuleRules(rule: Rule, content: string): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Check overview section length (only warn if too brief, not error)
    // Only warn if content exists but is too short
    if (rule.overview.scenario.length > 0 && rule.overview.scenario.length < MIN_OVERVIEW_SCENARIO_LENGTH) {
      issues.push({
        level: 'WARNING',
        path: 'overview.scenario',
        message: VALIDATION_MESSAGES.OVERVIEW_SCENARIO_TOO_BRIEF,
      });
    }

    if (rule.overview.goal.length > 0 && rule.overview.goal.length < MIN_OVERVIEW_GOAL_LENGTH) {
      issues.push({
        level: 'WARNING',
        path: 'overview.goal',
        message: VALIDATION_MESSAGES.OVERVIEW_GOAL_TOO_BRIEF,
      });
    }

    // Check required components
    if (rule.conventions.requiredComponents.length < MIN_REQUIRED_COMPONENTS) {
      issues.push({
        level: 'ERROR',
        path: 'conventions.requiredComponents',
        message: VALIDATION_MESSAGES.NO_REQUIRED_COMPONENTS,
      });
    }

    // Check component descriptions
    rule.conventions.requiredComponents.forEach((component, index) => {
      if (component.description.length < 10) {
        issues.push({
          level: 'WARNING',
          path: `conventions.requiredComponents[${index}].description`,
          message: VALIDATION_MESSAGES.COMPONENT_DESCRIPTION_TOO_BRIEF,
        });
      }
    });

    // Check naming rules
    if (rule.conventions.namingRules.length === 0) {
      issues.push({
        level: 'ERROR',
        path: 'conventions.namingRules',
        message: VALIDATION_MESSAGES.NO_NAMING_RULES,
      });
    }

    // Check checklist phases
    if (rule.checklist.length < MIN_PHASES) {
      issues.push({
        level: 'WARNING',
        path: 'checklist',
        message: VALIDATION_MESSAGES.FEW_PHASES,
      });
    }

    // Check each phase has tasks
    rule.checklist.forEach((phase, index) => {
      if (phase.tasks.length < MIN_TASKS_PER_PHASE) {
        issues.push({
          level: 'ERROR',
          path: `checklist[${index}].tasks`,
          message: VALIDATION_MESSAGES.PHASE_NO_TASKS,
        });
      }

      // Check task descriptions
      phase.tasks.forEach((task, taskIndex) => {
        if (task.description.length < 10) {
          issues.push({
            level: 'WARNING',
            path: `checklist[${index}].tasks[${taskIndex}].description`,
            message: VALIDATION_MESSAGES.TASK_DESCRIPTION_TOO_SHORT,
          });
        }
      });
    });

    // Check references (optional but recommended)
    if (rule.references.length === 0) {
      issues.push({
        level: 'INFO',
        path: 'references',
        message: VALIDATION_MESSAGES.NO_REFERENCES,
      });
    }

    return issues;
  }

  /**
   * Enrich top-level error messages with guidance
   */
  private enrichTopLevelError(ruleId: string, baseMessage: string): string {
    const msg = baseMessage.trim();

    if (msg.includes('Missing "## 范式概述"') || msg.includes('Missing "## 核心约定"') || msg.includes('Missing "## 实现检查清单"')) {
      return `${msg}. ${VALIDATION_MESSAGES.GUIDE_MISSING_SECTIONS}`;
    }

    if (msg.includes('适用场景') || msg.includes('目标')) {
      return `${msg}. ${VALIDATION_MESSAGES.GUIDE_MISSING_SECTIONS}`;
    }

    return msg;
  }

  /**
   * Extract rule name from file path
   */
  private extractNameFromPath(filePath: string): string {
    const normalizedPath = filePath.replaceAll('\\', '/');
    const parts = normalizedPath.split('/');
    const fileName = parts[parts.length - 1] ?? '';
    
    // Remove -RULE.md suffix if present
    const ruleMatch = fileName.match(/^(.+)-RULE\.md$/i);
    if (ruleMatch) {
      return ruleMatch[1];
    }
    
    // Fallback to filename without extension
    const dotIndex = fileName.lastIndexOf('.');
    return dotIndex > 0 ? fileName.slice(0, dotIndex) : fileName;
  }

  /**
   * Create validation report
   */
  private createReport(issues: ValidationIssue[]): ValidationReport {
    const errors = issues.filter((i) => i.level === 'ERROR').length;
    const warnings = issues.filter((i) => i.level === 'WARNING').length;
    const info = issues.filter((i) => i.level === 'INFO').length;

    const valid = this.strictMode
      ? errors === 0 && warnings === 0
      : errors === 0;

    return {
      valid,
      issues,
      summary: {
        errors,
        warnings,
        info,
      },
    };
  }

  /**
   * Check if validation report is valid
   */
  isValid(report: ValidationReport): boolean {
    return report.valid;
  }
}

