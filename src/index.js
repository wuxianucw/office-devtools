const actions = require('@actions/core');
const func = require('./utils/functions');
const { shuffle, getRandomInt } = require('./utils/algorithm');

const API_LIST = [
    "https://graph.microsoft.com/v1.0/me/",
    "https://graph.microsoft.com/v1.0/users",
    "https://graph.microsoft.com/v1.0/me/people",
    "https://graph.microsoft.com/v1.0/groups",
    "https://graph.microsoft.com/v1.0/me/contacts",
    "https://graph.microsoft.com/v1.0/me/drive/root",
    "https://graph.microsoft.com/v1.0/me/drive/root/children",
    "https://graph.microsoft.com/v1.0/drive/root",
    "https://graph.microsoft.com/v1.0/me/drive",
    "https://graph.microsoft.com/v1.0/me/drive/recent",
    "https://graph.microsoft.com/v1.0/me/drive/sharedWithMe",
    "https://graph.microsoft.com/v1.0/me/calendars",
    "https://graph.microsoft.com/v1.0/me/events",
    "https://graph.microsoft.com/v1.0/sites/root",
    "https://graph.microsoft.com/v1.0/sites/root/sites",
    "https://graph.microsoft.com/v1.0/sites/root/drives",
    "https://graph.microsoft.com/v1.0/sites/root/columns",
    "https://graph.microsoft.com/v1.0/me/onenote/notebooks",
    "https://graph.microsoft.com/v1.0/me/onenote/sections",
    "https://graph.microsoft.com/v1.0/me/onenote/pages",
    "https://graph.microsoft.com/v1.0/me/messages",
    "https://graph.microsoft.com/v1.0/me/mailFolders",
    "https://graph.microsoft.com/v1.0/me/outlook/masterCategories",
    "https://graph.microsoft.com/v1.0/me/mailFolders/Inbox/messages/delta",
    "https://graph.microsoft.com/v1.0/me/mailFolders/inbox/messageRules",
    "https://graph.microsoft.com/v1.0/me/messages?$filter=importance eq 'high'",
    "https://graph.microsoft.com/v1.0/me/messages?$search=\"myoffice\"",
    "https://graph.microsoft.com/beta/me/messages?$select=internetMessageHeaders&$top"
];
const requiredList = [0, 1, 5, 6, 20, 21];
const optionalList = [...API_LIST.keys()].filter(v => !(v in requiredList));
const originalList = [5, 9, 8, 1, 20, 24, 23, 6, 21, 22];

const CONFIG = {
    ROUND: 3,
    RANDOM_DELAY: {
        ROUND: {
            ON: true,
            RANGE: [500, 3000]
        },
        REQ: {
            ON: true,
            RANGE: [100, 1000]
        }
    },
    RANDOM_ORDER: true,
    DEBUG: true
};

const [appId, appSecret, appToken] = [process.env.APP_ID, process.env.APP_SECRET, process.env.TOKEN];
if (!appId || !appSecret || !appToken) {
    actions.setFailed("Incorrect config.");
    process.exit(1);
}
actions.setSecret(appSecret);
actions.setSecret(appToken);

const reqList = CONFIG.RANDOM_ORDER ? requiredList.concat(shuffle(optionalList).slice(0, 6)) : originalList;

async function main() {
    const accessToken = (await func.getToken(appId, appSecret, appToken)).access_token;
    if (!accessToken) {
        throw new Error("Unable to get access token.");
    }
    actions.setSecret(accessToken);
    actions.info(`Will perform ${CONFIG.ROUND} rounds of operations for test...`);
    for (let i = 1; i <= CONFIG.ROUND; i++) {
        actions.info(`Round ${i}:`);
        if (CONFIG.RANDOM_DELAY.ROUND.ON) {
            const t = getRandomInt(CONFIG.RANDOM_DELAY.ROUND.RANGE[0], CONFIG.RANDOM_DELAY.ROUND.RANGE[1] + 1);
            actions.info(`Wait ${t}ms...`);
            await func.sleep(t);
        }
        for (const j in reqList) {
            const url = API_LIST[reqList[j]];
            if (CONFIG.RANDOM_DELAY.REQ.ON) {
                const t = getRandomInt(CONFIG.RANDOM_DELAY.REQ.RANGE[0], CONFIG.RANDOM_DELAY.REQ.RANGE[1] + 1);
                await func.sleep(t);
            }
            const res = await func.request(url, accessToken);
            if (res.status === 200) {
                actions.info(`[${+j + 1}] request(${url}) succeeded.`);
            } else {
                actions.error(`[${+j + 1}] request(${url}) failed with status code ${res.status}.`);
                if (CONFIG.DEBUG) {
                    console.log(res.body);
                }
            }
        }
    }
}

main().catch((e) => {
    actions.setFailed(e);
    if (CONFIG.DEBUG) {
        console.log(e);
    }
});
