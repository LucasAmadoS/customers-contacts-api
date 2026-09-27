import express from "express"
import routes from "./routes.js"
import "./database/index.js"
import { uploadsFolder } from "./config/multer.js"
import errorHandler from "./app/middlewares/error-handler.js"

class App {
    constructor() {
        this.server = express();
        this.middlewares();
        this.routes()
        this.exceptionHandler()
    }

    middlewares() {
        this.server.use(express.json());
        this.server.use(express.urlencoded ({extended: false}))
        this.server.use("/files", express.static(uploadsFolder))
    }

    routes() {
        this.server.use(routes)
    }

    exceptionHandler() {
        this.server.use(errorHandler)
    }
}

export default new App()
