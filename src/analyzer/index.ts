import * as path from "path";
import { ProjectAnalysis } from "../types";
import { analyzeStructure } from "./structure";
import { analyzeDependencies, getProjectName } from "./dependencies";
import {
  detectFramework,
  detectStyling,
  detectStateManagement,
  detectDataFetching,
  detectTesting,
  detectDatabase,
  detectAuthentication,
} from "./framework";
import { detectPatterns } from "./patterns";
import { detectConfigs } from "./config";

export function analyzeProject(projectPath: string): ProjectAnalysis {
  const resolvedPath = path.resolve(projectPath);
  const projectName = getProjectName(resolvedPath);

  // 1. Analyze dependencies
  const { analysis: dependencies, scripts } = analyzeDependencies(resolvedPath);

  // 2. Detect framework
  const framework = detectFramework(resolvedPath, dependencies);

  // 3. Analyze folder structure
  const structure = analyzeStructure(resolvedPath);

  // 4. Detect patterns
  const patterns = detectPatterns(resolvedPath, structure, dependencies);

  // 5. Detect configs
  const configs = detectConfigs(resolvedPath);

  // 6. Detect specific tech
  const styling = detectStyling(dependencies, resolvedPath);
  const stateManagement = detectStateManagement(dependencies);
  const dataFetching = detectDataFetching(dependencies);
  const testing = detectTesting(dependencies);
  const database = detectDatabase(dependencies);
  const authentication = detectAuthentication(dependencies);

  return {
    projectName,
    projectPath: resolvedPath,
    framework,
    dependencies,
    structure,
    patterns,
    configs,
    scripts,
    styling,
    stateManagement,
    dataFetching,
    testing,
    database,
    authentication,
  };
}
