import ServerConfigs from "./configs/ServerConfigs";
import server from "./routes";

console.log('**** SERVER AS STARTDED ****');

//app.listen(ServerConfigs.Port);
server.listen(ServerConfigs.Port); // not 'app.listen'!
