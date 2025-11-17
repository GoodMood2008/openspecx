import { Rule, Overview, Conventions, Component, NamingRule, Phase, Task, Reference } from '../schemas/rule.schema.js';

export interface Section {
  level: number;
  title: string;
  content: string;
  children: Section[];
}

export class RuleParser {
  private lines: string[];
  private currentLine: number;

  constructor(content: string) {
    const normalized = RuleParser.normalizeContent(content);
    this.lines = normalized.split('\n');
    this.currentLine = 0;
  }

  protected static normalizeContent(content: string): string {
    return content.replace(/\r\n?/g, '\n');
  }

  /**
   * Parse RULE document from markdown content
   */
  parse(ruleName?: string): Rule {
    const sections = this.parseSections();
    
    // Extract rule name from title if not provided
    const titleSection = sections.find(s => s.level === 1);
    let name = ruleName || '';
    if (titleSection) {
      const match = titleSection.title.match(/^Module Rules:\s*(.+)$/i);
      if (match) {
        name = match[1].trim();
      }
    }
    
    if (!name) {
      throw new Error('Rule name cannot be determined from document');
    }

    // Parse overview section (范式概述)
    const overviewSection = this.findSection(sections, '范式概述') || this.findSection(sections, 'Paradigm Overview');
    if (!overviewSection) {
      throw new Error('Missing "## 范式概述" section');
    }
    const overview = this.parseOverview(overviewSection);

    // Parse conventions section (核心约定)
    const conventionsSection = this.findSection(sections, '核心约定') || this.findSection(sections, 'Core Conventions');
    if (!conventionsSection) {
      throw new Error('Missing "## 核心约定" section');
    }
    const conventions = this.parseConventions(conventionsSection);

    // Parse checklist section (实现检查清单)
    const checklistSection = this.findSection(sections, '实现检查清单') || this.findSection(sections, 'Implementation Checklist');
    if (!checklistSection) {
      throw new Error('Missing "## 实现检查清单" section');
    }
    const checklist = this.parseChecklist(checklistSection);

    // Parse references section (参考示例) - optional
    const referencesSection = this.findSection(sections, '参考示例') || this.findSection(sections, 'Reference Examples');
    const references = referencesSection ? this.parseReferences(referencesSection) : [];

    return {
      name,
      overview,
      conventions,
      checklist,
      references,
      metadata: {
        version: '1.0.0',
        format: 'openspecx-rule',
      },
    };
  }

  /**
   * Parse overview section
   */
  private parseOverview(section: Section): Overview {
    const content = section.content;
    
    // Extract 适用场景 (Applicable Scenarios) - support both Chinese and English
    const scenarioMatch = content.match(/\*\*适用场景\*\*[：:]\s*(.+?)(?=\n\*\*|$)/is) ||
                         content.match(/\*\*Applicable Scenarios?\*\*[：:]\s*(.+?)(?=\n\*\*|$)/is);
    const scenario = scenarioMatch ? scenarioMatch[1].trim() : '';
    
    // Extract 目标 (Goals) - support both Chinese and English
    const goalMatch = content.match(/\*\*目标\*\*[：:]\s*(.+?)(?=\n\*\*|$)/is) ||
                     content.match(/\*\*Goals?\*\*[：:]\s*(.+?)(?=\n\*\*|$)/is);
    const goal = goalMatch ? goalMatch[1].trim() : '';

    return {
      scenario,
      goal,
    };
  }

  /**
   * Parse conventions section
   */
  private parseConventions(section: Section): Conventions {
    const requiredComponentsSection = this.findSubsection(section, '必需组件') || this.findSubsection(section, 'Required Components');
    const namingRulesSection = this.findSubsection(section, '命名规范') || this.findSubsection(section, 'Naming Conventions');

    const requiredComponents = requiredComponentsSection 
      ? this.parseRequiredComponents(requiredComponentsSection)
      : [];

    const namingRules = namingRulesSection
      ? this.parseNamingRules(namingRulesSection)
      : [];

    return {
      requiredComponents,
      namingRules,
    };
  }

  /**
   * Parse required components from list
   */
  private parseRequiredComponents(section: Section): Component[] {
    const components: Component[] = [];
    const lines = section.content.split('\n');

    for (const line of lines) {
      // Match checkbox format: - [ ] **Type**: `path` - description
      const checkboxMatch = line.match(/^[-*]\s+\[([ x]?)\]\s+\*\*([^*]+)\*\*[：:]\s*`([^`]+)`\s*[-–—]\s*(.+)$/);
      if (checkboxMatch) {
        components.push({
          type: checkboxMatch[2].trim(),
          path: checkboxMatch[3].trim(),
          description: checkboxMatch[4].trim(),
          required: checkboxMatch[1].trim() !== 'x', // unchecked means required
        });
        continue;
      }

      // Match without checkbox: - **Type**: `path` - description
      const listMatch = line.match(/^[-*]\s+\*\*([^*]+)\*\*[：:]\s*`([^`]+)`\s*[-–—]\s*(.+)$/);
      if (listMatch) {
        components.push({
          type: listMatch[1].trim(),
          path: listMatch[2].trim(),
          description: listMatch[3].trim(),
          required: true,
        });
      }
    }

    return components;
  }

  /**
   * Parse naming rules from table or list
   */
  private parseNamingRules(section: Section): NamingRule[] {
    const rules: NamingRule[] = [];
    const content = section.content;

    // Try to parse as markdown table first
    // Match table headers in both Chinese and English
    const tableMatch = content.match(/\|.*(组件类型|Component Type).*\|.*(命名模式|Pattern).*\|.*(示例|Example).*\|/i);
    if (tableMatch) {
      const lines = content.split('\n');
      let inTable = false;
      let headerSkipped = false;
      
      for (const line of lines) {
        // Check if it's a table row
        if (line.match(/^\|.*\|.*\|.*\|$/)) {
          // Skip separator row (contains only dashes, colons, spaces, pipes)
          if (line.match(/^[\s|:—-]+$/)) {
            headerSkipped = true;
            continue;
          }
          
          if (!inTable) {
            inTable = true;
            if (!headerSkipped) {
              continue; // Skip header row
            }
          }
          
          const cells = line.split('|').map(c => c.trim()).filter(c => c);
          if (cells.length >= 3) {
            rules.push({
              componentType: cells[0],
              pattern: cells[1],
              example: cells[2],
            });
          }
        }
      }
    }

    // If no table found, try list format
    if (rules.length === 0) {
      const lines = content.split('\n');
      for (const line of lines) {
        // Match: - **Type**: pattern - example
        const match = line.match(/^[-*]\s+\*\*([^*]+)\*\*[：:]\s*(.+?)\s*[-–—]\s*(.+)$/);
        if (match) {
          rules.push({
            componentType: match[1].trim(),
            pattern: match[2].trim(),
            example: match[3].trim(),
          });
        }
      }
    }

    return rules;
  }

  /**
   * Parse checklist phases
   */
  private parseChecklist(section: Section): Phase[] {
    const phases: Phase[] = [];
    const subsections = section.children.filter(s => s.level === 3);

    for (const subsection of subsections) {
      // Extract phase name (e.g., "Phase 1: Core Implementation")
      const phaseMatch = subsection.title.match(/^Phase\s+\d+[：:]\s*(.+)$/i);
      const phaseName = phaseMatch ? phaseMatch[1].trim() : subsection.title.trim();

      // Parse tasks from content
      const tasks = this.parseTasks(subsection.content);

      phases.push({
        name: phaseName,
        tasks,
      });
    }

    return phases;
  }

  /**
   * Parse tasks from content
   */
  private parseTasks(content: string): Task[] {
    const tasks: Task[] = [];
    const lines = content.split('\n');

    for (const line of lines) {
      // Match checkbox format: - [ ] Task description
      const checkboxMatch = line.match(/^[-*]\s+\[([ x]?)\]\s+(.+)$/);
      if (checkboxMatch) {
        tasks.push({
          description: checkboxMatch[2].trim(),
          completed: checkboxMatch[1].trim() === 'x',
        });
      }
    }

    return tasks;
  }

  /**
   * Parse references section
   */
  private parseReferences(section: Section): Reference[] {
    const references: Reference[] = [];
    const lines = section.content.split('\n');

    for (const line of lines) {
      // Match: - **Type**: `path` - description (optional)
      const match = line.match(/^[-*]\s+\*\*([^*]+)\*\*[：:]\s*`([^`]+)`(?:\s*[-–—]\s*(.+))?$/);
      if (match) {
        references.push({
          type: match[1].trim(),
          path: match[2].trim(),
          description: match[3]?.trim(),
        });
      }
    }

    return references;
  }

  /**
   * Parse markdown sections
   */
  protected parseSections(): Section[] {
    const sections: Section[] = [];
    const stack: Section[] = [];
    
    for (let i = 0; i < this.lines.length; i++) {
      const line = this.lines[i];
      const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
      
      if (headerMatch) {
        const level = headerMatch[1].length;
        const title = headerMatch[2].trim();
        const content = this.getContentUntilNextHeader(i + 1, level);
        
        const section: Section = {
          level,
          title,
          content,
          children: [],
        };

        while (stack.length > 0 && stack[stack.length - 1].level >= level) {
          stack.pop();
        }

        if (stack.length === 0) {
          sections.push(section);
        } else {
          stack[stack.length - 1].children.push(section);
        }

        stack.push(section);
      }
    }

    return sections;
  }

  /**
   * Get content until next header of same or higher level
   */
  private getContentUntilNextHeader(startLine: number, maxLevel: number): string {
    const contentLines: string[] = [];
    
    for (let i = startLine; i < this.lines.length; i++) {
      const line = this.lines[i];
      const headerMatch = line.match(/^(#{1,6})\s+/);
      
      if (headerMatch && headerMatch[1].length <= maxLevel) {
        break;
      }
      
      contentLines.push(line);
    }
    
    return contentLines.join('\n');
  }

  /**
   * Find section by title (case-insensitive, supports both Chinese and English)
   */
  protected findSection(sections: Section[], title: string): Section | undefined {
    for (const section of sections) {
      if (section.title.toLowerCase().includes(title.toLowerCase())) {
        return section;
      }
    }
    
    // Also search in children
    for (const section of sections) {
      const found = this.findSection(section.children, title);
      if (found) return found;
    }
    
    return undefined;
  }

  /**
   * Find subsection within a section
   */
  private findSubsection(section: Section, title: string): Section | undefined {
    return this.findSection(section.children, title);
  }
}

