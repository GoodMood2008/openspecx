import { promises as fs } from 'fs';
import path from 'path';
import { ModuleAnalysis, ClassInfo, InterfaceInfo, FunctionInfo, DetectedPattern } from './types.js';

/**
 * Analyzer for module code structure
 * Supports TypeScript, JavaScript, and Python files
 */
export class ModuleAnalyzer {
  private modulePath: string;
  private supportedExtensions = ['.ts', '.tsx', '.js', '.jsx', '.py'];

  constructor(modulePath: string) {
    this.modulePath = path.resolve(modulePath);
  }

  /**
   * Analyze module structure
   */
  async analyze(): Promise<ModuleAnalysis> {
    const files = await this.scanDirectory();
    const filesByType = this.categorizeFiles(files);
    
    const classes: ClassInfo[] = [];
    const interfaces: InterfaceInfo[] = [];
    const functions: FunctionInfo[] = [];
    const testFiles: string[] = [];
    const patterns: DetectedPattern[] = [];

    // Analyze each file
    for (const file of files) {
      const ext = path.extname(file);
      const fileName = path.basename(file);

      // Identify test files
      if (this.isTestFile(fileName)) {
        testFiles.push(fileName);
        continue;
      }

      // Parse based on file type
      if (ext === '.ts' || ext === '.tsx' || ext === '.js' || ext === '.jsx') {
        const content = await fs.readFile(file, 'utf-8');
        const fileClasses = this.extractClasses(content, file);
        const fileInterfaces = this.extractInterfaces(content, file);
        const fileFunctions = this.extractFunctions(content, file);

        classes.push(...fileClasses);
        interfaces.push(...fileInterfaces);
        functions.push(...fileFunctions);
      } else if (ext === '.py') {
        const content = await fs.readFile(file, 'utf-8');
        const fileClasses = this.extractPythonClasses(content, file);
        const fileFunctions = this.extractPythonFunctions(content, file);

        classes.push(...fileClasses);
        functions.push(...fileFunctions);
      }
    }

    // Detect design patterns
    patterns.push(...this.detectPatterns(files, classes, interfaces));

    return {
      modulePath: this.modulePath,
      totalFiles: files.length,
      filesByType,
      classes,
      interfaces,
      functions,
      testFiles,
      patterns,
    };
  }

  /**
   * Scan directory recursively for source files
   */
  private async scanDirectory(): Promise<string[]> {
    const files: string[] = [];
    const ignoredDirs = ['node_modules', '.git', 'dist', 'build', '__pycache__', '.pytest_cache'];

    async function scan(dir: string): Promise<void> {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          
          // Skip ignored directories
          if (entry.isDirectory()) {
            if (!ignoredDirs.includes(entry.name)) {
              await scan(fullPath);
            }
            continue;
          }

          // Check if file has supported extension
          const ext = path.extname(entry.name);
          if (['.ts', '.tsx', '.js', '.jsx', '.py'].includes(ext)) {
            files.push(fullPath);
          }
        }
      } catch (error) {
        // Skip directories we can't read
      }
    }

    await scan(this.modulePath);
    return files;
  }

  /**
   * Categorize files by type
   */
  private categorizeFiles(files: string[]): Record<string, number> {
    const counts: Record<string, number> = {};
    
    for (const file of files) {
      const ext = path.extname(file);
      const category = ext || 'other';
      counts[category] = (counts[category] || 0) + 1;
    }

    return counts;
  }

  /**
   * Check if file is a test file
   */
  private isTestFile(fileName: string): boolean {
    const testPatterns = [
      /^test[._-]/i,
      /[._-]test[._-]/i,
      /\.test\./i,
      /\.spec\./i,
    ];
    
    return testPatterns.some(pattern => pattern.test(fileName));
  }

  /**
   * Extract classes from TypeScript/JavaScript code
   */
  private extractClasses(content: string, filePath: string): ClassInfo[] {
    const classes: ClassInfo[] = [];
    
    // Match class definitions - handle multiline and single line
    // Use a more flexible regex that handles whitespace and line breaks
    const classRegex = /(?:^|\n)\s*(export\s+)?(abstract\s+)?class\s+(\w+)(?:\s+extends\s+(\w+))?(?:\s+implements\s+([\w\s,]+))?/gm;
    let match;

    while ((match = classRegex.exec(content)) !== null) {
      const isExported = !!match[1];
      const className = match[3];
      const extendsFrom = match[4];
      const implementsList = match[5]?.split(',').map(i => i.trim()).filter(Boolean);

      // Extract methods (simplified)
      const methods = this.extractClassMethods(content, className);

      classes.push({
        name: className,
        file: path.relative(this.modulePath, filePath),
        isExported,
        extendsFrom,
        implements: implementsList,
        methods,
      });
    }

    return classes;
  }

  /**
   * Extract interfaces from TypeScript code
   */
  private extractInterfaces(content: string, filePath: string): InterfaceInfo[] {
    const interfaces: InterfaceInfo[] = [];
    
    // Match interface definitions - handle whitespace and line breaks
    const interfaceRegex = /(?:^|\n)\s*(export\s+)?interface\s+(\w+)(?:\s+extends\s+([\w\s,]+))?/gm;
    let match;

    while ((match = interfaceRegex.exec(content)) !== null) {
      const interfaceName = match[2];
      
      // Extract methods and properties
      const methods = this.extractInterfaceMembers(content, interfaceName);

      interfaces.push({
        name: interfaceName,
        file: path.relative(this.modulePath, filePath),
        methods,
      });
    }

    return interfaces;
  }

  /**
   * Extract functions from TypeScript/JavaScript code
   */
  private extractFunctions(content: string, filePath: string): FunctionInfo[] {
    const functions: FunctionInfo[] = [];
    
    // Match function declarations and arrow functions
    const functionRegex = /^(export\s+)?(async\s+)?function\s+(\w+)|^(export\s+)?(const|let|var)\s+(\w+)\s*[:=]\s*(async\s+)?\(/gm;
    let match;

    while ((match = functionRegex.exec(content)) !== null) {
      const isExported = !!(match[1] || match[4]);
      const isAsync = !!(match[2] || match[7]);
      const functionName = match[3] || match[6];
      
      // Count parameters (simplified)
      const paramMatch = content.substring(match.index).match(/\(([^)]*)\)/);
      const parameters = paramMatch ? paramMatch[1].split(',').filter(p => p.trim()).length : 0;

      functions.push({
        name: functionName,
        file: path.relative(this.modulePath, filePath),
        isExported,
        isAsync,
        parameters,
      });
    }

    return functions;
  }

  /**
   * Extract classes from Python code
   */
  private extractPythonClasses(content: string, filePath: string): ClassInfo[] {
    const classes: ClassInfo[] = [];
    
    // Match class definitions
    const classRegex = /^class\s+(\w+)(?:\(([^)]+)\))?/gm;
    let match;

    while ((match = classRegex.exec(content)) !== null) {
      const className = match[1];
      const parentClass = match[2]?.split(',')[0]?.trim();

      classes.push({
        name: className,
        file: path.relative(this.modulePath, filePath),
        isExported: true, // Python classes are always "exported"
        extendsFrom: parentClass,
      });
    }

    return classes;
  }

  /**
   * Extract functions from Python code
   */
  private extractPythonFunctions(content: string, filePath: string): FunctionInfo[] {
    const functions: FunctionInfo[] = [];
    
    // Match function definitions
    const functionRegex = /^(async\s+)?def\s+(\w+)\s*\(/gm;
    let match;

    while ((match = functionRegex.exec(content)) !== null) {
      const isAsync = !!match[1];
      const functionName = match[2];

      functions.push({
        name: functionName,
        file: path.relative(this.modulePath, filePath),
        isExported: true,
        isAsync,
      });
    }

    return functions;
  }

  /**
   * Extract methods from a class
   */
  private extractClassMethods(content: string, className: string): string[] {
    const methods: string[] = [];
    
    // Find class block - handle both "class ClassName" and "export class ClassName"
    // Use a more flexible pattern that handles whitespace
    const classPattern = new RegExp(`(?:export\\s+)?(?:abstract\\s+)?class\\s+${className}\\b`, 'm');
    const classMatch = content.match(classPattern);
    if (!classMatch) return methods;
    
    const classStart = classMatch.index!;
    if (classStart === -1) return methods;

    // Find class end (simplified - looks for next class/function at same or higher level)
    let braceCount = 0;
    let inClass = false;
    let classEnd = content.length;

    for (let i = classStart; i < content.length; i++) {
      if (content[i] === '{') {
        braceCount++;
        inClass = true;
      } else if (content[i] === '}') {
        braceCount--;
        if (inClass && braceCount === 0) {
          classEnd = i;
          break;
        }
      }
    }

    const classContent = content.substring(classStart, classEnd);
    
    // Extract method names - improved regex to handle various formats
    const methodRegex = /(?:public|private|protected|static)?\s*(?:async\s+)?(\w+)\s*\(/g;
    let methodMatch;
    
    while ((methodMatch = methodRegex.exec(classContent)) !== null) {
      const methodName = methodMatch[1];
      // Skip constructor and common keywords
      if (!['constructor', 'get', 'set'].includes(methodName)) {
        methods.push(methodName);
      }
    }

    return methods;
  }

  /**
   * Extract members from an interface
   */
  private extractInterfaceMembers(content: string, interfaceName: string): string[] {
    const members: string[] = [];
    
    // Find interface block - handle both "interface Name" and "export interface Name"
    const interfacePattern = new RegExp(`(?:export\\s+)?interface\\s+${interfaceName}\\b`, 'm');
    const interfaceMatch = content.match(interfacePattern);
    if (!interfaceMatch) return members;
    
    const interfaceStart = interfaceMatch.index!;
    if (interfaceStart === -1) return members;

    // Find interface end
    let braceCount = 0;
    let inInterface = false;
    let interfaceEnd = content.length;

    for (let i = interfaceStart; i < content.length; i++) {
      if (content[i] === '{') {
        braceCount++;
        inInterface = true;
      } else if (content[i] === '}') {
        braceCount--;
        if (inInterface && braceCount === 0) {
          interfaceEnd = i;
          break;
        }
      }
    }

    const interfaceContent = content.substring(interfaceStart, interfaceEnd);
    
    // Extract method signatures
    const methodRegex = /(\w+)\s*\([^)]*\)\s*[:;]/g;
    let methodMatch;
    
    while ((methodMatch = methodRegex.exec(interfaceContent)) !== null) {
      members.push(methodMatch[1]);
    }

    return members;
  }

  /**
   * Detect design patterns in the codebase
   */
  private detectPatterns(
    files: string[],
    classes: ClassInfo[],
    interfaces: InterfaceInfo[]
  ): DetectedPattern[] {
    const patterns: DetectedPattern[] = [];

    // Detect Factory pattern
    const factoryFiles = files.filter(f => {
      const fileName = path.basename(f).toLowerCase();
      return fileName.includes('factory') || fileName.includes('creator');
    });

    if (factoryFiles.length > 0) {
      patterns.push({
        type: 'Factory',
        files: factoryFiles.map(f => path.relative(this.modulePath, f)),
        confidence: 0.8,
        description: 'Factory pattern detected based on file naming',
      });
    }

    // Detect Singleton pattern
    const singletonClasses = classes.filter(c => {
      // Look for getInstance method
      if (c.methods?.includes('getInstance')) {
        return true;
      }
      // Also check if class name suggests singleton
      const className = c.name.toLowerCase();
      if (className.includes('singleton') || className.includes('instance')) {
        return true;
      }
      return false;
    });

    if (singletonClasses.length > 0) {
      patterns.push({
        type: 'Singleton',
        files: [...new Set(singletonClasses.map(c => c.file))],
        confidence: 0.7,
        description: 'Singleton pattern detected based on getInstance method',
      });
    }

    // Detect Strategy pattern (interface + multiple implementations)
    if (interfaces.length > 0) {
      const implementations = classes.filter(c => 
        c.implements && c.implements.length > 0
      );

      if (implementations.length >= 2) {
        patterns.push({
          type: 'Strategy',
          files: [...new Set(implementations.map(c => c.file))],
          confidence: 0.6,
          description: 'Strategy pattern detected: multiple implementations of interfaces',
        });
      }
    }

    return patterns;
  }
}

