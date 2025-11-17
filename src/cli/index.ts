import { Command } from 'commander';
import { createRequire } from 'module';
import { initCommand } from '../commands/init.js';
import { validateCommand } from '../commands/validate.js';

const program = new Command();
const require = createRequire(import.meta.url);
const { version } = require('../../package.json');

program
  .name('openspecx')
  .description('OpenSpec Extensions - Module Rules Management')
  .version(version);

// Global options
program.option('--no-color', 'Disable color output');

// Apply global flags before any command runs
program.hook('preAction', (thisCommand) => {
  const opts = thisCommand.opts();
  if (opts.noColor) {
    process.env.NO_COLOR = '1';
  }
});

// init 命令
program
  .command('init')
  .description('Initialize a new module rule')
  .argument('<modulePath>', 'Path to the module (e.g., api/multi_language)')
  .argument('<ruleName>', 'Name of the rule (e.g., generate_multi_language)')
  .option('--tool <tool>', 'Target tool (default: cursor)', 'cursor')
  .option('--skip-analysis', 'Skip module code analysis')
  .action(async (modulePath, ruleName, options) => {
    await initCommand(modulePath, ruleName, options);
  });

// validate 命令
program
  .command('validate')
  .description('Validate a RULE.md file')
  .argument('<ruleFile>', 'Path to the RULE.md file')
  .option('--strict', 'Enable strict mode (warnings as errors)')
  .option('--json', 'Output JSON format')
  .action(async (ruleFile, options) => {
    await validateCommand(ruleFile, options);
  });

program.parse();

