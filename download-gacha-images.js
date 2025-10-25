// download-gacha-images.js
const fs = require('fs');
const path = require('path');
const https = require('https');

// URLs stables pour le téléchargement
const imagesToDownload = [
    // Demon Slayer
    { id: 'ds_001.jpg', url: 'https://raw.githubusercontent.com/Kyusaan/Kint-Bot-Dashboard-Assets/main/gacha/cards/ds_001.jpg' },
    { id: 'ds_002.jpg', url: 'https://raw.githubusercontent.com/Kyusaan/Kint-Bot-Dashboard-Assets/main/gacha/cards/ds_002.jpg' },
    { id: 'ds_003.jpg', url: 'https://raw.githubusercontent.com/Kyusaan/Kint-Bot-Dashboard-Assets/main/gacha/cards/ds_003.jpg' },
    { id: 'ds_004.jpg', url: 'https://raw.githubusercontent.com/Kyusaan/Kint-Bot-Dashboard-Assets/main/gacha/cards/ds_004.jpg' },
    { id: 'ds_005.jpg', url: 'https://raw.githubusercontent.com/Kyusaan/Kint-Bot-Dashboard-Assets/main/gacha/cards/ds_005.jpg' },
    { id: 'ds_006.jpg', url: 'https://raw.githubusercontent.com/Kyusaan/Kint-Bot-Dashboard-Assets/main/gacha/cards/ds_006.jpg' },
    { id: 'ds_007.jpg', url: 'https://raw.githubusercontent.com/Kyusaan/Kint-Bot-Dashboard-Assets/main/gacha/cards/ds_007.jpg' },
    { id: 'ds_008.jpg', url: 'https://raw.githubusercontent.com/Kyusaan/Kint-Bot-Dashboard-Assets/main/gacha/cards/ds_008.jpg' },
    { id: 'ds_009.png', url: 'https://raw.githubusercontent.com/Kyusaan/Kint-Bot-Dashboard-Assets/main/gacha/cards/ds_009.png' },
    // Naruto
    { id: 'nar_001.jpg', url: 'https://raw.githubusercontent.com/Kyusaan/Kint-Bot-Dashboard-Assets/main/gacha/cards/nar_001.jpg' },
    { id: 'nar_002.jpg', url: 'https://raw.githubusercontent.com/Kyusaan/Kint-Bot-Dashboard-Assets/main/gacha/cards/nar_002.jpg' },
    { id: 'nar_003.jpg', url: 'https://raw.githubusercontent.com/Kyusaan/Kint-Bot-Dashboard-Assets/main/gacha/cards/nar_003.jpg' },
    { id: 'nar_004.jpg', url: 'https://raw.githubusercontent.com/Kyusaan/Kint-Bot-Dashboard-Assets/main/gacha/cards/nar_004.jpg' },
    { id: 'nar_005.jpg', url: 'https://raw.githubusercontent.com/Kyusaan/Kint-Bot-Dashboard-Assets/main/gacha/cards/nar_005.jpg' },
    { id: 'nar_006.jpg', url: 'https://raw.githubusercontent.com/Kyusaan/Kint-Bot-Dashboard-Assets/main/gacha/cards/nar_006.jpg' },
    { id: 'nar_007.jpg', url: 'https://raw.githubusercontent.com/Kyusaan/Kint-Bot-Dashboard-Assets/main/gacha/cards/nar_007.jpg' },
    { id: 'nar_008.jpg', url: 'https://raw.githubusercontent.com/Kyusaan/Kint-Bot-Dashboard-Assets/main/gacha/cards/nar_008.jpg' },
    { id: 'nar_009.png', url: 'https://raw.githubusercontent.com/Kyusaan/Kint-Bot-Dashboard-Assets/main/gacha/cards/nar_009.png' },
    // One Piece
    { id: 'op_001.jpg', url: 'https://raw.githubusercontent.com/Kyusaan/Kint-Bot-Dashboard-Assets/main/gacha/cards/op_001.jpg' },
    { id: 'op_002.jpg', url: 'https://raw.githubusercontent.com/Kyusaan/Kint-Bot-Dashboard-Assets/main/gacha/cards/op_002.jpg' },
    { id: 'op_003.jpg', url: 'https://raw.githubusercontent.com/Kyusaan/Kint-Bot-Dashboard-Assets/main/gacha/cards/op_003.jpg' },
    { id: 'op_004.jpg', url: 'https://raw.githubusercontent.com/Kyusaan/Kint-Bot-Dashboard-Assets/main/gacha/cards/op_004.jpg' },
    { id: 'op_005.jpg', url: 'https://raw.githubusercontent.com/Kyusaan/Kint-Bot-Dashboard-Assets/main/gacha/cards/op_005.jpg' },
    { id: 'op_006.jpg', url: 'https://raw.githubusercontent.com/Kyusaan/Kint-Bot-Dashboard-Assets/main/gacha/cards/op_006.jpg' },
    { id: 'op_007.jpg', url: 'https://raw.githubusercontent.com/Kyusaan/Kint-Bot-Dashboard-Assets/main/gacha/cards/op_007.jpg' },
    { id: 'op_008.jpg', url: 'https://raw.githubusercontent.com/Kyusaan/Kint-Bot-Dashboard-Assets/main/gacha/cards/op_008.jpg' },
    { id: 'op_009.png', url: 'https://raw.githubusercontent.com/Kyusaan/Kint-Bot-Dashboard-Assets/main/gacha/cards/op_009.png' },
    // Attack on Titan
    { id: 'aot_001.jpg', url: 'https://raw.githubusercontent.com/Kyusaan/Kint-Bot-Dashboard-Assets/main/gacha/cards/aot_001.jpg' },
    { id: 'aot_002.jpg', url: 'https://raw.githubusercontent.com/Kyusaan/Kint-Bot-Dashboard-Assets/main/gacha/cards/aot_002.jpg' },
    { id: 'aot_003.jpg', url: 'https://raw.githubusercontent.com/Kyusaan/Kint-Bot-Dashboard-Assets/main/gacha/cards/aot_003.jpg' },
    { id: 'aot_004.jpg', url: 'https://raw.githubusercontent.com/Kyusaan/Kint-Bot-Dashboard-Assets/main/gacha/cards/aot_004.jpg' },
    { id: 'aot_005.jpg', url: 'https://raw.githubusercontent.com/Kyusaan/Kint-Bot-Dashboard-Assets/main/gacha/cards/aot_005.jpg' },
    { id: 'aot_006.jpg', url: 'https://raw.githubusercontent.com/Kyusaan/Kint-Bot-Dashboard-Assets/main/gacha/cards/aot_006.jpg' },
    { id: 'aot_007.png', url: 'https://raw.githubusercontent.com/Kyusaan/Kint-Bot-Dashboard-Assets/main/gacha/cards/aot_007.png' },
    // My Hero Academia
    { id: 'mha_001.jpg', url: 'https://raw.githubusercontent.com/Kyusaan/Kint-Bot-Dashboard-Assets/main/gacha/cards/mha_001.jpg' },
    { id: 'mha_002.jpg', url: 'https://raw.githubusercontent.com/Kyusaan/Kint-Bot-Dashboard-Assets/main/gacha/cards/mha_002.jpg' },
    { id: 'mha_003.jpg', url: 'https://raw.githubusercontent.com/Kyusaan/Kint-Bot-Dashboard-Assets/main/gacha/cards/mha_003.jpg' },
    { id: 'mha_004.jpg', url: 'https://raw.githubusercontent.com/Kyusaan/Kint-Bot-Dashboard-Assets/main/gacha/cards/mha_004.jpg' },
    { id: 'mha_005.jpg', url: 'https://raw.githubusercontent.com/Kyusaan/Kint-Bot-Dashboard-Assets/main/gacha/cards/mha_005.jpg' },
    { id: 'mha_006.jpg', url: 'https://raw.githubusercontent.com/Kyusaan/Kint-Bot-Dashboard-Assets/main/gacha/cards/mha_006.jpg' },
    { id: 'mha_007.png', url: 'https://raw.githubusercontent.com/Kyusaan/Kint-Bot-Dashboard-Assets/main/gacha/cards/mha_007.png' },
    // Jujutsu Kaisen
    { id: 'jjk_001.jpg', url: 'https://raw.githubusercontent.com/Kyusaan/Kint-Bot-Dashboard-Assets/main/gacha/cards/jjk_001.jpg' },
    { id: 'jjk_002.jpg', url: 'https://raw.githubusercontent.com/Kyusaan/Kint-Bot-Dashboard-Assets/main/gacha/cards/jjk_002.jpg' },
    { id: 'jjk_003.jpg', url: 'https://raw.githubusercontent.com/Kyusaan/Kint-Bot-Dashboard-Assets/main/gacha/cards/jjk_003.jpg' },
    { id: 'jjk_004.jpg', url: 'https://raw.githubusercontent.com/Kyusaan/Kint-Bot-Dashboard-Assets/main/gacha/cards/jjk_004.jpg' },
    { id: 'jjk_005.jpg', url: 'https://raw.githubusercontent.com/Kyusaan/Kint-Bot-Dashboard-Assets/main/gacha/cards/jjk_005.jpg' },
    { id: 'jjk_006.jpg', url: 'https://raw.githubusercontent.com/Kyusaan/Kint-Bot-Dashboard-Assets/main/gacha/cards/jjk_006.jpg' },
    { id: 'jjk_007.png', url: 'https://raw.githubusercontent.com/Kyusaan/Kint-Bot-Dashboard-Assets/main/gacha/cards/jjk_007.png' },
    // Dragon Ball Z
    { id: 'dbz_001.jpg', url: 'https://raw.githubusercontent.com/Kyusaan/Kint-Bot-Dashboard-Assets/main/gacha/cards/dbz_001.jpg' },
    { id: 'dbz_002.jpg', url: 'https://raw.githubusercontent.com/Kyusaan/Kint-Bot-Dashboard-Assets/main/gacha/cards/dbz_002.jpg' },
    { id: 'dbz_003.jpg', url: 'https://raw.githubusercontent.com/Kyusaan/Kint-Bot-Dashboard-Assets/main/gacha/cards/dbz_003.jpg' },
    { id: 'dbz_004.jpg', url: 'https://raw.githubusercontent.com/Kyusaan/Kint-Bot-Dashboard-Assets/main/gacha/cards/dbz_004.jpg' },
    { id: 'dbz_005.jpg', url: 'https://raw.githubusercontent.com/Kyusaan/Kint-Bot-Dashboard-Assets/main/gacha/cards/dbz_005.jpg' },
    { id: 'dbz_006.jpg', url: 'https://raw.githubusercontent.com/Kyusaan/Kint-Bot-Dashboard-Assets/main/gacha/cards/dbz_006.jpg' },
    { id: 'dbz_007.jpg', url: 'https://raw.githubusercontent.com/Kyusaan/Kint-Bot-Dashboard-Assets/main/gacha/cards/dbz_007.jpg' },
    { id: 'dbz_008.jpg', url: 'https://raw.githubusercontent.com/Kyusaan/Kint-Bot-Dashboard-Assets/main/gacha/cards/dbz_008.jpg' },
    { id: 'dbz_009.png', url: 'https://raw.githubusercontent.com/Kyusaan/Kint-Bot-Dashboard-Assets/main/gacha/cards/dbz_009.png' },
    // Bleach
    { id: 'ble_001.jpg', url: 'https://raw.githubusercontent.com/Kyusaan/Kint-Bot-Dashboard-Assets/main/gacha/cards/ble_001.jpg' },
    { id: 'ble_002.jpg', url: 'https://raw.githubusercontent.com/Kyusaan/Kint-Bot-Dashboard-Assets/main/gacha/cards/ble_002.jpg' },
    { id: 'ble_003.jpg', url: 'https://raw.githubusercontent.com/Kyusaan/Kint-Bot-Dashboard-Assets/main/gacha/cards/ble_003.jpg' },
    { id: 'ble_004.jpg', url: 'https://raw.githubusercontent.com/Kyusaan/Kint-Bot-Dashboard-Assets/main/gacha/cards/ble_004.jpg' },
    { id: 'ble_005.jpg', url: 'https://raw.githubusercontent.com/Kyusaan/Kint-Bot-Dashboard-Assets/main/gacha/cards/ble_005.jpg' },
    { id: 'ble_006.jpg', url: 'https://raw.githubusercontent.com/Kyusaan/Kint-Bot-Dashboard-Assets/main/gacha/cards/ble_006.jpg' },
    { id: 'ble_007.jpg', url: 'https://raw.githubusercontent.com/Kyusaan/Kint-Bot-Dashboard-Assets/main/gacha/cards/ble_007.jpg' },
    { id: 'ble_008.jpg', url: 'https://raw.githubusercontent.com/Kyusaan/Kint-Bot-Dashboard-Assets/main/gacha/cards/ble_008.jpg' },
    { id: 'ble_009.png', url: 'https://raw.githubusercontent.com/Kyusaan/Kint-Bot-Dashboard-Assets/main/gacha/cards/ble_009.png' },
    // Hunter x Hunter
    { id: 'hxh_001.jpg', url: 'https://raw.githubusercontent.com/Kyusaan/Kint-Bot-Dashboard-Assets/main/gacha/cards/hxh_001.jpg' },
    { id: 'hxh_002.jpg', url: 'https://raw.githubusercontent.com/Kyusaan/Kint-Bot-Dashboard-Assets/main/gacha/cards/hxh_002.jpg' },
    { id: 'hxh_003.jpg', url: 'https://raw.githubusercontent.com/Kyusaan/Kint-Bot-Dashboard-Assets/main/gacha/cards/hxh_003.jpg' },
    { id: 'hxh_004.jpg', url: 'https://raw.githubusercontent.com/Kyusaan/Kint-Bot-Dashboard-Assets/main/gacha/cards/hxh_004.jpg' },
    { id: 'hxh_005.jpg', url: 'https://raw.githubusercontent.com/Kyusaan/Kint-Bot-Dashboard-Assets/main/gacha/cards/hxh_005.jpg' },
    { id: 'hxh_006.jpg', url: 'https://raw.githubusercontent.com/Kyusaan/Kint-Bot-Dashboard-Assets/main/gacha/cards/hxh_006.jpg' },
    { id: 'hxh_007.jpg', url: 'https://raw.githubusercontent.com/Kyusaan/Kint-Bot-Dashboard-Assets/main/gacha/cards/hxh_007.jpg' },
    { id: 'hxh_008.jpg', url: 'https://raw.githubusercontent.com/Kyusaan/Kint-Bot-Dashboard-Assets/main/gacha/cards/hxh_008.jpg' },
    { id: 'hxh_009.png', url: 'https://raw.githubusercontent.com/Kyusaan/Kint-Bot-Dashboard-Assets/main/gacha/cards/hxh_009.png' },
];

const downloadDir = path.join(__dirname, 'public', 'gacha', 'cards');

if (!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir, { recursive: true });
}

function downloadImage(url, dest) {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Échec du téléchargement de ${url} (Status: ${response.statusCode})`));
                return;
            }
            const file = fs.createWriteStream(dest);
            response.pipe(file);
            file.on('finish', () => {
                file.close(resolve);
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => {}); // Supprimer le fichier en cas d'erreur
            reject(err);
        });
    });
}

async function main() {
    console.log(`\n🤖 Démarrage du téléchargement des ${imagesToDownload.length} images de cartes Gacha...`);
    console.log(`   Destination: ${downloadDir}\n`);

    let successCount = 0;
    let failCount = 0;

    for (const image of imagesToDownload) {
        const filePath = path.join(downloadDir, image.id);
        if (fs.existsSync(filePath)) {
            console.log(`🟡 Ignoré (existe déjà): ${image.id}`);
            successCount++;
            continue;
        }
        try {
            await downloadImage(image.url, filePath);
            console.log(`✅ Téléchargé: ${image.id}`);
            successCount++;
        } catch (error) {
            console.error(`❌ Erreur pour ${image.id}: ${error.message}`);
            failCount++;
        }
        // Petite pause pour ne pas surcharger le serveur d'images
        await new Promise(resolve => setTimeout(resolve, 50));
    }

    console.log('\n----------------------------------------');
    console.log('🎉 Téléchargement terminé !');
    console.log(`   ${successCount} images téléchargées ou déjà présentes.`);
    if (failCount > 0) {
        console.log(`   ${failCount} erreurs.`);
    }
    console.log('----------------------------------------\n');
}

main();
