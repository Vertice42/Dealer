"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ServerConfigs_1 = require("./configs/ServerConfigs");
const routes_1 = require("./routes");
console.log('**** SERVER AS STARTDED ****');
//app.listen(ServerConfigs.Port);
routes_1.default.listen(ServerConfigs_1.default.Port); // not 'app.listen'!
