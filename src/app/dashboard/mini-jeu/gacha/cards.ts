// Collection de cartes d'anime pour le système Gacha
// Raretés : Commun, Rare, Épique, Légendaire, Mythique (SS)

export type CardRarity = 'Commun' | 'Rare' | 'Épique' | 'Légendaire' | 'Mythique';

export interface AnimeCard {
    id: string;
    name: string;
    anime: string;
    rarity: CardRarity;
    image: string; // 
    malId: number; // 
    description: string;
    power: number; // Niveau de puissance (1-100) osef mais pour le trackID
}

// Probabilités de drop (total = 85% car 15% = rien)
export const RARITY_RATES = {
    'Commun': 0.40,      // 40% (47% des cartes)
    'Rare': 0.25,        // 25% (29% des cartes)
    'Épique': 0.15,      // 15% (18% des cartes)
    'Légendaire': 0.05,  // 5%  (6% des cartes)
    'Mythique': 0.01,    // 1% (sauf pity à 100 tirages)
};

// Couleurs associées aux raretés
export const RARITY_COLORS = {
    'Commun': {
        bg: 'from-gray-600 to-gray-800',
        border: 'border-gray-500',
        glow: 'shadow-gray-500/50',
        text: 'text-gray-300'
    },
    'Rare': {
        bg: 'from-blue-600 to-blue-800',
        border: 'border-blue-500',
        glow: 'shadow-blue-500/50',
        text: 'text-blue-300'
    },
    'Épique': {
        bg: 'from-purple-600 to-purple-800',
        border: 'border-purple-500',
        glow: 'shadow-purple-500/50',
        text: 'text-purple-300'
    },
    'Légendaire': {
        bg: 'from-yellow-600 to-yellow-800',
        border: 'border-yellow-500',
        glow: 'shadow-yellow-500/50',
        text: 'text-yellow-300'
    },
    'Mythique': {
        bg: 'from-red-600 via-pink-600 to-purple-600',
        border: 'border-pink-500',
        glow: 'shadow-pink-500/80',
        text: 'text-pink-300'
    }
};

// Collection de cartes d'anime
export const ANIME_CARDS: AnimeCard[] = [
    // ===== DEMON SLAYER =====
    // Commun
    {
        id: 'ds_001',
        name: 'Tanjiro Kamado',
        anime: 'Demon Slayer',
        rarity: 'Commun',
        image: '/gacha/cards/ds_001.jpg',
        malId: 146156,
        description: 'Le gentil pourfendeur de démons avec un cœur pur',
        power: 45
    },
    {
        id: 'ds_002',
        name: 'Zenitsu Agatsuma',
        anime: 'Demon Slayer',
        rarity: 'Commun',
        image: '/gacha/cards/ds_002.jpg',
        malId: 146158,
        description: 'Maître de la respiration de la foudre',
        power: 42
    },
    {
        id: 'ds_003',
        name: 'Inosuke Hashibira',
        anime: 'Demon Slayer',
        rarity: 'Commun',
        image: '/gacha/cards/ds_003.jpg',
        malId: 146159,
        description: 'Le guerrier sauvage aux deux sabres',
        power: 43
    },
    // Rare
    {
        id: 'ds_004',
        name: 'Nezuko Kamado',
        anime: 'Demon Slayer',
        rarity: 'Rare',
        image: '/gacha/cards/ds_004.jpg',
        malId: 146157,
        description: 'La démone qui protège les humains',
        power: 58
    },
    {
        id: 'ds_005',
        name: 'Giyu Tomioka',
        anime: 'Demon Slayer',
        rarity: 'Rare',
        image: '/gacha/cards/ds_005.jpg',
        malId: 146735,
        description: 'Pilier de l\'Eau, calme et puissant',
        power: 62
    },
    // Épique
    {
        id: 'ds_006',
        name: 'Kyojuro Rengoku',
        anime: 'Demon Slayer',
        rarity: 'Épique',
        image: '/gacha/cards/ds_006.jpg',
        malId: 151143,
        description: 'Pilier de la Flamme, cœur ardent',
        power: 75
    },
    {
        id: 'ds_007',
        name: 'Tengen Uzui',
        anime: 'Demon Slayer',
        rarity: 'Épique',
        image: '/gacha/cards/ds_007.jpg',
        malId: 151144,
        description: 'Pilier du Son, le plus flamboyant',
        power: 73
    },
    // Légendaire
    {
        id: 'ds_008',
        name: 'Muzan Kibutsuji',
        anime: 'Demon Slayer',
        rarity: 'Légendaire',
        image: '/gacha/cards/ds_008.jpg',
        malId: 151156,
        description: 'Le roi des démons, immortel et terrifiant',
        power: 88
    },
    // Mythique
    {
        id: 'ds_009',
        name: 'Yoriichi Tsugikuni',
        anime: 'Demon Slayer',
        rarity: 'Mythique',
        image: '/gacha/cards/ds_009.png',
        malId: 174159,
        description: 'Le plus puissant pourfendeur, créateur de la Danse du Dieu du Feu',
        power: 100
    },

    
    // ===== NARUTO =====
    // Commun
    {
        id: 'nar_001',
        name: 'Naruto Uzumaki (Genin)',
        anime: 'Naruto',
        rarity: 'Commun',
        image: '/gacha/cards/nar_001.jpg',
        malId: 17,
        description: 'Le ninja hyperactif qui rêve de devenir Hokage',
        power: 40
    },
    {
        id: 'nar_002',
        name: 'Sakura Haruno',
        anime: 'Naruto',
        rarity: 'Commun',
        image: '/gacha/cards/nar_002.jpg',
        malId: 145,
        description: 'Kunoichi déterminée aux talents médicaux',
        power: 38
    },
    {
        id: 'nar_003',
        name: 'Rock Lee',
        anime: 'Naruto',
        rarity: 'Commun',
        image: '/gacha/cards/nar_003.jpg',
        malId: 306,
        description: 'Maître du taijutsu, travailleur acharné',
        power: 44
    },
    // Rare
    {
        id: 'nar_004',
        name: 'Sasuke Uchiha',
        anime: 'Naruto',
        rarity: 'Rare',
        image: '/gacha/cards/nar_004.jpg',
        malId: 13,
        description: 'Dernier survivant du clan Uchiha',
        power: 60
    },
    {
        id: 'nar_005',
        name: 'Kakashi Hatake',
        anime: 'Naruto',
        rarity: 'Rare',
        image: '/gacha/cards/nar_005.jpg',
        malId: 85,
        description: 'Le ninja copieur aux mille techniques',
        power: 65
    },
    // Épique
    {
        id: 'nar_006',
        name: 'Itachi Uchiha',
        anime: 'Naruto',
        rarity: 'Épique',
        image: '/gacha/cards/nar_006.jpg',
        malId: 14,
        description: 'Génie du clan Uchiha, maître du Sharingan',
        power: 78
    },
    {
        id: 'nar_007',
        name: 'Jiraiya',
        anime: 'Naruto',
        rarity: 'Épique',
        image: '/gacha/cards/nar_007.jpg',
        malId: 2423,
        description: 'L\'ermite crapaud, l\'un des trois Sannin',
        power: 76
    },
    // Légendaire
    {
        id: 'nar_008',
        name: 'Minato Namikaze',
        anime: 'Naruto',
        rarity: 'Légendaire',
        image: '/gacha/cards/nar_008.jpg',
        malId: 2535,
        description: 'L\'Éclair Jaune de Konoha, 4ème Hokage',
        power: 90
    },
    // Mythique
    {
        id: 'nar_009',
        name: 'Madara Uchiha',
        anime: 'Naruto',
        rarity: 'Mythique',
        image: '/gacha/cards/nar_009.png',
        malId: 11,
        description: 'Légende vivante, cofondateur de Konoha',
        power: 98
    },

    // ===== ONE PIECE =====
    // Commun
    {
        id: 'op_001',
        name: 'Monkey D. Luffy (Début)',
        anime: 'One Piece',
        rarity: 'Commun',
        image: '/gacha/cards/op_001.jpg',
        malId: 40,
        description: 'Le pirate au chapeau de paille',
        power: 42
    },
    {
        id: 'op_002',
        name: 'Roronoa Zoro',
        anime: 'One Piece',
        rarity: 'Commun',
        image: '/gacha/cards/op_002.jpg',
        malId: 62,
        description: 'Le chasseur de pirates aux trois sabres',
        power: 44
    },
    {
        id: 'op_003',
        name: 'Nami',
        anime: 'One Piece',
        rarity: 'Commun',
        image: '/gacha/cards/op_003.jpg',
        malId: 723,
        description: 'La navigatrice voleuse',
        power: 35
    },
    // Rare
    {
        id: 'op_004',
        name: 'Sanji',
        anime: 'One Piece',
        rarity: 'Rare',
        image: '/gacha/cards/op_004.jpg',
        malId: 305,
        description: 'Le cuisinier aux jambes noires',
        power: 58
    },
    {
        id: 'op_005',
        name: 'Portgas D. Ace',
        anime: 'One Piece',
        rarity: 'Rare',
        image: '/gacha/cards/op_005.jpg',
        malId: 724,
        description: 'Utilisateur du fruit du feu',
        power: 63
    },
    // Épique
    {
        id: 'op_006',
        name: 'Trafalgar Law',
        anime: 'One Piece',
        rarity: 'Épique',
        image: '/gacha/cards/op_006.jpg',
        malId: 17169,
        description: 'Le chirurgien de la mort',
        power: 74
    },
    {
        id: 'op_007',
        name: 'Boa Hancock',
        anime: 'One Piece',
        rarity: 'Épique',
        image: '/gacha/cards/op_007.jpg',
        malId: 1663,
        description: 'L\'impératrice pirate',
        power: 72
    },
    // Légendaire
    {
        id: 'op_008',
        name: 'Shanks le Roux',
        anime: 'One Piece',
        rarity: 'Légendaire',
        image: '/gacha/cards/op_008.jpg',
        malId: 309,
        description: 'L\'un des quatre empereurs',
        power: 92
    },
    // Mythique
    {
        id: 'op_009',
        name: 'Gol D. Roger',
        anime: 'One Piece',
        rarity: 'Mythique',
        image: '/gacha/cards/op_009.png',
        malId: 40459,
        description: 'Le Roi des Pirates, légende absolue',
        power: 99
    },

    // ===== ATTACK ON TITAN =====
    // Commun
    {
        id: 'aot_001',
        name: 'Eren Yeager',
        anime: 'Attack on Titan',
        rarity: 'Commun',
        image: '/gacha/cards/aot_001.jpg',
        malId: 40882,
        description: 'Le soldat déterminé à exterminer les titans',
        power: 46
    },
    {
        id: 'aot_002',
        name: 'Mikasa Ackerman',
        anime: 'Attack on Titan',
        rarity: 'Commun',
        image: '/gacha/cards/aot_002.jpg',
        malId: 40881,
        description: 'La plus forte soldate de l\'humanité',
        power: 48
    },
    // Rare
    {
        id: 'aot_003',
        name: 'Armin Arlert',
        anime: 'Attack on Titan',
        rarity: 'Rare',
        image: '/gacha/cards/aot_003.jpg',
        malId: 46494,
        description: 'Le stratège brillant',
        power: 55
    },
    {
        id: 'aot_004',
        name: 'Levi Ackerman',
        anime: 'Attack on Titan',
        rarity: 'Rare',
        image: '/gacha/cards/aot_004.jpg',
        malId: 45627,
        description: 'Le soldat le plus fort de l\'humanité',
        power: 68
    },
    // Épique
    {
        id: 'aot_005',
        name: 'Reiner Braun',
        anime: 'Attack on Titan',
        rarity: 'Épique',
        image: '/gacha/cards/aot_005.jpg',
        malId: 46496,
        description: 'Le titan cuirassé',
        power: 70
    },
    // Légendaire
    {
        id: 'aot_006',
        name: 'Eren (Titan Originel)',
        anime: 'Attack on Titan',
        rarity: 'Légendaire',
        image: '/gacha/cards/aot_006.jpg',
        malId: 40882,
        description: 'Le pouvoir du titan originel',
        power: 85
    },
    // Mythique
    {
        id: 'aot_007',
        name: 'Ymir Fritz',
        anime: 'Attack on Titan',
        rarity: 'Mythique',
        image: '/gacha/cards/aot_007.png',
        malId: 170283,
        description: 'La première titan, origine de tous les titans',
        power: 97
    },

    // ===== MY HERO ACADEMIA =====
    // Commun
    {
        id: 'mha_001',
        name: 'Izuku Midoriya',
        anime: 'My Hero Academia',
        rarity: 'Commun',
        image: '/gacha/cards/mha_001.jpg',
        malId: 117909,
        description: 'Le héros sans alter qui a tout reçu',
        power: 41
    },
    {
        id: 'mha_002',
        name: 'Ochaco Uraraka',
        anime: 'My Hero Academia',
        rarity: 'Commun',
        image: '/gacha/cards/mha_002.jpg',
        malId: 117911,
        description: 'L\'héroïne de la gravité zéro',
        power: 39
    },
    // Rare
    {
        id: 'mha_003',
        name: 'Katsuki Bakugo',
        anime: 'My Hero Academia',
        rarity: 'Rare',
        image: '/gacha/cards/mha_003.jpg',
        malId: 117910,
        description: 'Le héros explosif au tempérament volcanique',
        power: 61
    },
    {
        id: 'mha_004',
        name: 'Shoto Todoroki',
        anime: 'My Hero Academia',
        rarity: 'Rare',
        image: '/gacha/cards/mha_004.jpg',
        malId: 117912,
        description: 'Maître de la glace et du feu',
        power: 64
    },
    // Épique
    {
        id: 'mha_005',
        name: 'Endeavor',
        anime: 'My Hero Academia',
        rarity: 'Épique',
        image: '/gacha/cards/mha_005.jpg',
        malId: 117915,
        description: 'Le héros numéro 1, maître des flammes',
        power: 77
    },
    // Légendaire
    {
        id: 'mha_006',
        name: 'All Might (Prime)',
        anime: 'My Hero Academia',
        rarity: 'Légendaire',
        image: '/gacha/cards/mha_006.jpg',
        malId: 117913,
        description: 'Le symbole de la paix à son apogée',
        power: 91
    },
    // Mythique
    {
        id: 'mha_007',
        name: 'All For One',
        anime: 'My Hero Academia',
        rarity: 'Mythique',
        image: '/gacha/cards/mha_007.png',
        malId: 117914,
        description: 'Le seigneur des ténèbres, voleur d\'alters',
        power: 96
    },

    // ===== JUJUTSU KAISEN =====
    // Commun
    {
        id: 'jjk_001',
        name: 'Yuji Itadori',
        anime: 'Jujutsu Kaisen',
        rarity: 'Commun',
        image: '/gacha/cards/jjk_001.jpg',
        malId: 164473,
        description: 'L\'hôte de Sukuna, force surhumaine',
        power: 43
    },
    {
        id: 'jjk_002',
        name: 'Megumi Fushiguro',
        anime: 'Jujutsu Kaisen',
        rarity: 'Commun',
        image: '/gacha/cards/jjk_002.jpg',
        malId: 164474,
        description: 'Invocateur des dix ombres divines',
        power: 45
    },
    // Rare
    {
        id: 'jjk_003',
        name: 'Nobara Kugisaki',
        anime: 'Jujutsu Kaisen',
        rarity: 'Rare',
        image: '/gacha/cards/jjk_003.jpg',
        malId: 164475,
        description: 'Exorciste aux techniques de poupée vaudou',
        power: 56
    },
    {
        id: 'jjk_004',
        name: 'Maki Zenin',
        anime: 'Jujutsu Kaisen',
        rarity: 'Rare',
        image: '/gacha/cards/jjk_004.jpg',
        malId: 164479,
        description: 'Combattante sans énergie maudite',
        power: 59
    },
    // Épique
    {
        id: 'jjk_005',
        name: 'Toji Fushiguro',
        anime: 'Jujutsu Kaisen',
        rarity: 'Épique',
        image: '/gacha/cards/jjk_005.jpg',
        malId: 171809,
        description: 'Le tueur de sorciers, sans énergie maudite',
        power: 79
    },
    // Légendaire
    {
        id: 'jjk_006',
        name: 'Gojo Satoru',
        anime: 'Jujutsu Kaisen',
        rarity: 'Légendaire',
        image: '/gacha/cards/jjk_006.jpg',
        malId: 164471,
        description: 'Le plus puissant exorciste, maître de l\'infini',
        power: 93
    },
    // Mythique
    {
        id: 'jjk_007',
        name: 'Ryomen Sukuna',
        anime: 'Jujutsu Kaisen',
        rarity: 'Mythique',
        image: '/gacha/cards/jjk_007.png',
        malId: 164478,
        description: 'Le roi des fléaux, terreur millénaire',
        power: 100
    },

    // ===== DRAGON BALL Z =====
    // Commun
    {
        id: 'dbz_001',
        name: 'Son Goku',
        anime: 'Dragon Ball Z',
        rarity: 'Commun',
        image: '/gacha/cards/dbz_001.jpg',
        malId: 246,
        description: 'Le Saiyan légendaire, protecteur de la Terre',
        power: 47
    },
    {
        id: 'dbz_002',
        name: 'Son Gohan',
        anime: 'Dragon Ball Z',
        rarity: 'Commun',
        image: '/gacha/cards/dbz_002.jpg',
        malId: 247,
        description: 'Le fils de Goku, potentiel caché',
        power: 44
    },
    {
        id: 'dbz_003',
        name: 'Piccolo',
        anime: 'Dragon Ball Z',
        rarity: 'Commun',
        image: '/gacha/cards/dbz_003.jpg',
        malId: 251,
        description: 'Le Namek sage et puissant',
        power: 46
    },
    // Rare
    {
        id: 'dbz_004',
        name: 'Vegeta',
        anime: 'Dragon Ball Z',
        rarity: 'Rare',
        image: '/gacha/cards/dbz_004.jpg',
        malId: 250,
        description: 'Le prince des Saiyans, rival de Goku',
        power: 66
    },
    {
        id: 'dbz_005',
        name: 'Trunks',
        anime: 'Dragon Ball Z',
        rarity: 'Rare',
        image: '/gacha/cards/dbz_005.jpg',
        malId: 253,
        description: 'Le guerrier du futur',
        power: 60
    },
    // Épique
    {
        id: 'dbz_006',
        name: 'Majin Buu',
        anime: 'Dragon Ball Z',
        rarity: 'Épique',
        image: '/gacha/cards/dbz_006.jpg',
        malId: 2152,
        description: 'La créature magique destructrice',
        power: 76
    },
    {
        id: 'dbz_007',
        name: 'Cell',
        anime: 'Dragon Ball Z',
        rarity: 'Épique',
        image: '/gacha/cards/dbz_007.jpg',
        malId: 2151,
        description: 'L\'androïde bio-organique parfait',
        power: 74
    },
    // Légendaire
    {
        id: 'dbz_008',
        name: 'Goku Super Saiyan',
        anime: 'Dragon Ball Z',
        rarity: 'Légendaire',
        image: '/gacha/cards/dbz_008.jpg',
        malId: 246,
        description: 'La transformation légendaire des Saiyans',
        power: 89
    },
    // Mythique
    {
        id: 'dbz_009',
        name: 'Beerus',
        anime: 'Dragon Ball Z',
        rarity: 'Mythique',
        image: '/gacha/cards/dbz_009.png',
        malId: 83731,
        description: 'Le Dieu de la Destruction',
        power: 99
    },

    // ===== BLEACH =====
    // Commun
    {
        id: 'ble_001',
        name: 'Ichigo Kurosaki',
        anime: 'Bleach',
        rarity: 'Commun',
        image: '/gacha/cards/ble_001.jpg',
        malId: 5,
        description: 'Le Shinigami remplaçant',
        power: 46
    },
    {
        id: 'ble_002',
        name: 'Rukia Kuchiki',
        anime: 'Bleach',
        rarity: 'Commun',
        image: '/gacha/cards/ble_002.jpg',
        malId: 6,
        description: 'La Shinigami qui a tout changé',
        power: 43
    },
    {
        id: 'ble_003',
        name: 'Orihime Inoue',
        anime: 'Bleach',
        rarity: 'Commun',
        image: '/gacha/cards/ble_003.jpg',
        malId: 8,
        description: 'Pouvoir de rejet des événements',
        power: 40
    },
    // Rare
    {
        id: 'ble_004',
        name: 'Renji Abarai',
        anime: 'Bleach',
        rarity: 'Rare',
        image: '/gacha/cards/ble_004.jpg',
        malId: 116,
        description: 'Vice-capitaine de la 6ème division',
        power: 59
    },
    {
        id: 'ble_005',
        name: 'Byakuya Kuchiki',
        anime: 'Bleach',
        rarity: 'Rare',
        image: '/gacha/cards/ble_005.jpg',
        malId: 115,
        description: 'Capitaine de la 6ème division',
        power: 67
    },
    // Épique
    {
        id: 'ble_006',
        name: 'Kenpachi Zaraki',
        anime: 'Bleach',
        rarity: 'Épique',
        image: '/gacha/cards/ble_006.jpg',
        malId: 118,
        description: 'Le capitaine le plus brutal',
        power: 78
    },
    {
        id: 'ble_007',
        name: 'Toshiro Hitsugaya',
        anime: 'Bleach',
        rarity: 'Épique',
        image: '/gacha/cards/ble_007.jpg',
        malId: 120,
        description: 'Le plus jeune capitaine',
        power: 72
    },
    // Légendaire
    {
        id: 'ble_008',
        name: 'Sosuke Aizen',
        anime: 'Bleach',
        rarity: 'Légendaire',
        image: '/gacha/cards/ble_008.jpg',
        malId: 2369,
        description: 'Le traître aux pouvoirs divins',
        power: 91
    },
    // Mythique
    {
        id: 'ble_009',
        name: 'Yhwach',
        anime: 'Bleach',
        rarity: 'Mythique',
        image: '/gacha/cards/ble_009.png',
        malId: 75046,
        description: 'Le père de tous les Quincy',
        power: 98
    },

    // ===== HUNTER X HUNTER =====
    // Commun
    {
        id: 'hxh_001',
        name: 'Gon Freecss',
        anime: 'Hunter x Hunter',
        rarity: 'Commun',
        image: '/gacha/cards/hxh_001.jpg',
        malId: 30,
        description: 'Le jeune Hunter à la recherche de son père',
        power: 44
    },
    {
        id: 'hxh_002',
        name: 'Killua Zoldyck',
        anime: 'Hunter x Hunter',
        rarity: 'Commun',
        image: '/gacha/cards/hxh_002.jpg',
        malId: 27,
        description: 'L\'assassin prodige',
        power: 46
    },
    {
        id: 'hxh_003',
        name: 'Kurapika',
        anime: 'Hunter x Hunter',
        rarity: 'Commun',
        image: '/gacha/cards/hxh_003.jpg',
        malId: 28,
        description: 'Le dernier des Kurta',
        power: 45
    },
    // Rare
    {
        id: 'hxh_004',
        name: 'Leorio Paradinight',
        anime: 'Hunter x Hunter',
        rarity: 'Rare',
        image: '/gacha/cards/hxh_004.jpg',
        malId: 29,
        description: 'Le futur médecin Hunter',
        power: 54
    },
    {
        id: 'hxh_005',
        name: 'Hisoka Morow',
        anime: 'Hunter x Hunter',
        rarity: 'Rare',
        image: '/gacha/cards/hxh_005.jpg',
        malId: 31,
        description: 'Le magicien sadique',
        power: 69
    },
    // Épique
    {
        id: 'hxh_006',
        name: 'Chrollo Lucilfer',
        anime: 'Hunter x Hunter',
        rarity: 'Épique',
        image: '/gacha/cards/hxh_006.jpg',
        malId: 34,
        description: 'Chef de la Brigade Fantôme',
        power: 80
    },
    {
        id: 'hxh_007',
        name: 'Netero',
        anime: 'Hunter x Hunter',
        rarity: 'Épique',
        image: '/gacha/cards/hxh_007.jpg',
        malId: 32,
        description: 'Le président de l\'Association des Hunters',
        power: 77
    },
    // Légendaire
    {
        id: 'hxh_008',
        name: 'Meruem',
        anime: 'Hunter x Hunter',
        rarity: 'Légendaire',
        image: '/gacha/cards/hxh_008.jpg',
        malId: 47281,
        description: 'Le roi des Chimera Ants',
        power: 94
    },
    // Mythique
    {
        id: 'hxh_009',
        name: 'Adult Gon',
        anime: 'Hunter x Hunter',
        rarity: 'Mythique',
        image: '/gacha/cards/hxh_009.png',
        malId: 30,
        description: 'La transformation ultime de Gon',
        power: 100
    },
];

// Fonction pour obtenir toutes les cartes d'une rareté donnée
export function getCardsByRarity(rarity: CardRarity): AnimeCard[] {
    return ANIME_CARDS.filter(card => card.rarity === rarity);
}

// Fonction pour obtenir une carte aléatoire d'une rareté donnée
export function getRandomCardByRarity(rarity: CardRarity): AnimeCard {
    const cards = getCardsByRarity(rarity);
    if (cards.length === 0) {
        // Fallback
        return ANIME_CARDS[0];
    }
    return cards[Math.floor(Math.random() * cards.length)];
}

// Fonction pour obtenir une carte par son ID
export function getCardById(id: string): AnimeCard | undefined {
    return ANIME_CARDS.find(card => card.id === id);
}