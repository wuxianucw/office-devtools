const request = require('superagent');

module.exports = {
    async getToken(id, secret, token) {
        const res = await request
            .post("https://login.microsoftonline.com/common/oauth2/v2.0/token")
            .type("form")
            .send({
                grant_type: "refresh_token",
                refresh_token: token,
                client_id: id,
                client_secret: secret,
                redirect_uri: "http://localhost:53682/"
            });
        return res.body.access_token;
    },
    async request(url, token) {
        const res = await request
            .get(url)
            .set("Authorization", token)
        return res;
    },
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};
