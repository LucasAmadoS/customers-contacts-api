import Customer from "../models/Customer.js"
import * as Yup from "yup"
import Contact from "../models/Contact.js"
import listQuery from "../helpers/list-query.js"

const SORTABLE = ["id", "name", "email", "status", "createdAt", "updatedAt"]

class contactsController {
    // Listar todos os Contatos
    async index(req, res) {
        const { where, order, limit, offset } = listQuery(req.query, {
            where: { customer_id: req.params.customerId },
            sortable: SORTABLE,
            withStatus: true
        })

        const data = await Contact.findAll({
            where,
            include: [
                {
                    model: Customer,
                    attributes: ["id", "status"],
                    required: true
                }
            ],
            order,
            limit,
            offset
        });

        return res.json(data);
    }

    // Lista um Contato por ID - Route Params
    async show(req, res) {
        const contact = await Contact.findOne({
            where: {
                customer_id: req.params.customerId,
                id: req.params.id,
            },
        })

        if (!contact) {
            return res.status(404).json({ error: "ID não encontrado" })
        }

        return res.json(contact)
    }

    // Cria um novo Contato
    async create(req, res) {
        const schema = Yup.object().shape({
            name: Yup.string().required(),
            email: Yup.string().email().required(),
            status: Yup.string().uppercase().oneOf(["ACTIVE", "ARCHIVED"])
        })

        const data = await schema.validate(req.body, { stripUnknown: true, abortEarly: false })

        const customer = await Customer.findByPk(req.params.customerId)

        if (!customer) {
            return res.status(404).json({ error: "Cliente não encontrado" })
        }

        const contact = await Contact.create({
            ...data,
            customer_id: customer.id,
        })

        return res.status(201).json(contact);
    }

    // Atualiza um Contato
    async update(req, res) {
        const schema = Yup.object().shape({
            name: Yup.string(),
            email: Yup.string().email(),
            status: Yup.string().uppercase().oneOf(["ACTIVE", "ARCHIVED"])
        })

        const data = await schema.validate(req.body, { stripUnknown: true, abortEarly: false })

        const contact = await Contact.findOne({
            where: {
                customer_id: req.params.customerId,
                id: req.params.id,
            }
        })

        if (!contact) {
            return res.status(404).json({ error: "ID não encontrado" })
        }

        await contact.update(data)

        return res.json(contact)
    }

    // Deleta um Contato
    async destroy(req, res) {
        const contact = await Contact.findOne({
            where: {
                customer_id: req.params.customerId,
                id: req.params.id,
            }
        })

        if (!contact) {
            return res.status(404).json({ error: "ID não encontrado" })
        }

        await contact.destroy();

        return res.json({ message: "Contato deletado com sucesso" })
    }
}

export default new contactsController()
