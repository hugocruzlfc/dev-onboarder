#!/usr/bin/env node

import { Command } from "commander";
import * as fs from "fs";
import * as path from "path";
import chalk from "chalk";
import ora from "ora";
import { analyzeProject } from "./analyzer";
import { generateMarkdown } from "./generator/markdown";

const program = new Command();

program
  .name("project-onboarder")
  .description(
    "🚀 Analiza un proyecto y genera una guía de onboarding para nuevos desarrolladores",
  )
  .version("1.0.0")
  .argument("[path]", "Ruta al proyecto a analizar", ".")
  .option(
    "-o, --output <filename>",
    "Nombre del archivo de salida",
    "ONBOARDING.md",
  )
  .option("--stdout", "Imprimir el resultado en consola en lugar de archivo")
  .option("--json", "Exportar el análisis en formato JSON")
  .action(
    async (
      projectPath: string,
      options: { output: string; stdout?: boolean; json?: boolean },
    ) => {
      const resolvedPath = path.resolve(projectPath);

      // Validate path
      if (!fs.existsSync(resolvedPath)) {
        console.error(chalk.red(`\n❌ La ruta "${resolvedPath}" no existe.\n`));
        process.exit(1);
      }

      if (!fs.statSync(resolvedPath).isDirectory()) {
        console.error(
          chalk.red(`\n❌ "${resolvedPath}" no es un directorio.\n`),
        );
        process.exit(1);
      }

      // Check for package.json
      if (!fs.existsSync(path.join(resolvedPath, "package.json"))) {
        console.error(
          chalk.red(`\n❌ No se encontró package.json en "${resolvedPath}".\n`),
        );
        console.error(
          chalk.yellow(
            "   Este tool requiere un proyecto Node.js con package.json.\n",
          ),
        );
        process.exit(1);
      }

      console.log(chalk.cyan("\n🔍 project-onboarder\n"));
      console.log(chalk.gray(`   Analizando: ${resolvedPath}\n`));

      const spinner = ora("Analizando estructura del proyecto...").start();

      try {
        // Analyze
        spinner.text = "Analizando dependencias...";
        const analysis = analyzeProject(resolvedPath);

        spinner.text = "Detectando framework y patrones...";

        // JSON output
        if (options.json) {
          spinner.succeed("Análisis completado");
          const jsonPath = path.join(resolvedPath, "onboarding-analysis.json");
          fs.writeFileSync(jsonPath, JSON.stringify(analysis, null, 2));
          console.log(chalk.green(`\n✅ JSON exportado a: ${jsonPath}\n`));
          return;
        }

        // Generate markdown
        spinner.text = "Generando guía de onboarding...";
        const markdown = generateMarkdown(analysis);

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
        console.log(chalk.green(`\n✅ Guía generada exitosamente!`));
        console.log(chalk.gray(`   📄 Archivo: ${outputPath}\n`));
        console.log(chalk.cyan("   Resumen:"));
        console.log(
          chalk.white(
            `   ├── Framework: ${analysis.framework.name} ${analysis.framework.version}`,
          ),
        );
        console.log(
          chalk.white(`   ├── Dependencias: ${analysis.dependencies.total}`),
        );
        console.log(
          chalk.white(
            `   ├── Patrones: ${analysis.patterns.map((p) => p.name).join(", ")}`,
          ),
        );
        console.log(
          chalk.white(`   ├── Estilos: ${analysis.styling.approach}`),
        );
        console.log(
          chalk.white(`   ├── Testing: ${analysis.testing.framework}`),
        );

        if (analysis.stateManagement.length > 0) {
          console.log(
            chalk.white(
              `   ├── Estado: ${analysis.stateManagement.map((s) => s.name).join(", ")}`,
            ),
          );
        }
        if (analysis.database.length > 0) {
          console.log(
            chalk.white(
              `   ├── DB: ${analysis.database.map((d) => d.name).join(", ")}`,
            ),
          );
        }

        console.log(
          chalk.white(
            `   └── Configs: ${analysis.configs.length} archivos detectados`,
          ),
        );
        console.log("");
      } catch (error) {
        spinner.fail("Error durante el análisis");
        console.error(chalk.red(`\n❌ ${(error as Error).message}\n`));
        process.exit(1);
      }
    },
  );

program.parse();
