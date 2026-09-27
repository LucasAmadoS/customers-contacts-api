import nodemailer from "nodemailer"
import mailConfig from "../config/mail.js"

class Mail {
    constructor() {
        const {host, port, secure, auth} = mailConfig

        this.transport = nodemailer.createTransport({
            host,
            port,
            secure,
            auth: auth.user? auth : null
        });
    }

    send(message) {
        return this.transport.sendMail({
            ...mailConfig.default,
            ...message
        })
    }
}

export default new Mail