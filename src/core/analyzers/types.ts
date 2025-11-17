/**
 * Types for module code analysis
 */

export interface ModuleAnalysis {
  modulePath: string;
  totalFiles: number;
  filesByType: Record<string, number>;
  classes: ClassInfo[];
  interfaces: InterfaceInfo[];
  functions: FunctionInfo[];
  testFiles: string[];
  patterns: DetectedPattern[];
}

export interface ClassInfo {
  name: string;
  file: string;
  isExported: boolean;
  extendsFrom?: string;
  implements?: string[];
  methods?: string[];
}

export interface InterfaceInfo {
  name: string;
  file: string;
  methods: string[];
  properties?: string[];
}

export interface FunctionInfo {
  name: string;
  file: string;
  isExported: boolean;
  isAsync: boolean;
  parameters?: number;
}

export interface DetectedPattern {
  type: 'Factory' | 'Singleton' | 'Observer' | 'Strategy' | 'Builder' | 'Adapter';
  files: string[];
  confidence: number;
  description?: string;
}

