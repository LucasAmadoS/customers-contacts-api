import Mail from "../../lib/mail.js"


class welcomeEmail {
    get key() {
        return "welcomeEmail"
    }

    async handle({ data }) {
        const {email, name} = data

        await Mail.send({
            to: email,
            subject: "Seja bem-vindo(a)",
            text: `Olá ${name}, Bem-vindo(a) ao nosso sistema`
        })
    }
}

export default new welcomeEmail()
