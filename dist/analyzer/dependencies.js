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
exports.analyzeDependencies = analyzeDependencies;
exports.getProjectName = getProjectName;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const types_1 = require("../types");
function analyzeDependencies(projectPath) {
    const pkgPath = path.join(projectPath, "package.json");
    if (!fs.existsSync(pkgPath)) {
        return {
            analysis: { production: [], development: [], total: 0 },
            scripts: {},
        };
    }
    const pkgContent = fs.readFileSync(pkgPath, "utf-8");
    const pkg = JSON.parse(pkgContent);
    const production = classifyDeps(pkg.dependencies || {});
    const development = classifyDeps(pkg.devDependencies || {});
    return {
        analysis: {
            production,
            development,
            total: production.length + development.length,
        },
        scripts: pkg.scripts || {},
    };
}
function classifyDeps(deps) {
    return Object.entries(deps).map(([name, version]) => {
        const known = types_1.KNOWN_LIBRARIES[name];
        if (known) {
            return {
                name,
                version: version,
                category: known.category,
                description: known.description,
            };
        }
        return {
            name,
            version: version,
            category: guessCategory(name),
            description: "",
        };
    });
}
function guessCategory(name) {
    const n = name.toLowerCase();
    // Radix UI components
    if (n.startsWith("@radix-ui/"))
        return "ui-components";
    // NestJS modules
    if (n.startsWith("@nestjs/"))
        return "framework";
    // Testing related
    if (n.includes("test") ||
        n.includes("spec") ||
        n.includes("mock") ||
        n.includes("stub"))
        return "testing";
    // Linting
    if (n.includes("eslint") || n.includes("prettier") || n.includes("lint"))
        return "linting";
    // Types packages
    if (n.startsWith("@types/"))
        return "utility";
    // Build tools
    if (n.includes("webpack") || n.includes("babel") || n.includes("rollup"))
        return "build-tool";
    // Styling
    if (n.includes("css") ||
        n.includes("style") ||
        n.includes("theme") ||
        n.includes("tailwind"))
        return "styling";
    // Database
    if (n.includes("sql") ||
        n.includes("mongo") ||
        n.includes("redis") ||
        n.includes("database") ||
        n.includes("db"))
        return "database";
    // Auth
    if (n.includes("auth") ||
        n.includes("passport") ||
        n.includes("jwt") ||
        n.includes("oauth"))
        return "authentication";
    return "other";
}
function getProjectName(projectPath) {
    const pkgPath = path.join(projectPath, "package.json");
    if (fs.existsSync(pkgPath)) {
        try {
            const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
            return pkg.name || path.basename(projectPath);
        }
        catch {
            return path.basename(projectPath);
        }
    }
    return path.basename(projectPath);
}
//# sourceMappingURL=dependencies.js.map