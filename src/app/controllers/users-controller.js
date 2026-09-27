import * as Yup from "yup"
import User from "../models/User.js"
import File from "../models/File.js"
import Queue from "../../lib/queue.js"
import welcomeEmail from "../jobs/welcomeEmail.js"
import listQuery from "../helpers/list-query.js"

const SORTABLE = ["id", "name", "email", "createdAt", "updatedAt"]

const HIDDEN = ["password", "password_hash", "file_id"]

const includeFile = {
    model: File,
    as: "file",
    attributes: ["id", "name", "path", "url"]
}

class userController {
    // Listar todos os Users
    async index(req, res) {
        const { where, order, limit, offset } = listQuery(req.query, {
            sortable: SORTABLE
        })

        const data = await User.findAll({
            attributes: { exclude: HIDDEN },
            include: [includeFile],
            where,
            order,
            limit,
            offset
        });

        return res.json(data);
    }

    // Lista um Users por ID - Route Params
    async show(req, res) {
        const user = await User.findByPk(req.params.id, {
            attributes: { exclude: HIDDEN },
            include: [includeFile]
        })

        if (!user) {
            return res.status(404).json({ error: "ID não encontrado" })
        }

        return res.json(user)
    }

    // Criar um novo User
    async create(req, res) {
        const schema = Yup.object().shape({
            name: Yup.string().required(),
            email: Yup.string().email().required(),
            password: Yup.string().required().min(8),
            passwordConfirmation: Yup.string().when("password", ([password], field) =>
                password ? field.required().oneOf([Yup.ref("password")]) : field
            )
        })

        const data = await schema.validate(req.body, { stripUnknown: true, abortEarly: false })

        const { id, name, email, createdAt, updatedAt } = await User.create(data)

        try {
            await Queue.add(welcomeEmail.key, { name, email })
        } catch (error) {
            console.error("Erro ao enfileirar e-mail de boas-vindas:", error.message)
        }

        return res.status(201).json({ id, name, email, createdAt, updatedAt });
    }

    // Atualiza um User
    async update(req, res) {
        if (Number(req.params.id) !== req.userId) {
            return res.status(403).json({ error: "Você só pode alterar o seu próprio usuário" })
        }

        const schema = Yup.object().shape({
            name: Yup.string(),
            email: Yup.string().email(),
            file_id: Yup.number().integer().positive().nullable(),
            oldPassword: Yup.string().min(8).when("password", ([password], field) =>
                password ? field.required() : field
            ),
            password: Yup.string().min(8),
            passwordConfirmation: Yup.string().when("password", ([password], field) =>
                password ? field.required().oneOf([Yup.ref("password")]) : field
            )
        })

        const data = await schema.validate(req.body, { stripUnknown: true, abortEarly: false })

        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ error: "Esse usuário não existe" })
        }

        if (data.password && !(await user.checkPassword(data.oldPassword))) {
            return res.status(401).json({ error: "Senha atual incorreta" })
        }

        await user.update(data)

        const updated = await User.findByPk(user.id, {
            attributes: { exclude: HIDDEN },
            include: [includeFile]
        })

        return res.json(updated);
    }

    // Deleta um User
    async destroy(req, res) {
        if (Number(req.params.id) !== req.userId) {
            return res.status(403).json({ error: "Você só pode deletar o seu próprio usuário" })
        }

        const user = await User.findByPk(req.params.id)

        if (!user) {
            return res.status(404).json({ error: "Usuário não encontrado" })
        }

        await user.destroy();

        return res.json({ message: "Usuário deletado com sucesso" })
    }
}

export default new userController()
