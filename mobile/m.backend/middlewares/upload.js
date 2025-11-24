// backend/middlewares/upload.js
import multer from "multer";
import path from "path";
import fs from "fs";

// ---------------------------------------------------------
// 📌 Configurações gerais
// ---------------------------------------------------------
const UPLOAD_DIR = path.resolve("uploads");

// Criar a pasta se não existir
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// ---------------------------------------------------------
// 📌 Extensões permitidas
// ---------------------------------------------------------
const allowedMime = {
    images: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    files: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ]
};

// Unificar lista
const ALLOWED_MIME_TYPES = [...allowedMime.images, ...allowedMime.files];

// ---------------------------------------------------------
// 📌 Função para limpar o nome do arquivo
// ---------------------------------------------------------
function sanitizeFileName(original) {
    return original
        .replace(/[^\w.-]/g, "_")
        .toLowerCase();
}

// ---------------------------------------------------------
// 📌 Configuração do destino e nome
// ---------------------------------------------------------
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        const subfolder = file.mimetype.startsWith("image/") ? "images" : "files";
        const finalPath = path.join(UPLOAD_DIR, subfolder);

        if (!fs.existsSync(finalPath)) {
            fs.mkdirSync(finalPath, { recursive: true });
        }

        callback(null, finalPath);
    },

    filename: (req, file, callback) => {
        const timestamp = Date.now();
        const sanitized = sanitizeFileName(file.originalname);
        const finalName = `${timestamp}-${sanitized}`;
        callback(null, finalName);
    },
});

// ---------------------------------------------------------
// 📌 Filtro de arquivos
// ---------------------------------------------------------
function fileFilter(req, file, callback) {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        return callback(new Error("Tipo de arquivo não permitido."), false);
    }
    callback(null, true);
}

// ---------------------------------------------------------
// 📌 Objeto Multer final
// ---------------------------------------------------------
export const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10 MB por arquivo
    },
    fileFilter
});
