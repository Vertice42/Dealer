import jwt = require('jsonwebtoken');

export function Authenticate(twitchToken: string) {
    return new Promise((resolve, reject) => {
        let SecretBuffer = Buffer.from(process.env.ExtensionSecret, 'base64');
        jwt.verify(twitchToken, SecretBuffer, (err, decoded) => {
            if (err) {
                reject(err)
            } else {
                resolve(decoded);
            }
        });
    })

}