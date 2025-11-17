import { z } from 'zod';
import { VALIDATION_MESSAGES, MIN_REQUIRED_COMPONENTS, MIN_PHASES, MIN_TASKS_PER_PHASE } from '../validation/constants.js';

/**
 * Component definition in RULE document
 */
export const ComponentSchema = z.object({
  type: z.string().min(1, 'Component type cannot be empty'),
  path: z.string().min(1, 'Component path/pattern cannot be empty'),
  description: z.string().min(1, 'Component description cannot be empty'),
  required: z.boolean().default(true),
});

export type Component = z.infer<typeof ComponentSchema>;

/**
 * Naming rule definition
 */
export const NamingRuleSchema = z.object({
  componentType: z.string().min(1, 'Component type cannot be empty'),
  pattern: z.string().min(1, 'Naming pattern cannot be empty'),
  example: z.string().min(1, 'Example cannot be empty'),
});

export type NamingRule = z.infer<typeof NamingRuleSchema>;

/**
 * Task in a phase
 */
export const TaskSchema = z.object({
  description: z.string().min(1, VALIDATION_MESSAGES.TASK_DESCRIPTION_TOO_SHORT),
  completed: z.boolean().default(false),
});

export type Task = z.infer<typeof TaskSchema>;

/**
 * Phase in implementation checklist
 */
export const PhaseSchema = z.object({
  name: z.string().min(1, VALIDATION_MESSAGES.PHASE_NAME_TOO_SHORT),
  tasks: z.array(TaskSchema)
    .min(MIN_TASKS_PER_PHASE, VALIDATION_MESSAGES.PHASE_NO_TASKS),
});

export type Phase = z.infer<typeof PhaseSchema>;

/**
 * Reference example
 */
export const ReferenceSchema = z.object({
  type: z.string().min(1, 'Reference type cannot be empty'),
  path: z.string().min(1, 'Reference path cannot be empty'),
  description: z.string().optional(),
});

export type Reference = z.infer<typeof ReferenceSchema>;

/**
 * Overview section
 */
export const OverviewSchema = z.object({
  scenario: z.string()
    .min(1, VALIDATION_MESSAGES.OVERVIEW_SCENARIO_EMPTY)
    .min(30, VALIDATION_MESSAGES.OVERVIEW_SCENARIO_TOO_SHORT),
  goal: z.string()
    .min(1, VALIDATION_MESSAGES.OVERVIEW_GOAL_EMPTY)
    .min(30, VALIDATION_MESSAGES.OVERVIEW_GOAL_TOO_SHORT),
});

export type Overview = z.infer<typeof OverviewSchema>;

/**
 * Conventions section
 */
export const ConventionsSchema = z.object({
  requiredComponents: z.array(ComponentSchema)
    .min(MIN_REQUIRED_COMPONENTS, VALIDATION_MESSAGES.NO_REQUIRED_COMPONENTS),
  namingRules: z.array(NamingRuleSchema)
    .min(1, VALIDATION_MESSAGES.NO_NAMING_RULES),
});

export type Conventions = z.infer<typeof ConventionsSchema>;

/**
 * Complete RULE document schema
 */
export const RuleSchema = z.object({
  name: z.string().min(1, VALIDATION_MESSAGES.RULE_NAME_EMPTY),
  overview: OverviewSchema,
  conventions: ConventionsSchema,
  checklist: z.array(PhaseSchema)
    .min(MIN_PHASES, VALIDATION_MESSAGES.NO_PHASES),
  references: z.array(ReferenceSchema).default([]),
  metadata: z.object({
    version: z.string().default('1.0.0'),
    format: z.literal('openspecx-rule'),
    sourcePath: z.string().optional(),
  }).optional(),
});

export type Rule = z.infer<typeof RuleSchema>;

