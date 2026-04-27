import { ProjectAnalysis } from "../types";

/**
 * Wraps raw Mermaid code into both a ```mermaid block (for GitHub/GitLab)
 * and a mermaid.ink image fallback (for any other Markdown viewer).
 */
function wrapDiagram(mermaidCode: string, alt: string): string {
  const encoded = Buffer.from(mermaidCode, "utf-8").toString("base64url");
  const imgUrl = `https://mermaid.ink/img/${encoded}`;

  let output = "";
  // Mermaid code block (renders on GitHub, GitLab, VS Code)
  output += "```mermaid\n" + mermaidCode + "\n```\n\n";
  // Image fallback (renders everywhere else)
  output += `<details><summary>📷 Ver como imagen</summary>\n\n`;
  output += `![${alt}](${imgUrl})\n\n`;
  output += `</details>`;

  return output;
}

export function generateArchitectureDiagram(analysis: ProjectAnalysis): string {
  const {
    framework,
    stateManagement,
    dataFetching,
    database,
    styling,
    authentication,
  } = analysis;

  if (framework.category === "unknown") {
    return "";
  }

  let code = "flowchart TB\n";

  // Client layer
  if (["frontend", "fullstack"].includes(framework.category)) {
    code += '  subgraph CLIENT["🖥️ Cliente"]\n';
    code += '    UI["UI Components"]\n';

    if (stateManagement.length > 0) {
      code += `    STATE["Estado Global\\n(${stateManagement.map((s) => s.name).join(", ")})"]\n`;
      code += "    UI --> STATE\n";
    }

    if (styling.libraries.length > 0) {
      code += `    STYLES["Estilos\\n(${styling.approach})"]\n`;
      code += "    UI --> STYLES\n";
    }

    code += "  end\n\n";
  }

  // API / Data layer
  if (dataFetching.length > 0 || framework.category === "fullstack") {
    code += '  subgraph DATA["📡 Data Layer"]\n';

    if (dataFetching.length > 0) {
      code += `    FETCH["Data Fetching\\n(${dataFetching.map((f) => f.name).join(", ")})"]\n`;
    }

    if (
      framework.category === "fullstack" ||
      framework.category === "backend"
    ) {
      code += '    API["API Routes / Endpoints"]\n';
    }

    code += "  end\n\n";
  }

  // Backend / Server
  if (["backend", "fullstack"].includes(framework.category)) {
    code += `  subgraph SERVER["⚙️ Server (${framework.name})"]\n`;

    if (authentication.length > 0) {
      code += `    AUTH["Auth\\n(${authentication.map((a) => a.name).join(", ")})"]\n`;
    }

    code += '    LOGIC["Business Logic"]\n';

    if (database.length > 0) {
      code += `    ORM["ORM / DB Client\\n(${database.map((d) => d.name).join(", ")})"]\n`;
      code += "    LOGIC --> ORM\n";
    }

    code += "  end\n\n";
  }

  // Database
  if (database.length > 0) {
    code += '  subgraph DB["🗄️ Base de Datos"]\n';
    code += '    DATABASE[("Database")]\n';
    code += "  end\n\n";
  }

  // Connections
  if (["frontend", "fullstack"].includes(framework.category)) {
    if (dataFetching.length > 0) {
      code += "  UI --> FETCH\n";
    }
    if (framework.category === "fullstack") {
      if (dataFetching.length > 0) {
        code += "  FETCH --> API\n";
      } else {
        code += "  UI --> API\n";
      }
    }
  }

  if (["backend", "fullstack"].includes(framework.category)) {
    if (framework.category === "fullstack") {
      code += "  API --> LOGIC\n";
    }
    if (authentication.length > 0) {
      code += "  API --> AUTH\n";
    }
    if (database.length > 0) {
      code += "  ORM --> DATABASE\n";
    }
  }

  return wrapDiagram(code, "Architecture Diagram");
}

export function generateDataFlowDiagram(analysis: ProjectAnalysis): string {
  const { framework, stateManagement, dataFetching, database } = analysis;

  if (framework.category === "unknown") return "";

  let code = "sequenceDiagram\n";

  if (["frontend", "fullstack"].includes(framework.category)) {
    code += "  participant U as 👤 Usuario\n";
    code += "  participant C as 🖥️ Componente\n";

    if (stateManagement.length > 0) {
      code += `  participant S as 📦 Store (${stateManagement[0].name})\n`;
    }
  }

  if (dataFetching.length > 0) {
    code += `  participant F as 📡 ${dataFetching[0].name}\n`;
  }

  if (["backend", "fullstack"].includes(framework.category)) {
    code += `  participant API as ⚙️ ${framework.name} API\n`;
  }

  if (database.length > 0) {
    code += "  participant DB as 🗄️ Database\n";
  }

  code += "\n";

  // Flow
  if (["frontend", "fullstack"].includes(framework.category)) {
    code += "  U->>C: Interacción\n";

    if (stateManagement.length > 0) {
      code += "  C->>S: Actualizar estado\n";
      code += "  S-->>C: Re-render\n";
    }

    if (dataFetching.length > 0) {
      code += "  C->>F: Request datos\n";
      if (["backend", "fullstack"].includes(framework.category)) {
        code += "  F->>API: HTTP/GraphQL Request\n";
      }
    } else if (["backend", "fullstack"].includes(framework.category)) {
      code += "  C->>API: HTTP Request\n";
    }
  }

  if (
    ["backend", "fullstack"].includes(framework.category) &&
    database.length > 0
  ) {
    code += "  API->>DB: Query\n";
    code += "  DB-->>API: Resultado\n";
  }

  if (["backend", "fullstack"].includes(framework.category)) {
    if (dataFetching.length > 0) {
      code += "  API-->>F: Response\n";
      code += "  F-->>C: Datos (cached)\n";
    } else if (["frontend", "fullstack"].includes(framework.category)) {
      code += "  API-->>C: Response\n";
    }
  }

  if (["frontend", "fullstack"].includes(framework.category)) {
    code += "  C-->>U: UI Actualizada\n";
  }

  return wrapDiagram(code, "Data Flow Diagram");
}

export function generateFolderDiagram(analysis: ProjectAnalysis): string {
  const dirs =
    analysis.structure.children?.filter((c) => c.type === "directory") || [];

  if (dirs.length === 0) return "";

  let code = "flowchart LR\n";
  code += `  ROOT["📁 ${analysis.projectName}"]\n`;

  for (const dir of dirs.slice(0, 12)) {
    const id = dir.name.replace(/[^a-zA-Z0-9]/g, "_");
    const icon = getDirIcon(dir.name);
    code += `  ROOT --> ${id}["${icon} ${dir.name}/"]\n`;

    // Show one level of subdirs
    const subDirs =
      dir.children?.filter((c) => c.type === "directory").slice(0, 5) || [];
    for (const sub of subDirs) {
      const subId = `${id}_${sub.name.replace(/[^a-zA-Z0-9]/g, "_")}`;
      code += `  ${id} --> ${subId}["${sub.name}/"]\n`;
    }
  }

  return wrapDiagram(code, "Folder Structure");
}

function getDirIcon(name: string): string {
  const icons: Record<string, string> = {
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

export function generateImportGraphDiagram(analysis: ProjectAnalysis): string {
  // Find the most connected files to keep the diagram readable
  const nodes = analysis.importGraph
    .filter((n) => n.imports.length > 0 || n.importedBy.length > 0)
    .sort(
      (a, b) =>
        b.imports.length +
        b.importedBy.length -
        (a.imports.length + a.importedBy.length),
    )
    .slice(0, 15);

  if (nodes.length === 0) return "";

  const nodeFiles = new Set(nodes.map((n) => n.file));

  let code = "flowchart LR\n";

  // Add nodes
  for (const node of nodes) {
    const id = sanitizeId(node.file);
    const label = shortenPath(node.file);
    code += `  ${id}["${label}"]\n`;
  }

  code += "\n";

  // Add edges (only between visible nodes)
  const edges = new Set<string>();
  for (const node of nodes) {
    const fromId = sanitizeId(node.file);
    for (const imp of node.imports) {
      if (nodeFiles.has(imp)) {
        const toId = sanitizeId(imp);
        const edgeKey = `${fromId}->${toId}`;
        if (!edges.has(edgeKey)) {
          edges.add(edgeKey);
          code += `  ${fromId} --> ${toId}\n`;
        }
      }
    }
  }

  return wrapDiagram(code, "Import Graph");
}

function sanitizeId(filePath: string): string {
  return filePath.replace(/[^a-zA-Z0-9]/g, "_").replace(/_+/g, "_");
}

function shortenPath(filePath: string): string {
  // Remove src/ prefix and extension for cleaner labels
  return filePath.replace(/^src\//, "").replace(/\.(ts|tsx|js|jsx)$/, "");
}
