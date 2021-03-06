const actions = require('@actions/core');
const github = require('@actions/github');
const func = require('./utils/functions');
const { encrypt } = require('./utils/algorithm');
const CONFIG = require('./config');

const [appId, appSecret, appToken] = [process.env.APP_ID, process.env.APP_SECRET, process.env.TOKEN];
if (!appId || !appSecret || !appToken) {
    actions.setFailed("Incorrect config.");
    process.exit(1);
}
actions.setSecret(appSecret);
actions.setSecret(appToken);

const [ghToken, _ghRepo] = [process.env.GH_TOKEN, process.env.GITHUB_REPO];
if (!ghToken || !_ghRepo) {
    actions.setFailed("Incorrect github info.");
    process.exit(1);
}
const [ghOwner, ghRepo] = _ghRepo.split("/");
actions.setSecret(ghToken);

const octokit = github.getOctokit(ghToken);

async function main() {
    const res = await octokit.request('GET /repos/{owner}/{repo}/actions/secrets/public-key', {
        owner: ghOwner,
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

    await octokit.request('PUT /repos/{owner}/{repo}/actions/secrets/{secret_name}', {
        owner: ghOwner,
        repo: ghRepo,
        secret_name: 'TOKEN',
        encrypted_value: encrypt(publicKey, newToken),
        key_id: keyId
    })
}

main().catch((e) => {
    actions.setFailed(e);
    if (CONFIG.DEBUG) {
        console.log(e);
    }
});
