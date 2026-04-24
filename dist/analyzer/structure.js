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
exports.analyzeStructure = analyzeStructure;
exports.getStructureTree = getStructureTree;
exports.getKeyDirectories = getKeyDirectories;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const IGNORED_DIRS = new Set([
    "node_modules",
    ".git",
    ".next",
    ".nuxt",
    ".output",
    "dist",
    "build",
    ".cache",
    ".turbo",
    ".vercel",
    ".svelte-kit",
    "coverage",
    ".nyc_output",
    "__pycache__",
    ".pytest_cache",
    "venv",
    ".venv",
    ".idea",
    ".vscode",
    ".DS_Store",
    "vendor",
    "tmp",
    ".tmp",
    ".parcel-cache",
    "storybook-static",
]);
const MAX_DEPTH = 4;
const MAX_FILES_PER_DIR = 50;
function analyzeStructure(projectPath) {
    return buildTree(projectPath, 0);
}
function buildTree(dirPath, depth) {
    const name = path.basename(dirPath);
    const structure = {
        name,
        path: dirPath,
        type: "directory",
        children: [],
    };
    if (depth >= MAX_DEPTH)
        return structure;
    let entries;
    try {
        entries = fs.readdirSync(dirPath, { withFileTypes: true });
    }
    catch {
        return structure;
    }
    // Sort: directories first, then files
    entries.sort((a, b) => {
        if (a.isDirectory() && !b.isDirectory())
            return -1;
        if (!a.isDirectory() && b.isDirectory())
            return 1;
        return a.name.localeCompare(b.name);
    });
    let fileCount = 0;
    for (const entry of entries) {
        if (entry.name.startsWith(".") && entry.name !== ".env.example")
            continue;
        if (IGNORED_DIRS.has(entry.name))
            continue;
        const fullPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
            structure.children.push(buildTree(fullPath, depth + 1));
        }
        else if (entry.isFile()) {
            if (fileCount >= MAX_FILES_PER_DIR)
                continue;
            fileCount++;
            structure.children.push({
                name: entry.name,
                path: fullPath,
                type: "file",
            });
        }
    }
    return structure;
}
function getStructureTree(structure, prefix = "") {
    let result = "";
    const children = structure.children || [];
    for (let i = 0; i < children.length; i++) {
        const child = children[i];
        const isLast = i === children.length - 1;
        const connector = isLast ? "└── " : "├── ";
        const extension = isLast ? "    " : "│   ";
        result += `${prefix}${connector}${child.name}${child.type === "directory" ? "/" : ""}\n`;
        if (child.type === "directory" &&
            child.children &&
            child.children.length > 0) {
            result += getStructureTree(child, prefix + extension);
        }
    }
    return result;
}
function getKeyDirectories(structure) {
    const keyDirs = [];
    const children = structure.children || [];
    const dirDescriptions = {
        src: "Código fuente principal de la aplicación",
        app: "Directorio de rutas/páginas (App Router en Next.js o similar)",
        pages: "Directorio de páginas/rutas del proyecto",
        components: "Componentes reutilizables de UI",
        lib: "Librerías y utilidades internas",
        utils: "Funciones de utilidad",
        helpers: "Funciones auxiliares",
        hooks: "Custom hooks de React",
        services: "Lógica de servicios y comunicación con APIs",
        api: "Endpoints o rutas de la API",
        styles: "Archivos de estilos (CSS, SCSS, etc.)",
        public: "Assets estáticos servidos directamente",
        assets: "Recursos estáticos (imágenes, fuentes, etc.)",
        config: "Archivos de configuración",
        types: "Definiciones de tipos TypeScript",
        interfaces: "Interfaces TypeScript",
        models: "Modelos de datos / entidades",
        schemas: "Esquemas de validación o base de datos",
        middleware: "Funciones middleware",
        guards: "Guards de autenticación/autorización",
        interceptors: "Interceptores de requests/responses",
        pipes: "Pipes de validación/transformación",
        decorators: "Decoradores personalizados",
        modules: "Módulos de la aplicación",
        controllers: "Controladores que manejan requests HTTP",
        resolvers: "Resolvers de GraphQL",
        providers: "Proveedores de contexto o inyección de dependencias",
        store: "Store de estado global",
        state: "Manejo de estado de la aplicación",
        slices: "Slices de Redux/RTK",
        features: "Módulos organizados por feature/funcionalidad",
        domains: "Módulos organizados por dominio de negocio",
        test: "Archivos de testing",
        tests: "Archivos de testing",
        __tests__: "Archivos de testing (convención Jest)",
        e2e: "Tests end-to-end",
        cypress: "Tests E2E con Cypress",
        prisma: "Esquemas y migraciones de Prisma ORM",
        migrations: "Migraciones de base de datos",
        generated: "Código auto-generado (tipos, cliente Prisma, etc.)",
        scripts: "Scripts de automatización",
        docker: "Configuración de Docker",
        infra: "Infraestructura y deployment",
        deploy: "Configuración de despliegue",
        i18n: "Internacionalización y traducciones",
        locales: "Archivos de traducciones",
        layouts: "Componentes de layout/estructura de página",
        templates: "Plantillas reutilizables",
        context: "React Context providers",
        actions: "Server actions o Redux actions",
        reducers: "Reducers de estado",
    };
    for (const child of children) {
        if (child.type === "directory") {
            const desc = dirDescriptions[child.name.toLowerCase()];
            if (desc) {
                keyDirs.push({ name: child.name, description: desc });
            }
            // Recurse one level into src/
            if (child.name === "src" && child.children) {
                for (const subChild of child.children) {
                    if (subChild.type === "directory") {
                        const subDesc = dirDescriptions[subChild.name.toLowerCase()];
                        if (subDesc) {
                            keyDirs.push({
                                name: `src/${subChild.name}`,
                                description: subDesc,
                            });
                        }
                    }
                }
            }
        }
    }
    return keyDirs;
}
//# sourceMappingURL=structure.js.map