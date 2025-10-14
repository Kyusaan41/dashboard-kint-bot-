/**
 * Script de test pour l'API Casino du bot Discord
 * 
 * Ce script teste les endpoints de l'API casino hébergée sur le bot NyxNode
 * 
 * Usage: node test-bot-casino-api.js
 */

const API_URL = 'http://193.70.34.25:20007';

// Couleurs pour les logs
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
};

function log(color, message) {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testAPI() {
    log('cyan', '\n🎰 TEST DE L\'API CASINO DU BOT DISCORD\n');
    log('blue', `URL de l'API: ${API_URL}\n`);

    // Test 1: Ajouter des gains de test
    log('yellow', '📝 Test 1: Ajout de gains de test...');
    const testPlayers = [
        { username: 'Kyusaan', amount: 5000, isJackpot: true },
        { username: 'TestPlayer1', amount: 1500, isJackpot: false },
        { username: 'TestPlayer2', amount: 3000, isJackpot: false },
        { username: 'Kyusaan', amount: 2000, isJackpot: false }, // 2ème gain pour Kyusaan
        { username: 'TestPlayer1', amount: 500, isJackpot: false }, // 2ème gain pour TestPlayer1
        { username: 'JackpotKing', amount: 10000, isJackpot: true },
    ];

    for (const player of testPlayers) {
        try {
            const response = await fetch(`${API_URL}/api/casino/stats`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(player),
            });

            if (response.ok) {
                const data = await response.json();
                log('green', `  ✅ ${player.username}: +${player.amount} ${player.isJackpot ? '🎰 JACKPOT' : ''}`);
            } else {
                log('red', `  ❌ Erreur pour ${player.username}: ${response.status}`);
            }
        } catch (error) {
            log('red', `  ❌ Erreur réseau: ${error.message}`);
        }
    }

    // Attendre un peu pour que les données soient écrites
    await new Promise(resolve => setTimeout(resolve, 500));

    // Test 2: Récupérer le leaderboard "Plus Gros Gain"
    log('yellow', '\n🏆 Test 2: Récupération du leaderboard "Plus Gros Gain"...');
    try {
        const response = await fetch(`${API_URL}/api/casino/stats?type=biggestWin`);
        if (response.ok) {
            const data = await response.json();
            log('green', `  ✅ ${data.players.length} joueurs trouvés`);
            data.players.forEach((player, index) => {
                const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `  ${index + 1}.`;
                log('cyan', `    ${medal} ${player.username}: ${player.biggestWin} 💰`);
            });
        } else {
            log('red', `  ❌ Erreur: ${response.status}`);
        }
    } catch (error) {
        log('red', `  ❌ Erreur réseau: ${error.message}`);
    }

    // Test 3: Récupérer le leaderboard "Nombre de Victoires"
    log('yellow', '\n🎯 Test 3: Récupération du leaderboard "Nombre de Victoires"...');
    try {
        const response = await fetch(`${API_URL}/api/casino/stats?type=winCount`);
        if (response.ok) {
            const data = await response.json();
            log('green', `  ✅ ${data.players.length} joueurs trouvés`);
            data.players.forEach((player, index) => {
                const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `  ${index + 1}.`;
                log('cyan', `    ${medal} ${player.username}: ${player.winCount} 🏆`);
            });
        } else {
            log('red', `  ❌ Erreur: ${response.status}`);
        }
    } catch (error) {
        log('red', `  ❌ Erreur réseau: ${error.message}`);
    }

    // Test 4: Récupérer le leaderboard "Total des Gains"
    log('yellow', '\n💰 Test 4: Récupération du leaderboard "Total des Gains"...');
    try {
        const response = await fetch(`${API_URL}/api/casino/stats?type=totalWins`);
        if (response.ok) {
            const data = await response.json();
            log('green', `  ✅ ${data.players.length} joueurs trouvés`);
            data.players.forEach((player, index) => {
                const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `  ${index + 1}.`;
                log('cyan', `    ${medal} ${player.username}: ${player.totalWins} 💰 (${player.jackpotCount || 0} jackpots)`);
            });
        } else {
            log('red', `  ❌ Erreur: ${response.status}`);
        }
    } catch (error) {
        log('red', `  ❌ Erreur réseau: ${error.message}`);
    }

    // Test 5: Récupérer toutes les données brutes
    log('yellow', '\n📊 Test 5: Récupération de toutes les données...');
    try {
        const response = await fetch(`${API_URL}/api/casino/stats`);
        if (response.ok) {
            const data = await response.json();
            log('green', `  ✅ ${data.players.length} joueurs au total`);
            log('cyan', '\n  Données complètes:');
            data.players.forEach(player => {
                log('cyan', `    • ${player.username}:`);
                log('cyan', `      - Plus gros gain: ${player.biggestWin} 💰`);
                log('cyan', `      - Nombre de victoires: ${player.winCount} 🏆`);
                log('cyan', `      - Total des gains: ${player.totalWins} 💰`);
                log('cyan', `      - Jackpots: ${player.jackpotCount || 0} 🎰`);
            });
        } else {
            log('red', `  ❌ Erreur: ${response.status}`);
        }
    } catch (error) {
        log('red', `  ❌ Erreur réseau: ${error.message}`);
    }

    log('cyan', '\n✅ Tests terminés!\n');
}

// Exécuter les tests
testAPI().catch(error => {
    log('red', `\n❌ Erreur fatale: ${error.message}\n`);
    process.exit(1);
});