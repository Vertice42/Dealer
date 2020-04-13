import { Options } from "sequelize/types";

const USER = 'root';
const PASSWORD = '';

const SEQUELIZE_OPTIONS: Options = {
    dialect: 'mysql',
    host: '127.0.0.1',
    logging: false
}
export default { User: USER, Password: PASSWORD, SequelizeOptions: SEQUELIZE_OPTIONS };