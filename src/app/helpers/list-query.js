import * as Yup from "yup"
import { Op } from "sequelize"
import { parseISO, isValid } from "date-fns"

const MAX_LIMIT = 100
const DEFAULT_LIMIT = 25
const STATUS = ["ACTIVE", "ARCHIVED"]

function invalid(message, param) {
    return new Yup.ValidationError(message, undefined, param)
}

function parseDate(value, param) {
    const date = parseISO(value)

    if (!isValid(date)) {
        throw invalid(`${param} deve ser uma data válida (ISO, ex: 2026-01-31)`, param)
    }

    return date
}

function parsePositiveInt(value, fallback, param) {
    if (value === undefined) return fallback

    const number = Number(value)

    if (!Number.isInteger(number) || number < 1) {
        throw invalid(`${param} deve ser um número inteiro maior que 0`, param)
    }

    return number
}

function dateRange(before, after, beforeParam, afterParam) {
    const range = {}

    if (before) range[Op.lte] = parseDate(before, beforeParam)
    if (after) range[Op.gte] = parseDate(after, afterParam)

    return Object.getOwnPropertySymbols(range).length ? range : null
}

/**
 *
 * @param {object} query 
 * @param {object} options
 * @param {object} options.where 
 * @param {string[]} options.sortable 
 * @param {boolean} options.withStatus 
 */
export default function listQuery(query, { where: baseWhere = {}, sortable, withStatus = false }) {
    const {
        name,
        email,
        status,
        createdBefore,
        createdAfter,
        updatedBefore,
        updatedAfter,
        sort
    } = query

    const where = { ...baseWhere }

    if (name) {
        where.name = { [Op.iLike]: `%${name}%` }
    }

    if (email) {
        where.email = { [Op.iLike]: `%${email}%` }
    }

    if (withStatus && status) {
        const statuses = status.split(",").map(item => item.trim().toUpperCase())

        if (statuses.some(item => !STATUS.includes(item))) {
            throw invalid(`status deve ser ${STATUS.join(" ou ")}`, "status")
        }

        where.status = { [Op.in]: statuses }
    }

    const createdAt = dateRange(createdBefore, createdAfter, "createdBefore", "createdAfter")
    if (createdAt) where.createdAt = createdAt

    const updatedAt = dateRange(updatedBefore, updatedAfter, "updatedBefore", "updatedAfter")
    if (updatedAt) where.updatedAt = updatedAt

    let order = []

    if (sort) {
        order = sort.split(",").map(item => {
            const [field, direction = "ASC"] = item.split(":")
            const dir = direction.toUpperCase()

            if (!sortable.includes(field) || !["ASC", "DESC"].includes(dir)) {
                throw invalid(`sort inválido: use campo:asc ou campo:desc com os campos ${sortable.join(", ")}`, "sort")
            }

            return [field, dir]
        })
    }

    const page = parsePositiveInt(query.page, 1, "page")
    const limit = Math.min(parsePositiveInt(query.limit, DEFAULT_LIMIT, "limit"), MAX_LIMIT)

    return {
        where,
        order,
        limit,
        offset: (page - 1) * limit
    }
}
