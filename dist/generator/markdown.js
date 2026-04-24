"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMarkdown = generateMarkdown;
const structure_1 = require("../analyzer/structure");
const config_1 = require("../analyzer/config");
const diagrams_1 = require("./diagrams");
function generateMarkdown(analysis) {
    const pkgManager = (0, config_1.detectPackageManager)(analysis.projectPath);
    const installCmd = pkgManager === "npm" ? "npm install" : `${pkgManager} install`;
    const devCmd = findDevCommand(analysis.scripts, pkgManager);
    let md = "";
    // Header
    md += `# 🚀 Guía de Onboarding: ${analysis.projectName}\n\n`;
    md += `> Guía auto-generada por **project-onboarder** para facilitar la incorporación de nuevos desarrolladores.\n\n`;
    md += `---\n\n`;
    // Table of Contents
    md += `## 📑 Tabla de Contenidos\n\n`;
    md += `- [Resumen del Proyecto](#-resumen-del-proyecto)\n`;
    md += `- [Quick Start](#-quick-start)\n`;
    md += `- [Arquitectura y Diagrama](#-arquitectura-y-diagrama)\n`;
    md += `- [Estructura del Proyecto](#-estructura-del-proyecto)\n`;
    md += `- [Stack Tecnológico](#-stack-tecnológico)\n`;
    md += `- [Patrones de Diseño](#-patrones-de-diseño)\n`;
    md += `- [Estilos](#-estilos)\n`;
    md += `- [Estado Global](#-estado-global)\n`;
    md += `- [Data Fetching](#-data-fetching)\n`;
    md += `- [Base de Datos](#-base-de-datos)\n`;
    md += `- [Autenticación](#-autenticación)\n`;
    md += `- [Testing](#-testing)\n`;
    md += `- [Scripts Disponibles](#-scripts-disponibles)\n`;
    md += `- [Archivos de Configuración](#-archivos-de-configuración)\n`;
    md += `- [Flujo de Datos](#-flujo-de-datos)\n`;
    md += `- [Dependencias Principales](#-dependencias-principales)\n`;
    md += `\n---\n\n`;
    // Project Summary
    md += `## 📋 Resumen del Proyecto\n\n`;
    md += `| Aspecto | Detalle |\n`;
    md += `|---------|--------|\n`;
    md += `| **Framework** | ${analysis.framework.name} ${analysis.framework.version} |\n`;
    md += `| **Tipo** | ${getCategoryLabel(analysis.framework.category)} |\n`;
    md += `| **Package Manager** | ${pkgManager} |\n`;
    md += `| **Total Dependencias** | ${analysis.dependencies.total} (${analysis.dependencies.production.length} prod + ${analysis.dependencies.development.length} dev) |\n`;
    md += `| **Estilos** | ${analysis.styling.approach} |\n`;
    md += `| **Testing** | ${analysis.testing.framework} |\n`;
    if (analysis.stateManagement.length > 0) {
        md += `| **Estado Global** | ${analysis.stateManagement.map((s) => s.name).join(", ")} |\n`;
    }
    if (analysis.dataFetching.length > 0) {
        md += `| **Data Fetching** | ${analysis.dataFetching.map((d) => d.name).join(", ")} |\n`;
    }
    if (analysis.database.length > 0) {
        md += `| **Base de Datos** | ${analysis.database.map((d) => d.name).join(", ")} |\n`;
    }
    if (analysis.authentication.length > 0) {
        md += `| **Autenticación** | ${analysis.authentication.map((a) => a.name).join(", ")} |\n`;
    }
    md += `\n> ${analysis.framework.description}\n`;
    if (analysis.framework.docsUrl) {
        md += `>\n> 📖 Docs: ${analysis.framework.docsUrl}\n`;
    }
    md += `\n---\n\n`;
    // Quick Start
    md += `## ⚡ Quick Start\n\n`;
    md += `\`\`\`bash\n`;
    md += `# 1. Clonar el repositorio\n`;
    md += `git clone <url-del-repo>\n`;
    md += `cd ${analysis.projectName}\n\n`;
    md += `# 2. Instalar dependencias\n`;
    md += `${installCmd}\n\n`;
    // Check for .env.example
    if (analysis.configs.some((c) => c.file.includes(".env"))) {
        md += `# 3. Configurar variables de entorno\n`;
        md += `cp .env.example .env.local\n`;
        md += `# Editar .env.local con tus valores\n\n`;
    }
    // Check for prisma
    if (analysis.database.some((d) => d.name.includes("prisma"))) {
        md += `# ${analysis.configs.some((c) => c.file.includes(".env")) ? "4" : "3"}. Configurar base de datos (Prisma)\n`;
        md += `npx prisma generate\n`;
        md += `npx prisma db push  # o npx prisma migrate dev\n\n`;
    }
    md += `# ${getStepNumber(analysis)}. Iniciar en modo desarrollo\n`;
    md += `${devCmd}\n`;
    md += `\`\`\`\n\n`;
    md += `---\n\n`;
    // Architecture Diagram
    const archDiagram = (0, diagrams_1.generateArchitectureDiagram)(analysis);
    if (archDiagram) {
        md += `## 🏗️ Arquitectura y Diagrama\n\n`;
        md += `### Diagrama de Arquitectura\n\n`;
        md += archDiagram + "\n\n";
    }
    // Folder diagram
    const folderDiagram = (0, diagrams_1.generateFolderDiagram)(analysis);
    if (folderDiagram) {
        md += `### Diagrama de Estructura\n\n`;
        md += folderDiagram + "\n\n";
    }
    md += `---\n\n`;
    // Project Structure
    md += `## 📁 Estructura del Proyecto\n\n`;
    md += `\`\`\`\n`;
    md += `${analysis.projectName}/\n`;
    md += (0, structure_1.getStructureTree)(analysis.structure);
    md += `\`\`\`\n\n`;
    // Key directories
    const keyDirs = (0, structure_1.getKeyDirectories)(analysis.structure);
    if (keyDirs.length > 0) {
        md += `### Directorios Clave\n\n`;
        md += `| Directorio | Propósito |\n`;
        md += `|------------|----------|\n`;
        for (const dir of keyDirs) {
            md += `| \`${dir.name}/\` | ${dir.description} |\n`;
        }
        md += `\n`;
    }
    md += `---\n\n`;
    // Tech Stack
    md += `## 🛠️ Stack Tecnológico\n\n`;
    const categories = groupByCategory(analysis);
    for (const [category, deps] of Object.entries(categories)) {
        if (deps.length === 0)
            continue;
        md += `### ${getCategoryIcon(category)} ${getCategoryName(category)}\n\n`;
        md += `| Librería | Versión | Descripción |\n`;
        md += `|----------|---------|-------------|\n`;
        for (const dep of deps) {
            md += `| **${dep.name}** | ${dep.version} | ${dep.description} |\n`;
        }
        md += `\n`;
    }
    md += `---\n\n`;
    // Design Patterns
    md += `## 🎯 Patrones de Diseño\n\n`;
    for (const pattern of analysis.patterns) {
        md += `### ${pattern.name}\n\n`;
        md += `${pattern.description}\n\n`;
        if (pattern.evidence.length > 0) {
            md += `**Evidencia:** ${pattern.evidence.join(", ")}\n\n`;
        }
    }
    md += `---\n\n`;
    // Styling
    md += `## 🎨 Estilos\n\n`;
    md += `${analysis.styling.description}\n\n`;
    if (analysis.styling.libraries.length > 0) {
        for (const lib of analysis.styling.libraries) {
            md += `- **${lib.name}** (${lib.version}): ${lib.description}\n`;
            if (lib.docsUrl)
                md += `  - 📖 ${lib.docsUrl}\n`;
        }
        md += `\n`;
    }
    md += `---\n\n`;
    // State Management
    md += `## 📦 Estado Global\n\n`;
    if (analysis.stateManagement.length > 0) {
        for (const lib of analysis.stateManagement) {
            md += `### ${lib.name} (${lib.version})\n\n`;
            md += `${lib.description}\n\n`;
            if (lib.docsUrl)
                md += `📖 Documentación: ${lib.docsUrl}\n\n`;
        }
    }
    else {
        md += `No se detectó una librería de estado global. El proyecto probablemente usa:\n`;
        md += `- React Context API\n`;
        md += `- Estado local con \`useState\` / \`useReducer\`\n`;
        md += `- Server state via framework (Next.js Server Components, etc.)\n\n`;
    }
    md += `---\n\n`;
    // Data Fetching
    md += `## 📡 Data Fetching\n\n`;
    if (analysis.dataFetching.length > 0) {
        for (const lib of analysis.dataFetching) {
            md += `### ${lib.name} (${lib.version})\n\n`;
            md += `${lib.description}\n\n`;
            if (lib.docsUrl)
                md += `📖 Documentación: ${lib.docsUrl}\n\n`;
        }
    }
    else {
        md += `No se detectó una librería dedicada de data fetching. El proyecto probablemente usa:\n`;
        md += `- \`fetch\` nativo del navegador/Node.js\n`;
        md += `- Data fetching del framework (loaders, server components, etc.)\n\n`;
    }
    md += `---\n\n`;
    // Database
    md += `## 🗄️ Base de Datos\n\n`;
    if (analysis.database.length > 0) {
        for (const lib of analysis.database) {
            md += `### ${lib.name} (${lib.version})\n\n`;
            md += `${lib.description}\n\n`;
            if (lib.docsUrl)
                md += `📖 Documentación: ${lib.docsUrl}\n\n`;
        }
    }
    else {
        md += `No se detectó un ORM o cliente de base de datos.\n\n`;
    }
    md += `---\n\n`;
    // Authentication
    md += `## 🔐 Autenticación\n\n`;
    if (analysis.authentication.length > 0) {
        for (const lib of analysis.authentication) {
            md += `### ${lib.name} (${lib.version})\n\n`;
            md += `${lib.description}\n\n`;
            if (lib.docsUrl)
                md += `📖 Documentación: ${lib.docsUrl}\n\n`;
        }
    }
    else {
        md += `No se detectó una librería de autenticación dedicada.\n\n`;
    }
    md += `---\n\n`;
    // Testing
    md += `## 🧪 Testing\n\n`;
    if (analysis.testing.libraries.length > 0) {
        md += `| Tipo | Herramienta | Estado |\n`;
        md += `|------|-------------|--------|\n`;
        md += `| Unit Tests | ${analysis.testing.framework} | ${analysis.testing.hasUnit ? "✅ Configurado" : "❌ No detectado"} |\n`;
        md += `| Integration Tests | - | ${analysis.testing.hasIntegration ? "✅ Configurado" : "❌ No detectado"} |\n`;
        md += `| E2E Tests | - | ${analysis.testing.hasE2E ? "✅ Configurado" : "❌ No detectado"} |\n\n`;
        md += `### Librerías de Testing\n\n`;
        for (const lib of analysis.testing.libraries) {
            md += `- **${lib.name}** (${lib.version}): ${lib.description}\n`;
            if (lib.docsUrl)
                md += `  - 📖 ${lib.docsUrl}\n`;
        }
        // Test commands
        const testScripts = Object.entries(analysis.scripts).filter(([key]) => key.includes("test") || key.includes("e2e") || key.includes("spec"));
        if (testScripts.length > 0) {
            md += `\n### Comandos de Testing\n\n`;
            md += `\`\`\`bash\n`;
            for (const [name, cmd] of testScripts) {
                md += `${pkgManager} run ${name}   # ${cmd}\n`;
            }
            md += `\`\`\`\n`;
        }
    }
    else {
        md += `⚠️ No se detectaron herramientas de testing configuradas.\n\n`;
    }
    md += `\n---\n\n`;
    // Scripts
    md += `## 📜 Scripts Disponibles\n\n`;
    const scripts = Object.entries(analysis.scripts);
    if (scripts.length > 0) {
        md += `| Script | Comando | Descripción |\n`;
        md += `|--------|---------|-------------|\n`;
        for (const [name, cmd] of scripts) {
            md += `| \`${pkgManager} run ${name}\` | \`${cmd}\` | ${getScriptDescription(name)} |\n`;
        }
    }
    else {
        md += `No se encontraron scripts en package.json.\n`;
    }
    md += `\n---\n\n`;
    // Config Files
    md += `## ⚙️ Archivos de Configuración\n\n`;
    if (analysis.configs.length > 0) {
        md += `| Archivo | Herramienta | Propósito |\n`;
        md += `|---------|-------------|----------|\n`;
        for (const config of analysis.configs) {
            md += `| \`${config.file}\` | ${config.tool} | ${config.description} |\n`;
        }
    }
    else {
        md += `No se encontraron archivos de configuración relevantes.\n`;
    }
    md += `\n---\n\n`;
    // Data Flow Diagram
    const dataFlowDiagram = (0, diagrams_1.generateDataFlowDiagram)(analysis);
    if (dataFlowDiagram) {
        md += `## 🔄 Flujo de Datos\n\n`;
        md += `### Secuencia típica de una interacción\n\n`;
        md += dataFlowDiagram + "\n\n";
        md += `---\n\n`;
    }
    // All dependencies
    md += `## 📦 Dependencias Principales\n\n`;
    md += `### Producción (${analysis.dependencies.production.length})\n\n`;
    const prodDeps = analysis.dependencies.production.filter((d) => d.category !== "other");
    if (prodDeps.length > 0) {
        md += `| Librería | Versión | Categoría | Descripción |\n`;
        md += `|----------|---------|-----------|-------------|\n`;
        for (const dep of prodDeps) {
            md += `| ${dep.name} | ${dep.version} | ${getCategoryName(dep.category)} | ${dep.description} |\n`;
        }
    }
    md += `\n### Desarrollo (${analysis.dependencies.development.length})\n\n`;
    const devDeps = analysis.dependencies.development.filter((d) => d.category !== "other" && !d.name.startsWith("@types/"));
    if (devDeps.length > 0) {
        md += `| Librería | Versión | Categoría | Descripción |\n`;
        md += `|----------|---------|-----------|-------------|\n`;
        for (const dep of devDeps) {
            md += `| ${dep.name} | ${dep.version} | ${getCategoryName(dep.category)} | ${dep.description} |\n`;
        }
    }
    md += `\n`;
    // Footer
    md += `---\n\n`;
    md += `> 📝 *Esta guía fue generada automáticamente por [project-onboarder](https://github.com/project-onboarder).*\n`;
    md += `> *Última generación: ${new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })}*\n`;
    return md;
}
// ── Helpers ──
function getCategoryLabel(category) {
    const labels = {
        frontend: "🖥️ Frontend",
        backend: "⚙️ Backend",
        fullstack: "🌐 Fullstack",
        unknown: "❓ Desconocido",
    };
    return labels[category] || category;
}
function getCategoryName(category) {
    const names = {
        framework: "Framework",
        "state-management": "Estado Global",
        "data-fetching": "Data Fetching",
        styling: "Estilos",
        testing: "Testing",
        database: "Base de Datos",
        authentication: "Autenticación",
        validation: "Validación",
        "ui-components": "Componentes UI",
        "build-tool": "Build Tool",
        linting: "Linting",
        utility: "Utilidad",
        api: "API",
        logging: "Logging",
        other: "Otros",
    };
    return names[category] || category;
}
function getCategoryIcon(category) {
    const icons = {
        framework: "🚀",
        "state-management": "📦",
        "data-fetching": "📡",
        styling: "🎨",
        testing: "🧪",
        database: "🗄️",
        authentication: "🔐",
        validation: "✅",
        "ui-components": "🧩",
        "build-tool": "🔨",
        linting: "📏",
        utility: "🔧",
        api: "🌐",
        logging: "📋",
        other: "📎",
    };
    return icons[category] || "📎";
}
function groupByCategory(analysis) {
    const allDeps = [...analysis.dependencies.production];
    const grouped = {};
    for (const dep of allDeps) {
        if (dep.category === "other" || dep.name.startsWith("@types/"))
            continue;
        if (!grouped[dep.category])
            grouped[dep.category] = [];
        grouped[dep.category].push({
            name: dep.name,
            version: dep.version,
            description: dep.description,
        });
    }
    return grouped;
}
function getScriptDescription(name) {
    const descriptions = {
        dev: "Inicia el servidor de desarrollo",
        start: "Inicia la aplicación en producción",
        build: "Compila el proyecto para producción",
        test: "Ejecuta los tests",
        "test:watch": "Ejecuta tests en modo watch",
        "test:cov": "Ejecuta tests con cobertura",
        "test:e2e": "Ejecuta tests end-to-end",
        lint: "Ejecuta el linter",
        "lint:fix": "Corrige errores de lint automáticamente",
        format: "Formatea el código",
        preview: "Preview del build de producción",
        generate: "Genera código (tipos, cliente DB, etc.)",
        migrate: "Ejecuta migraciones de base de datos",
        seed: "Ejecuta seeds de base de datos",
        storybook: "Inicia Storybook",
        typecheck: "Verifica tipos TypeScript",
        clean: "Limpia archivos de build",
        prepare: "Prepara git hooks (Husky)",
    };
    return descriptions[name] || "-";
}
function findDevCommand(scripts, pkgManager) {
    if (scripts["dev"])
        return `${pkgManager} run dev`;
    if (scripts["start:dev"])
        return `${pkgManager} run start:dev`;
    if (scripts["start"])
        return `${pkgManager} run start`;
    return `${pkgManager} run dev`;
}
function getStepNumber(analysis) {
    let step = 3;
    if (analysis.configs.some((c) => c.file.includes(".env")))
        step++;
    if (analysis.database.some((d) => d.name.includes("prisma")))
        step++;
    return step;
}
//# sourceMappingURL=markdown.js.map