import File from "../models/File.js"

class filesController {
    async create(req, res) {
        if (!req.file) {
            return res.status(400).json({ error: "Nenhum arquivo enviado (campo \"file\")" })
        }

        const { originalname: name, filename: path } = req.file

        const file = await File.create({ name, path })

        return res.status(201).json(file)
    }
}

export default new filesController()
