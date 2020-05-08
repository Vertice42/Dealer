import { APP } from "..";
import path = require('path');


APP.get('/', function (req, res) {
    let Path = './pages/index.html';
    if (process.env.NODE_ENV === 'production') Path = './pages/index.html';
    res.sendFile(path.resolve(Path));
})

APP.get('/EULA', function (req, res) {    
    res.sendFile(path.resolve('./pages/EULA.html'));
})

APP.get('/PrivacyPolicy', function (req, res) {    
    res.sendFile(path.resolve('./pages/PrivacyPolicy.html'));
})

APP.get('/img/:file', function (req, res) {    
    res.sendFile(path.resolve('./pages/' + req.path));
})

APP.get('/style/:file', function (req, res) {    
    res.sendFile(path.resolve('./pages/' + req.path));
})
