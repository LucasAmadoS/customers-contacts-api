import {  Router  } from "express"
import customers from "./app/controllers/customers-controller.js"
import contacts from "./app/controllers/contacts-controller.js"
import users from "./app/controllers/users-controller.js"
import sessions from "./app/controllers/sessions-controller.js"
import auth from "./app/middlewares/auth.js"
import multer from "multer"
import multerConfig from "./config/multer.js"
import files from "./app/controllers/files-controller.js"

const routes = new Router();
const upload = multer(multerConfig)

// Rotas públicas
routes.post("/sessions", sessions.create)
routes.post("/users", users.create)

// Controla o acesso
routes.use(auth);

// Rota dos Customers
routes.get("/customers", customers.index)
routes.get("/customers/:id", customers.show)
routes.post("/customers", customers.create)
routes.put("/customers/:id", customers.update)
routes.delete("/customers/:id", customers.destroy)

// Rota dos Contacts
routes.get("/customers/:customerId/contacts", contacts.index)
routes.get("/customers/:customerId/contacts/:id", contacts.show)
routes.post("/customers/:customerId/contacts", contacts.create)
routes.put("/customers/:customerId/contacts/:id", contacts.update)
routes.delete("/customers/:customerId/contacts/:id", contacts.destroy)

// Rota dos Users
routes.get("/users", users.index)
routes.get("/users/:id", users.show)
routes.put("/users/:id", users.update)
routes.delete("/users/:id", users.destroy)

// Arquivos
routes.post("/files", upload.single("file"), files.create)


export default routes