var URL: string;
if (process.env.NODE_ENV !== 'Production') {
    require('dotenv').config();
    URL = process.env.URL
} else {
    URL = 'http://dealertwitchextension.dnsabr.com/'
}

export default {
    URL: URL
}