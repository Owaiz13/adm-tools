import express from "express";
import getRootPath from "./utils/getRootPath.js";
import execCommand from "./utils/execCommand.js";
import readNestedDir from "./utils/readNestedDir.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import cors from "cors";
const app = express();
app.use(cors());
const PORT = 9000;
// Debug logging middleware (optional but helpful)
app.use((req, res, next) => {
    console.log(`📥 [${req.method}] ${req.originalUrl}`);
    next();
});
function getMulterUpload(destination) {
    if (!fs.existsSync(destination)) {
        fs.mkdirSync(destination, { recursive: true });
    }
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, destination);
        },
        filename: (req, file, cb) => {
            cb(null, file.originalname);
        },
    });
    return multer({ storage });
}
app.get("/", (req, res) => {
    res.json({ version: "0.0.1" });
});
app.post("/decompile_jadx", async (req, res) => {
    const uploadsPath = getRootPath("jadx-docker/uploads");
    const outputPath = getRootPath("jadx-docker/output");
    const upload = getMulterUpload(uploadsPath).single("apkfile");
    upload(req, res, async (err) => {
        if (err) {
            return res.status(500).send(`File upload failed. Error: ${err}`);
        }
        const apkFile = req.file;
        if (!apkFile) {
            return res.status(400).send("No file uploaded.");
        }
        const command = `docker run -v ${uploadsPath}:/app/uploads -v ${outputPath}:/app/output jadx-decompile ${apkFile.filename}`;
        const result = await execCommand(command);
        if (!result.success) {
            return res.status(500).send(result.message);
        }
        const apkName = apkFile.filename.replace(".apk", "");
        const decompDir = path.join(outputPath, apkName);
        const files = readNestedDir(decompDir, outputPath); // should return full paths
        const fileUrls = files
            .filter((file) => file !== ".gitkeep" && !/^\..*$/.test(file))
            .map((file) => {
            let relativePath = path.relative(outputPath, file)
                .split(path.sep)
                .join("/")
                .replace(/^(\.\.\/|\/)+/, ""); // ✅ clean relative path
            return {
                filename: path.basename(file),
                path: relativePath,
                url: `http://localhost:${PORT}/static/apk/${relativePath}`,
            };
        });
        res.json({ files: fileUrls });
    });
});
app.post("/decompile_so", async (req, res) => {
    const uploadsPath = getRootPath("workers/so_decompiler/uploads");
    const outputPath = getRootPath("workers/so_decompiler/output");
    const upload = getMulterUpload(uploadsPath).single("sofile");
    upload(req, res, async (err) => {
        if (err) {
            console.error("Multer error:", err);
            return res.status(500).send(`File upload failed. Error: ${err.message}`);
        }
        const soFile = req.file;
        if (!soFile) {
            return res.status(400).send("No file uploaded.");
        }
        const selections = req.body.selections || [];
        let argument;
        if (selections.includes("angr") && selections.includes("ghidra")) {
            argument = "decompile";
        }
        else if (selections.includes("angr")) {
            argument = "angr";
        }
        else if (selections.includes("ghidra")) {
            argument = "ghidra";
        }
        else {
            return res.status(400).send("Invalid selections.");
        }
        const command = `docker run -v ${uploadsPath}:/decompile/uploads -v ${outputPath}:/decompile/output devrvk/so-decompiler ${argument} /decompile/uploads/${soFile.filename} /decompile/output`;
        const result = await execCommand(command);
        if (!result.success) {
            return res.status(500).send(result.message);
        }
        const files = fs.readdirSync(outputPath);
        const fileUrls = files
            .filter((file) => file !== ".gitkeep" && !/^\..*$/.test(file))
            .map((file) => ({
            filename: file,
            url: `http://localhost:${PORT}/static/so/${file}`,
        }));
        res.json({ files: fileUrls });
    });
});
// ✅ Static file serving
app.use("/static/apk", express.static(getRootPath("jadx-docker/output")));
app.use("/static/so", express.static(getRootPath("workers/so_decompiler/output")));
app.listen(PORT, () => {
    console.log(`🚀 Server Running on http://localhost:${PORT}`);
    console.log(`📁 Serving static APK files from: ${getRootPath("jadx-docker/output")}`);
});
