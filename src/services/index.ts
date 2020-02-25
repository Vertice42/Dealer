import ServerConfigs from "./configs/ServerConfigs";
import server from "./routes";

console.log('**** SERVER AS STARTDED ****');
server.listen(ServerConfigs.Port);