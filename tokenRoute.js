const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

const USER_TOKENS_FILE = path.join(__dirname, './data/user-tokens.json');

// Exchange rates (example values)
const EXCHANGE_RATES = {
    buy: 10, // 10 pièces for 1 jeton
    sell: 8  // 8 pièces for 1 jeton
};

/**
 * Reads user token data from the file.
 * @returns {Promise<Object>} User token data.
 */
async function readUserTokensData() {
    try {
        const data = await fs.readFile(USER_TOKENS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            const defaultData = {
                exchangeRate: EXCHANGE_RATES,
                users: {}
            };
            await writeUserTokensData(defaultData);
            return defaultData;
        }
        throw error;
    }
}

/**
 * Writes user token data to the file.
 * @param {Object} data - The data to write.
 */
async function writeUserTokensData(data) {
    await fs.writeFile(USER_TOKENS_FILE, JSON.stringify(data, null, 2));
}

// GET - Get exchange rates
router.get('/exchange-rates', (req, res) => {
    res.json(EXCHANGE_RATES);
});

// POST - Buy tokens
router.post('/buy', async (req, res) => {
    const { userId, amount } = req.body; // amount is in tokens

    if (!userId || typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({ error: 'Invalid userId or amount' });
    }

    const costInCoins = amount * EXCHANGE_RATES.buy;

    // TODO: Implement actual coin deduction logic here
    // For now, simulate success
    const userHasEnoughCoins = true; // Placeholder

    if (!userHasEnoughCoins) {
        return res.status(403).json({ error: 'Insufficient coins' });
    }

    try {
        const userTokensData = await readUserTokensData();
        userTokensData.users[userId] = (userTokensData.users[userId] || 0) + amount;
        await writeUserTokensData(userTokensData);

        // TODO: Deduct coins from user's balance (external system)
        console.log(`User ${userId} bought ${amount} tokens for ${costInCoins} coins.`);

        res.json({
            success: true,
            message: `Successfully bought ${amount} tokens.`,
            newTokensBalance: userTokensData.users[userId]
        });
    } catch (error) {
        console.error('Error buying tokens:', error);
        res.status(500).json({ error: 'Error processing token purchase' });
    }
});

// POST - Sell tokens
router.post('/sell', async (req, res) => {
    const { userId, amount } = req.body; // amount is in tokens

    if (!userId || typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({ error: 'Invalid userId or amount' });
    }

    try {
        const userTokensData = await readUserTokensData();
        const currentUserTokens = userTokensData.users[userId] || 0;

        if (currentUserTokens < amount) {
            return res.status(403).json({ error: 'Insufficient tokens to sell' });
        }

        const earningsInCoins = amount * EXCHANGE_RATES.sell;

        userTokensData.users[userId] -= amount;
        await writeUserTokensData(userTokensData);

        // TODO: Add coins to user's balance (external system)
        console.log(`User ${userId} sold ${amount} tokens for ${earningsInCoins} coins.`);

        res.json({
            success: true,
            message: `Successfully sold ${amount} tokens.`,
            newTokensBalance: userTokensData.users[userId]
        });
    } catch (error) {
        console.error('Error selling tokens:', error);
        res.status(500).json({ error: 'Error processing token sale' });
    }
});

// GET - Get user's token balance
router.get('/balance/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const userTokensData = await readUserTokensData();
        const balance = userTokensData.users[userId] || 0;
        res.json({ userId, balance });
    } catch (error) {
        console.error('Error getting user token balance:', error);
        res.status(500).json({ error: 'Error retrieving token balance' });
    }
});

module.exports = router;