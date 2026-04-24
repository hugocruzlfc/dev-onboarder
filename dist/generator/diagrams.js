"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateArchitectureDiagram = generateArchitectureDiagram;
exports.generateDataFlowDiagram = generateDataFlowDiagram;
exports.generateFolderDiagram = generateFolderDiagram;
exports.generateImportGraphDiagram = generateImportGraphDiagram;
function generateArchitectureDiagram(analysis) {
    const { framework, stateManagement, dataFetching, database, styling, authentication, } = analysis;
    if (framework.category === "unknown") {
        return "";
    }
    let diagram = "```mermaid\nflowchart TB\n";
    // Client layer
    if (["frontend", "fullstack"].includes(framework.category)) {
        diagram += '  subgraph CLIENT["🖥️ Cliente"]\n';
        diagram += '    UI["UI Components"]\n';
        if (stateManagement.length > 0) {
            diagram += `    STATE["Estado Global\\n(${stateManagement.map((s) => s.name).join(", ")})"]\n`;
            diagram += "    UI --> STATE\n";
        }
        if (styling.libraries.length > 0) {
            diagram += `    STYLES["Estilos\\n(${styling.approach})"]\n`;
            diagram += "    UI --> STYLES\n";
        }
        diagram += "  end\n\n";
    }
    // API / Data layer
    if (dataFetching.length > 0 || framework.category === "fullstack") {
        diagram += '  subgraph DATA["📡 Data Layer"]\n';
        if (dataFetching.length > 0) {
            diagram += `    FETCH["Data Fetching\\n(${dataFetching.map((f) => f.name).join(", ")})"]\n`;
        }
        if (framework.category === "fullstack" ||
            framework.category === "backend") {
            diagram += '    API["API Routes / Endpoints"]\n';
        }
        diagram += "  end\n\n";
    }
    // Backend / Server
    if (["backend", "fullstack"].includes(framework.category)) {
        diagram += `  subgraph SERVER["⚙️ Server (${framework.name})"]\n`;
        if (authentication.length > 0) {
            diagram += `    AUTH["Auth\\n(${authentication.map((a) => a.name).join(", ")})"]\n`;
        }
        diagram += '    LOGIC["Business Logic"]\n';
        if (database.length > 0) {
            diagram += `    ORM["ORM / DB Client\\n(${database.map((d) => d.name).join(", ")})"]\n`;
            diagram += "    LOGIC --> ORM\n";
        }
        diagram += "  end\n\n";
    }
    // Database
    if (database.length > 0) {
        diagram += '  subgraph DB["🗄️ Base de Datos"]\n';
        diagram += '    DATABASE[("Database")]\n';
        diagram += "  end\n\n";
    }
    // Connections
    if (["frontend", "fullstack"].includes(framework.category)) {
        if (dataFetching.length > 0) {
            diagram += "  UI --> FETCH\n";
        }
        if (framework.category === "fullstack") {
            if (dataFetching.length > 0) {
                diagram += "  FETCH --> API\n";
            }
            else {
                diagram += "  UI --> API\n";
            }
        }
    }
    if (["backend", "fullstack"].includes(framework.category)) {
        if (framework.category === "fullstack") {
            diagram += "  API --> LOGIC\n";
        }
        if (authentication.length > 0) {
            diagram += "  API --> AUTH\n";
        }
        if (database.length > 0) {
            diagram += "  ORM --> DATABASE\n";
        }
    }
    diagram += "```";
    return diagram;
}
function generateDataFlowDiagram(analysis) {
    const { framework, stateManagement, dataFetching, database } = analysis;
    if (framework.category === "unknown")
        return "";
    let diagram = "```mermaid\nsequenceDiagram\n";
    if (["frontend", "fullstack"].includes(framework.category)) {
        diagram += "  participant U as 👤 Usuario\n";
        diagram += "  participant C as 🖥️ Componente\n";
        if (stateManagement.length > 0) {
            diagram += `  participant S as 📦 Store (${stateManagement[0].name})\n`;
        }
    }
    if (dataFetching.length > 0) {
        diagram += `  participant F as 📡 ${dataFetching[0].name}\n`;
    }
    if (["backend", "fullstack"].includes(framework.category)) {
        diagram += `  participant API as ⚙️ ${framework.name} API\n`;
    }
    if (database.length > 0) {
        diagram += "  participant DB as 🗄️ Database\n";
    }
    diagram += "\n";
    // Flow
    if (["frontend", "fullstack"].includes(framework.category)) {
        diagram += "  U->>C: Interacción\n";
        if (stateManagement.length > 0) {
            diagram += "  C->>S: Actualizar estado\n";
            diagram += "  S-->>C: Re-render\n";
        }
        if (dataFetching.length > 0) {
            diagram += "  C->>F: Request datos\n";
            if (["backend", "fullstack"].includes(framework.category)) {
                diagram += "  F->>API: HTTP/GraphQL Request\n";
            }
        }
        else if (["backend", "fullstack"].includes(framework.category)) {
            diagram += "  C->>API: HTTP Request\n";
        }
    }
    if (["backend", "fullstack"].includes(framework.category) &&
        database.length > 0) {
        diagram += "  API->>DB: Query\n";
        diagram += "  DB-->>API: Resultado\n";
    }
    if (["backend", "fullstack"].includes(framework.category)) {
        if (dataFetching.length > 0) {
            diagram += "  API-->>F: Response\n";
            diagram += "  F-->>C: Datos (cached)\n";
        }
        else if (["frontend", "fullstack"].includes(framework.category)) {
            diagram += "  API-->>C: Response\n";
        }
    }
    if (["frontend", "fullstack"].includes(framework.category)) {
        diagram += "  C-->>U: UI Actualizada\n";
    }
    diagram += "```";
    return diagram;
}
function generateFolderDiagram(analysis) {
    const dirs = analysis.structure.children?.filter((c) => c.type === "directory") || [];
    if (dirs.length === 0)
        return "";
    let diagram = "```mermaid\nflowchart LR\n";
    diagram += `  ROOT["📁 ${analysis.projectName}"]\n`;
    for (const dir of dirs.slice(0, 12)) {
        const id = dir.name.replace(/[^a-zA-Z0-9]/g, "_");
        const icon = getDirIcon(dir.name);
        diagram += `  ROOT --> ${id}["${icon} ${dir.name}/"]\n`;
        // Show one level of subdirs
        const subDirs = dir.children?.filter((c) => c.type === "directory").slice(0, 5) || [];
        for (const sub of subDirs) {
            const subId = `${id}_${sub.name.replace(/[^a-zA-Z0-9]/g, "_")}`;
            diagram += `  ${id} --> ${subId}["${sub.name}/"]\n`;
        }
    }
    diagram += "```";
    return diagram;
}
function getDirIcon(name) {
    const icons = {
        src: "📂",
        app: "🚀",
        pages: "📄",
        components: "🧩",
        lib: "📚",
        utils: "🔧",
        hooks: "🪝",
        services: "⚙️",
        api: "📡",
        styles: "🎨",
        public: "🌐",
        assets: "🖼️",
        test: "🧪",
        tests: "🧪",
        __tests__: "🧪",
        prisma: "💾",
        config: "⚙️",
        types: "📝",
        store: "📦",
        middleware: "🔀",
        generated: "🤖",
    };
    return icons[name.toLowerCase()] || "📁";
}
function generateImportGraphDiagram(analysis) {
    // Find the most connected files to keep the diagram readable
    const nodes = analysis.importGraph
        .filter((n) => n.imports.length > 0 || n.importedBy.length > 0)
        .sort((a, b) => (b.imports.length + b.importedBy.length) - (a.imports.length + a.importedBy.length))
        .slice(0, 15);
    if (nodes.length === 0)
        return "";
    const nodeFiles = new Set(nodes.map((n) => n.file));
    let diagram = "```mermaid\nflowchart LR\n";
    // Add nodes
    for (const node of nodes) {
        const id = sanitizeId(node.file);
        const label = shortenPath(node.file);
        diagram += `  ${id}["${label}"]\n`;
    }
    diagram += "\n";
    // Add edges (only between visible nodes)
    const edges = new Set();
    for (const node of nodes) {
        const fromId = sanitizeId(node.file);
        for (const imp of node.imports) {
            if (nodeFiles.has(imp)) {
                const toId = sanitizeId(imp);
                const edgeKey = `${fromId}->${toId}`;
                if (!edges.has(edgeKey)) {
                    edges.add(edgeKey);
                    diagram += `  ${fromId} --> ${toId}\n`;
                }
            }
        }
    }
    diagram += "```";
    return diagram;
}
function sanitizeId(filePath) {
    return filePath.replace(/[^a-zA-Z0-9]/g, "_").replace(/_+/g, "_");
}
function shortenPath(filePath) {
    // Remove src/ prefix and extension for cleaner labels
    return filePath
        .replace(/^src\//, "")
        .replace(/\.(ts|tsx|js|jsx)$/, "");
}
//# sourceMappingURL=diagrams.js.map