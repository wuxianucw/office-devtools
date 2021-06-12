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

module.exports = CONFIG;
