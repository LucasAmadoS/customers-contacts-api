import app from "./app.js"

const PORT = process.env.PORT || 3000

app.server.listen(PORT, () => {
    console.log(`Servidor iniciado na porta ${PORT}`)
})
