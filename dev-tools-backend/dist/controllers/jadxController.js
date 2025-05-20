import path from "path";
import getRootPath from "../utils/getRootPath";
import execCommand from "../utils/execCommand";
import readNestedDir from "../utils/readNestedDir";
const PORT = 9000;
export const decompileJadx = async (req, res) => {
    const uploadsPath = getRootPath("workers/jadx_decompile/uploads");
    const outputPath = getRootPath("workers/jadx_decompile/output");
    const apkFile = req.file;
    if (!apkFile) {
        return res.status(400).send("No file uploaded.");
    }
    const apkFilename = apkFile.filename;
    const command = `docker run -v ${uploadsPath}:/app/uploads -v ${outputPath}:/app/output jadx-decompile ${apkFilename}`;
    const result = await execCommand(command);
    if (!result.success) {
        return res.status(500).send(result.message);
    }
    const apkName = apkFilename.replace(".apk", "");
    const decompDir = path.join(outputPath, apkName);
    const files = readNestedDir(decompDir, outputPath);
    const fileUrls = files
        .filter((file) => file !== ".gitkeep" && !/^\..*$/.test(file))
        .map((file) => ({
        filename: path.basename(file),
        path: file,
        url: `http://localhost:${PORT}/static/apk/${file}`,
    }));
    res.json({ files: fileUrls });
};
