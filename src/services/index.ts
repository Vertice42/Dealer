import { app } from "./routes";
import ServerConfigs from "./configs/ServerConfigs";

console.log('**** SERVER AS STARTDED ****');

app.listen(ServerConfigs.Port);
