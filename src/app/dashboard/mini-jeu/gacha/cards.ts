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
    quote?: string; // ✨ NOUVEAU: Citation iconique du personnage
}

// Probabilités de drop (total = 85% car 15% = rien)
// ✨ MISE À JOUR: Taux de Mythique à 2% et ajustement des autres taux.
export const RARITY_RATES = {
    'Commun': 0.53,      // 53%
    'Rare': 0.25,        // 25%
    'Épique': 0.15,      // 15%
    'Légendaire': 0.05,  // 5%
    'Mythique': 0.02,    // 2% (chance de base, hors pity)
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
    { id: 'ds_010', name: 'Shinobu Kocho', anime: 'Demon Slayer', rarity: 'Commun', image: '/gacha/cards/ds_010.jpg', malId: 146738, description: 'Pilier de l\'Insecte, rapide et mortelle.', power: 48 },
    { id: 'ds_011', name: 'Kanao Tsuyuri', anime: 'Demon Slayer', rarity: 'Commun', image: '/gacha/cards/ds_011.jpg', malId: 146160, description: 'Tsuguko de Shinobu, au potentiel immense.', power: 44 },
    { id: 'ds_023', name: 'Genya Shinazugawa', anime: 'Demon Slayer', rarity: 'Commun', image: '/gacha/cards/ds_023.jpg', malId: 146161, description: 'Pourfendeur qui peut acquérir les pouvoirs des démons qu\'il mange.', power: 40 },
    { id: 'ds_002', name: 'Zenitsu Agatsuma', anime: 'Demon Slayer', rarity: 'Commun', image: '/gacha/cards/ds_002.jpg', malId: 146158, description: 'Maître de la respiration de la foudre', power: 42 },
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
    { id: 'ds_012', name: 'Sanemi Shinazugawa', anime: 'Demon Slayer', rarity: 'Rare', image: '/gacha/cards/ds_012.jpg', malId: 151146, description: 'Pilier du Vent, au tempérament explosif.', power: 63 },
    { id: 'ds_013', name: 'Obanai Iguro', anime: 'Demon Slayer', rarity: 'Rare', image: '/gacha/cards/ds_013.jpg', malId: 151148, description: 'Pilier du Serpent, toujours accompagné de Kaburamaru.', power: 62 },
    { id: 'ds_014', name: 'Mitsuri Kanroji', anime: 'Demon Slayer', rarity: 'Rare', image: '/gacha/cards/ds_014.jpg', malId: 151147, description: 'Pilier de l\'Amour, dotée d\'une force surhumaine.', power: 61 },
    { id: 'ds_022', name: 'Muichiro Tokito', anime: 'Demon Slayer', rarity: 'Rare', image: '/gacha/cards/ds_022.jpg', malId: 151145, description: 'Pilier de la Brume, un génie souvent dans ses pensées.', power: 64 },
    { id: 'ds_025', name: 'Sakonji Urokodaki', anime: 'Demon Slayer', rarity: 'Rare', image: '/gacha/cards/ds_025.jpg', malId: 146736, description: 'Ancien Pilier de l\'Eau et maître de Tanjiro.', power: 55 },
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
    { id: 'ds_015', name: 'Gyomei Himejima', anime: 'Demon Slayer', rarity: 'Épique', image: '/gacha/cards/ds_015.jpg', malId: 151149, description: 'Pilier de la Roche, considéré comme le plus fort des Piliers.', power: 80 },
    { id: 'ds_016', name: 'Akaza', anime: 'Demon Slayer', rarity: 'Épique', image: '/gacha/cards/ds_016.jpg', malId: 151154, description: 'Troisième Lune Supérieure, maître des arts martiaux.', power: 84 },
    { id: 'ds_017', name: 'Doma', anime: 'Demon Slayer', rarity: 'Épique', image: '/gacha/cards/ds_017.jpg', malId: 151153, description: 'Deuxième Lune Supérieure, au sourire glaçant.', power: 86 },
    { id: 'ds_024', name: 'Kaigaku', anime: 'Demon Slayer', rarity: 'Épique', image: '/gacha/cards/ds_024.jpg', malId: 174160, description: 'Ancien disciple de la Foudre, devenu une Lune Supérieure.', power: 81 },
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
    { id: 'ds_018', name: 'Gyutaro', anime: 'Demon Slayer', rarity: 'Légendaire', image: '/gacha/cards/ds_018.jpg', malId: 174157, description: 'Sixième Lune Supérieure, partageant son corps avec sa sœur.', power: 88 },
    { id: 'ds_019', name: 'Daki', anime: 'Demon Slayer', rarity: 'Légendaire', image: '/gacha/cards/ds_019.jpg', malId: 174158, description: 'Sixième Lune Supérieure, manipulant des obi mortels.', power: 87 },
    { id: 'ds_020', name: 'Kokushibo', anime: 'Demon Slayer', rarity: 'Légendaire', image: '/gacha/cards/ds_020.jpg', malId: 151152, description: 'Première Lune Supérieure, ancien pourfendeur de démons.', power: 96 },
    { id: 'ds_021', name: 'Tanjiro (Sun Breathing)', anime: 'Demon Slayer', rarity: 'Mythique', image: '/gacha/cards/ds_021.jpg', malId: 146156, description: 'La maîtrise de la Respiration du Soleil, l\'héritage de Yoriichi.', power: 98 },
    // Mythique
    {
        id: 'ds_009',
        name: 'Yoriichi Tsugikuni',
        anime: 'Demon Slayer',
        rarity: 'Mythique',
        image: '/gacha/cards/ds_009.png',
        malId: 174159,
        description: 'Le plus puissant pourfendeur, créateur de la Danse du Dieu du Feu',
        power: 100,
        quote: "Ceux qui naissent avec un don supérieur aux autres ont le devoir de l'utiliser pour le bien du monde."
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
    { id: 'nar_010', name: 'Shikamaru Nara', anime: 'Naruto', rarity: 'Commun', image: '/gacha/cards/nar_010.jpg', malId: 307, description: 'Génie stratégique, maître des ombres.', power: 41 },
    { id: 'nar_011', name: 'Hinata Hyuga', anime: 'Naruto', rarity: 'Commun', image: '/gacha/cards/nar_011.jpg', malId: 249, description: 'Héritière du Byakugan, au cœur loyal.', power: 39 },
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
    { id: 'nar_012', name: 'Gaara', anime: 'Naruto', rarity: 'Rare', image: '/gacha/cards/nar_012.jpg', malId: 24, description: 'Jinchuriki de Shukaku, maître du sable.', power: 64 },
    { id: 'nar_013', name: 'Orochimaru', anime: 'Naruto', rarity: 'Rare', image: '/gacha/cards/nar_013.jpg', malId: 2422, description: 'Sannin légendaire en quête d\'immortalité.', power: 68 },
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
    { id: 'nar_024', name: 'Might Guy', anime: 'Naruto', rarity: 'Rare', image: '/gacha/cards/nar_024.jpg', malId: 308, description: 'La Noble Bête de Konoha, expert en taijutsu.', power: 68 },
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
    { id: 'nar_014', name: 'Pain (Yahiko)', anime: 'Naruto', rarity: 'Épique', image: '/gacha/cards/nar_014.jpg', malId: 2132, description: 'Chef de l\'Akatsuki, porteur du Rinnegan.', power: 83 },
    { id: 'nar_015', name: 'Obito Uchiha', anime: 'Naruto', rarity: 'Épique', image: '/gacha/cards/nar_015.jpg', malId: 15, description: 'L\'homme masqué qui a déclenché la guerre.', power: 85 },
    { id: 'nar_016', name: 'Konan', anime: 'Naruto', rarity: 'Épique', image: '/gacha/cards/nar_016.jpg', malId: 2133, description: 'L\'ange de papier de l\'Akatsuki.', power: 75 },
    { id: 'nar_022', name: 'Sasori', anime: 'Naruto', rarity: 'Épique', image: '/gacha/cards/nar_022.jpg', malId: 2425, description: 'Maître marionnettiste de l\'Akatsuki.', power: 77 },
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
    { id: 'nar_023', name: 'Deidara', anime: 'Naruto', rarity: 'Épique', image: '/gacha/cards/nar_023.jpg', malId: 2426, description: 'L\'artiste de l\'explosion, membre de l\'Akatsuki.', power: 76 },
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
    { id: 'nar_017', name: 'Hashirama Senju', anime: 'Naruto', rarity: 'Légendaire', image: '/gacha/cards/nar_017.jpg', malId: 2533, description: 'Le Premier Hokage, Dieu des Shinobi.', power: 94 },
    { id: 'nar_018', name: 'Tobirama Senju', anime: 'Naruto', rarity: 'Légendaire', image: '/gacha/cards/nar_018.jpg', malId: 2534, description: 'Le Deuxième Hokage, créateur de nombreuses techniques.', power: 92 },
    { id: 'nar_019', name: 'Naruto (Sage Mode)', anime: 'Naruto', rarity: 'Légendaire', image: '/gacha/cards/nar_019.jpg', malId: 17, description: 'La puissance de la nature maîtrisée.', power: 89 },
    // Mythique
    {
        id: 'nar_009',
        name: 'Madara Uchiha',
        anime: 'Naruto',
        rarity: 'Mythique',
        image: '/gacha/cards/nar_009.png',
        malId: 11,
        description: 'Légende vivante, cofondateur de Konoha',
        power: 98,
        quote: "Réveille-toi et affronte la réalité ! Rien ne se passe comme prévu dans ce monde misérable."
    },
    { id: 'nar_020', name: 'Kaguya Otsutsuki', anime: 'Naruto', rarity: 'Mythique', image: '/gacha/cards/nar_020.jpg', malId: 75635, description: 'La Progenitrice du Chakra, une menace divine.', power: 100 },
    { id: 'nar_021', name: 'Naruto (Six Paths)', anime: 'Naruto', rarity: 'Mythique', image: '/gacha/cards/nar_021.jpg', malId: 17, description: 'Le Sauveur du Monde, héritier du Sage des Six Chemins.', power: 99 },
    { id: 'nar_025', name: 'Guy (Eight Gates)', anime: 'Naruto', rarity: 'Mythique', image: '/gacha/cards/nar_025.jpg', malId: 308, description: 'L\'ouverture de la huitième porte, une puissance qui surpasse les Kage.', power: 99 },

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
    { id: 'op_010', name: 'Usopp', anime: 'One Piece', rarity: 'Commun', image: '/gacha/cards/op_010.jpg', malId: 304, description: 'Le tireur d\'élite et grand menteur de l\'équipage.', power: 36 },
    { id: 'op_011', name: 'Tony Tony Chopper', anime: 'One Piece', rarity: 'Commun', image: '/gacha/cards/op_011.jpg', malId: 307, description: 'Le médecin de l\'équipage, un renne au grand cœur.', power: 37 },
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
    { id: 'op_012', name: 'Nico Robin', anime: 'One Piece', rarity: 'Rare', image: '/gacha/cards/op_012.jpg', malId: 722, description: 'L\'archéologue qui peut lire les Poneglyphes.', power: 59 },
    { id: 'op_013', name: 'Franky', anime: 'One Piece', rarity: 'Rare', image: '/gacha/cards/op_013.jpg', malId: 308, description: 'Le charpentier cyborg de l\'équipage.', power: 60 },
    { id: 'op_014', name: 'Brook', anime: 'One Piece', rarity: 'Rare', image: '/gacha/cards/op_014.jpg', malId: 310, description: 'Le musicien squelette, revenu à la vie.', power: 58 },
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
    { id: 'op_015', name: 'Jinbe', anime: 'One Piece', rarity: 'Épique', image: '/gacha/cards/op_015.jpg', malId: 1662, description: 'Le Paladin des Mers, timonier de l\'équipage.', power: 75 },
    { id: 'op_016', name: 'Dracule Mihawk', anime: 'One Piece', rarity: 'Épique', image: '/gacha/cards/op_016.jpg', malId: 311, description: 'Le plus grand sabreur du monde.', power: 84 },
    { id: 'op_017', name: 'Donquixote Doflamingo', anime: 'One Piece', rarity: 'Épique', image: '/gacha/cards/op_017.jpg', malId: 1664, description: 'Le Dragon Céleste déchu, maître des fils.', power: 86 },
    { id: 'op_022', name: 'Katakuri', anime: 'One Piece', rarity: 'Épique', image: '/gacha/cards/op_022.jpg', malId: 83824, description: 'Le plus fort des Sweet Commanders, maître du Haki de l\'Observation.', power: 88 },
    { id: 'op_023', name: 'Eustass Kid', anime: 'One Piece', rarity: 'Épique', image: '/gacha/cards/op_023.jpg', malId: 17170, description: 'Capitaine de l\'équipage de Kid, utilisateur du magnétisme.', power: 76 },
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
    { id: 'op_025', name: 'Sabo', anime: 'One Piece', rarity: 'Épique', image: '/gacha/cards/op_025.jpg', malId: 40460, description: 'Le second de l\'Armée Révolutionnaire, frère spirituel de Luffy.', power: 85 },
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
    { id: 'op_018', name: 'Kaido', anime: 'One Piece', rarity: 'Légendaire', image: '/gacha/cards/op_018.jpg', malId: 83823, description: 'La créature la plus puissante du monde.', power: 97 },
    { id: 'op_019', name: 'Charlotte Linlin (Big Mom)', anime: 'One Piece', rarity: 'Légendaire', image: '/gacha/cards/op_019.jpg', malId: 83825, description: 'Impératrice de Totto Land, capable de voler les âmes.', power: 96 },
    { id: 'op_020', name: 'Marshall D. Teach (Blackbeard)', anime: 'One Piece', rarity: 'Légendaire', image: '/gacha/cards/op_020.jpg', malId: 1665, description: 'Le seul homme à posséder deux Fruits du Démon.', power: 95 },
    { id: 'op_024', name: 'Silvers Rayleigh', anime: 'One Piece', rarity: 'Légendaire', image: '/gacha/cards/op_024.jpg', malId: 1666, description: 'Le "Seigneur des Ténèbres", second de l\'équipage de Roger.', power: 93 },
    // Mythique
    {
        id: 'op_009',
        name: 'Gol D. Roger',
        anime: 'One Piece',
        rarity: 'Mythique',
        image: '/gacha/cards/op_009.png',
        malId: 40459,
        description: 'Le Roi des Pirates, légende absolue',
        power: 99,
        quote: "Mon trésor ? Je vous le laisse si vous voulez. Trouvez-le ! Je l'ai laissé quelque part dans ce monde !"
    },
    { id: 'op_021', name: 'Luffy (Gear 5)', anime: 'One Piece', rarity: 'Mythique', image: '/gacha/cards/op_021.jpg', malId: 40, description: 'L\'éveil du Hito Hito no Mi, modèle: Nika. Le guerrier de la libération.', power: 100 },

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
    { id: 'aot_008', name: 'Jean Kirstein', anime: 'Attack on Titan', rarity: 'Commun', image: '/gacha/cards/aot_008.jpg', malId: 46497, description: 'Soldat pragmatique devenu un leader fiable.', power: 42 },
    { id: 'aot_009', name: 'Connie Springer', anime: 'Attack on Titan', rarity: 'Commun', image: '/gacha/cards/aot_009.jpg', malId: 46499, description: 'Soldat simple d\'esprit mais au grand cœur.', power: 38 },
    { id: 'aot_010', name: 'Sasha Blouse', anime: 'Attack on Titan', rarity: 'Commun', image: '/gacha/cards/aot_010.jpg', malId: 46498, description: 'La "fille patate", archère talentueuse.', power: 40 },
    { id: 'aot_022', name: 'Gabi Braun', anime: 'Attack on Titan', rarity: 'Commun', image: '/gacha/cards/aot_022.jpg', malId: 138239, description: 'Jeune guerrière Mahr, candidate pour hériter du Titan Cuirassé.', power: 35 },
    { id: 'aot_023', name: 'Falco Grice', anime: 'Attack on Titan', rarity: 'Commun', image: '/gacha/cards/aot_023.jpg', malId: 138238, description: 'Jeune guerrier Mahr au grand cœur.', power: 34 },
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
    { id: 'aot_011', name: 'Historia Reiss', anime: 'Attack on Titan', rarity: 'Rare', image: '/gacha/cards/aot_011.jpg', malId: 46500, description: 'Héritière du trône des Murs.', power: 52 },
    { id: 'aot_012', name: 'Hange Zoë', anime: 'Attack on Titan', rarity: 'Rare', image: '/gacha/cards/aot_012.jpg', malId: 46495, description: 'Scientifique passionnée par les Titans.', power: 58 },
    { id: 'aot_013', name: 'Annie Leonhart', anime: 'Attack on Titan', rarity: 'Rare', image: '/gacha/cards/aot_013.jpg', malId: 46501, description: 'Le Titan Féminin, experte en arts martiaux.', power: 65 },
    { id: 'aot_024', name: 'Porco Galliard', anime: 'Attack on Titan', rarity: 'Rare', image: '/gacha/cards/aot_024.jpg', malId: 138242, description: 'Le Titan Mâchoire, rapide et agile.', power: 66 },
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
    { id: 'aot_025', name: 'Willy Tybur', anime: 'Attack on Titan', rarity: 'Rare', image: '/gacha/cards/aot_025.jpg', malId: 170284, description: 'Noble d\'Eldia détenant le Titan Marteau d\'Armes.', power: 50 },
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
    { id: 'aot_014', name: 'Bertholdt Hoover', anime: 'Attack on Titan', rarity: 'Épique', image: '/gacha/cards/aot_014.jpg', malId: 46502, description: 'Le Titan Colossal, dieu de la destruction.', power: 78 },
    { id: 'aot_015', name: 'Zeke Yeager', anime: 'Attack on Titan', rarity: 'Épique', image: '/gacha/cards/aot_015.jpg', malId: 86039, description: 'Le Titan Bestial, chef des guerriers de Mahr.', power: 83 },
    { id: 'aot_016', name: 'Pieck Finger', anime: 'Attack on Titan', rarity: 'Épique', image: '/gacha/cards/aot_016.jpg', malId: 138240, description: 'Le Titan Charette, soutien stratégique.', power: 72 },
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
    { id: 'aot_017', name: 'Erwin Smith', anime: 'Attack on Titan', rarity: 'Légendaire', image: '/gacha/cards/aot_017.jpg', malId: 45628, description: 'Commandant du Bataillon d\'exploration, prêt à tout sacrifier.', power: 90 },
    { id: 'aot_018', name: 'Kenny Ackerman', anime: 'Attack on Titan', rarity: 'Légendaire', image: '/gacha/cards/aot_018.jpg', malId: 126065, description: '"Kenny l\'Éventreur", l\'oncle de Levi.', power: 86 },
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
    { id: 'aot_019', name: 'Eren (Founding Titan)', anime: 'Attack on Titan', rarity: 'Mythique', image: '/gacha/cards/aot_019.jpg', malId: 40882, description: 'Le pouvoir de commander tous les Titans et de remodeler le monde.', power: 100 },
    { id: 'aot_020', name: 'Levi (Prime)', anime: 'Attack on Titan', rarity: 'Mythique', image: '/gacha/cards/aot_020.jpg', malId: 45627, description: 'Le Caporal-Chef dans toute sa splendeur, un tourbillon d\'acier.', power: 98 },

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
    { id: 'mha_008', name: 'Tenya Iida', anime: 'My Hero Academia', rarity: 'Commun', image: '/gacha/cards/mha_008.jpg', malId: 117916, description: 'Le délégué de la classe, rapide comme l\'éclair.', power: 40 },
    { id: 'mha_009', name: 'Eijiro Kirishima', anime: 'My Hero Academia', rarity: 'Commun', image: '/gacha/cards/mha_009.jpg', malId: 117917, description: 'Le héros à la peau d\'acier, Red Riot.', power: 42 },
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
    { id: 'mha_010', name: 'Tsuyu Asui', anime: 'My Hero Academia', rarity: 'Rare', image: '/gacha/cards/mha_010.jpg', malId: 117918, description: 'Froppy, l\'héroïne aux capacités de grenouille.', power: 55 },
    { id: 'mha_011', name: 'Momo Yaoyorozu', anime: 'My Hero Academia', rarity: 'Rare', image: '/gacha/cards/mha_011.jpg', malId: 117919, description: 'L\'héroïne de la création, capable de tout fabriquer.', power: 57 },
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
    { id: 'mha_012', name: 'Shota Aizawa (Eraser Head)', anime: 'My Hero Academia', rarity: 'Épique', image: '/gacha/cards/mha_012.jpg', malId: 117920, description: 'Le professeur principal qui peut effacer les Alters.', power: 74 },
    { id: 'mha_013', name: 'Tomura Shigaraki', anime: 'My Hero Academia', rarity: 'Épique', image: '/gacha/cards/mha_013.jpg', malId: 117921, description: 'Le chef de l\'Alliance des super-vilains.', power: 80 },
    { id: 'mha_014', name: 'Dabi', anime: 'My Hero Academia', rarity: 'Épique', image: '/gacha/cards/mha_014.jpg', malId: 117922, description: 'Le vilain aux flammes bleues dévastatrices.', power: 78 },
    { id: 'mha_015', name: 'Himiko Toga', anime: 'My Hero Academia', rarity: 'Épique', image: '/gacha/cards/mha_015.jpg', malId: 117923, description: 'La vilaine qui peut prendre l\'apparence des autres.', power: 73 },
    { id: 'mha_023', name: 'Nejire Hado', anime: 'My Hero Academia', rarity: 'Épique', image: '/gacha/cards/mha_023.jpg', malId: 137406, description: 'Membre des Big 3, manipulant des ondes de choc.', power: 76 },
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
    { id: 'mha_016', name: 'Hawks', anime: 'My Hero Academia', rarity: 'Légendaire', image: '/gacha/cards/mha_016.jpg', malId: 137402, description: 'Le héros ailé, numéro 2 du classement.', power: 88 },
    { id: 'mha_017', name: 'Mirko', anime: 'My Hero Academia', rarity: 'Légendaire', image: '/gacha/cards/mha_017.jpg', malId: 164935, description: 'L\'héroïne lapine, d\'une puissance et d\'une agilité féroces.', power: 87 },
    { id: 'mha_018', name: 'Overhaul (Kai Chisaki)', anime: 'My Hero Academia', rarity: 'Légendaire', image: '/gacha/cards/mha_018.jpg', malId: 137403, description: 'Le chef des Huit Préceptes de la Mort, capable de tout remodeler.', power: 89 },
    { id: 'mha_022', name: 'Lemillion (Mirio Togata)', anime: 'My Hero Academia', rarity: 'Légendaire', image: '/gacha/cards/mha_022.jpg', malId: 137404, description: 'Le plus proche du sommet, même sans alter.', power: 89 },
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
    { id: 'mha_019', name: 'Deku (Vigilante)', anime: 'My Hero Academia', rarity: 'Mythique', image: '/gacha/cards/mha_019.jpg', malId: 117909, description: 'Agissant seul, portant le poids du One For All.', power: 97 },
    { id: 'mha_020', name: 'Shigaraki (Post-Awakening)', anime: 'My Hero Academia', rarity: 'Mythique', image: '/gacha/cards/mha_020.jpg', malId: 117921, description: 'Le symbole de la peur, une calamité ambulante.', power: 99 },
    { id: 'mha_021', name: 'Star and Stripe', anime: 'My Hero Academia', rarity: 'Mythique', image: '/gacha/cards/mha_021.jpg', malId: 196362, description: 'L\'héroïne numéro 1 des États-Unis, au pouvoir absolu.', power: 98 },

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
    { id: 'jjk_008', name: 'Panda', anime: 'Jujutsu Kaisen', rarity: 'Commun', image: '/gacha/cards/jjk_008.jpg', malId: 164480, description: 'Un cadavre maudit unique avec trois cœurs.', power: 41 },
    { id: 'jjk_009', name: 'Toge Inumaki', anime: 'Jujutsu Kaisen', rarity: 'Commun', image: '/gacha/cards/jjk_009.jpg', malId: 164481, description: 'Utilisateur de la parole incantatoire.', power: 44 },
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
    { id: 'jjk_010', name: 'Kento Nanami', anime: 'Jujutsu Kaisen', rarity: 'Rare', image: '/gacha/cards/jjk_010.jpg', malId: 164476, description: 'L\'exorciste de classe 1, pragmatique et puissant.', power: 65 },
    { id: 'jjk_011', name: 'Aoi Todo', anime: 'Jujutsu Kaisen', rarity: 'Rare', image: '/gacha/cards/jjk_011.jpg', malId: 164482, description: 'Exorciste de classe 1 de Kyoto, obsédé par les idoles.', power: 67 },
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
    { id: 'jjk_022', name: 'Mei Mei', anime: 'Jujutsu Kaisen', rarity: 'Rare', image: '/gacha/cards/jjk_022.jpg', malId: 171813, description: 'Exorciste de classe 1 qui manipule les corbeaux.', power: 66 },
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
    { id: 'jjk_012', name: 'Suguru Geto', anime: 'Jujutsu Kaisen', rarity: 'Épique', image: '/gacha/cards/jjk_012.jpg', malId: 164472, description: 'Le maître des fléaux, ancien ami de Gojo.', power: 82 },
    { id: 'jjk_013', name: 'Mahito', anime: 'Jujutsu Kaisen', rarity: 'Épique', image: '/gacha/cards/jjk_013.jpg', malId: 164483, description: 'Fléau de classe S qui manipule les âmes.', power: 84 },
    { id: 'jjk_014', name: 'Choso', anime: 'Jujutsu Kaisen', rarity: 'Épique', image: '/gacha/cards/jjk_014.jpg', malId: 171810, description: 'Le plus âgé des fœtus maudits, maître du sang.', power: 78 },
    { id: 'jjk_023', name: 'Naobito Zenin', anime: 'Jujutsu Kaisen', rarity: 'Épique', image: '/gacha/cards/jjk_023.jpg', malId: 171814, description: 'Chef du clan Zenin, l\'un des plus rapides exorcistes.', power: 77 },
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
    { id: 'jjk_015', name: 'Yuta Okkotsu', anime: 'Jujutsu Kaisen', rarity: 'Légendaire', image: '/gacha/cards/jjk_015.jpg', malId: 164477, description: 'Exorciste de classe S au potentiel immense, lié à Rika.', power: 91 },
    { id: 'jjk_016', name: 'Jogo', anime: 'Jujutsu Kaisen', rarity: 'Légendaire', image: '/gacha/cards/jjk_016.jpg', malId: 171811, description: 'Fléau de classe S, maître du feu volcanique.', power: 87 },
    { id: 'jjk_017', name: 'Hanami', anime: 'Jujutsu Kaisen', rarity: 'Légendaire', image: '/gacha/cards/jjk_017.jpg', malId: 171812, description: 'Fléau de classe S, incarnant la peur de la nature.', power: 86 },
    { id: 'jjk_021', name: 'Maki Zenin (Awakened)', anime: 'Jujutsu Kaisen', rarity: 'Légendaire', image: '/gacha/cards/jjk_021.jpg', malId: 164479, description: 'Libérée de ses chaînes, une combattante au niveau de Toji.', power: 90 },
    { id: 'jjk_024', name: 'Hajime Kashimo', anime: 'Jujutsu Kaisen', rarity: 'Légendaire', image: '/gacha/cards/jjk_024.jpg', malId: 201390, description: 'Exorciste de l\'ère Edo réincarné, maître de l\'électricité.', power: 90 },
    { id: 'jjk_025', name: 'Hiromi Higuruma', anime: 'Jujutsu Kaisen', rarity: 'Légendaire', image: '/gacha/cards/jjk_025.jpg', malId: 201391, description: 'Avocat devenu exorciste, son domaine est un tribunal.', power: 89 },
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
    { id: 'jjk_018', name: 'Kenjaku', anime: 'Jujutsu Kaisen', rarity: 'Mythique', image: '/gacha/cards/jjk_018.jpg', malId: 164472, description: 'Le cerveau millénaire, orchestrant le chaos.', power: 96 },
    { id: 'jjk_019', name: 'Gojo (Unlimited Void)', anime: 'Jujutsu Kaisen', rarity: 'Mythique', image: '/gacha/cards/jjk_019.jpg', malId: 164471, description: 'L\'expansion de domaine qui submerge les sens de tout.', power: 99 },
    { id: 'jjk_020', name: 'Sukuna (Heian Era)', anime: 'Jujutsu Kaisen', rarity: 'Mythique', image: '/gacha/cards/jjk_020.jpg', malId: 164478, description: 'La forme originelle du Roi des Fléaux, une véritable calamité.', power: 100 },

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
    { id: 'dbz_010', name: 'Krillin', anime: 'Dragon Ball Z', rarity: 'Commun', image: '/gacha/cards/dbz_010.jpg', malId: 252, description: 'Le meilleur ami de Goku, le terrien le plus fort.', power: 38 },
    { id: 'dbz_011', name: 'Yamcha', anime: 'Dragon Ball Z', rarity: 'Commun', image: '/gacha/cards/dbz_011.jpg', malId: 254, description: 'Ancien bandit du désert, souvent malchanceux.', power: 32 },
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
    { id: 'dbz_012', name: 'Tien Shinhan', anime: 'Dragon Ball Z', rarity: 'Rare', image: '/gacha/cards/dbz_012.jpg', malId: 255, description: 'Maître de l\'école de la Grue, doté d\'un troisième œil.', power: 55 },
    { id: 'dbz_013', name: 'C-18', anime: 'Dragon Ball Z', rarity: 'Rare', image: '/gacha/cards/dbz_013.jpg', malId: 2149, description: 'Cyborg redoutable devenue une alliée précieuse.', power: 64 },
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
    { id: 'dbz_014', name: 'Frieza', anime: 'Dragon Ball Z', rarity: 'Épique', image: '/gacha/cards/dbz_014.jpg', malId: 2150, description: 'Le tyran galactique, ennemi juré de Goku.', power: 82 },
    { id: 'dbz_015', name: 'Gohan (Super Saiyan 2)', anime: 'Dragon Ball Z', rarity: 'Épique', image: '/gacha/cards/dbz_015.jpg', malId: 247, description: 'La puissance cachée de Gohan enfin libérée.', power: 85 },
    { id: 'dbz_016', name: 'Future Trunks (Super Saiyan)', anime: 'Dragon Ball Z', rarity: 'Épique', image: '/gacha/cards/dbz_016.jpg', malId: 253, description: 'Le guerrier venu d\'un futur apocalyptique.', power: 78 },
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
    { id: 'dbz_024', name: 'Goku Black', anime: 'Dragon Ball Z', rarity: 'Épique', image: '/gacha/cards/dbz_024.jpg', malId: 122435, description: 'Zamasu dans le corps de Goku, porteur de la justice divine.', power: 87 },
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
    { id: 'dbz_017', name: 'Vegeta (Majin)', anime: 'Dragon Ball Z', rarity: 'Légendaire', image: '/gacha/cards/dbz_017.jpg', malId: 250, description: 'Le Prince des Saiyans corrompu par Babidi.', power: 90 },
    { id: 'dbz_018', name: 'Vegito', anime: 'Dragon Ball Z', rarity: 'Légendaire', image: '/gacha/cards/dbz_018.jpg', malId: 4999, description: 'La fusion Potara de Goku et Vegeta.', power: 96 },
    { id: 'dbz_019', name: 'Gogeta', anime: 'Dragon Ball Z', rarity: 'Légendaire', image: '/gacha/cards/dbz_019.jpg', malId: 5000, description: 'La fusion par la danse de Goku et Vegeta.', power: 95 },
    { id: 'dbz_023', name: 'Jiren', anime: 'Dragon Ball Z', rarity: 'Légendaire', image: '/gacha/cards/dbz_023.jpg', malId: 130357, description: 'Le plus puissant guerrier de l\'Univers 11.', power: 97 },
    { id: 'dbz_025', name: 'Zamasu (Fused)', anime: 'Dragon Ball Z', rarity: 'Légendaire', image: '/gacha/cards/dbz_025.jpg', malId: 122436, description: 'La fusion de Goku Black et Zamasu, un dieu immortel.', power: 91 },
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
    { id: 'dbz_020', name: 'Broly (DBS)', anime: 'Dragon Ball Z', rarity: 'Mythique', image: '/gacha/cards/dbz_020.jpg', malId: 2153, description: 'Le Super Saiyan Légendaire, une force de la nature.', power: 98 },
    { id: 'dbz_021', name: 'Whis', anime: 'Dragon Ball Z', rarity: 'Mythique', image: '/gacha/cards/dbz_021.jpg', malId: 83733, description: 'L\'ange et maître de Beerus, d\'une puissance insondable.', power: 100 },
    { id: 'dbz_022', name: 'Goku (Ultra Instinct)', anime: 'Dragon Ball Z', rarity: 'Mythique', image: '/gacha/cards/dbz_022.jpg', malId: 246, description: 'L\'état des dieux, une maîtrise parfaite du corps.', power: 100 },

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
    { id: 'ble_010', name: 'Uryu Ishida', anime: 'Bleach', rarity: 'Commun', image: '/gacha/cards/ble_010.jpg', malId: 7, description: 'Un Quincy et rival d\'Ichigo.', power: 44 },
    { id: 'ble_011', name: 'Yasutora Sado (Chad)', anime: 'Bleach', rarity: 'Commun', image: '/gacha/cards/ble_011.jpg', malId: 9, description: 'L\'ami loyal d\'Ichigo au bras surpuissant.', power: 41 },
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
    { id: 'ble_012', name: 'Yoruichi Shihoin', anime: 'Bleach', rarity: 'Rare', image: '/gacha/cards/ble_012.jpg', malId: 117, description: 'Ancienne capitaine, experte en Hakuda et Shunpo.', power: 65 },
    { id: 'ble_013', name: 'Kisuke Urahara', anime: 'Bleach', rarity: 'Rare', image: '/gacha/cards/ble_013.jpg', malId: 119, description: 'Le mystérieux propriétaire de la boutique Urahara.', power: 68 },
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
    { id: 'ble_014', name: 'Grimmjow Jaegerjaquez', anime: 'Bleach', rarity: 'Épique', image: '/gacha/cards/ble_014.jpg', malId: 2370, description: 'Le 6ème Espada, incarnation de la destruction.', power: 80 },
    { id: 'ble_015', name: 'Ulquiorra Cifer', anime: 'Bleach', rarity: 'Épique', image: '/gacha/cards/ble_015.jpg', malId: 2371, description: 'Le 4ème Espada, représentant le nihilisme.', power: 85 },
    { id: 'ble_022', name: 'Shunsui Kyoraku', anime: 'Bleach', rarity: 'Épique', image: '/gacha/cards/ble_022.jpg', malId: 121, description: 'Capitaine de la 1ère division, un combattant joueur mais redoutable.', power: 86 },
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
    { id: 'ble_023', name: 'Coyote Starrk', anime: 'Bleach', rarity: 'Épique', image: '/gacha/cards/ble_023.jpg', malId: 2372, description: 'Le premier Espada, incarnant la solitude.', power: 87 },
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
    { id: 'ble_016', name: 'Genryusai Yamamoto', anime: 'Bleach', rarity: 'Légendaire', image: '/gacha/cards/ble_016.jpg', malId: 114, description: 'Le Commandant-Général du Gotei 13, maître du feu.', power: 94 },
    { id: 'ble_017', name: 'Ichigo (Vasto Lorde)', anime: 'Bleach', rarity: 'Légendaire', image: '/gacha/cards/ble_017.jpg', malId: 5, description: 'La forme Hollow la plus pure et la plus puissante d\'Ichigo.', power: 92 },
    { id: 'ble_018', name: 'Aizen (Hogyoku)', anime: 'Bleach', rarity: 'Légendaire', image: '/gacha/cards/ble_018.jpg', malId: 2369, description: 'Fusionné avec le Hogyoku, transcendant Shinigami et Hollow.', power: 96 },
    { id: 'ble_019', name: 'Jugram Haschwalth', anime: 'Bleach', rarity: 'Légendaire', image: '/gacha/cards/ble_019.jpg', malId: 75047, description: 'Le Grand Maître des Sternritter, "The Balance".', power: 90 },
    { id: 'ble_024', name: 'Askin Nakk Le Vaar', anime: 'Bleach', rarity: 'Légendaire', image: '/gacha/cards/ble_024.jpg', malId: 75048, description: 'Sternritter "The Deathdealing", manipulant les doses létales.', power: 89 },
    { id: 'ble_025', name: 'Gerard Valkyrie', anime: 'Bleach', rarity: 'Légendaire', image: '/gacha/cards/ble_025.jpg', malId: 75049, description: 'Sternritter "The Miracle", le cœur du Roi des Esprits.', power: 93 },
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
    { id: 'ble_020', name: 'Ichigo (Mugetsu)', anime: 'Bleach', rarity: 'Mythique', image: '/gacha/cards/ble_020.jpg', malId: 5, description: 'L\'Ultime Getsuga Tensho, un pouvoir au coût immense.', power: 100 },
    { id: 'ble_021', name: 'Ichibe Hyosube', anime: 'Bleach', rarity: 'Mythique', image: '/gacha/cards/ble_021.jpg', malId: 75045, description: 'Chef de la Division Zéro, celui qui a nommé toutes choses.', power: 99 },

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
    { id: 'hxh_010', name: 'Biscuit Krueger', anime: 'Hunter x Hunter', rarity: 'Commun', image: '/gacha/cards/hxh_010.jpg', malId: 33, description: 'Maître en Nen sous une apparence trompeuse.', power: 48 },
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
    { id: 'hxh_011', name: 'Zeno Zoldyck', anime: 'Hunter x Hunter', rarity: 'Rare', image: '/gacha/cards/hxh_011.jpg', malId: 2568, description: 'Le grand-père de Killua, un assassin légendaire.', power: 70 },
    { id: 'hxh_012', name: 'Silva Zoldyck', anime: 'Hunter x Hunter', rarity: 'Rare', image: '/gacha/cards/hxh_012.jpg', malId: 2569, description: 'Le père de Killua, chef de la famille Zoldyck.', power: 72 },
    { id: 'hxh_013', name: 'Feitan Portor', anime: 'Hunter x Hunter', rarity: 'Rare', image: '/gacha/cards/hxh_013.jpg', malId: 35, description: 'Membre de la Brigade Fantôme, spécialiste de la torture.', power: 68 },
    { id: 'hxh_023', name: 'Uvogin', anime: 'Hunter x Hunter', rarity: 'Rare', image: '/gacha/cards/hxh_023.jpg', malId: 36, description: 'Le membre le plus fort physiquement de la Brigade Fantôme.', power: 69 },
    { id: 'hxh_024', name: 'Shizuku Murasaki', anime: 'Hunter x Hunter', rarity: 'Rare', image: '/gacha/cards/hxh_024.jpg', malId: 37, description: 'Membre de la Brigade Fantôme, son aspirateur peut tout absorber.', power: 62 },
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
    { id: 'hxh_014', name: 'Illumi Zoldyck', anime: 'Hunter x Hunter', rarity: 'Épique', image: '/gacha/cards/hxh_014.jpg', malId: 2567, description: 'Le frère aîné de Killua, manipulateur d\'aiguilles.', power: 79 },
    { id: 'hxh_015', name: 'Shaiapouf', anime: 'Hunter x Hunter', rarity: 'Épique', image: '/gacha/cards/hxh_015.jpg', malId: 47283, description: 'Garde royal papillon, loyal jusqu\'à la folie.', power: 84 },
    { id: 'hxh_016', name: 'Neferpitou', anime: 'Hunter x Hunter', rarity: 'Épique', image: '/gacha/cards/hxh_016.jpg', malId: 47282, description: 'Garde royal félin, au Nen terrifiant.', power: 88 },
    { id: 'hxh_022', name: 'Kite', anime: 'Hunter x Hunter', rarity: 'Épique', image: '/gacha/cards/hxh_022.jpg', malId: 2571, description: 'Disciple de Ging, son Nen invoque une arme aléatoire.', power: 78 },
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
    { id: 'hxh_025', name: 'Morel Mackernasey', anime: 'Hunter x Hunter', rarity: 'Épique', image: '/gacha/cards/hxh_025.jpg', malId: 47286, description: 'Hunter expérimenté, maître de la manipulation de la fumée.', power: 79 },
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
    { id: 'hxh_017', name: 'Menthuthuyoupi', anime: 'Hunter x Hunter', rarity: 'Légendaire', image: '/gacha/cards/hxh_017.jpg', malId: 47284, description: 'Garde royal capable de métamorphoser son corps.', power: 89 },
    { id: 'hxh_018', name: 'Ging Freecss', anime: 'Hunter x Hunter', rarity: 'Légendaire', image: '/gacha/cards/hxh_018.jpg', malId: 2570, description: 'Le père de Gon, un Hunter doublement étoilé de légende.', power: 93 },
    { id: 'hxh_019', name: 'Killua (Godspeed)', anime: 'Hunter x Hunter', rarity: 'Légendaire', image: '/gacha/cards/hxh_019.jpg', malId: 27, description: 'Vitesse et réflexes divins grâce à la maîtrise de l\'électricité.', power: 90 },
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
    
    { id: 'hxh_021', name: 'Alluka Zoldyck', anime: 'Hunter x Hunter', rarity: 'Mythique', image: '/gacha/cards/hxh_021.jpg', malId: 47285, description: 'Possédée par Nanika, une entité capable d\'exaucer n\'importe quel vœu.', power: 99 },

    // ===== CHAINSAW MAN =====
    // Commun
    {
        id: 'csm_001',
        name: 'Denji',
        anime: 'Chainsaw Man',
        rarity: 'Commun',
        image: '/gacha/cards/csm_001.jpg',
        malId: 165265,
        description: 'Un jeune homme fusionné avec son chien-démon, Pochita.',
        power: 45
    },
    { id: 'csm_011', name: 'Himeno', anime: 'Chainsaw Man', rarity: 'Rare', image: '/gacha/cards/csm_011.jpg', malId: 175956, description: 'Devil Hunter expérimentée, partenaire d\'Aki.', power: 63 },
    {
        id: 'csm_002',
        name: 'Pochita',
        anime: 'Chainsaw Man',
        rarity: 'Commun',
        image: '/gacha/cards/csm_002.jpg',
        malId: 165266,
        description: 'Le démon-tronçonneuse au grand cœur, meilleur ami de Denji.',
        power: 38
    },
    // Rare
    {
        id: 'csm_003',
        name: 'Aki Hayakawa',
        anime: 'Chainsaw Man',
        rarity: 'Rare',
        image: '/gacha/cards/csm_003.jpg',
        malId: 165268,
        description: 'Un Devil Hunter sérieux qui a des contrats avec plusieurs démons.',
        power: 62
    },
    {
        id: 'csm_004',
        name: 'Power',
        anime: 'Chainsaw Man',
        rarity: 'Rare',
        image: '/gacha/cards/csm_004.jpg',
        malId: 165267,
        description: 'La Démon-Sang, aussi puissante que chaotique et menteuse.',
        power: 60
    },
    { id: 'csm_010', name: 'Angel Devil', anime: 'Chainsaw Man', rarity: 'Épique', image: '/gacha/cards/csm_010.jpg', malId: 175957, description: 'Un démon qui peut absorber l\'espérance de vie au contact.', power: 75 },
    // Épique
    {
        id: 'csm_005',
        name: 'Makima',
        anime: 'Chainsaw Man',
        rarity: 'Épique',
        image: '/gacha/cards/csm_005.jpg',
        malId: 165269,
        description: 'Une Devil Hunter de haut rang, chef de l\'escouade spéciale de Denji.',
        power: 82
    },
    {
        id: 'csm_006',
        name: 'Kishibe',
        anime: 'Chainsaw Man',
        rarity: 'Épique',
        image: '/gacha/cards/csm_006.jpg',
        malId: 172815,
        description: 'Le plus puissant Devil Hunter, capitaine de l\'escouade spéciale de Tokyo.',
        power: 79
    },
    { id: 'csm_013', name: 'Reze', anime: 'Chainsaw Man', rarity: 'Épique', image: '/gacha/cards/csm_013.jpg', malId: 175958, description: 'L\'hybride Bombe, envoyée par l\'Union Soviétique.', power: 84 },
    // Légendaire
    {
        id: 'csm_007',
        name: 'Chainsaw Man',
        anime: 'Chainsaw Man',
        rarity: 'Légendaire',
        image: '/gacha/cards/csm_007.jpg',
        malId: 165265,
        description: 'La forme démoniaque de Denji, le "Héros de l\'Enfer" craint par les démons.',
        power: 92
    },
    {
        id: 'csm_008',
        name: 'Gun Devil',
        anime: 'Chainsaw Man',
        rarity: 'Légendaire',
        image: '/gacha/cards/csm_008.jpg',
        malId: 201377,
        description: 'Un démon incroyablement puissant qui incarne la peur des armes à feu.',
        power: 95
    },
    { id: 'csm_012', name: 'Quanxi', anime: 'Chainsaw Man', rarity: 'Légendaire', image: '/gacha/cards/csm_012.jpg', malId: 201392, description: 'La première Devil Hunter, une hybride arbalète.', power: 90 },
    // Mythique
    {
        id: 'csm_009',
        name: 'Darkness Devil',
        anime: 'Chainsaw Man',
        rarity: 'Mythique',
        image: '/gacha/cards/csm_009.png',
        malId: 201378,
        description: 'Un démon primordial qui n\'a jamais connu la mort, incarnant la peur des ténèbres.',
        power: 100
    },
    { id: 'csm_014', name: 'Pochita (Hero of Hell)', anime: 'Chainsaw Man', rarity: 'Mythique', image: '/gacha/cards/csm_014.jpg', malId: 165266, description: 'La véritable forme du Démon-Tronçonneuse, craint par tous les démons.', power: 100 },
    
    // ===== SPY X FAMILY =====
    { id: 'spy_001', name: 'Loid Forger', anime: 'Spy x Family', rarity: 'Commun', image: '/gacha/cards/spy_001.jpg', malId: 166328, description: 'L\'espion de génie connu sous le nom de "Twilight".', power: 48 },
    { id: 'spy_002', name: 'Anya Forger', anime: 'Spy x Family', rarity: 'Commun', image: '/gacha/cards/spy_002.jpg', malId: 166329, description: 'La jeune télépathe qui connaît les secrets de tout le monde.', power: 40 },
    { id: 'spy_003', name: 'Yor Forger', anime: 'Spy x Family', rarity: 'Commun', image: '/gacha/cards/spy_003.jpg', malId: 166330, description: 'La "Princesse Ibara", une tueuse à gages redoutable.', power: 47 },
    { id: 'spy_004', name: 'Bond Forger', anime: 'Spy x Family', rarity: 'Rare', image: '/gacha/cards/spy_004.jpg', malId: 196363, description: 'Le chien de la famille qui peut voir le futur.', power: 50 },
    { id: 'spy_005', name: 'Damian Desmond', anime: 'Spy x Family', rarity: 'Rare', image: '/gacha/cards/spy_005.jpg', malId: 166331, description: 'Le deuxième fils de la cible de Loid, Donovan Desmond.', power: 35 },
    { id: 'spy_013', name: 'Fiona Frost (Nightfall)', anime: 'Spy x Family', rarity: 'Rare', image: '/gacha/cards/spy_013.jpg', malId: 196364, description: 'Collègue espionne de Loid, amoureuse de lui.', power: 62 },
    { id: 'spy_006', name: 'Yuri Briar', anime: 'Spy x Family', rarity: 'Épique', image: '/gacha/cards/spy_006.jpg', malId: 166332, description: 'Le frère de Yor, un agent zélé de la police secrète.', power: 65 },
    { id: 'spy_007', name: 'Franky Franklin', anime: 'Spy x Family', rarity: 'Épique', image: '/gacha/cards/spy_007.jpg', malId: 166333, description: 'L\'informateur de Loid, un atout précieux.', power: 55 },
    { id: 'spy_008', name: 'Twilight', anime: 'Spy x Family', rarity: 'Légendaire', image: '/gacha/cards/spy_008.jpg', malId: 166328, description: 'Le maître de l\'espionnage dans sa forme la plus pure.', power: 85 },
    { id: 'spy_009', name: 'Thorn Princess', anime: 'Spy x Family', rarity: 'Mythique', image: '/gacha/cards/spy_009.jpg', malId: 166330, description: 'Yor dans son rôle de tueuse, une danse mortelle.', power: 90 },
    { id: 'spy_010', name: 'Sylvia Sherwood (Handler)', anime: 'Spy x Family', rarity: 'Épique', image: '/gacha/cards/spy_010.jpg', malId: 166334, description: 'La supérieure de Loid à WISE.', power: 70 },
    { id: 'spy_011', name: 'Becky Blackbell', anime: 'Spy x Family', rarity: 'Commun', image: '/gacha/cards/spy_011.jpg', malId: 166335, description: 'La meilleure amie d\'Anya à l\'école Eden.', power: 25 },
    { id: 'spy_012', name: 'Donovan Desmond', anime: 'Spy x Family', rarity: 'Légendaire', image: '/gacha/cards/spy_012.jpg', malId: 166336, description: 'La cible principale de l\'Opération Strix, un homme politique insaisissable.', power: 80 },

    // ===== TOKYO REVENGERS =====
    { id: 'tr_001', name: 'Takemichi Hanagaki', anime: 'Tokyo Revengers', rarity: 'Commun', image: '/gacha/cards/tr_001.jpg', malId: 138241, description: 'Le "héros pleurnichard" qui voyage dans le temps pour tout changer.', power: 30 },
    { id: 'tr_002', name: 'Manjiro Sano (Mikey)', anime: 'Tokyo Revengers', rarity: 'Rare', image: '/gacha/cards/tr_002.jpg', malId: 138243, description: 'Le chef charismatique et invincible du Toman.', power: 70 },
    { id: 'tr_003', name: 'Ken Ryuguji (Draken)', anime: 'Tokyo Revengers', rarity: 'Rare', image: '/gacha/cards/tr_003.jpg', malId: 138244, description: 'Le vice-président du Toman, le cœur du gang.', power: 68 },
    { id: 'tr_004', name: 'Keisuke Baji', anime: 'Tokyo Revengers', rarity: 'Épique', image: '/gacha/cards/tr_004.jpg', malId: 138245, description: 'Capitaine de la 1ère division, l\'un des membres fondateurs.', power: 75 },
    { id: 'tr_005', name: 'Chifuyu Matsuno', anime: 'Tokyo Revengers', rarity: 'Épique', image: '/gacha/cards/tr_005.jpg', malId: 138246, description: 'Le loyal vice-capitaine de la 1ère division.', power: 65 },
    { id: 'tr_011', name: 'Kazutora Hanemiya', anime: 'Tokyo Revengers', rarity: 'Épique', image: '/gacha/cards/tr_011.jpg', malId: 138249, description: 'Membre fondateur du Toman, au passé tragique.', power: 73 },
    { id: 'tr_014', name: 'Taiju Shiba', anime: 'Tokyo Revengers', rarity: 'Épique', image: '/gacha/cards/tr_014.jpg', malId: 164939, description: 'Le chef tyrannique de la 10ème génération des Black Dragons.', power: 78 },
    { id: 'tr_006', name: 'Tetta Kisaki', anime: 'Tokyo Revengers', rarity: 'Légendaire', image: '/gacha/cards/tr_006.jpg', malId: 138247, description: 'Le cerveau manipulateur derrière les tragédies.', power: 85 },
    { id: 'tr_007', name: 'Shuji Hanma', anime: 'Tokyo Revengers', rarity: 'Légendaire', image: '/gacha/cards/tr_007.jpg', malId: 138248, description: 'Le "Shinigami", toujours en quête de sensations fortes.', power: 82 },
    { id: 'tr_008', name: 'Izana Kurokawa', anime: 'Tokyo Revengers', rarity: 'Légendaire', image: '/gacha/cards/tr_008.jpg', malId: 164936, description: 'Le chef de Tenjiku, doté de "sens invincibles".', power: 88 },
    { id: 'tr_009', name: 'Mikey (Dark Impulses)', anime: 'Tokyo Revengers', rarity: 'Mythique', image: '/gacha/cards/tr_009.jpg', malId: 138243, description: 'Lorsque les ténèbres consument le cœur de Mikey.', power: 98 },
    { id: 'tr_012', name: 'Hajime Kokonoi', anime: 'Tokyo Revengers', rarity: 'Rare', image: '/gacha/cards/tr_012.jpg', malId: 164937, description: 'Le génie financier, capable de lever des fonds impressionnants.', power: 58 },
    { id: 'tr_013', name: 'Seishu Inui', anime: 'Tokyo Revengers', rarity: 'Rare', image: '/gacha/cards/tr_013.jpg', malId: 164938, description: 'Ancien membre des Black Dragons, loyal à Kokonoi.', power: 60 },

    // ===== FULLMETAL ALCHEMIST: BROTHERHOOD =====
    { id: 'fma_001', name: 'Edward Elric', anime: 'Fullmetal Alchemist: Brotherhood', rarity: 'Commun', image: '/gacha/cards/fma_001.jpg', malId: 11, description: 'L\'alchimiste Fullmetal, à la recherche de la pierre philosophale.', power: 48 },
    { id: 'fma_002', name: 'Alphonse Elric', anime: 'Fullmetal Alchemist: Brotherhood', rarity: 'Commun', image: '/gacha/cards/fma_002.jpg', malId: 12, description: 'Une âme scellée dans une armure, au cœur d\'or.', power: 45 },
    { id: 'fma_003', name: 'Roy Mustang', anime: 'Fullmetal Alchemist: Brotherhood', rarity: 'Rare', image: '/gacha/cards/fma_003.jpg', malId: 22, description: 'L\'alchimiste de Flamme, un stratège ambitieux.', power: 68 },
    { id: 'fma_004', name: 'Riza Hawkeye', anime: 'Fullmetal Alchemist: Brotherhood', rarity: 'Rare', image: '/gacha/cards/fma_004.jpg', malId: 23, description: 'Tireuse d\'élite et garde du corps loyale de Mustang.', power: 60 },
    { id: 'fma_005', name: 'Scar', anime: 'Fullmetal Alchemist: Brotherhood', rarity: 'Épique', image: '/gacha/cards/fma_005.jpg', malId: 25, description: 'L\'Ishvalan vengeur qui chasse les alchimistes d\'État.', power: 78 },
    { id: 'fma_013', name: 'Alex Louis Armstrong', anime: 'Fullmetal Alchemist: Brotherhood', rarity: 'Rare', image: '/gacha/cards/fma_013.jpg', malId: 24, description: 'L\'alchimiste au Bras Puissant, un homme musclé au grand cœur.', power: 62 },
    { id: 'fma_006', name: 'King Bradley', anime: 'Fullmetal Alchemist: Brotherhood', rarity: 'Épique', image: '/gacha/cards/fma_006.jpg', malId: 26, description: 'Le Führer d\'Amestris, l\'homonculus Wrath.', power: 85 },
    { id: 'fma_007', name: 'Greed', anime: 'Fullmetal Alchemist: Brotherhood', rarity: 'Épique', image: '/gacha/cards/fma_007.jpg', malId: 27, description: 'L\'homonculus de l\'avarice, le "bouclier ultime".', power: 76 },
    { id: 'fma_014', name: 'Olivier Mira Armstrong', anime: 'Fullmetal Alchemist: Brotherhood', rarity: 'Épique', image: '/gacha/cards/fma_014.jpg', malId: 1668, description: 'La "Reine des Glaces", commandante de Fort Briggs.', power: 75 },
    { id: 'fma_016', name: 'Wrath (2003)', anime: 'Fullmetal Alchemist: Brotherhood', rarity: 'Épique', image: '/gacha/cards/fma_016.jpg', malId: 26, description: 'L\'enfant de l\'autre côté de la porte, un homonculus unique.', power: 77 },
    { id: 'fma_008', name: 'Lust', anime: 'Fullmetal Alchemist: Brotherhood', rarity: 'Légendaire', image: '/gacha/cards/fma_008.jpg', malId: 28, description: 'L\'homonculus de la luxure, la "lance ultime".', power: 86 },
    { id: 'fma_009', name: 'Envy', anime: 'Fullmetal Alchemist: Brotherhood', rarity: 'Légendaire', image: '/gacha/cards/fma_009.jpg', malId: 29, description: 'L\'homonculus de l\'envie, capable de changer d\'apparence.', power: 84 },
    { id: 'fma_010', name: 'Van Hohenheim', anime: 'Fullmetal Alchemist: Brotherhood', rarity: 'Légendaire', image: '/gacha/cards/fma_010.jpg', malId: 1667, description: 'Le père des frères Elric, une pierre philosophale vivante.', power: 92 },
    { id: 'fma_015', name: 'Pride', anime: 'Fullmetal Alchemist: Brotherhood', rarity: 'Légendaire', image: '/gacha/cards/fma_015.jpg', malId: 1669, description: 'Le premier homonculus, l\'incarnation de l\'orgueil.', power: 90 },
    { id: 'fma_011', name: 'Father', anime: 'Fullmetal Alchemist: Brotherhood', rarity: 'Mythique', image: '/gacha/cards/fma_011.jpg', malId: 1666, description: 'Le créateur des homonculus, cherchant à devenir un dieu.', power: 99 },
    { id: 'fma_012', name: 'Truth', anime: 'Fullmetal Alchemist: Brotherhood', rarity: 'Mythique', image: '/gacha/cards/fma_012.jpg', malId: 201380, description: 'L\'entité cosmique qui incarne l\'univers, le monde, tout.', power: 100 },

    // ===== DEATH NOTE =====
    { id: 'dn_001', name: 'Light Yagami', anime: 'Death Note', rarity: 'Commun', image: '/gacha/cards/dn_001.jpg', malId: 8, description: 'L\'étudiant brillant qui devient le "dieu du nouveau monde".', power: 50 },
    { id: 'dn_011', name: 'Touta Matsuda', anime: 'Death Note', rarity: 'Commun', image: '/gacha/cards/dn_011.jpg', malId: 16, description: 'Le jeune membre naïf de la cellule d\'enquête.', power: 30 },
    { id: 'dn_002', name: 'L Lawliet', anime: 'Death Note', rarity: 'Rare', image: '/gacha/cards/dn_002.jpg', malId: 7, description: 'Le plus grand détective du monde, à la poursuite de Kira.', power: 70 },
    { id: 'dn_003', name: 'Misa Amane', anime: 'Death Note', rarity: 'Commun', image: '/gacha/cards/dn_003.jpg', malId: 9, description: 'La deuxième Kira, une idole dévouée à Light.', power: 40 },
    { id: 'dn_004', name: 'Ryuk', anime: 'Death Note', rarity: 'Épique', image: '/gacha/cards/dn_004.jpg', malId: 10, description: 'Le Shinigami qui a laissé tomber son Death Note par ennui.', power: 75 },
    { id: 'dn_005', name: 'Rem', anime: 'Death Note', rarity: 'Épique', image: '/gacha/cards/dn_005.jpg', malId: 11, description: 'Le Shinigami dévoué à la protection de Misa.', power: 72 },
    { id: 'dn_006', name: 'Near (Nate River)', anime: 'Death Note', rarity: 'Légendaire', image: '/gacha/cards/dn_006.jpg', malId: 12, description: 'Le successeur de L, un génie des puzzles.', power: 88 },
    { id: 'dn_007', name: 'Mello (Mihael Keehl)', anime: 'Death Note', rarity: 'Légendaire', image: '/gacha/cards/dn_007.jpg', malId: 13, description: 'Le rival de Near, prêt à tout pour surpasser L.', power: 86 },
    { id: 'dn_008', name: 'Teru Mikami', anime: 'Death Note', rarity: 'Légendaire', image: '/gacha/cards/dn_008.jpg', malId: 14, description: 'Le procureur fanatique choisi par Kira.', power: 80 },
    { id: 'dn_010', name: 'Soichiro Yagami', anime: 'Death Note', rarity: 'Rare', image: '/gacha/cards/dn_010.jpg', malId: 15, description: 'Le chef de la cellule d\'enquête japonaise et père de Light.', power: 55 },
    { id: 'dn_012', name: 'Watari (Quillsh Wammy)', anime: 'Death Note', rarity: 'Épique', image: '/gacha/cards/dn_012.jpg', malId: 17, description: 'L\'assistant de L et fondateur de l\'orphelinat pour surdoués.', power: 70 },
    { id: 'dn_009', name: 'Kira', anime: 'Death Note', rarity: 'Mythique', image: '/gacha/cards/dn_009.jpg', malId: 8, description: 'Le symbole de la justice autoproclamée, un concept qui a changé le monde.', power: 95 },


    // ===== CYBERPUNK: EDGERUNNERS =====
    { id: 'cpe_001', name: 'David Martinez', anime: 'Cyberpunk: Edgerunners', rarity: 'Commun', image: '/gacha/cards/cpe_001.jpg', malId: 210393, description: 'Un gamin des rues qui devient un mercenaire de Night City.', power: 45 },
    { id: 'cpe_010', name: 'Pilar', anime: 'Cyberpunk: Edgerunners', rarity: 'Commun', image: '/gacha/cards/cpe_010.jpg', malId: 210398, description: 'Le frère de Rebecca, un techie excentrique.', power: 38 },
    { id: 'cpe_011', name: 'Gloria Martinez', anime: 'Cyberpunk: Edgerunners', rarity: 'Commun', image: '/gacha/cards/cpe_011.jpg', malId: 210401, description: 'La mère de David, qui a tout sacrifié pour son fils.', power: 25 },
    { id: 'cpe_002', name: 'Lucy', anime: 'Cyberpunk: Edgerunners', rarity: 'Rare', image: '/gacha/cards/cpe_002.jpg', malId: 210394, description: 'Une netrunner talentueuse au passé mystérieux.', power: 65 },
    { id: 'cpe_003', name: 'Maine', anime: 'Cyberpunk: Edgerunners', rarity: 'Rare', image: '/gacha/cards/cpe_003.jpg', malId: 210395, description: 'Le chef de l\'équipe de mercenaires, un vétéran cybernétique.', power: 68 },
    { id: 'cpe_004', name: 'Rebecca', anime: 'Cyberpunk: Edgerunners', rarity: 'Épique', image: '/gacha/cards/cpe_004.jpg', malId: 210397, description: 'Une edgerunner petite mais féroce, experte en armes lourdes.', power: 75 },
    { id: 'cpe_005', name: 'Kiwi', anime: 'Cyberpunk: Edgerunners', rarity: 'Épique', image: '/gacha/cards/cpe_005.jpg', malId: 210398, description: 'Une netrunner stoïque et expérimentée.', power: 72 },
    { id: 'cpe_006', name: 'Faraday', anime: 'Cyberpunk: Edgerunners', rarity: 'Légendaire', image: '/gacha/cards/cpe_006.jpg', malId: 210399, description: 'Un fixer impitoyable qui manipule les edgerunners.', power: 85 },
    { id: 'cpe_007', name: 'David (Sandevistan)', anime: 'Cyberpunk: Edgerunners', rarity: 'Légendaire', image: '/gacha/cards/cpe_007.jpg', malId: 210393, description: 'Poussant le Sandevistan à ses limites, un éclair dans Night City.', power: 92 },
    { id: 'cpe_008', name: 'Adam Smasher', anime: 'Cyberpunk: Edgerunners', rarity: 'Mythique', image: '/gacha/cards/cpe_008.jpg', malId: 210400, description: 'La légende de Night City, plus machine qu\'homme.', power: 98 },
    { id: 'cpe_009', name: 'Dorio', anime: 'Cyberpunk: Edgerunners', rarity: 'Rare', image: '/gacha/cards/cpe_009.jpg', malId: 210396, description: 'La partenaire de Maine, une femme forte et expérimentée.', power: 60 },

    // ===== STEINS;GATE =====
    { id: 'sg_001', name: 'Rintarou Okabe', anime: 'Steins;Gate', rarity: 'Commun', image: '/gacha/cards/sg_001.jpg', malId: 23947, description: 'Le scientifique fou autoproclamé, fondateur du laboratoire.', power: 40 },
    { id: 'sg_002', name: 'Kurisu Makise', anime: 'Steins;Gate', rarity: 'Rare', image: '/gacha/cards/sg_002.jpg', malId: 23950, description: 'Une jeune neuroscientifique de génie.', power: 65 },
    { id: 'sg_003', name: 'Mayuri Shiina', anime: 'Steins;Gate', rarity: 'Commun', image: '/gacha/cards/sg_003.jpg', malId: 23948, description: 'L\'amie d\'enfance d\'Okabe, toujours joyeuse. "Tutturu!"', power: 30 },
    { id: 'sg_004', name: 'Itaru Hashida (Daru)', anime: 'Steins;Gate', rarity: 'Commun', image: '/gacha/cards/sg_004.jpg', malId: 23949, description: 'Le super hacker du groupe.', power: 38 },
    { id: 'sg_005', name: 'Suzuha Amane', anime: 'Steins;Gate', rarity: 'Épique', image: '/gacha/cards/sg_005.jpg', malId: 23951, description: 'La voyageuse du temps venue du futur.', power: 70 },
    { id: 'sg_014', name: 'Nae Tennouji', anime: 'Steins;Gate', rarity: 'Commun', image: '/gacha/cards/sg_014.jpg', malId: 23958, description: 'La jeune fille de Mr. Braun.', power: 20 },
    { id: 'sg_006', name: 'Luka Urushibara', anime: 'Steins;Gate', rarity: 'Rare', image: '/gacha/cards/sg_006.jpg', malId: 23952, description: '...mais c\'est un garçon.', power: 45 },
    { id: 'sg_007', name: 'Faris NyanNyan', anime: 'Steins;Gate', rarity: 'Rare', image: '/gacha/cards/sg_007.jpg', malId: 23953, description: 'La reine du moe et propriétaire du MayQueen Nyan-nyan.', power: 48 },
    { id: 'sg_008', name: 'Moeka Kiryuu', anime: 'Steins;Gate', rarity: 'Épique', image: '/gacha/cards/sg_008.jpg', malId: 23954, description: 'La "Shining Finger" obsédée par son téléphone.', power: 68 },
    { id: 'sg_013', name: 'Yugo Tennouji (Mr. Braun)', anime: 'Steins;Gate', rarity: 'Rare', image: '/gacha/cards/sg_013.jpg', malId: 23957, description: 'Le propriétaire du magasin de télévisions, avec un passé sombre.', power: 55 },
    { id: 'sg_016', name: 'Amadeus Kurisu', anime: 'Steins;Gate', rarity: 'Épique', image: '/gacha/cards/sg_016.jpg', malId: 108631, description: 'Une intelligence artificielle basée sur les souvenirs de Kurisu.', power: 75 },
    { id: 'sg_009', name: 'John Titor', anime: 'Steins;Gate', rarity: 'Légendaire', image: '/gacha/cards/sg_009.jpg', malId: 23955, description: 'Le pseudonyme du voyageur temporel qui a tout déclenché.', power: 85 },
    { id: 'sg_010', name: 'Hououin Kyouma', anime: 'Steins;Gate', rarity: 'Légendaire', image: '/gacha/cards/sg_010.jpg', malId: 23947, description: 'L\'alter ego d\'Okabe, défiant l\'Organisation.', power: 90 },
    { id: 'sg_015', name: 'Okabe (Steins Gate Worldline)', anime: 'Steins;Gate', rarity: 'Légendaire', image: '/gacha/cards/sg_015.jpg', malId: 23947, description: 'Celui qui a trompé le monde et atteint la ligne de temps Steins Gate.', power: 92 },
    
    // ===== VINLAND SAGA =====
    { id: 'vs_001', name: 'Thorfinn (Young)', anime: 'Vinland Saga', rarity: 'Commun', image: '/gacha/cards/vs_001.jpg', malId: 2468, description: 'Un jeune garçon islandais rêvant de voir le Vinland.', power: 40 },
    { id: 'vs_002', name: 'Askeladd', anime: 'Vinland Saga', rarity: 'Épique', image: '/gacha/cards/vs_002.jpg', malId: 2470, description: 'Le chef mercenaire charismatique et rusé.', power: 80 },
    { id: 'vs_003', name: 'Canute (Young)', anime: 'Vinland Saga', rarity: 'Rare', image: '/gacha/cards/vs_003.jpg', malId: 2471, description: 'Le prince danois, timide et craintif.', power: 35 },
    { id: 'vs_004', name: 'Thorkell', anime: 'Vinland Saga', rarity: 'Épique', image: '/gacha/cards/vs_004.jpg', malId: 2472, description: 'Le géant viking qui ne vit que pour le combat.', power: 85 },
    { id: 'vs_005', name: 'Thors', anime: 'Vinland Saga', rarity: 'Légendaire', image: '/gacha/cards/vs_005.jpg', malId: 2474, description: 'Le "Troll de Jom", le plus grand guerrier viking.', power: 94 },
    { id: 'vs_012', name: 'Einar', anime: 'Vinland Saga', rarity: 'Commun', image: '/gacha/cards/vs_012.jpg', malId: 2477, description: 'Un esclave qui devient le meilleur ami de Thorfinn.', power: 32 },
    { id: 'vs_006', name: 'Bjorn', anime: 'Vinland Saga', rarity: 'Rare', image: '/gacha/cards/vs_006.jpg', malId: 2473, description: 'Le second d\'Askeladd, un berserker loyal.', power: 65 },
    { id: 'vs_007', name: 'Leif Erikson', anime: 'Vinland Saga', rarity: 'Commun', image: '/gacha/cards/vs_007.jpg', malId: 2469, description: 'L\'explorateur qui a inspiré les rêves de Thorfinn.', power: 30 },
    { id: 'vs_008', name: 'Thorfinn (Slave)', anime: 'Vinland Saga', rarity: 'Rare', image: '/gacha/cards/vs_008.jpg', malId: 2468, description: 'Un homme brisé cherchant un sens à sa vie.', power: 50 },
    { id: 'vs_013', name: 'Snake', anime: 'Vinland Saga', rarity: 'Rare', image: '/gacha/cards/vs_013.jpg', malId: 2478, description: 'Le chef des gardes de la ferme de Ketil, un épéiste talentueux.', power: 64 },
    { id: 'vs_009', name: 'Canute (King)', anime: 'Vinland Saga', rarity: 'Légendaire', image: '/gacha/cards/vs_009.jpg', malId: 2471, description: 'Le prince devenu un roi impitoyable et visionnaire.', power: 90 },
    { id: 'vs_010', name: 'Hild', anime: 'Vinland Saga', rarity: 'Mythique', image: '/gacha/cards/vs_010.jpg', malId: 2475, description: 'L\'ingénieure qui cherche à se venger de Thorfinn.', power: 88 },

    // ===== SWORD ART ONLINE =====
    { id: 'sao_001', name: 'Kirito', anime: 'Sword Art Online', rarity: 'Commun', image: '/gacha/cards/sao_001.jpg', malId: 36765, description: 'Le "Beater" solo qui a survécu à l\'Aincrad.', power: 48 },
    { id: 'sao_002', name: 'Asuna', anime: 'Sword Art Online', rarity: 'Commun', image: '/gacha/cards/sao_002.jpg', malId: 36764, description: 'L\'"Éclair Fulgurant", vice-commandante des Chevaliers du Sang.', power: 47 },
    { id: 'sao_003', name: 'Klein', anime: 'Sword Art Online', rarity: 'Commun', image: '/gacha/cards/sao_003.jpg', malId: 40832, description: 'Le premier ami de Kirito dans SAO, chef de la guilde Fuurinkazan.', power: 38 },
    { id: 'sao_004', name: 'Silica', anime: 'Sword Art Online', rarity: 'Commun', image: '/gacha/cards/sao_004.jpg', malId: 40834, description: 'Une dompteuse de bêtes avec son dragon Pina.', power: 35 },
    { id: 'sao_005', name: 'Lisbeth', anime: 'Sword Art Online', rarity: 'Commun', image: '/gacha/cards/sao_005.jpg', malId: 40833, description: 'La forgeronne talentueuse et amie d\'Asuna.', power: 36 },
    { id: 'sao_017', name: 'Agil', anime: 'Sword Art Online', rarity: 'Commun', image: '/gacha/cards/sao_017.jpg', malId: 40836, description: 'Un marchand et combattant à la hache, ami de Kirito.', power: 40 },
    { id: 'sao_006', name: 'Sinon', anime: 'Sword Art Online', rarity: 'Rare', image: '/gacha/cards/sao_006.jpg', malId: 71393, description: 'La meilleure sniper de Gun Gale Online.', power: 65 },
    { id: 'sao_007', name: 'Leafa', anime: 'Sword Art Online', rarity: 'Rare', image: '/gacha/cards/sao_007.jpg', malId: 40831, description: 'La sœur de Kirito, une puissante joueuse de Sylph.', power: 62 },
    { id: 'sao_008', name: 'Yui', anime: 'Sword Art Online', rarity: 'Rare', image: '/gacha/cards/sao_008.jpg', malId: 40835, description: 'Un programme d\'IA qui est devenue la "fille" de Kirito et Asuna.', power: 50 },
    { id: 'sao_009', name: 'Eugeo', anime: 'Sword Art Online', rarity: 'Épique', image: '/gacha/cards/sao_009.jpg', malId: 139125, description: 'Le meilleur ami de Kirito dans l\'Underworld.', power: 78 },
    { id: 'sao_010', name: 'Alice Zuberg', anime: 'Sword Art Online', rarity: 'Épique', image: '/gacha/cards/sao_010.jpg', malId: 139124, description: 'La Chevalier de l\'Intégrité au service de l\'Église Axiom.', power: 82 },
    { id: 'sao_016', name: 'Yuuki Konno', anime: 'Sword Art Online', rarity: 'Épique', image: '/gacha/cards/sao_016.jpg', malId: 87024, description: 'L\'"Épée Absolue", une joueuse d\'une force inégalée.', power: 85 },
    { id: 'sao_011', name: 'Death Gun', anime: 'Sword Art Online', rarity: 'Légendaire', image: '/gacha/cards/sao_011.jpg', malId: 87023, description: 'Le joueur qui prétend pouvoir tuer des gens dans le monde réel depuis GGO.', power: 88 },
    { id: 'sao_012', name: 'Heathcliff', anime: 'Sword Art Online', rarity: 'Légendaire', image: '/gacha/cards/sao_012.jpg', malId: 40830, description: 'Le chef des Chevaliers du Sang, détenteur du bouclier ultime.', power: 90 },
    { id: 'sao_018', name: 'Bercouli Synthesis One', anime: 'Sword Art Online', rarity: 'Légendaire', image: '/gacha/cards/sao_018.jpg', malId: 143239, description: 'Le premier Chevalier de l\'Intégrité et le plus puissant.', power: 91 },
    { id: 'sao_019', name: 'Gabriel Miller (Subtilizer)', anime: 'Sword Art Online', rarity: 'Légendaire', image: '/gacha/cards/sao_019.jpg', malId: 143240, description: 'L\'antagoniste principal de l\'arc Alicization, obsédé par les âmes.', power: 93 },
    { id: 'sao_013', name: 'Administrator (Quinella)', anime: 'Sword Art Online', rarity: 'Mythique', image: '/gacha/cards/sao_013.jpg', malId: 143236, description: 'La souveraine absolue de l\'Église Axiom dans l\'Underworld.', power: 96 },
    { id: 'sao_014', name: 'Kirito (Star-King)', anime: 'Sword Art Online', rarity: 'Mythique', image: '/gacha/cards/sao_014.jpg', malId: 36765, description: 'Le souverain de l\'Underworld après 200 ans passés dans le simulateur.', power: 99 },
    { id: 'sao_015', name: 'Kayaba Akihiko', anime: 'Sword Art Online', rarity: 'Mythique', image: '/gacha/cards/sao_015.jpg', malId: 40830, description: 'Le créateur de Sword Art Online, le maître du jeu mortel.', power: 100 },

    // ===== FAIRY TAIL =====
    { id: 'ft_001', name: 'Natsu Dragneel', anime: 'Fairy Tail', rarity: 'Commun', image: '/gacha/cards/ft_001.jpg', malId: 6707, description: 'Le Chasseur de Dragon de Feu de Fairy Tail.', power: 48 },
    { id: 'ft_002', name: 'Lucy Heartfilia', anime: 'Fairy Tail', rarity: 'Commun', image: '/gacha/cards/ft_002.jpg', malId: 6708, description: 'La constellationniste qui rêve d\'écrire un roman.', power: 40 },
    { id: 'ft_003', name: 'Gray Fullbuster', anime: 'Fairy Tail', rarity: 'Commun', image: '/gacha/cards/ft_003.jpg', malId: 6709, description: 'Le mage de glace qui a la manie de se déshabiller.', power: 46 },
    { id: 'ft_004', name: 'Happy', anime: 'Fairy Tail', rarity: 'Commun', image: '/gacha/cards/ft_004.jpg', malId: 6711, description: 'L\'Exceed bleu, partenaire inséparable de Natsu. "Aye Sir!"', power: 20 },
    { id: 'ft_005', name: 'Erza Scarlet', anime: 'Fairy Tail', rarity: 'Rare', image: '/gacha/cards/ft_005.jpg', malId: 6710, description: 'Titania, la reine des fées, mage de rang S.', power: 70 },
    { id: 'ft_006', name: 'Wendy Marvell', anime: 'Fairy Tail', rarity: 'Rare', image: '/gacha/cards/ft_006.jpg', malId: 13394, description: 'La jeune Chasseuse de Dragon Céleste.', power: 58 },
    { id: 'ft_016', name: 'Juvia Lockser', anime: 'Fairy Tail', rarity: 'Rare', image: '/gacha/cards/ft_016.jpg', malId: 6716, description: 'La mage de l\'eau, follement amoureuse de Gray.', power: 63 },
    { id: 'ft_007', name: 'Gajeel Redfox', anime: 'Fairy Tail', rarity: 'Rare', image: '/gacha/cards/ft_007.jpg', malId: 6712, description: 'Le Chasseur de Dragon d\'Acier.', power: 65 },
    { id: 'ft_008', name: 'Jellal Fernandes', anime: 'Fairy Tail', rarity: 'Épique', image: '/gacha/cards/ft_008.jpg', malId: 6713, description: 'Ancien mage saint, maître de la magie céleste.', power: 82 },
    { id: 'ft_009', name: 'Laxus Dreyar', anime: 'Fairy Tail', rarity: 'Épique', image: '/gacha/cards/ft_009.jpg', malId: 6714, description: 'Le Chasseur de Dragon de Foudre, petit-fils de Makarov.', power: 84 },
    { id: 'ft_010', name: 'Mirajane Strauss', anime: 'Fairy Tail', rarity: 'Épique', image: '/gacha/cards/ft_010.jpg', malId: 6715, description: 'La démone de Fairy Tail, capable de se transformer.', power: 80 },
    { id: 'ft_017', name: 'Makarov Dreyar', anime: 'Fairy Tail', rarity: 'Épique', image: '/gacha/cards/ft_017.jpg', malId: 6717, description: 'Le 3ème, 6ème et 8ème maître de Fairy Tail, un des Dix Mages Saints.', power: 86 },
    { id: 'ft_011', name: 'Zeref Dragneel', anime: 'Fairy Tail', rarity: 'Légendaire', image: '/gacha/cards/ft_011.jpg', malId: 26369, description: 'Le mage noir le plus puissant et le plus maudit de l\'histoire.', power: 96 },
    { id: 'ft_012', name: 'Acnologia', anime: 'Fairy Tail', rarity: 'Légendaire', image: '/gacha/cards/ft_012.jpg', malId: 49293, description: 'Le Roi des Dragons, l\'incarnation de la destruction.', power: 98 },
    { id: 'ft_013', name: 'Mavis Vermillion', anime: 'Fairy Tail', rarity: 'Légendaire', image: '/gacha/cards/ft_013.jpg', malId: 49292, description: 'La première maître de Fairy Tail, le "Tacticien des Fées".', power: 92 },
    { id: 'ft_018', name: 'Gildarts Clive', anime: 'Fairy Tail', rarity: 'Légendaire', image: '/gacha/cards/ft_018.jpg', malId: 6718, description: 'Le mage le plus puissant de Fairy Tail.', power: 94 },
    { id: 'ft_014', name: 'Natsu (Dragon Force)', anime: 'Fairy Tail', rarity: 'Mythique', image: '/gacha/cards/ft_014.jpg', malId: 6707, description: 'La forme ultime d\'un Chasseur de Dragon, une puissance dévastatrice.', power: 97 },
    { id: 'ft_015', name: 'Igneel', anime: 'Fairy Tail', rarity: 'Mythique', image: '/gacha/cards/ft_015.jpg', malId: 49294, description: 'Le Roi des Dragons de Feu, père adoptif de Natsu.', power: 99 },
    { id: 'ft_019', name: 'Natsu (E.N.D.)', anime: 'Fairy Tail', rarity: 'Mythique', image: '/gacha/cards/ft_019.jpg', malId: 6707, description: 'Etherious Natsu Dragneel, le plus puissant démon de Zeref.', power: 100 },

    // ===== RE:ZERO =====
    { id: 'rz_001', name: 'Subaru Natsuki', anime: 'Re:Zero', rarity: 'Commun', image: '/gacha/cards/rz_001.jpg', malId: 118861, description: 'Le jeune homme transporté dans un autre monde, capable de revenir de la mort.', power: 25 },
    { id: 'rz_002', name: 'Emilia', anime: 'Re:Zero', rarity: 'Commun', image: '/gacha/cards/rz_002.jpg', malId: 118859, description: 'Une demi-elfe candidate au trône de Lugnica.', power: 45 },
    { id: 'rz_003', name: 'Puck', anime: 'Re:Zero', rarity: 'Rare', image: '/gacha/cards/rz_003.jpg', malId: 118860, description: 'L\'esprit familier d\'Emilia, un puissant mage de glace.', power: 60 },
    { id: 'rz_004', name: 'Rem', anime: 'Re:Zero', rarity: 'Rare', image: '/gacha/cards/rz_004.jpg', malId: 118862, description: 'La servante oni dévouée du manoir Roswaal.', power: 68 },
    { id: 'rz_005', name: 'Ram', anime: 'Re:Zero', rarity: 'Rare', image: '/gacha/cards/rz_005.jpg', malId: 118863, description: 'La sœur jumelle de Rem, experte en magie du vent.', power: 62 },
    { id: 'rz_015', name: 'Crusch Karsten', anime: 'Re:Zero', rarity: 'Rare', image: '/gacha/cards/rz_015.jpg', malId: 118875, description: 'Candidate au trône, une leader née.', power: 64 },
    { id: 'rz_016', name: 'Felix Argyle', anime: 'Re:Zero', rarity: 'Rare', image: '/gacha/cards/rz_016.jpg', malId: 118876, description: 'Le chevalier de Crusch, le meilleur guérisseur du royaume.', power: 58 },
    { id: 'rz_006', name: 'Beatrice', anime: 'Re:Zero', rarity: 'Épique', image: '/gacha/cards/rz_006.jpg', malId: 118864, description: 'La gardienne de la bibliothèque interdite.', power: 75 },
    { id: 'rz_007', name: 'Roswaal L. Mathers', anime: 'Re:Zero', rarity: 'Épique', image: '/gacha/cards/rz_007.jpg', malId: 118865, description: 'Le puissant et excentrique margrave.', power: 80 },
    { id: 'rz_008', name: 'Wilhelm van Astrea', anime: 'Re:Zero', rarity: 'Épique', image: '/gacha/cards/rz_008.jpg', malId: 118866, description: 'Le "Démon de l\'Épée", un maître épéiste légendaire.', power: 82 },
    { id: 'rz_017', name: 'Julius Juukulius', anime: 'Re:Zero', rarity: 'Épique', image: '/gacha/cards/rz_017.jpg', malId: 118877, description: 'Le "plus excellent des chevaliers".', power: 78 },
    { id: 'rz_018', name: 'Garfiel Tinsel', anime: 'Re:Zero', rarity: 'Épique', image: '/gacha/cards/rz_018.jpg', malId: 172817, description: 'Le "Bouclier du Sanctuaire", un demi-homme-bête féroce.', power: 76 },
    { id: 'rz_009', name: 'Petelgeuse Romanee-Conti', anime: 'Re:Zero', rarity: 'Légendaire', image: '/gacha/cards/rz_009.jpg', malId: 118867, description: 'L\'Archevêque du Péché de la Paresse, complètement dément.', power: 88 },
    { id: 'rz_010', name: 'Reinhard van Astrea', anime: 'Re:Zero', rarity: 'Légendaire', image: '/gacha/cards/rz_010.jpg', malId: 118868, description: 'Le "Maître Épéiste", l\'humain le plus fort du monde.', power: 98 },
    { id: 'rz_011', name: 'Echidna', anime: 'Re:Zero', rarity: 'Légendaire', image: '/gacha/cards/rz_011.jpg', malId: 172816, description: 'La Sorcière de l\'Avarice, avide de connaissances.', power: 94 },
    { id: 'rz_012', name: 'Satella', anime: 'Re:Zero', rarity: 'Mythique', image: '/gacha/cards/rz_012.jpg', malId: 118869, description: 'La Sorcière de l\'Envie, l\'entité qui a donné à Subaru sa capacité.', power: 100 },
    { id: 'rz_013', name: 'Regulus Corneas', anime: 'Re:Zero', rarity: 'Mythique', image: '/gacha/cards/rz_013.jpg', malId: 139126, description: 'L\'Archevêque du Péché de l\'Avarice, l\'être le plus "satisfait" du monde.', power: 97 },
    { id: 'rz_014', name: 'Pandora', anime: 'Re:Zero', rarity: 'Mythique', image: '/gacha/cards/rz_014.jpg', malId: 201381, description: 'La Sorcière de la Vanité, capable de réécrire la réalité.', power: 99 },

    // ===== OVERLORD =====
    { id: 'ovl_001', name: 'Ainz Ooal Gown', anime: 'Overlord', rarity: 'Épique', image: '/gacha/cards/ovl_001.jpg', malId: 88631, description: 'Le maître de la guilde, souverain du Grand Tombeau de Nazarick.', power: 88 },
    { id: 'ovl_002', name: 'Albedo', anime: 'Overlord', rarity: 'Rare', image: '/gacha/cards/ovl_002.jpg', malId: 88633, description: 'La superviseure des Gardiens, follement amoureuse d\'Ainz.', power: 70 },
    { id: 'ovl_003', name: 'Shalltear Bloodfallen', anime: 'Overlord', rarity: 'Rare', image: '/gacha/cards/ovl_003.jpg', malId: 88635, description: 'La gardienne des trois premiers étages, une véritable vampire.', power: 72 },
    { id: 'ovl_004', name: 'Cocytus', anime: 'Overlord', rarity: 'Rare', image: '/gacha/cards/ovl_004.jpg', malId: 88637, description: 'Le gardien du 5ème étage, un guerrier insectoïde.', power: 68 },
    { id: 'ovl_005', name: 'Aura Bella Fiora', anime: 'Overlord', rarity: 'Commun', image: '/gacha/cards/ovl_005.jpg', malId: 88639, description: 'Gardienne du 6ème étage, dompteuse de bêtes.', power: 48 },
    { id: 'ovl_006', name: 'Mare Bello Fiore', anime: 'Overlord', rarity: 'Commun', image: '/gacha/cards/ovl_006.jpg', malId: 88641, description: 'Gardien du 6ème étage, puissant druide.', power: 47 },
    { id: 'ovl_015', name: 'Evileye', anime: 'Overlord', rarity: 'Rare', image: '/gacha/cards/ovl_015.jpg', malId: 88651, description: 'Membre de l\'équipe d\'aventuriers "Blue Rose", une vampire puissante.', power: 69 },
    { id: 'ovl_016', name: 'Clementine', anime: 'Overlord', rarity: 'Rare', image: '/gacha/cards/ovl_016.jpg', malId: 88652, description: 'Une guerrière psychopathe, ancienne membre de l\'Écriture Noire.', power: 66 },
    { id: 'ovl_007', name: 'Demiurge', anime: 'Overlord', rarity: 'Épique', image: '/gacha/cards/ovl_007.jpg', malId: 88643, description: 'Le gardien du 7ème étage, un démon stratège.', power: 84 },
    { id: 'ovl_008', name: 'Sebas Tian', anime: 'Overlord', rarity: 'Épique', image: '/gacha/cards/ovl_008.jpg', malId: 88645, description: 'Le majordome de Nazarick, un moine dragonide.', power: 80 },
    { id: 'ovl_017', name: 'Gazef Stronoff', anime: 'Overlord', rarity: 'Épique', image: '/gacha/cards/ovl_017.jpg', malId: 88653, description: 'Le plus puissant guerrier du Royaume de Re-Estize.', power: 77 },
    { id: 'ovl_018', name: 'Brain Unglaus', anime: 'Overlord', rarity: 'Épique', image: '/gacha/cards/ovl_018.jpg', malId: 88654, description: 'Un mercenaire dont le seul but est de perfectionner son art de l\'épée.', power: 75 },
    { id: 'ovl_009', name: 'Narberal Gamma', anime: 'Overlord', rarity: 'Rare', image: '/gacha/cards/ovl_009.jpg', malId: 88647, description: 'Membre des Pléiades, une magicienne de combat.', power: 65 },
    { id: 'ovl_010', name: 'Pandora\'s Actor', anime: 'Overlord', rarity: 'Légendaire', image: '/gacha/cards/ovl_010.jpg', malId: 88649, description: 'Le doppelgänger créé par Ainz, gardien du trésor.', power: 90 },
    { id: 'ovl_011', name: 'Zesshi Zetsumei', anime: 'Overlord', rarity: 'Légendaire', image: '/gacha/cards/ovl_011.jpg', malId: 143237, description: 'La carte maîtresse de la Théocratie Slane, une sang-mêlé surpuissante.', power: 94 },
    { id: 'ovl_012', name: 'Rubedo', anime: 'Overlord', rarity: 'Mythique', image: '/gacha/cards/ovl_012.jpg', malId: 201382, description: 'L\'entité la plus puissante de Nazarick, gardienne du 8ème étage.', power: 100 },
    { id: 'ovl_013', name: 'Touch Me', anime: 'Overlord', rarity: 'Mythique', image: '/gacha/cards/ovl_013.jpg', malId: 143238, description: 'L\'un des fondateurs d\'Ainz Ooal Gown, un champion du monde.', power: 98 },
    { id: 'ovl_014', name: 'Ainz (The Goal of All Life is Death)', anime: 'Overlord', rarity: 'Mythique', image: '/gacha/cards/ovl_014.jpg', malId: 88631, description: 'Utilisant sa compétence la plus redoutable, qui garantit la mort.', power: 99 },

    // ===== CODE GEASS =====
    { id: 'cg_001', name: 'Lelouch vi Britannia', anime: 'Code Geass', rarity: 'Commun', image: '/gacha/cards/cg_001.jpg', malId: 417, description: 'Le prince exilé qui obtient le pouvoir du Geass.', power: 50 },
    { id: 'cg_002', name: 'Suzaku Kururugi', anime: 'Code Geass', rarity: 'Commun', image: '/gacha/cards/cg_002.jpg', malId: 418, description: 'L\'ami d\'enfance de Lelouch, pilote du Lancelot.', power: 48 },
    { id: 'cg_003', name: 'C.C.', anime: 'Code Geass', rarity: 'Rare', image: '/gacha/cards/cg_003.jpg', malId: 419, description: 'La sorcière immortelle qui a donné le Geass à Lelouch.', power: 65 },
    { id: 'cg_004', name: 'Kallen Kozuki', anime: 'Code Geass', rarity: 'Rare', image: '/gacha/cards/cg_004.jpg', malId: 420, description: 'La pilote d\'élite de l\'Ordre des Chevaliers Noirs.', power: 68 },
    { id: 'cg_005', name: 'Jeremiah Gottwald', anime: 'Code Geass', rarity: 'Rare', image: '/gacha/cards/cg_005.jpg', malId: 421, description: 'Le cyborg loyal, surnommé "Orange".', power: 60 },
    { id: 'cg_006', name: 'Charles zi Britannia', anime: 'Code Geass', rarity: 'Épique', image: '/gacha/cards/cg_006.jpg', malId: 422, description: 'L\'Empereur de Britannia, obsédé par le passé.', power: 80 },
    { id: 'cg_014', name: 'Euphemia li Britannia', anime: 'Code Geass', rarity: 'Rare', image: '/gacha/cards/cg_014.jpg', malId: 427, description: 'La princesse au grand cœur qui rêvait de paix.', power: 45 },
    { id: 'cg_015', name: 'Rolo Lamperouge', anime: 'Code Geass', rarity: 'Rare', image: '/gacha/cards/cg_015.jpg', malId: 428, description: 'Le "frère" de Lelouch, doté d\'un Geass qui arrête la perception du temps.', power: 64 },
    { id: 'cg_007', name: 'Schneizel el Britannia', anime: 'Code Geass', rarity: 'Épique', image: '/gacha/cards/cg_007.jpg', malId: 423, description: 'Le second prince de Britannia, un stratège redoutable.', power: 82 },
    { id: 'cg_013', name: 'Cornelia li Britannia', anime: 'Code Geass', rarity: 'Épique', image: '/gacha/cards/cg_013.jpg', malId: 426, description: 'La "Sorcière de Britannia", une stratège militaire impitoyable.', power: 78 },
    { id: 'cg_008', name: 'Bismarck Waldstein', anime: 'Code Geass', rarity: 'Légendaire', image: '/gacha/cards/cg_008.jpg', malId: 424, description: 'Le Chevalier de Un, le plus puissant des Knights of Round.', power: 90 },
    { id: 'cg_009', name: 'Marianne vi Britannia', anime: 'Code Geass', rarity: 'Légendaire', image: '/gacha/cards/cg_009.jpg', malId: 425, description: 'La mère de Lelouch, une pilote légendaire.', power: 88 },
    { id: 'cg_010', name: 'Zero', anime: 'Code Geass', rarity: 'Légendaire', image: '/gacha/cards/cg_010.jpg', malId: 417, description: 'Le symbole de la rébellion, le leader masqué de l\'Ordre des Chevaliers Noirs.', power: 94 },
    { id: 'cg_016', name: 'V.V.', anime: 'Code Geass', rarity: 'Légendaire', image: '/gacha/cards/cg_016.jpg', malId: 429, description: 'Le frère jumeau de Charles, un autre immortel.', power: 87 },
    { id: 'cg_011', name: 'Lelouch (Emperor)', anime: 'Code Geass', rarity: 'Mythique', image: '/gacha/cards/cg_011.jpg', malId: 417, description: 'Le 99ème Empereur de Britannia, le tyran qui unifiera le monde.', power: 98 },

    // ===== NO GAME NO LIFE =====
    { id: 'ngnl_001', name: 'Sora', anime: 'No Game No Life', rarity: 'Commun', image: '/gacha/cards/ngnl_001.jpg', malId: 64017, description: 'Le stratège génial et manipulateur du duo "Blank".', power: 48 },
    { id: 'ngnl_002', name: 'Shiro', anime: 'No Game No Life', rarity: 'Commun', image: '/gacha/cards/ngnl_002.jpg', malId: 64019, description: 'La génie du calcul et de la logique, imbattable aux échecs.', power: 48 },
    { id: 'ngnl_003', name: 'Stephanie Dola', anime: 'No Game No Life', rarity: 'Commun', image: '/gacha/cards/ngnl_003.jpg', malId: 64021, description: 'La princesse d\'Elkia, souvent la victime des jeux de "Blank".', power: 30 },
    { id: 'ngnl_004', name: 'Jibril', anime: 'No Game No Life', rarity: 'Rare', image: '/gacha/cards/ngnl_004.jpg', malId: 64023, description: 'Une Flügel, une race angélique avide de connaissances.', power: 70 },
    { id: 'ngnl_005', name: 'Kurami Zell', anime: 'No Game No Life', rarity: 'Rare', image: '/gacha/cards/ngnl_005.jpg', malId: 87025, description: 'Une humaine qui a tenté de prendre le trône d\'Elkia.', power: 55 },
    { id: 'ngnl_006', name: 'Fiel Nirvalen', anime: 'No Game No Life', rarity: 'Rare', image: '/gacha/cards/ngnl_006.jpg', malId: 87027, description: 'Une elfe qui aide Kurami, experte en magie.', power: 60 },
    { id: 'ngnl_011', name: 'Schwi Dola', anime: 'No Game No Life', rarity: 'Épique', image: '/gacha/cards/ngnl_011.jpg', malId: 122437, description: 'Une Ex-Machina qui voulait comprendre le cœur humain.', power: 80 },
    { id: 'ngnl_012', name: 'Riku Dola', anime: 'No Game No Life', rarity: 'Épique', image: '/gacha/cards/ngnl_012.jpg', malId: 122438, description: 'L\'ancêtre de l\'humanité qui a mis fin à la Grande Guerre.', power: 82 },
    { id: 'ngnl_007', name: 'Izuna Hatsuse', anime: 'No Game No Life', rarity: 'Épique', image: '/gacha/cards/ngnl_007.jpg', malId: 87029, description: 'Une jeune Werebeast aux capacités physiques surhumaines.', power: 75 },
    { id: 'ngnl_008', name: 'Tet', anime: 'No Game No Life', rarity: 'Légendaire', image: '/gacha/cards/ngnl_008.jpg', malId: 64025, description: 'Le Dieu Unique de Disboard, celui qui a établi les Dix Serments.', power: 95 },
    { id: 'ngnl_013', name: 'Holou', anime: 'No Game No Life', rarity: 'Légendaire', image: '/gacha/cards/ngnl_013.jpg', malId: 201393, description: 'La Déesse Primordiale, une Old Deus.', power: 96 },
    { id: 'ngnl_014', name: 'Azril', anime: 'No Game No Life', rarity: 'Légendaire', image: '/gacha/cards/ngnl_014.jpg', malId: 201394, description: 'La représentante des Flügel, la plus âgée et la plus puissante.', power: 93 },
    
    // ===== KONOSUBA =====
    { id: 'kono_001', name: 'Kazuma Sato', anime: 'Konosuba', rarity: 'Commun', image: '/gacha/cards/kono_001.jpg', malId: 88653, description: 'L\'aventurier cynique avec une chance incroyablement élevée.', power: 35 },
    { id: 'kono_002', name: 'Aqua', anime: 'Konosuba', rarity: 'Commun', image: '/gacha/cards/kono_002.jpg', malId: 88655, description: 'La déesse de l\'eau, aussi puissante qu\'inutile.', power: 40 },
    { id: 'kono_003', name: 'Megumin', anime: 'Konosuba', rarity: 'Rare', image: '/gacha/cards/kono_003.jpg', malId: 88657, description: 'L\'archimage qui ne connaît qu\'un seul sort : Explosion !', power: 65 },
    { id: 'kono_004', name: 'Darkness', anime: 'Konosuba', rarity: 'Rare', image: '/gacha/cards/kono_004.jpg', malId: 88659, description: 'La croisée masochiste qui ne peut toucher aucune cible.', power: 55 },
    { id: 'kono_005', name: 'Wiz', anime: 'Konosuba', rarity: 'Rare', image: '/gacha/cards/kono_005.jpg', malId: 118870, description: 'Une liche et ancienne générale du Roi Démon, tenant une boutique.', power: 68 },
    { id: 'kono_006', name: 'Yunyun', anime: 'Konosuba', rarity: 'Épique', image: '/gacha/cards/kono_006.jpg', malId: 118871, description: 'La rivale autoproclamée de Megumin, cherchant désespérément des amis.', power: 72 },
    { id: 'kono_011', name: 'Eris', anime: 'Konosuba', rarity: 'Rare', image: '/gacha/cards/kono_011.jpg', malId: 118878, description: 'La déesse de la chance, que Kazuma admire.', power: 50 },
    { id: 'kono_014', name: 'Chomusuke', anime: 'Konosuba', rarity: 'Commun', image: '/gacha/cards/kono_014.jpg', malId: 118879, description: 'Le familier de Megumin, un chat noir mystérieux.', power: 15 },
    { id: 'kono_007', name: 'Verdia', anime: 'Konosuba', rarity: 'Épique', image: '/gacha/cards/kono_007.jpg', malId: 118872, description: 'Un des généraux du Roi Démon, un dullahan.', power: 78 },
    { id: 'kono_012', name: 'Sylvia', anime: 'Konosuba', rarity: 'Épique', image: '/gacha/cards/kono_012.jpg', malId: 164940, description: 'Une chimère et générale du Roi Démon.', power: 76 },
    { id: 'kono_013', name: 'Hans', anime: 'Konosuba', rarity: 'Épique', image: '/gacha/cards/kono_013.jpg', malId: 164941, description: 'Un général du Roi Démon, un slime empoisonné.', power: 74 },
    { id: 'kono_008', name: 'Vanir', anime: 'Konosuba', rarity: 'Légendaire', image: '/gacha/cards/kono_008.jpg', malId: 118873, description: 'Un duc de l\'enfer, l\'un des généraux les plus puissants.', power: 88 },
    { id: 'kono_010', name: 'Explosion Magic', anime: 'Konosuba', rarity: 'Mythique', image: '/gacha/cards/kono_010.jpg', malId: 88657, description: 'Le sort ultime, l\'art suprême. Le seul et unique chemin.', power: 95 },

    // ===== THE SEVEN DEADLY SINS =====
    { id: 'sds_001', name: 'Meliodas', anime: 'The Seven Deadly Sins', rarity: 'Commun', image: '/gacha/cards/sds_001.jpg', malId: 42091, description: 'Le Dragon de la Colère, capitaine des Seven Deadly Sins.', power: 49 },
    { id: 'sds_002', name: 'Elizabeth Liones', anime: 'The Seven Deadly Sins', rarity: 'Commun', image: '/gacha/cards/sds_002.jpg', malId: 42093, description: 'La troisième princesse de Liones, réincarnation d\'une déesse.', power: 38 },
    { id: 'sds_003', name: 'Hawk', anime: 'The Seven Deadly Sins', rarity: 'Commun', image: '/gacha/cards/sds_003.jpg', malId: 42095, description: 'Le "Capitaine des Restes", un cochon qui parle.', power: 20 },
    { id: 'sds_004', name: 'Diane', anime: 'The Seven Deadly Sins', rarity: 'Rare', image: '/gacha/cards/sds_004.jpg', malId: 42097, description: 'Le Serpent de l\'Envie, une géante au grand cœur.', power: 65 },
    { id: 'sds_005', name: 'Ban', anime: 'The Seven Deadly Sins', rarity: 'Rare', image: '/gacha/cards/sds_005.jpg', malId: 42099, description: 'Le Renard de l\'Avarice, l\'homme immortel.', power: 68 },
    { id: 'sds_006', name: 'King', anime: 'The Seven Deadly Sins', rarity: 'Rare', image: '/gacha/cards/sds_006.jpg', malId: 42101, description: 'Le Grizzly de la Paresse, le roi des fées.', power: 67 },
    { id: 'sds_016', name: 'Arthur Pendragon', anime: 'The Seven Deadly Sins', rarity: 'Rare', image: '/gacha/cards/sds_016.jpg', malId: 42109, description: 'Le jeune roi de Camelot, destiné à de grandes choses.', power: 55 },
    { id: 'sds_017', name: 'Gilthunder', anime: 'The Seven Deadly Sins', rarity: 'Rare', image: '/gacha/cards/sds_017.jpg', malId: 42111, description: 'Un Chevalier Sacré de Liones, maître de la foudre.', power: 62 },
    { id: 'sds_007', name: 'Gowther', anime: 'The Seven Deadly Sins', rarity: 'Épique', image: '/gacha/cards/sds_007.jpg', malId: 42103, description: 'Le Bélier de la Luxure, une poupée sans émotions.', power: 75 },
    { id: 'sds_008', name: 'Merlin', anime: 'The Seven Deadly Sins', rarity: 'Épique', image: '/gacha/cards/sds_008.jpg', malId: 42105, description: 'Le Sanglier de la Gourmandise, la plus grande sorcière de Britannia.', power: 84 },
    { id: 'sds_009', name: 'Escanor', anime: 'The Seven Deadly Sins', rarity: 'Épique', image: '/gacha/cards/sds_009.jpg', malId: 42107, description: 'Le Lion de l\'Orgueil, dont la puissance varie avec le soleil.', power: 88 },
    { id: 'sds_018', name: 'Hendrickson', anime: 'The Seven Deadly Sins', rarity: 'Épique', image: '/gacha/cards/sds_018.jpg', malId: 42113, description: 'Ancien Grand Chevalier Sacré qui a libéré les démons.', power: 78 },
    { id: 'sds_019', name: 'Dreyfus', anime: 'The Seven Deadly Sins', rarity: 'Épique', image: '/gacha/cards/sds_019.jpg', malId: 42115, description: 'Grand Chevalier Sacré et frère de Hendrickson.', power: 76 },
    { id: 'sds_010', name: 'Zeldris', anime: 'The Seven Deadly Sins', rarity: 'Légendaire', image: '/gacha/cards/sds_010.jpg', malId: 139127, description: 'Le Commandement de la Piété, frère de Meliodas.', power: 92 },
    { id: 'sds_011', name: 'Estarossa', anime: 'The Seven Deadly Sins', rarity: 'Légendaire', image: '/gacha/cards/sds_011.jpg', malId: 139128, description: 'Le Commandement de la Charité, qui se révélera être Mael.', power: 93 },
    { id: 'sds_012', name: 'Demon King', anime: 'The Seven Deadly Sins', rarity: 'Légendaire', image: '/gacha/cards/sds_012.jpg', malId: 139129, description: 'Le souverain du Clan des Démons, père de Meliodas.', power: 97 },
    { id: 'sds_013', name: 'Meliodas (Assault Mode)', anime: 'The Seven Deadly Sins', rarity: 'Mythique', image: '/gacha/cards/sds_013.jpg', malId: 42091, description: 'La forme originelle de Meliodas, dénuée d\'émotions.', power: 98 },
    { id: 'sds_014', name: 'Escanor (The One)', anime: 'The Seven Deadly Sins', rarity: 'Mythique', image: '/gacha/cards/sds_014.jpg', malId: 42107, description: 'Au zénith, l\'incarnation de la puissance pendant une minute.', power: 99 },
    { id: 'sds_015', name: 'Chaos', anime: 'The Seven Deadly Sins', rarity: 'Mythique', image: '/gacha/cards/sds_015.jpg', malId: 201384, description: 'L\'entité primordiale qui a créé le monde, les dieux et les démons.', power: 100 },

    // ===== BLACK CLOVER =====
    { id: 'bc_001', name: 'Asta', anime: 'Black Clover', rarity: 'Commun', image: '/gacha/cards/bc_001.jpg', malId: 122643, description: 'Le garçon né sans magie, détenteur d\'un grimoire à cinq feuilles.', power: 47 },
    { id: 'bc_002', name: 'Yuno', anime: 'Black Clover', rarity: 'Commun', image: '/gacha/cards/bc_002.jpg', malId: 122644, description: 'Le rival d\'Asta, un prodige de la magie du vent.', power: 48 },
    { id: 'bc_003', name: 'Noelle Silva', anime: 'Black Clover', rarity: 'Commun', image: '/gacha/cards/bc_003.jpg', malId: 122645, description: 'Membre de la royauté qui apprend à maîtriser sa magie de l\'eau.', power: 42 },
    { id: 'bc_004', name: 'Yami Sukehiro', anime: 'Black Clover', rarity: 'Rare', image: '/gacha/cards/bc_004.jpg', malId: 122646, description: 'Le capitaine du Taureau Noir, maître de la magie des ténèbres.', power: 70 },
    { id: 'bc_005', name: 'Mereoleona Vermillion', anime: 'Black Clover', rarity: 'Rare', image: '/gacha/cards/bc_005.jpg', malId: 139130, description: 'La "Lionne Indomptée", capitaine par intérim du Lion Flamboyant.', power: 72 },
    { id: 'bc_006', name: 'Luck Voltia', anime: 'Black Clover', rarity: 'Rare', image: '/gacha/cards/bc_006.jpg', malId: 122647, description: 'Le mage de foudre sociopathe qui adore se battre.', power: 64 },
    { id: 'bc_015', name: 'Fuegoleon Vermillion', anime: 'Black Clover', rarity: 'Épique', image: '/gacha/cards/bc_015.jpg', malId: 139133, description: 'Capitaine du Lion Flamboyant, un leader respecté.', power: 80 },
    { id: 'bc_016', name: 'Nozel Silva', anime: 'Black Clover', rarity: 'Épique', image: '/gacha/cards/bc_016.jpg', malId: 139134, description: 'Capitaine de l\'Aigle d\'Argent, maître de la magie du mercure.', power: 81 },
    { id: 'bc_007', name: 'Licht', anime: 'Black Clover', rarity: 'Épique', image: '/gacha/cards/bc_007.jpg', malId: 139131, description: 'Le chef de l\'Œil du Crépuscule, un elfe à la magie de lumière.', power: 85 },
    { id: 'bc_008', name: 'Patolli', anime: 'Black Clover', rarity: 'Épique', image: '/gacha/cards/bc_008.jpg', malId: 139131, description: 'L\'elfe réincarné dans le corps de William Vangeance.', power: 83 },
    { id: 'bc_009', name: 'Zagred', anime: 'Black Clover', rarity: 'Légendaire', image: '/gacha/cards/bc_009.jpg', malId: 201385, description: 'Le démon qui a orchestré le massacre des elfes.', power: 92 },
    { id: 'bc_010', name: 'Julius Novachrono', anime: 'Black Clover', rarity: 'Légendaire', image: '/gacha/cards/bc_010.jpg', malId: 139132, description: 'L\'Empereur-Mage, maître de la magie du temps.', power: 95 },
    { id: 'bc_011', name: 'Asta (Black Asta)', anime: 'Black Clover', rarity: 'Légendaire', image: '/gacha/cards/bc_011.jpg', malId: 122643, description: 'Quand Asta emprunte le pouvoir de son démon, Liebe.', power: 90 },
    { id: 'bc_017', name: 'William Vangeance', anime: 'Black Clover', rarity: 'Légendaire', image: '/gacha/cards/bc_017.jpg', malId: 139135, description: 'Capitaine de l\'Aube d\'Or, le plus proche de devenir Empereur-Mage.', power: 91 },
    { id: 'bc_018', name: 'Dante Zogratis', anime: 'Black Clover', rarity: 'Légendaire', image: '/gacha/cards/bc_018.jpg', malId: 201395, description: 'Membre de la Triade Sombre, hôte de Lucifero.', power: 93 },
    { id: 'bc_012', name: 'Liebe', anime: 'Black Clover', rarity: 'Mythique', image: '/gacha/cards/bc_012.jpg', malId: 201386, description: 'Le démon de l\'anti-magie qui réside dans le grimoire d\'Asta.', power: 96 },
    { id: 'bc_014', name: 'Lucius Zogratis', anime: 'Black Clover', rarity: 'Mythique', image: '/gacha/cards/bc_014.jpg', malId: 201388, description: 'Le plus âgé des frères Zogratis, l\'hôte de l\'âme de Julius.', power: 100 },

    // ===== FIRE FORCE =====
    { id: 'ff_001', name: 'Shinra Kusakabe', anime: 'Fire Force', rarity: 'Commun', image: '/gacha/cards/ff_001.jpg', malId: 149918, description: 'Le "Démon" aux pieds enflammés, pompier de 3ème génération.', power: 47 },
    { id: 'ff_002', name: 'Arthur Boyle', anime: 'Fire Force', rarity: 'Commun', image: '/gacha/cards/ff_002.jpg', malId: 149919, description: 'Le "Roi Chevalier" qui se bat avec une épée de plasma.', power: 46 },
    { id: 'ff_003', name: 'Maki Oze', anime: 'Fire Force', rarity: 'Commun', image: '/gacha/cards/ff_003.jpg', malId: 149920, description: 'Pompier de 2ème génération, experte en combat au corps à corps.', power: 43 },
    { id: 'ff_004', name: 'Takehisa Hinawa', anime: 'Fire Force', rarity: 'Rare', image: '/gacha/cards/ff_004.jpg', malId: 149921, description: 'Le lieutenant de la 8ème brigade, maître des balles enflammées.', power: 65 },
    { id: 'ff_005', name: 'Akitaru Obi', anime: 'Fire Force', rarity: 'Rare', image: '/gacha/cards/ff_005.jpg', malId: 149922, description: 'Le capitaine de la 8ème brigade, un humain sans pouvoir mais sur-entraîné.', power: 60 },
    { id: 'ff_013', name: 'Tamaki Kotatsu', anime: 'Fire Force', rarity: 'Commun', image: '/gacha/cards/ff_013.jpg', malId: 149928, description: 'Pompier de 3ème génération, malgré son "syndrome de la chance ecchi".', power: 40 },
    { id: 'ff_006', name: 'Benimaru Shinmon', anime: 'Fire Force', rarity: 'Épique', image: '/gacha/cards/ff_006.jpg', malId: 149923, description: 'Le "Roi de la Destruction", le plus puissant pompier de Tokyo.', power: 85 },
    { id: 'ff_007', name: 'Joker', anime: 'Fire Force', rarity: 'Épique', image: '/gacha/cards/ff_007.jpg', malId: 149924, description: 'L\'anti-héros énigmatique qui cherche la vérité.', power: 82 },
    { id: 'ff_014', name: 'Leonard Burns', anime: 'Fire Force', rarity: 'Épique', image: '/gacha/cards/ff_014.jpg', malId: 149929, description: 'Capitaine de la 1ère brigade, un vétéran au pouvoir immense.', power: 86 },
    { id: 'ff_015', name: 'Charon', anime: 'Fire Force', rarity: 'Épique', image: '/gacha/cards/ff_015.jpg', malId: 149930, description: 'Gardien de Haumea, capable d\'absorber et de renvoyer l\'énergie.', power: 83 },
    { id: 'ff_008', name: 'Sho Kusakabe', anime: 'Fire Force', rarity: 'Légendaire', image: '/gacha/cards/ff_008.jpg', malId: 149925, description: 'Le frère de Shinra, commandant des Chevaliers de la Cendre.', power: 90 },
    { id: 'ff_009', name: 'Haumea', anime: 'Fire Force', rarity: 'Légendaire', image: '/gacha/cards/ff_009.jpg', malId: 149926, description: 'La "Gardienne du Grand Prédicateur", capable de contrôler les esprits.', power: 92 },
    
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