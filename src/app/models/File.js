import Sequelize, { Model } from "sequelize";

const APP_URL = process.env.APP_URL || `http://localhost:${process.env.PORT || 3000}`

class File extends Model {
    static init(sequelize) {
        super.init({
            name: Sequelize.STRING,
            path: Sequelize.STRING,
            url: {
                type: Sequelize.VIRTUAL,
                get() {
                    return `${APP_URL}/files/${this.path}`
                }
            },
        }, {
            sequelize,
            name: {
                singular: "file",
                plural: "files"
            }
        })
    }

    static associate(models) {
        this.hasMany(models.User, { foreignKey: "file_id" })
    }
}

export default File
