import jwt = require('jsonwebtoken');

export function Authenticate(twitchToken: string) {
    return new Promise((resolve, reject) => {
        let Secret: string;
        if (process.env.NODE_ENV === 'production') {
            Secret = process.env.Secret;
        } else {
            Secret = process.argv[2];
        }

        let SecretBuffer = Buffer.from(Secret, 'base64');
        jwt.verify(twitchToken, SecretBuffer, (err, decoded) => {
            if (err) {
                reject(err)
            } else {
                resolve(decoded);
            }
        });
    })

}