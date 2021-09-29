const request = require('superagent');

module.exports = {
    async getToken(id, secret, token) {
        try {
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
            return res.body;
        } catch (err) {
            throw new Error(err);
        }
    },
    async request(url, token) {
        try {
            const res = await request
                .get(url)
                .set("Authorization", token)
            return res;
        } catch (err) {
            return err;
        }
    },
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};
