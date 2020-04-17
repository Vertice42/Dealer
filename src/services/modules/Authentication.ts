import jwt = require('jsonwebtoken');

export function Authenticate(twitchToken: string) {
    return new Promise((resolve, reject) => {
        let SecretBuffer = Buffer.from(process.argv[2], 'base64');
        jwt.verify(twitchToken, SecretBuffer, (err, decoded) => {
            if (err) {
                reject(err)
            } else {
                resolve(decoded);
            }
        });
    })

}