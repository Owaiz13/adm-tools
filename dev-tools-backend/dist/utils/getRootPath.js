/*
This function returns a absolute path to the file/directory.
Parameters:
-----------
- relativePath: string - The relative path to the directory ot file

Returns:
-----------
- string - The absolute path to the directory or file.
*/
import path from "path";
export default function getRootPath(relativePath) {
    const projectRoot = process.cwd();
    const resolvedPath = path.resolve(projectRoot, relativePath);
    return resolvedPath;
}
