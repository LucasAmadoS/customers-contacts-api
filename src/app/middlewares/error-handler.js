import * as Yup from "yup"
import multer from "multer"
import { UniqueConstraintError, ForeignKeyConstraintError, DatabaseError } from "sequelize"
import AppError from "../errors/app-error.js"

const INVALID_VALUE_CODES = ["22P02", "22003", "22007", "22008"]

export default (err, req, res, next) => {
    if (err instanceof AppError) {
        return res.status(err.status).json({ error: err.message })
    }

    if (err instanceof Yup.ValidationError) {
        return res.status(400).json({ error: "Erro ao validar o Schema", details: err.errors })
    }

    if (err instanceof multer.MulterError) {
        const message = err.code === "LIMIT_FILE_SIZE"
            ? "Arquivo muito grande (máximo 5 MB)"
            : "Erro no upload do arquivo"

        return res.status(400).json({ error: message })
    }

    if (err instanceof UniqueConstraintError) {
        const field = Object.keys(err.fields || {})[0]
            || err.parent?.constraint?.match(/^[^_]+_(.+)_key$/)?.[1]

        const message = field ? `Já existe um registro com esse ${field}` : "Registro já existe"

        return res.status(409).json({ error: message })
    }

    if (err instanceof ForeignKeyConstraintError) {
        return res.status(400).json({ error: "Registro relacionado não encontrado" })
    }

    if (err instanceof DatabaseError && INVALID_VALUE_CODES.includes(err.parent?.code)) {
        return res.status(400).json({ error: "Parâmetro inválido" })
    }

    if (err.type === "entity.parse.failed") {
        return res.status(400).json({ error: "JSON inválido" })
    }

    console.error(err)

    return res.status(500).json({ error: "Erro interno do servidor" })
}
