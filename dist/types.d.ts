export interface ProjectAnalysis {
    projectName: string;
    projectPath: string;
    framework: FrameworkInfo;
    dependencies: DependencyAnalysis;
    structure: FolderStructure;
    patterns: PatternInfo[];
    configs: ConfigInfo[];
    scripts: Record<string, string>;
    styling: StylingInfo;
    stateManagement: LibraryInfo[];
    dataFetching: LibraryInfo[];
    testing: TestingInfo;
    database: LibraryInfo[];
    authentication: LibraryInfo[];
}
export interface FrameworkInfo {
    name: string;
    version: string;
    description: string;
    docsUrl: string;
    category: "frontend" | "backend" | "fullstack" | "unknown";
}
export interface DependencyAnalysis {
    production: DependencyInfo[];
    development: DependencyInfo[];
    total: number;
}
export interface DependencyInfo {
    name: string;
    version: string;
    category: DependencyCategory;
    description: string;
}
export type DependencyCategory = "framework" | "state-management" | "data-fetching" | "styling" | "testing" | "database" | "authentication" | "validation" | "ui-components" | "build-tool" | "linting" | "utility" | "api" | "logging" | "other";
export interface FolderStructure {
    name: string;
    path: string;
    type: "file" | "directory";
    children?: FolderStructure[];
    description?: string;
}
export interface PatternInfo {
    name: string;
    description: string;
    evidence: string[];
}
export interface ConfigInfo {
    file: string;
    tool: string;
    description: string;
}
export interface StylingInfo {
    approach: string;
    libraries: LibraryInfo[];
    description: string;
}
export interface LibraryInfo {
    name: string;
    version: string;
    description: string;
    docsUrl: string;
}
export interface TestingInfo {
    framework: string;
    libraries: LibraryInfo[];
    hasE2E: boolean;
    hasUnit: boolean;
    hasIntegration: boolean;
}
export declare const KNOWN_LIBRARIES: Record<string, {
    category: DependencyCategory;
    description: string;
    docsUrl: string;
}>;
//# sourceMappingURL=types.d.ts.map