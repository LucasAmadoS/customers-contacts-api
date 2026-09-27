import multer from "multer"
import { extname, resolve, dirname } from "path"
import { fileURLToPath } from "url"
import crypto from "crypto"
import AppError from "../app/errors/app-error.js"

const __dirname = dirname(fileURLToPath(import.meta.url))

export const uploadsFolder = resolve(__dirname, "..", "..", "tmp", "uploads")

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"]

export default {
    storage: multer.diskStorage({
        destination: uploadsFolder,
        filename: (req, file, callback) => {
            crypto.randomBytes(16, (err, res) => {
                if (err) return callback(err)

                return callback(null, res.toString("hex") + extname(file.originalname))
            })
        }
    }),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB
        files: 1,
    },
    fileFilter: (req, file, callback) => {
        if (!ALLOWED_TYPES.includes(file.mimetype)) {
            return callback(new AppError(400, "Tipo de arquivo não permitido (use JPG, PNG, GIF ou WEBP)"))
        }

        return callback(null, true)
    }
}
