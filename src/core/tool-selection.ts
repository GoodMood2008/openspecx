import {
  createPrompt,
  isEnterKey,
  isSpaceKey,
  isUpKey,
  isDownKey,
  useKeypress,
  usePagination,
  useState,
} from '@inquirer/core';
import chalk from 'chalk';
import { AI_TOOLS, AIToolOption } from './config.js';

type ToolWizardChoice =
  | {
      kind: 'heading' | 'info';
      value: string;
      label: string;
      selectable: false;
    }
  | {
      kind: 'option';
      value: string;
      label: string;
      configured: boolean;
      selectable: true;
    };

type ToolWizardConfig = {
  extendMode: boolean;
  baseMessage: string;
  choices: ToolWizardChoice[];
  initialSelected?: string[];
};

type WizardStep = 'intro' | 'select' | 'review';

const isSelectableChoice = (
  choice: ToolWizardChoice
): choice is Extract<ToolWizardChoice, { selectable: true }> => choice.selectable;

const toolSelectionWizard = createPrompt<string[], ToolWizardConfig>(
  (config, done) => {
    const totalSteps = 3;
    const [step, setStep] = useState<WizardStep>('intro');
    const selectableChoices = config.choices.filter(isSelectableChoice);
    const initialCursorIndex = config.choices.findIndex((choice) =>
      choice.selectable
    );
    const [cursor, setCursor] = useState<number>(
      initialCursorIndex === -1 ? 0 : initialCursorIndex
    );
    const [selected, setSelected] = useState<string[]>(() => {
      const initial = new Set(
        (config.initialSelected ?? []).filter((value) =>
          selectableChoices.some((choice) => choice.value === value)
        )
      );
      return selectableChoices
        .map((choice) => choice.value)
        .filter((value) => initial.has(value));
    });
    const [error, setError] = useState<string | null>(null);

    const selectedSet = new Set(selected);
    const pageSize = Math.max(config.choices.length, 1);

    const updateSelected = (next: Set<string>) => {
      const ordered = selectableChoices
        .map((choice) => choice.value)
        .filter((value) => next.has(value));
      setSelected(ordered);
    };

    const page = usePagination({
      items: config.choices,
      active: cursor,
      pageSize,
      loop: false,
      renderItem: ({ item, isActive }) => {
        if (!item.selectable) {
          const prefix = item.kind === 'info' ? '  ' : '';
          const textColor =
            item.kind === 'heading' ? chalk.gray : chalk.dim;
          return `  ${textColor(`${prefix}${item.label}`)}`;
        }

        const isSelected = selectedSet.has(item.value);
        const cursorSymbol = isActive ? chalk.white('›') : ' ';
        const indicator = isSelected ? chalk.white('◉') : chalk.gray('○');
        const nameColor = isActive ? chalk.white : chalk.gray;
        const configuredNote = item.configured
          ? chalk.dim(' (already configured)')
          : '';
        const label = `${nameColor(item.label)}${configuredNote}`;
        return `${cursorSymbol} ${indicator} ${label}`;
      },
    });

    const moveCursor = (direction: 1 | -1) => {
      if (selectableChoices.length === 0) {
        return;
      }

      let nextIndex = cursor;
      while (true) {
        nextIndex = nextIndex + direction;
        if (nextIndex < 0 || nextIndex >= config.choices.length) {
          return;
        }

        if (config.choices[nextIndex]?.selectable) {
          setCursor(nextIndex);
          return;
        }
      }
    };

    useKeypress((key) => {
      if (step === 'intro') {
        if (isEnterKey(key)) {
          setStep('select');
        }
        return;
      }

      if (step === 'select') {
        if (isUpKey(key)) {
          moveCursor(-1);
          setError(null);
          return;
        }

        if (isDownKey(key)) {
          moveCursor(1);
          setError(null);
          return;
        }

        if (isSpaceKey(key)) {
          const current = config.choices[cursor];
          if (!current || !current.selectable) return;

          const next = new Set(selected);
          if (next.has(current.value)) {
            next.delete(current.value);
          } else {
            next.add(current.value);
          }

          updateSelected(next);
          setError(null);
          return;
        }

        if (isEnterKey(key)) {
          const current = config.choices[cursor];
          if (
            current &&
            current.selectable &&
            !selectedSet.has(current.value)
          ) {
            const next = new Set(selected);
            next.add(current.value);
            updateSelected(next);
          }
          setStep('review');
          setError(null);
          return;
        }

        if (key.name === 'escape') {
          const next = new Set<string>();
          updateSelected(next);
          setError(null);
        }
        return;
      }

      if (step === 'review') {
        if (isEnterKey(key)) {
          if (selected.length === 0) {
            setError('Please select at least one tool');
            return;
          }
          done(selected);
          return;
        }

        if (key.name === 'escape' || key.name === 'backspace') {
          setStep('select');
          setError(null);
        }
      }
    });

    const selectedChoices = selectableChoices.filter((choice) =>
      selectedSet.has(choice.value)
    );

    const stepIndex = step === 'intro' ? 1 : step === 'select' ? 2 : 3;
    const lines: string[] = [];
    lines.push(chalk.gray(`Step ${stepIndex}/${totalSteps}`));
    lines.push('');

    if (step === 'intro') {
      const introHeadline = config.extendMode
        ? 'Extend your OpenSpecX tooling'
        : 'Configure your OpenSpecX tooling';
      const introBody = config.extendMode
        ? 'We detected an existing setup. We will help you refresh or add integrations.'
        : "Let's get your AI assistants connected so they understand OpenSpecX.";

      lines.push(chalk.white(introHeadline));
      lines.push(chalk.gray(introBody));
      lines.push('');
      lines.push(chalk.gray('Press Enter to continue.'));
    } else if (step === 'select') {
      lines.push(chalk.white(config.baseMessage));
      lines.push(
        chalk.gray(
          'Use ↑/↓ to move · Space to toggle · Enter selects highlighted tool and reviews.'
        )
      );
      lines.push('');
      lines.push(page);
      lines.push('');
      lines.push(chalk.gray('Selected configuration:'));
      if (selectedChoices.length === 0) {
        lines.push(
          `  ${chalk.gray('- No tools selected')}`
        );
      } else {
        selectedChoices.forEach((choice) => {
          const configuredNote = choice.configured
            ? chalk.dim(' (already configured)')
            : '';
          lines.push(
            `  ${chalk.white('-')} ${chalk.white(choice.label)}${configuredNote}`
          );
        });
      }
    } else {
      lines.push(chalk.white('Review selections'));
      lines.push(
        chalk.gray('Press Enter to confirm or Backspace to adjust.')
      );
      lines.push('');

      if (selectedChoices.length === 0) {
        lines.push(
          chalk.gray(
            'No tools selected. Please select at least one tool.'
          )
        );
      } else {
        selectedChoices.forEach((choice) => {
          const configuredNote = choice.configured
            ? chalk.dim(' (already configured)')
            : '';
          lines.push(
            `${chalk.white('▌')} ${chalk.white(choice.label)}${configuredNote}`
          );
        });
      }
    }

    if (error) {
      return [lines.join('\n'), chalk.red(error)];
    }

    return lines.join('\n');
  }
);

export async function promptForAITools(
  existingTools: Record<string, boolean>,
  extendMode: boolean
): Promise<string[]> {
  const availableTools = AI_TOOLS.filter((tool) => tool.available);

  const baseMessage = extendMode
    ? 'Which AI tools would you like to add or refresh?'
    : 'Which AI tools do you use?';
  const initialSelection = extendMode
    ? availableTools
        .filter((tool) => existingTools[tool.value])
        .map((tool) => tool.value)
    : [];

  const choices: ToolWizardChoice[] = [
    {
      kind: 'heading',
      value: '__heading-tools__',
      label: 'Available AI tools',
      selectable: false,
    },
    ...availableTools.map<ToolWizardChoice>((tool) => ({
      kind: 'option',
      value: tool.value,
      label: tool.name,
      configured: Boolean(existingTools[tool.value]),
      selectable: true,
    })),
  ];

  return toolSelectionWizard({
    extendMode,
    baseMessage,
    choices,
    initialSelected: initialSelection,
  });
}


