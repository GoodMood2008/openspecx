import ora from 'ora';
import chalk from 'chalk';
import path from 'path';
import { promises as fs } from 'fs';
import { ModuleAnalyzer } from '../core/analyzers/module-analyzer.js';
import { RuleTemplateGenerator } from '../core/generators/rule-template-generator.js';
import { ProjectRuleTemplateGenerator } from '../core/generators/project-rule-template-generator.js';
import { fileExists, ensureDirectory, writeFile, readFile } from '../utils/file-system.js';
import { OPENSPEC_DIR_NAME, AI_TOOLS } from '../core/config.js';
import { ToolRegistry } from '../core/configurators/registry.js';
import { promptForAITools } from '../core/tool-selection.js';

/**
 * Initialize a new module rule
 * 
 * @param modulePath - Path to the module relative to project root (e.g., api/multi_language)
 * @param ruleName - Name of the rule (e.g., generate_multi_language)
 * @param options - Command options
 */
export async function initCommand(
  modulePath: string,
  ruleName: string,
  options: { tool?: string; skipAnalysis?: boolean }
): Promise<void> {
  const spinner = ora('Initializing module rule...').start();

  try {
    // Step 1: Validate module path exists in project root
    const projectRoot = process.cwd();
    const resolvedModulePath = path.resolve(projectRoot, modulePath);
    
    spinner.text = 'Validating module path...';
    
    // Check if module path exists
    if (!(await fileExists(resolvedModulePath))) {
      spinner.fail('Module path does not exist');
      console.error(chalk.red(`Error: Module path does not exist: ${modulePath}`));
      console.error(chalk.red(`Resolved path: ${resolvedModulePath}`));
      console.error(chalk.yellow(`Hint: Make sure the module directory exists in the project root.`));
      process.exit(1);
    }

    const stats = await fs.stat(resolvedModulePath);
    if (!stats.isDirectory()) {
      spinner.fail('Module path is not a directory');
      console.error(chalk.red(`Error: Path is not a directory: ${modulePath}`));
      process.exit(1);
    }

    // Verify the module path is within project root
    const relativePath = path.relative(projectRoot, resolvedModulePath);
    if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
      spinner.fail('Module path is outside project root');
      console.error(chalk.red(`Error: Module path must be within the project root: ${modulePath}`));
      process.exit(1);
    }

    // Step 2: Check/create openspec directory structure
    const openspecPath = path.join(projectRoot, OPENSPEC_DIR_NAME);
    const extendMode = await fileExists(openspecPath);
    
    if (!extendMode) {
      spinner.text = 'Creating OpenSpec structure...';
      await ensureDirectory(openspecPath);
      await ensureDirectory(path.join(openspecPath, 'commands'));
      spinner.succeed('OpenSpec structure created');
    } else {
      spinner.text = 'OpenSpec directory already exists';
      await ensureDirectory(path.join(openspecPath, 'commands'));
      spinner.succeed('OpenSpec structure ready');
    }

    // Step 2.1: Ensure .cursor/rule directory exists for centralized RULE storage
    spinner.text = 'Preparing .cursor/rule directory...';
    const cursorRoot = path.join(projectRoot, '.cursor');
    const cursorRuleDir = path.join(cursorRoot, 'rule');
    await ensureDirectory(cursorRuleDir);
    spinner.succeed('.cursor/rule directory ready');

    // Step 2.5: Check/create project-level RULE.md (similar to openspec/AGENTS.md)
    spinner.text = 'Checking project RULE specification...';
    const projectRulePath = path.join(openspecPath, 'RULE.md');
    const projectRuleExists = await fileExists(projectRulePath);
    
    if (!projectRuleExists) {
      spinner.text = 'Generating project RULE specification...';
      const projectRuleGenerator = new ProjectRuleTemplateGenerator();
      const projectRuleContent = projectRuleGenerator.generate();
      await writeFile(projectRulePath, projectRuleContent);
      spinner.succeed('Project RULE specification created');
      console.log(chalk.gray(`  Created: ${path.join(OPENSPEC_DIR_NAME, 'RULE.md')}`));
      console.log(chalk.gray('  You can customize this file to define project-specific RULE format.'));
    } else {
      spinner.succeed('Project RULE specification found');
    }

    // Store projectRulePath for later use
    const projectRuleSpecPath = projectRulePath;

    // Step 3: Get existing tool states (for extend mode)
    const existingToolStates: Record<string, boolean> = {};
    for (const tool of AI_TOOLS) {
      // For now, we don't check existing configurations
      // This can be enhanced later to check for existing command files
      existingToolStates[tool.value] = false;
    }

    // Step 4: Select tools (using wizard similar to openspec)
    spinner.stop();
    console.log();
    
    let selectedTools: string[];
    if (options.tool) {
      // Non-interactive mode: validate tool
      const tool = AI_TOOLS.find((t) => t.value === options.tool && t.available);
      if (!tool) {
        console.error(chalk.red(`Error: Tool "${options.tool}" is not available.`));
        console.error(chalk.yellow(`Available tools: ${AI_TOOLS.filter(t => t.available).map(t => t.value).join(', ')}`));
        process.exit(1);
      }
      selectedTools = [options.tool];
    } else {
      // Interactive mode: use wizard
      selectedTools = await promptForAITools(existingToolStates, extendMode);
      
      if (selectedTools.length === 0) {
        console.error(chalk.red('Error: At least one tool must be selected.'));
        process.exit(1);
      }
    }

    spinner.start('Configuring AI tools...');

    // Step 5: Analyze module (if not skipped)
    let analysis;
    if (!options.skipAnalysis) {
      spinner.text = 'Analyzing module code structure...';
      try {
        const analyzer = new ModuleAnalyzer(resolvedModulePath);
        analysis = await analyzer.analyze();
        spinner.succeed(`Analyzed ${analysis.totalFiles} files`);
      } catch (error) {
        spinner.warn('Module analysis failed, continuing with basic template');
        console.log(chalk.yellow(`Warning: ${error instanceof Error ? error.message : 'Analysis failed'}`));
      }
    }

    // Step 6: Configure selected tools
    spinner.text = 'Configuring AI tools...';
    for (const toolId of selectedTools) {
      const configurator = ToolRegistry.get(toolId);
      if (configurator && configurator.isAvailable) {
        if (toolId === 'cursor') {
          // Cursor configurator needs additional parameters
          const cursorConfigurator = configurator as any;
          await cursorConfigurator.configure(
            projectRoot,
            OPENSPEC_DIR_NAME,
            ruleName,
            modulePath,
            analysis
          );
        } else {
          await configurator.configure(projectRoot, OPENSPEC_DIR_NAME);
        }
      }
    }
    spinner.succeed('AI tools configured');

    // Step 7: Read project RULE specification (already checked/created in Step 2.5)
    spinner.text = 'Reading project RULE specification...';
    let projectRuleContent: string;
    try {
      projectRuleContent = await readFile(projectRuleSpecPath);
      spinner.succeed('Project RULE specification loaded');
    } catch (error) {
      spinner.warn('Failed to read project RULE specification, using default template');
      const projectRuleGenerator = new ProjectRuleTemplateGenerator();
      projectRuleContent = projectRuleGenerator.generate();
    }

    // Step 8: Generate module-specific RULE file based on project specification
    spinner.text = 'Generating module RULE file...';
    const ruleFileName = `${ruleName}-RULE.md`;
    const ruleFilePath = path.join(cursorRuleDir, ruleFileName);
    const ruleDisplayPath = path.posix.join('.cursor', 'rule', ruleFileName);
    
    // Check if RULE file already exists
    if (await fileExists(ruleFilePath)) {
      spinner.warn('RULE file already exists');
      console.log(chalk.yellow(`Warning: ${ruleFileName} already exists at ${ruleFilePath}`));
      console.log(chalk.yellow('The file will be overwritten.'));
    }
    
    // Generate module RULE based on project specification
    // Include AI instructions in the template file
    const ruleTemplateGenerator = new RuleTemplateGenerator();
    const ruleTemplateContent = ruleTemplateGenerator.generate(
      ruleName,
      modulePath,
      projectRuleSpecPath,
      analysis || undefined
    );
    await writeFile(ruleFilePath, ruleTemplateContent);
    spinner.succeed(`Generated module RULE template: ${ruleFileName}`);

    // Step 9: Display success message and next steps
    spinner.stop();
    console.log();
    console.log(chalk.green('✅ OpenSpecX initialization completed!'));
    console.log();
    
    const selectedToolNames = selectedTools
      .map((id) => AI_TOOLS.find((t) => t.value === id)?.name || id)
      .join(', ');
    
    console.log(chalk.gray('Tool summary:'));
    console.log(`  ${chalk.white('▌')} ${chalk.white('Configured:')} ${chalk.white(selectedToolNames)}`);
    console.log();

    console.log(chalk.bold('📋 Next steps:'));
    console.log();
    console.log(
      chalk.gray('────────────────────────────────────────────────────────────')
    );
    console.log(chalk.white('1. Populate your module RULE:'));
    console.log(
      chalk.gray(
        `   "Please read ${ruleDisplayPath} and help me fill it out`
      )
    );
    console.log(
      chalk.gray(
        `    with complete RULE content following ${path.join(OPENSPEC_DIR_NAME, 'RULE.md')}"`
      )
    );
    console.log(
      chalk.gray(
        `   Note: The file contains AI instructions for automatic validation and self-correction.`
      )
    );
    console.log();
    console.log(chalk.white('2. Use the generated Cursor command:'));
    console.log(
      chalk.gray(`   In Cursor, use command: /openspecx-${ruleName}`)
    );
    console.log(
      chalk.gray(
        `   Note: This command enhances openspec-proposal with paradigm constraints.`
      )
    );
    console.log(
      chalk.gray(
        `   It generates standard OpenSpec change structure but with RULE compliance checks.`
      )
    );
    console.log();

  } catch (error) {
    spinner.fail('Initialization failed');
    console.error(chalk.red(error instanceof Error ? error.message : 'Unknown error'));
    process.exit(1);
  }
}
