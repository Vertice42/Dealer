"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const routes_1 = require("./routes");
const ServerConfigs_1 = require("./configs/ServerConfigs");
console.log('**** SERVER AS STARTDED ****');
routes_1.app.listen(ServerConfigs_1.default.Port);
