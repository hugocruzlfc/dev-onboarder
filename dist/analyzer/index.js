"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeProject = analyzeProject;
const path = __importStar(require("path"));
const structure_1 = require("./structure");
const dependencies_1 = require("./dependencies");
const framework_1 = require("./framework");
const patterns_1 = require("./patterns");
const config_1 = require("./config");
function analyzeProject(projectPath) {
    const resolvedPath = path.resolve(projectPath);
    const projectName = (0, dependencies_1.getProjectName)(resolvedPath);
    // 1. Analyze dependencies
    const { analysis: dependencies, scripts } = (0, dependencies_1.analyzeDependencies)(resolvedPath);
    // 2. Detect framework
    const framework = (0, framework_1.detectFramework)(resolvedPath, dependencies);
    // 3. Analyze folder structure
    const structure = (0, structure_1.analyzeStructure)(resolvedPath);
    // 4. Detect patterns
    const patterns = (0, patterns_1.detectPatterns)(resolvedPath, structure, dependencies);
    // 5. Detect configs
    const configs = (0, config_1.detectConfigs)(resolvedPath);
    // 6. Detect specific tech
    const styling = (0, framework_1.detectStyling)(dependencies, resolvedPath);
    const stateManagement = (0, framework_1.detectStateManagement)(dependencies);
    const dataFetching = (0, framework_1.detectDataFetching)(dependencies);
    const testing = (0, framework_1.detectTesting)(dependencies);
    const database = (0, framework_1.detectDatabase)(dependencies);
    const authentication = (0, framework_1.detectAuthentication)(dependencies);
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
//# sourceMappingURL=index.js.map