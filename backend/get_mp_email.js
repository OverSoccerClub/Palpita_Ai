
const https = require('https');

const token = 'APP_USR-3735805395898688-062316-aec0a49ab4f4532e0f017539fa0842db-104102891';

const options = {
    hostname: 'api.mercadopago.com',
    path: '/users/me',
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${token}`
    }
};

const req = https.request(options, res => {
    let body = '';
    res.on('data', d => body += d);
    res.on('end', () => {
        const data = JSON.parse(body);
        console.log(JSON.stringify({
            id: data.id,
            email: data.email,
            first_name: data.first_name,
            last_name: data.last_name
        }, null, 2));
    });
});

req.on('error', error => {
    console.error(error);
});

req.end();
