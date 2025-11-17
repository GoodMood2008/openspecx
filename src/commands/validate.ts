import ora from 'ora';
import chalk from 'chalk';
import path from 'path';
import { RuleValidator } from '../core/validation/validator.js';
import { fileExists } from '../utils/file-system.js';

/**
 * Validate a RULE.md file
 * 
 * @param ruleFile - Path to the RULE.md file
 * @param options - Command options
 */
export async function validateCommand(
  ruleFile: string,
  options: { strict?: boolean; json?: boolean }
): Promise<void> {
  const spinner = ora('Validating RULE file...').start();

  try {
    // Resolve file path
    const resolvedPath = path.resolve(ruleFile);
    
    // Check if file exists
    if (!(await fileExists(resolvedPath))) {
      spinner.fail('File not found');
      console.error(chalk.red(`Error: File does not exist: ${resolvedPath}`));
      process.exit(1);
    }

    // Validate
    const validator = new RuleValidator(options.strict || false);
    const report = await validator.validateRule(resolvedPath);

    spinner.stop();

    // Output results
    if (options.json) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      outputHumanReadable(report, ruleFile);
    }

    // Exit with appropriate code
    if (!report.valid) {
      process.exit(1);
    }
  } catch (error) {
    spinner.fail('Validation failed');
    console.error(chalk.red(error instanceof Error ? error.message : 'Unknown error'));
    process.exit(1);
  }
}

/**
 * Output validation results in human-readable format
 */
function outputHumanReadable(report: any, filePath: string): void {
  console.log();
  
  if (report.valid) {
    console.log(chalk.green('✅ Validation passed!'));
  } else {
    console.log(chalk.red('❌ Validation failed'));
  }

  console.log();
  console.log(chalk.bold(`File: ${filePath}`));
  console.log(chalk.bold('Summary:'));
  console.log(`  ${chalk.red(`Errors: ${report.summary.errors}`)}`);
  console.log(`  ${chalk.yellow(`Warnings: ${report.summary.warnings}`)}`);
  console.log(`  ${chalk.blue(`Info: ${report.summary.info}`)}`);

  if (report.issues.length > 0) {
    console.log();
    console.log(chalk.bold('Issues:'));

    for (const issue of report.issues) {
      const levelColor = 
        issue.level === 'ERROR' ? chalk.red :
        issue.level === 'WARNING' ? chalk.yellow :
        chalk.blue;
      
      const levelSymbol = 
        issue.level === 'ERROR' ? '❌' :
        issue.level === 'WARNING' ? '⚠️' :
        'ℹ️';

      console.log();
      console.log(`  ${levelSymbol} ${levelColor(issue.level)}: ${issue.path}`);
      console.log(`     ${issue.message}`);
      
      if (issue.line) {
        console.log(`     Line: ${issue.line}`);
      }
    }
  }

  console.log();
}
