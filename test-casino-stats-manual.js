/**
 * Script de test manuel pour l'API casino stats
 * Usage: node test-casino-stats-manual.js
 */

const API_BASE = 'http://localhost:3000';

async function testStatsAPI() {
    console.log('🎰 Test de l\'API Casino Stats\n');

    try {
        // Test 1: Ajouter quelques victoires de test
        console.log('📝 Test 1: Ajout de victoires de test...');
        
        const testWins = [
            { username: 'TestPlayer1', winAmount: 500 },
            { username: 'TestPlayer2', winAmount: 1200 },
            { username: 'TestPlayer1', winAmount: 300 },
            { username: 'TestPlayer3', winAmount: 800 },
            { username: 'TestPlayer2', winAmount: 2500 },
            { username: 'TestPlayer1', winAmount: 150 },
        ];

        for (const win of testWins) {
            const response = await fetch(`${API_BASE}/api/casino/stats`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(win),
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log(`✅ ${win.username}: +${win.winAmount} pièces`);
            } else {
                console.log(`❌ Erreur pour ${win.username}: ${response.status}`);
            }
        }

        console.log('\n📊 Test 2: Récupération des stats...\n');

        // Test 2: Récupérer les stats par type
        const types = ['biggestWin', 'winCount', 'totalWins'];
        
        for (const type of types) {
            const response = await fetch(`${API_BASE}/api/casino/stats?type=${type}`);
            
            if (response.ok) {
                const data = await response.json();
                console.log(`\n🏆 Classement par ${type}:`);
                data.players.forEach((player, index) => {
                    console.log(`  ${index + 1}. ${player.username}`);
                    console.log(`     - Plus gros gain: ${player.biggestWin}`);
                    console.log(`     - Nombre de victoires: ${player.winCount}`);
                    console.log(`     - Gains totaux: ${player.totalWins}`);
                });
            } else {
                console.log(`❌ Erreur récupération ${type}: ${response.status}`);
            }
        }

        console.log('\n✅ Tests terminés avec succès!');
        
    } catch (error) {
        console.error('❌ Erreur:', error.message);
        console.log('\n⚠️  Assurez-vous que le serveur Next.js est démarré (npm run dev)');
    }
}

testStatsAPI();