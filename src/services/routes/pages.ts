import { APP } from "..";
import path = require('path');

APP.get('/', function (req, res) {
    res.sendFile(path.resolve('./index.html'));
})