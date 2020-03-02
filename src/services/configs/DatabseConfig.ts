import { Options } from "sequelize/types";

const User = 'root';
const Password = '';

const SequelizeOptions: Options = {
    dialect: 'mysql',
    host: '127.0.0.1',
    logging: false
}
export default { User, Password, SequelizeOptions };