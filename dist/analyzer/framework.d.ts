import { FrameworkInfo, StylingInfo, LibraryInfo, TestingInfo, DependencyAnalysis } from "../types";
export declare function detectFramework(projectPath: string, deps: DependencyAnalysis): FrameworkInfo;
export declare function detectStyling(deps: DependencyAnalysis, projectPath: string): StylingInfo;
export declare function detectStateManagement(deps: DependencyAnalysis): LibraryInfo[];
export declare function detectDataFetching(deps: DependencyAnalysis): LibraryInfo[];
export declare function detectTesting(deps: DependencyAnalysis): TestingInfo;
export declare function detectDatabase(deps: DependencyAnalysis): LibraryInfo[];
export declare function detectAuthentication(deps: DependencyAnalysis): LibraryInfo[];
//# sourceMappingURL=framework.d.ts.map