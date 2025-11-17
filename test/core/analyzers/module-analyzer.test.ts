import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import { ModuleAnalyzer } from '../../../src/core/analyzers/module-analyzer.js';

describe('ModuleAnalyzer', () => {
  const tmpDir = path.join(process.cwd(), 'test-module-analyzer-tmp');

  beforeEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
    await fs.mkdir(tmpDir, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  });

  async function createFile(relPath: string, content: string) {
    const filePath = path.join(tmpDir, relPath);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, content, 'utf-8');
    return filePath;
  }

  it('should analyze module structure across multiple languages', async () => {
    await createFile(
      'src/services/example-service.ts',
      `
        export class BaseService {}
        export class ExampleService extends BaseService implements IExample {
          public doWork() {}
          private helper() {}
        }
      `
    );

    await createFile(
      'src/interfaces/example.interface.ts',
      `
        export interface IExample {
          doWork(): void;
          helper(): string;
        }
      `
    );

    await createFile(
      'src/utils/worker.py',
      `
class Worker:
    def run(self):
        pass
      `
    );

    await createFile('tests/example.service.test.ts', 'describe("test", () => {});');

    const analyzer = new ModuleAnalyzer(tmpDir);
    const analysis = await analyzer.analyze();

    expect(analysis.totalFiles).toBe(4);
    expect(analysis.filesByType['.ts']).toBe(3);
    expect(analysis.filesByType['.py']).toBe(1);
    expect(analysis.classes.some((c) => c.name === 'ExampleService')).toBe(true);
    expect(analysis.interfaces.some((i) => i.name === 'IExample')).toBe(true);
    expect(analysis.testFiles).toContain('example.service.test.ts');
  });

  it('should detect common design patterns', async () => {
    await createFile(
      'src/factories/service-factory.ts',
      `
        export class ServiceFactory {
          create() {}
        }
      `
    );

    await createFile(
      'src/singleton.ts',
      `
        export class SingletonExample {
          private static instance?: SingletonExample;
          private constructor() {}
          static getInstance(): SingletonExample {
            if (!SingletonExample.instance) {
              SingletonExample.instance = new SingletonExample();
            }
            return SingletonExample.instance;
          }
        }
      `
    );

    await createFile(
      'src/strategies/example-strategy.ts',
      `
        export interface Strategy {
          execute(): void;
        }

        export class DefaultStrategy implements Strategy {
          execute() {}
        }

        export class AdvancedStrategy implements Strategy {
          execute() {}
        }
      `
    );

    const analyzer = new ModuleAnalyzer(tmpDir);
    const analysis = await analyzer.analyze();

    const patternTypes = analysis.patterns.map((p) => p.type);
    expect(patternTypes).toContain('Factory');
    expect(patternTypes).toContain('Singleton');
    expect(patternTypes).toContain('Strategy');
  });
});


