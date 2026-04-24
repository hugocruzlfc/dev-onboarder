#!/usr/bin/env node
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
const analyzer_1 = require("./analyzer");
const markdown_1 = require("./generator/markdown");
const program = new commander_1.Command();
program
    .name("project-onboarder")
    .description("🚀 Analiza un proyecto y genera una guía de onboarding para nuevos desarrolladores")
    .version("1.0.0")
    .argument("[path]", "Ruta al proyecto a analizar", ".")
    .option("-o, --output <filename>", "Nombre del archivo de salida", "ONBOARDING.md")
    .option("--stdout", "Imprimir el resultado en consola en lugar de archivo")
    .option("--json", "Exportar el análisis en formato JSON")
    .action(async (projectPath, options) => {
    const resolvedPath = path.resolve(projectPath);
    // Validate path
    if (!fs.existsSync(resolvedPath)) {
        console.error(chalk_1.default.red(`\n❌ La ruta "${resolvedPath}" no existe.\n`));
        process.exit(1);
    }
    if (!fs.statSync(resolvedPath).isDirectory()) {
        console.error(chalk_1.default.red(`\n❌ "${resolvedPath}" no es un directorio.\n`));
        process.exit(1);
    }
    // Check for package.json
    if (!fs.existsSync(path.join(resolvedPath, "package.json"))) {
        console.error(chalk_1.default.red(`\n❌ No se encontró package.json en "${resolvedPath}".\n`));
        console.error(chalk_1.default.yellow("   Este tool requiere un proyecto Node.js con package.json.\n"));
        process.exit(1);
    }
    console.log(chalk_1.default.cyan("\n🔍 project-onboarder\n"));
    console.log(chalk_1.default.gray(`   Analizando: ${resolvedPath}\n`));
    const spinner = (0, ora_1.default)("Analizando estructura del proyecto...").start();
    try {
        // Analyze
        spinner.text = "Analizando dependencias...";
        const analysis = (0, analyzer_1.analyzeProject)(resolvedPath);
        spinner.text = "Detectando framework y patrones...";
        // JSON output
        if (options.json) {
            spinner.succeed("Análisis completado");
            const jsonPath = path.join(resolvedPath, "onboarding-analysis.json");
            fs.writeFileSync(jsonPath, JSON.stringify(analysis, null, 2));
            console.log(chalk_1.default.green(`\n✅ JSON exportado a: ${jsonPath}\n`));
            return;
        }
        // Generate markdown
        spinner.text = "Generando guía de onboarding...";
        const markdown = (0, markdown_1.generateMarkdown)(analysis);
        if (options.stdout) {
            spinner.succeed("Análisis completado");
            console.log("\n" + markdown);
            return;
        }
        // Write to file
        const outputPath = path.join(resolvedPath, options.output);
        fs.writeFileSync(outputPath, markdown, "utf-8");
        spinner.succeed("Análisis completado");
        // Summary
        console.log(chalk_1.default.green(`\n✅ Guía generada exitosamente!`));
        console.log(chalk_1.default.gray(`   📄 Archivo: ${outputPath}\n`));
        console.log(chalk_1.default.cyan("   Resumen:"));
        console.log(chalk_1.default.white(`   ├── Framework: ${analysis.framework.name} ${analysis.framework.version}`));
        console.log(chalk_1.default.white(`   ├── Dependencias: ${analysis.dependencies.total}`));
        console.log(chalk_1.default.white(`   ├── Patrones: ${analysis.patterns.map((p) => p.name).join(", ")}`));
        console.log(chalk_1.default.white(`   ├── Estilos: ${analysis.styling.approach}`));
        console.log(chalk_1.default.white(`   ├── Testing: ${analysis.testing.framework}`));
        if (analysis.stateManagement.length > 0) {
            console.log(chalk_1.default.white(`   ├── Estado: ${analysis.stateManagement.map((s) => s.name).join(", ")}`));
        }
        if (analysis.database.length > 0) {
            console.log(chalk_1.default.white(`   ├── DB: ${analysis.database.map((d) => d.name).join(", ")}`));
        }
        console.log(chalk_1.default.white(`   └── Configs: ${analysis.configs.length} archivos detectados`));
        console.log("");
    }
    catch (error) {
        spinner.fail("Error durante el análisis");
        console.error(chalk_1.default.red(`\n❌ ${error.message}\n`));
        process.exit(1);
    }
});
program.parse();
//# sourceMappingURL=index.js.map