const actions = require('@actions/core');
const github = require('@actions/github');
const func = require('./utils/functions');
const { encrypt } = require('./utils/algorithm');

const [appId, appSecret, appToken] = [process.env.APP_ID, process.env.APP_SECRET, process.env.TOKEN];
if (!appId || !appSecret || !appToken) {
    actions.setFailed("Incorrect config.");
    process.exit(1);
}
actions.setSecret(appSecret);
actions.setSecret(appToken);

const [ghToken, ghRepo] = [process.env.GITHUB_TOKEN, process.env.GITHUB_REPO];
if (!ghToken || !ghRepo) {
    actions.setFailed("Incorrect github info.");
    process.exit(1);
}

const octokit = github.getOctokit(ghToken);

async function main() {
    const res = await octokit.request('GET /repos/{repo}/actions/secrets/public-key', {
        repo: ghRepo
    });
    if (res.status !== 200) {
        throw new Error("Fail to get public key.")
    }
    const [publicKey, keyId] = [res.data.key, res.data.key_id];

    const newToken = (await func.getToken(appId, appSecret, appToken)).refresh_token;
    if (!newToken) {
        throw new Error("Unable to get refresh token.");
    }

    await octokit.request('PUT /repos/{repo}/actions/secrets/{secret_name}', {
        repo: ghRepo,
        secret_name: 'TOKEN',
        encrypted_value: encrypt(publicKey, newToken),
        key_id: keyId
    })
}

main().catch((e) => {
    actions.setFailed(e);
});
