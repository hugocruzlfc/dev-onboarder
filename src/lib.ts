// Public API — use as library: import { analyzeProject, generateMarkdown } from 'project-onboarder'
export { analyzeProject } from "./analyzer";
export { generateMarkdown } from "./generator/markdown";
export type {
  ProjectAnalysis,
  FrameworkInfo,
  DependencyAnalysis,
  DependencyInfo,
  DependencyCategory,
  FolderStructure,
  PatternInfo,
  ConfigInfo,
  StylingInfo,
  LibraryInfo,
  TestingInfo,
  EndpointInfo,
  EnvVarInfo,
  ImportGraphNode,
  ProjectMetrics,
  EntryPointInfo,
} from "./types";
