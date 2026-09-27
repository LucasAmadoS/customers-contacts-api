import * as Yup from "yup"
import User from "../models/User.js"
import jwt from "jsonwebtoken"
import authConfig from "../../config/auth.js"

class sessionsController {
    async create(req, res) {
        const schema = Yup.object().shape({
            email: Yup.string().email().required(),
            password: Yup.string().required()
        })

        const { email, password } = await schema.validate(req.body, { stripUnknown: true, abortEarly: false })

        const user = await User.findOne({
            where: { email }
        })

        if (!user || !(await user.checkPassword(password))) {
            return res.status(401).json({ error: "E-mail ou senha inválidos" })
        }

        const { id, name } = user

        return res.json({
            user: {
                id, name, email
            },
            token: jwt.sign({ id }, authConfig.secret, {
                expiresIn: authConfig.expiresIn
            })
        })
    }
}

export default new sessionsController()
