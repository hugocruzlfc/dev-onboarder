import { FolderStructure } from "../types";
export declare function analyzeStructure(projectPath: string): FolderStructure;
export declare function getStructureTree(structure: FolderStructure, prefix?: string): string;
export declare function getKeyDirectories(structure: FolderStructure): {
    name: string;
    description: string;
}[];
//# sourceMappingURL=structure.d.ts.map