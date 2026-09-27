import Customer from "../models/Customer.js"
import * as Yup from "yup"
import Contact from "../models/Contact.js"
import listQuery from "../helpers/list-query.js"

const SORTABLE = ["id", "name", "email", "status", "createdAt", "updatedAt"]

class customersController {
    // Listar todos os Customers
    async index(req, res) {
        const { where, order, limit, offset } = listQuery(req.query, {
            sortable: SORTABLE,
            withStatus: true
        })

        const data = await Customer.findAll({
            where,
            include: [
                {
                    model: Contact,
                    attributes: ["id", "status"]
                }
            ],
            order,
            limit,
            offset
        });

        return res.json(data);
    }

    // Lista um Customer por ID - Route Params
    async show(req, res) {
        const customer = await Customer.findByPk(req.params.id, {
            include: [
                {
                    model: Contact,
                    attributes: ["id", "name", "email", "status"]
                }
            ]
        })

        if (!customer) {
            return res.status(404).json({ error: "ID não encontrado" })
        }

        return res.json(customer)
    }

    // Cria um novo Customers
    async create(req, res) {
        const schema = Yup.object().shape({
            name: Yup.string().required(),
            email: Yup.string().email().required(),
            status: Yup.string().uppercase().oneOf(["ACTIVE", "ARCHIVED"])
        })

        const data = await schema.validate(req.body, { stripUnknown: true, abortEarly: false })

        const customer = await Customer.create(data)

        return res.status(201).json(customer);
    }

    // Atualiza um Customers
    async update(req, res) {
        const schema = Yup.object().shape({
            name: Yup.string(),
            email: Yup.string().email(),
            status: Yup.string().uppercase().oneOf(["ACTIVE", "ARCHIVED"])
        })

        const data = await schema.validate(req.body, { stripUnknown: true, abortEarly: false })

        const customer = await Customer.findByPk(req.params.id)

        if (!customer) {
            return res.status(404).json({ error: "ID não encontrado" })
        }

        await customer.update(data)

        return res.json(customer)
    }

    // Deleta um Customers
    async destroy(req, res) {
        const customer = await Customer.findByPk(req.params.id)

        if (!customer) {
            return res.status(404).json({ error: "ID não encontrado" })
        }

        await customer.destroy();

        return res.json({ message: "Cliente deletado com sucesso" })
    }
}

export default new customersController()
