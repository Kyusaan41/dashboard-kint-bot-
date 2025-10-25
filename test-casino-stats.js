/**
 * Script de test pour les statistiques du casino
 * Lance le serveur Next.js et teste l'API /api/casino/stats
 */

const testData = [
    { username: 'Player1', winAmount: 5000 },
    { username: 'Player2', winAmount: 3000 },
    { username: 'Player1', winAmount: 8000 }, // 2ème gain pour Player1
    { username: 'Player3', winAmount: 1500 },
    { username: 'Player2', winAmount: 4500 }, // 2ème gain pour Player2
    { username: 'Player1', winAmount: 2000 }, // 3ème gain pour Player1
];

async function testStats() {
    console.log('🎰 Test des statistiques du casino\n');
    
    const baseUrl = 'http://localhost:3000';
    
    // 1. Enregistrer des gains
    console.log('📝 Enregistrement des gains...');
    for (const data of testData) {
        try {
            const response = await fetch(`${baseUrl}/api/casino/stats`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const result = await response.json();
            console.log(`✅ ${data.username}: +${data.winAmount} pièces`);
        } catch (error) {
            console.error(`❌ Erreur pour ${data.username}:`, error.message);
        }
    }
    
    console.log('\n📊 Résultats attendus:');
    console.log('Player1: biggestWin=8000, totalWins=15000, winCount=3');
    console.log('Player2: biggestWin=4500, totalWins=7500, winCount=2');
    console.log('Player3: biggestWin=1500, totalWins=1500, winCount=1');
    
    // 2. Récupérer les stats par type
    console.log('\n🏆 Classement par Plus gros gain:');
    try {
        const response = await fetch(`${baseUrl}/api/casino/stats?type=biggestWin`);
        const data = await response.json();
        data.players.forEach((p, i) => {
            console.log(`${i + 1}. ${p.username}: ${p.biggestWin} 💰`);
        });
    } catch (error) {
        console.error('❌ Erreur:', error.message);
    }
    
    console.log('\n🏆 Classement par Nombre de victoires:');
    try {
        const response = await fetch(`${baseUrl}/api/casino/stats?type=winCount`);
        const data = await response.json();
        data.players.forEach((p, i) => {
            console.log(`${i + 1}. ${p.username}: ${p.winCount} 🏆`);
        });
    } catch (error) {
        console.error('❌ Erreur:', error.message);
    }
    
    console.log('\n💰 Classement par Gains total:');
    try {
        const response = await fetch(`${baseUrl}/api/casino/stats?type=totalWins`);
        const data = await response.json();
        data.players.forEach((p, i) => {
            console.log(`${i + 1}. ${p.username}: ${p.totalWins} 💰`);
        });
    } catch (error) {
        console.error('❌ Erreur:', error.message);
    }
    
    console.log('\n✅ Test terminé !');
}

// Vérifier que le serveur est lancé
console.log('⚠️  Assurez-vous que le serveur Next.js est lancé (npm run dev)');
console.log('⏳ Démarrage du test dans 2 secondes...\n');

setTimeout(testStats, 2000);