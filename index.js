require('dotenv').config();

// =============================================
// VÉRIFICATION DES VARIABLES D'ENVIRONNEMENT
// =============================================
if (!process.env.BOT_TOKEN || !process.env.CLIENT_ID) {
    console.error('ERREUR FATALE: BOT_TOKEN ou CLIENT_ID est manquant dans le fichier .env');
    process.exit(1);
}

console.log("✅ Token d'authentification: " + (process.env.BOT_TOKEN ? "🟢 PRÉSENT" : "🔴 MANQUANT"));

// =============================================
// IMPORTS DES MODULES NODE.JS ET TIERS
// =============================================
const http = require('http');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const cron = require('node-cron');
const express = require("express");
const cors = require("cors");
const { Server } = require("socket.io");
const pokerEvaluator = require('poker-evaluator');

// =============================================
// IMPORTS DISCORD.JS
// =============================================
const { 
    Client, 
    GatewayIntentBits, 
    REST, 
    Routes, 
    EmbedBuilder, 
    Collection, 
    ActivityType,
    ChannelType, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    PermissionsBitField, 
    PermissionFlagsBits, 
    Partials
} = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');

// =============================================
// IMPORTS DES MODULES LOCAUX
// =============================================
const { checkAchievements } = require('./commands/succes.js');
const { initAirdrop } = require('./airdrop.js');
const leveling = require('./leveling.js');
const { getLevel } = require('./leveling.js');
const { resetKIP, assignBadgesBeforeReset } = require('./resetKIP');
const { getTimeUntilNextReset, startResetCheck, sendResetAnnouncement } = require('./event-reset-Kint');
const kintCommand = require('./commands/kint');
const valorantCommand = require('./commands/valorant');
const { handleMenuInteraction } = require('./commands/shop');
const { handleInteraction: handleBlackmarket } = require('./commands/blackmarket');
const { updateDailyStreak } = require('./activityTracker.js');
require('./welcomer.js');
const { checkKintWarns } = require('./kintwarns-checker');
const { checkPolls } = require('./pollManager');
const { checkBirthdays } = require('./birthdayChecker');
const { loadInventaire, saveInventaire } = require('./inventaire.js');
const supportCommand = require('./commands/support.js');
const { activeTickets } = supportCommand;
const { loadLoLData } = require('./dataLoader');
const eraserLeaver = require("./eraserleaver.js");
const { cleanExpiredEffects } = require('./effectsManager.js');

// =============================================
// IMPORTS DES ROUTES API (EXPRESS)
// =============================================
const xpRoutes = require('./routes/xpRoutes');
const pointsRoutes = require('./routes/pointsRoutes');
const currencyRoutes = require('./routes/currencyRoutes');
const messagesRoute = require('./routes/messages');
const patchnoteRoute = require('./routes/patchnote');
const titreRoutes = require('./routes/titre');
const successRoute = require('./routes/success');
const inventaireRoutes = require('./routes/inventaire');
const shopRoutes = require('./routes/shop.js');
const kintLogsRoute = require('./routes/kintLogsRoute');
const kintDetailedLogsRoute = require('./routes/kintDetailedLogsRoute');
const statKintRoutes = require('./routes/statkint');
const effectsRoutes = require('./routes/effects');
const eventsRoutes = require('./routes/events');
const gazetteRoutes = require('./routes/gazette'); 
const feedbackRoute = require('./routes/feedbackRoute');
const serverInfoRoutes = require('./routes/serverInfo');
const botLogsRoutes = require('./routes/botLogs');
const casinoRoutes = require('./routes/casinoRoutes');
const casinoTopWinsRouter = require('./routes/casino-top-wins-route');
const casinoStatsRouter = require('./routes/casino-stats-route');
const gachaRouter = require('./routes/gachaRoutes');




// =============================================
// CONFIGURATION INITIALE ET VARIABLES GLOBALES
// =============================================
const app = express();
const server = http.createServer(app);

// Chemins des fichiers de données
const serverInfoPath = path.join(__dirname, 'serverInfo.json');
const XP_FILE = path.join(__dirname, './xp.json');
const CURRENCY_FILE = path.join(__dirname, './currency.json');
const voiceConfigPath = path.join(__dirname, 'voiceConfig.json');
const twitchFile = path.join(__dirname, "twitch.json");

const tempChannels = new Map();
let hubVoiceChannelId = null;

// Configuration des récompenses de rôles par niveau
const { ROLE_REWARDS } = require('./roleRewards');

// Configuration du client Discord
const client = new Client({
    intents: [ 
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildVoiceStates, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.GuildMessageReactions, 
        GatewayIntentBits.MessageContent, 
        GatewayIntentBits.GuildMembers 
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

// --- Files used for activity logging (jobs & achievements) ---
const MESSAGES_LOG_FILE = path.join(__dirname, 'messages_log.json');
const REACTIONS_LOG_FILE = path.join(__dirname, 'reactions_log.json');
const REACTIONS_RECEIVED_FILE = path.join(__dirname, 'reactions_received.json');
const INVITES_LOG_FILE = path.join(__dirname, 'invites_log.json');

const VOICE_MINUTES_FILE = path.join(__dirname, 'voiceMinutes.json');
const VOICE_SESSIONS_FILE = path.join(__dirname, 'voiceSessions.json');

const previousInvites = new Map(); // guildId -> Map(code->uses)

function readJsonSafe(file) {
    if (!fs.existsSync(file)) return {};
    try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { return {}; }
}

function writeJson(file, data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

client.commands = new Collection();
client.maintenance = { isActive: false, startedAt: null };
const OWNER_ID = '1206053705149841428';

// Liste des serveurs où les commandes sont désactivées
const blockedServers = ["1409557696168067236"];

// Configuration des salons et IDs spéciaux
const TEMP_VOICE_HUB_ID = '1387423224182079578'; // ID du salon "Créer ton vocal"
const KUROMYI_CHANNEL = "1416815241857077508"; // Canal où poster le live Twitch de Kuromyi
const KUROMYI_USER_ID = "185180198075891712"; // ID Discord de Kuromyi
const patchNoteChannelId = "1387426127634497616"; // Canal pour les patchnotes

// Variables d'état
let logs = [];
let kuromyiLive = false;
let kuromyiLiveUrl = null; // Ajout pour suivre l'URL du stream
const tempVoiceMap = new Map(); // channelId → ownerId (salons vocaux temporaires)
const ticketMessages = new Map(); // Stockage des messages des tickets

// =============================================
// FONCTIONS UTILITAIRES
// =============================================

/**
 * Ajoute un message de log avec horodatage
 * @param {string} message - Message à logger
 */
const addLog = (message) => {
    const logEntry = { timestamp: new Date().toISOString(), log: message };
    logs.push(logEntry);
    if (logs.length > 100) logs.shift();
    console.log(`[LOG] ${message}`);
};
client.addLog = addLog;
client.logs = logs;

/**
 * Initialise les informations du serveur si le fichier n'existe pas
 */
function initServerInfo() { 
    if (!fs.existsSync(serverInfoPath)) { 
        fs.writeFileSync(serverInfoPath, JSON.stringify({ 
            guildId: '', 
            guildName: '', 
            guildIcon: '', 
            memberCount: 0, 
            messageCount: 0, 
            messagesLast7Days: [0, 0, 0, 0, 0, 0, 0], 
            members: [], 
        }, null, 2)); 
    } 
}

/**
 * Charge les informations du serveur depuis le fichier
 * @returns {Object} Données du serveur
 */
function loadServerInfo() { 
    initServerInfo(); 
    return JSON.parse(fs.readFileSync(serverInfoPath, 'utf-8')); 
}

/**
 * Sauvegarde les informations du serveur dans le fichier
 * @param {Object} data - Données à sauvegarder
 */
function saveServerInfo(data) { 
    fs.writeFileSync(serverInfoPath, JSON.stringify(data, null, 2)); 
}

/**
 * Charge la configuration des salons vocaux
 */
function loadVoiceConfig() { 
    try { 
        if (fs.existsSync(voiceConfigPath)) { 
            const config = JSON.parse(fs.readFileSync(voiceConfigPath, 'utf-8')); 
            if (config.channelId) { 
                hubVoiceChannelId = config.channelId; 
                console.log(`✅ Configuration vocale chargée. Salon modèle ID: ${hubVoiceChannelId}`); 
            } 
        } else { 
            console.log("⚠️ Fichier voiceConfig.json non trouvé."); 
        } 
    } catch (error) { 
        console.error("❌ Erreur lors du chargement de voiceConfig.json:", error); 
    } 
}

/**
 * Charge les données d'XP depuis le fichier
 * @returns {Object} Données d'XP
 */
function loadXP() { 
    if (!fs.existsSync(XP_FILE)) fs.writeFileSync(XP_FILE, JSON.stringify({})); 
    return JSON.parse(fs.readFileSync(XP_FILE, 'utf8')); 
}

/**
 * Lit le fichier de monnaie.
 * @returns {Object} Données de monnaie.
 */
function readCurrencyFile() {
    if (!fs.existsSync(CURRENCY_FILE)) {
        return {};
    }
    return JSON.parse(fs.readFileSync(CURRENCY_FILE, 'utf8'));
}

/**
 * Écrit dans le fichier de monnaie.
 * @param {Object} data - Données à écrire.
 */
function writeCurrencyFile(data) {
    fs.writeFileSync(CURRENCY_FILE, JSON.stringify(data, null, 2));
}

/**
 * Met à jour la monnaie d'un utilisateur.
 * @param {string} userId - L'ID de l'utilisateur.
 * @param {number} amountChange - Le montant à ajouter (peut être négatif).
 */
function updateCurrency(userId, amountChange) {
    const currencyData = readCurrencyFile();
    // S'assurer que l'entrée pour l'utilisateur est un objet avec une balance
    if (!currencyData[userId] || typeof currencyData[userId].balance !== 'number') {
        currencyData[userId] = { balance: 0 };
    }
    currencyData[userId].balance += amountChange;
    writeCurrencyFile(currencyData);
}
/**
 * Envoie un patchnote depuis le fichier JSON vers le canal dédié
 */
async function sendPatchNoteFromJSON() {
    client.addLog("📝 Tentative d'envoi du patchnote depuis patchnote.json.");
    try {
        const data = fs.readFileSync('./patchnote.json', 'utf-8');
        const patch = JSON.parse(data);
        const embed = new EmbedBuilder()
            .setTitle(patch.title || '📌 Patchnote')
            .setDescription(patch.description || '')
            .setColor(0x00AE86)
            .setTimestamp();
        
        if (patch.ajouts?.length) embed.addFields({ name: '✨ Nouveautés', value: patch.ajouts.map(e => `• ${e}`).join('\n') });
        if (patch.corrections?.length) embed.addFields({ name: '🛠️ Corrections de bugs', value: patch.corrections.map(e => `• ${e}`).join('\n') });
        if (patch.ajustements?.length) embed.addFields({ name: '⚙️ Ajustements', value: patch.ajustements.map(e => `• ${e}`).join('\n') });
        if (patch.suppressions?.length) embed.addFields({ name: '❌ Suppressions', value: patch.suppressions.map(e => `• ${e}`).join('\n') });
        if (patch.systeme?.length) embed.addFields({ name: '♻️ Système', value: patch.systeme.map(e => `• ${e}`).join('\n') });
        if (patch.message_developpeur) embed.addFields({ name: '💬 Message du développeur', value: patch.message_developpeur });
        if (patch.footer) embed.setFooter({ text: patch.footer });
        
        const channel = client.channels.cache.get(patchNoteChannelId);
        if (channel) {
            await channel.send({ embeds: [embed] });
            console.log("✅ Patchnote envoyé !");
            client.addLog("✅ Patchnote envoyé avec succès.");
        } else {
            console.error("❌ Canal pour patchnote introuvable.");
            client.addLog("❌ Échec de l'envoi du patchnote : canal introuvable.");
        }
    } catch (err) {
        console.error("❌ Erreur envoi patchnote:", err);
        client.addLog(`❌ Erreur lors de l'envoi du patchnote : ${err.message}`);
    }
}

/**
 * Déploie les commandes slash vers Discord
 */
const deployCommands = async () => {
    client.addLog('🛠️ Déploiement des commandes en cours...');
    const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);
    const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
    const commands = [];
    
    for (const file of commandFiles) {
        const command = require(`./commands/${file}`);
        if (!command.data || !command.data.name) continue;
        client.commands.set(command.data.name, command);
        commands.push(command.data.toJSON());
    }
    
    try {
        await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
        console.log("✅ Commandes déployées !");
        client.addLog(`✅ ${commands.length} commandes (/) ont été déployées avec succès.`);
    } catch (error) {
        console.error("Erreur lors du déploiement des commandes :", error);
        client.addLog(`❌ Erreur lors du déploiement des commandes : ${error.message}`);
    }
};

// =============================================
// CONFIGURATION EXPRESS (API)
// =============================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes API
app.use('/api/inventaire', inventaireRoutes(client));
app.use('/api/xp', xpRoutes);
app.use('/api/success', successRoute);
app.use('/api', titreRoutes);
app.use('/api', patchnoteRoute);
app.use('/api/points', pointsRoutes);
app.use('/api/currency', currencyRoutes);
app.use('/api', messagesRoute);
app.use('/api/shop', shopRoutes(client));
app.use('/api', kintDetailedLogsRoute);
app.use('/api', statKintRoutes);
app.use('/api/effects', effectsRoutes);
app.use('/api', kintLogsRoute(client));
app.use('/api', feedbackRoute(client));
app.use('/api/events', eventsRoutes);
app.use('/api/gazette', gazetteRoutes);
app.use('/api/server', serverInfoRoutes);
app.use('/api/bot', botLogsRoutes(client));
app.use('/api/casino', casinoRoutes);
app.use('/api/casino', casinoTopWinsRouter);
app.use('/api/casino', casinoStatsRouter);
app.use('/api/gacha', gachaRouter);





// Route pour les informations du serveur
app.get('/api/serverinfo', async (req, res) => {
    try {
        // Lire depuis le fichier serverInfo.json plutôt que de fetcher à chaque fois
        if (fs.existsSync(serverInfoPath)) {
            const cachedInfo = JSON.parse(fs.readFileSync(serverInfoPath, 'utf-8'));
            return res.json(cachedInfo);
        }
        
        // Fallback: construire depuis le cache Discord si le fichier n'existe pas
        const guild = client.guilds.cache.first();
        if (!guild) return res.status(404).json({ error: 'Serveur non trouvé.' });
        
        const info = {
            guildId: guild.id, 
            guildName: guild.name, 
            guildIcon: guild.icon,
            memberCount: guild.memberCount, 
            messageCount: loadServerInfo().messageCount || 0,
            messagesLast7Days: loadServerInfo().messagesLast7Days || [0,0,0,0,0,0,0],
            members: guild.members.cache.map((member) => ({
                id: member.id, 
                username: member.user.username,
                avatar: member.user.displayAvatarURL({ format: 'png', size: 128, dynamic: true }),
                joinedAt: member.joinedAt, 
                status: member.presence?.status || 'offline',
            })),
        };
        
        fs.writeFileSync(serverInfoPath, JSON.stringify(info, null, 2));
        res.json(info);
    } catch (error) {
        console.error('Erreur API /api/serverinfo :', error);
        res.status(500).json({ error: 'Impossible de récupérer les infos serveur.' });
    }
});

// Route pour les logs
app.get("/api/logs", (req, res) => {
    res.json({ logs });
});

// Route racine
app.get("/", (req, res) => res.send("API du bot est en ligne !"));

const PORT = process.env.PORT || 20007;

// =============================================
// GESTIONNAIRE DE JEU POKER (EN MÉMOIRE)
// =============================================
const pokerTables = new Map();

function generateTableCode(length = 6) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function createPokerDeck() {
    const suits = ['♥', '♦', '♣', '♠'];
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const deck = [];
    for (const suit of suits) {
        for (const rank of ranks) {
            deck.push({ suit, rank });
        }
    }
    // Mélanger le paquet
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}


// =============================================
// DÉMARRAGE DE L'APPLICATION
// =============================================
(async () => {
    try {
        // 1. Démarrer le serveur HTTP
        server.listen(PORT, () => {
            console.log(`✅ Serveur API lancé sur le port ${PORT}`);

            // 2. Attacher le WebSocket au serveur HTTP qui est maintenant en cours d'écoute
            const io = new Server(server, {
              cors: {
                origin: "*", // Pour le test, on autorise tout.
                methods: ["GET", "POST"],
                allowEIO3: true // Ajout pour la compatibilité
              }
            });

            // --- LOGIQUE DU SERVEUR DE JEU POKER ---
            io.on('connection', (socket) => {
              console.log(`[WebSocket] Client connecté : ${socket.id}`);
              addLog(`[WebSocket] Client connecté : ${socket.id}`);
              
              // Événement pour créer une table
              socket.on('poker_create_table', ({ user, minBuyIn, buyInAmount }) => {
                  let tableCode = generateTableCode();
                  // S'assurer que le code est unique
                  while (pokerTables.has(tableCode)) {
                      tableCode = generateTableCode();
                  }

                  console.log(`[Poker] Création de la table ${tableCode} pour ${user.name} avec une cave min de ${minBuyIn}`);

                  // Déduire la cave du solde réel du joueur
                  updateCurrency(user.id, -buyInAmount, `Poker: Buy-in table ${tableCode}`);
                  console.log(`[Poker] ${user.name} a fait un buy-in de ${buyInAmount} pièces.`);
                  addLog(`[Poker] ${user.name} a fait un buy-in de ${buyInAmount} pièces pour la table ${tableCode}.`);


                  const newTable = {
                      minBuyIn: minBuyIn, // IMPORTANT: Stocker le minBuyIn
                      code: tableCode,
                      players: [{
                          id: socket.id,
                          username: user.name,
                          avatar: user.image,
                          userId: user.id, // IMPORTANT: On stocke l'ID utilisateur
                          stack: buyInAmount, // Le stack de départ est la cave
                          isHost: true,
                      }],
                      state: 'waiting', // 'waiting', 'playing', 'finished'
                  pot: 0,
                  currentBet: 0,
                  dealerIndex: -1,
                  blinds: { // On stocke les blinds
                      sb: Math.floor((minBuyIn || 1000) / 100) || 5,
                      bb: Math.floor((minBuyIn || 1000) / 50) || 10,
                  },
                  communityCards: [],
                  playerRoundBets: {}, // Pour suivre les mises de chaque joueur dans un tour
                  turnCount: 0,
                      deck: createPokerDeck(),
                  };
                  pokerTables.set(tableCode, newTable);

                  socket.join(tableCode); // Le créateur rejoint la room de la table
                  addLog(`[Poker] Table ${tableCode} créée par ${user.name}.`);

                  // On renvoie l'état complet de la table au créateur
                  socket.emit('poker_table_joined', newTable);
              });

              // Événement pour rejoindre une table
              socket.on('poker_join_table', ({ tableCode, user, buyInAmount }) => {
                  const table = pokerTables.get(tableCode);

                  if (!table) {
                      return socket.emit('poker_error', { message: `La table avec le code ${tableCode} n'existe pas.` });
                  }

                  if (table.players.length >= 8) {
                      return socket.emit('poker_error', { message: 'Cette table est pleine.' });
                  }

                  // Vérifier si un joueur avec le même nom est déjà là (cas d'une reconnexion/refresh)
                  const existingPlayerIndex = table.players.findIndex(p => p.username === user.name);
                  if (existingPlayerIndex !== -1) {
                      console.log(`[Poker] ${user.name} se reconnecte à la table ${tableCode}. Mise à jour du socket ID.`);
                      // Mettre à jour l'ID du socket pour le joueur existant
                      table.players[existingPlayerIndex].id = socket.id;
                      
                      socket.join(tableCode);
                      // Informer les autres joueurs de la mise à jour (même si rien ne change visuellement pour eux)
                      io.to(tableCode).emit('poker_table_state_update', table);
                      
                      // Renvoyer l'état complet au joueur qui se reconnecte
                      return socket.emit('poker_table_joined', table);
                  }

                  // Déduire la cave du solde réel du joueur
                  updateCurrency(user.id, -buyInAmount, `Poker: Buy-in table ${tableCode}`);
                  console.log(`[Poker] ${user.name} a fait un buy-in de ${buyInAmount} pièces.`);
                  addLog(`[Poker] ${user.name} a fait un buy-in de ${buyInAmount} pièces pour la table ${tableCode}.`);

                  const newPlayer = {
                      id: socket.id,
                      username: user.name,
                      avatar: user.image,
                      userId: user.id,
                      stack: buyInAmount,
                      isHost: false,
                      isSpectating: false,
                  };
                  table.players.push(newPlayer);

                  socket.join(tableCode);
                  console.log(`[Poker] ${user.name} a rejoint la table ${tableCode}`);
                  addLog(`[Poker] ${user.name} a rejoint la table ${tableCode}`);

                  // Informer les autres joueurs de l'arrivée du nouveau
                  io.to(tableCode).emit('poker_player_joined', newPlayer);
                  // Envoyer l'état complet de la table au joueur qui vient de rejoindre
                  socket.emit('poker_table_joined', table);
              });

              // Événement pour gérer une action de joueur (Miser, Checker, Se Coucher)
              socket.on('poker_player_action', ({ tableCode, action }) => {
                  const table = pokerTables.get(tableCode);
                  if (!table || table.state !== 'playing' || table.currentPlayerId !== socket.id) {
                      return; // Action non autorisée ou invalide
                  }

                  const playerIndex = table.players.findIndex(p => p.id === socket.id);
                  if (playerIndex === -1) return;

                  if (action.type === 'fold') {
                      table.players[playerIndex].hasFolded = true;
                      console.log(`[Poker] ${table.players[playerIndex].username} se couche.`);
                  }

                  if (action.type === 'check') {
                      console.log(`[Poker] ${table.players[playerIndex].username} fait parole.`);
                  }

                  table.turnCount++;

                  if (action.type === 'bet') {
                      const betAmount = parseInt(action.amount, 10);
                      if (isNaN(betAmount) || betAmount <= 0 || betAmount > table.players[playerIndex].stack) {
                          return socket.emit('poker_error', { message: "Mise invalide." });
                      }

                      const amountToCall = table.currentBet - (table.playerRoundBets[socket.id] || 0);
                      const raiseAmount = betAmount - amountToCall;

                      if (betAmount < amountToCall) {
                          return socket.emit('poker_error', { message: `Vous devez miser au moins ${amountToCall} pour suivre.` });
                      }

                      table.players[playerIndex].stack -= betAmount; // Le stack est déjà déduit pour les blinds, il faut ajuster
                      table.pot += betAmount;
                      table.playerRoundBets[socket.id] = (table.playerRoundBets[socket.id] || 0) + betAmount;

                      if (table.playerRoundBets[socket.id] > table.currentBet) { // C'est une relance
                          table.currentBet = table.playerRoundBets[socket.id];
                          table.turnCount = 1; // La relance réinitialise le tour de parole
                          console.log(`[Poker] ${table.players[playerIndex].username} relance à ${table.currentBet}.`);
                      } else if (table.playerRoundBets[socket.id] === table.currentBet) { // C'est un call
                          console.log(`[Poker] ${table.players[playerIndex].username} suit la mise de ${table.currentBet}.`);
                      } else { // C'est une première mise
                          table.currentBet = betAmount;
                          console.log(`[Poker] ${table.players[playerIndex].username} mise ${betAmount}.`);
                      }
                  }

                  if (action.type === 'call') {
                      const amountToCall = table.currentBet - (table.playerRoundBets[socket.id] || 0);
                      // Similaire à 'bet' mais avec un montant fixe
                      // ... Logique à compléter dans une prochaine étape
                  }

                  // Vérifier si le tour de mise est terminé
                  const activePlayers = table.players.filter(p => !p.hasFolded);
                  if (table.turnCount >= activePlayers.length) {
                      // --- FIN DU TOUR DE MISE ---
                      table.turnCount = 0;
                      table.playerRoundBets = {};
                      table.currentBet = 0; // Réinitialiser la mise pour le nouveau tour

                      if (table.communityCards.length === 0) {
                          // --- FLOP ---
                          table.communityCards.push(table.deck.pop(), table.deck.pop(), table.deck.pop());
                          console.log(`[Poker] Flop pour la table ${tableCode}:`, table.communityCards);
                      } else if (table.communityCards.length === 3) {
                          // --- TURN ---
                          table.communityCards.push(table.deck.pop());
                          console.log(`[Poker] Turn pour la table ${tableCode}:`, table.communityCards[3]);
                      } else if (table.communityCards.length === 4) {
                          // --- RIVER ---
                          table.communityCards.push(table.deck.pop());
                          console.log(`[Poker] River pour la table ${tableCode}:`, table.communityCards[4]);
                      } else {
                          // --- SHOWDOWN (FIN DE LA PARTIE) ---
                          const winnerInfo = determineWinner(table);
                          
                          // Attribuer le pot au gagnant
                          if (winnerInfo.winner) {
                              const winnerPlayer = table.players.find(p => p.id === winnerInfo.winner.id);
                              if (winnerPlayer) {
                                  winnerPlayer.stack += table.pot;
                                  console.log(`[Poker] ${winnerPlayer.username} gagne ${table.pot} jetons.`);
                              }
                          }

                          // Préparer la table pour la prochaine main
                          table.state = 'finished'; // Mettre l'état à 'finished'
                          
                          // Envoyer le résultat à tout le monde
                          table.players.forEach(p => {
                              const socketToSendTo = io.sockets.sockets.get(p.id);
                              if (socketToSendTo) {
                                  // Pour le showdown, on envoie toutes les mains
                                  socketToSendTo.emit('poker_game_over', { table, winnerInfo });
                              }
                          });

                          pokerTables.set(tableCode, table); // Sauvegarder l'état final de la table
                          return; // Arrêter l'exécution pour ne pas passer au joueur suivant
                      }

                      // Le premier joueur à parler après le flop est le premier joueur actif après l'hôte
                      const hostIndex = table.players.findIndex(p => p.isHost);
                      let nextPlayerIndex = (hostIndex + 1) % table.players.length;
                      while (table.players[nextPlayerIndex].hasFolded) {
                          nextPlayerIndex = (nextPlayerIndex + 1) % table.players.length;
                      }
                      table.currentPlayerId = table.players[nextPlayerIndex].id;
                  } else {
                      // Passer au joueur suivant qui n'a pas encore abandonné
                      let nextPlayerIndex = (playerIndex + 1) % table.players.length;
                      while (table.players[nextPlayerIndex].hasFolded) {
                          nextPlayerIndex = (nextPlayerIndex + 1) % table.players.length;
                      }
                      table.currentPlayerId = table.players[nextPlayerIndex].id;
                  }

                  // Envoyer l'état mis à jour à tous les joueurs de la table
                  // On envoie un état personnalisé et sécurisé à chaque joueur
                  table.players.forEach(p => {
                      const socketToSendTo = io.sockets.sockets.get(p.id);
                      if (socketToSendTo) {
                          socketToSendTo.emit('poker_table_state_update', getPersonalizedTableState(table, p.id));
                      }
                  });
              });

              // Fonction pour déterminer le gagnant
              function determineWinner(table) {
                  const activePlayers = table.players.filter(p => !p.hasFolded);
                  if (activePlayers.length === 1) {
                      return { winner: activePlayers[0], handRank: "A gagné par forfait" };
                  }

                  const suitMap = { '♥': 'h', '♦': 'd', '♣': 'c', '♠': 's' };
                  const formatCard = c => c.rank.replace('10', 'T') + suitMap[c.suit];

                  const communityCardsFormatted = table.communityCards.map(formatCard);
                  
                  let bestHand = null;
                  let winner = null;

                  activePlayers.forEach(player => {
                      // Assurez-vous que le joueur a une main avant de l'évaluer
                      if (!player.hand || player.hand.length < 2) return;

                      const playerCardsFormatted = player.hand.map(formatCard);
                      const allCards = [...playerCardsFormatted, ...communityCardsFormatted];
                      const evaluation = pokerEvaluator.evalHand(allCards);

                      // Stocker l'évaluation pour l'afficher plus tard
                      player.handDetails = evaluation;

                      if (!bestHand || evaluation.value > bestHand.value) {
                          bestHand = evaluation;
                          winner = player;
                      }
                  });

                  return { winner, handRank: bestHand.handName };
              }

              // Fonction pour démarrer une nouvelle main
              function startNewHand(table) {
                  table.pot = 0;
                  table.currentBet = 0;
                  table.communityCards = [];
                  table.playerRoundBets = {};
                  table.turnCount = 0;
                  table.deck = createPokerDeck();

                  // Réinitialiser les joueurs et distribuer les cartes
                  table.players.forEach(p => {
                      p.hasFolded = false;
                      p.hand = [table.deck.pop(), table.deck.pop()];
                      delete p.handDetails;
                  });

                  // --- GESTION DES BLINDS ---
                  const smallBlindIndex = (table.dealerIndex + 1) % table.players.length;
                  const bigBlindIndex = (table.dealerIndex + 2) % table.players.length;

                  const sbPlayer = table.players[smallBlindIndex];
                  const bbPlayer = table.players[bigBlindIndex];

                  // Prélever les vraies pièces
                  sbPlayer.stack -= table.blinds.sb;
                  table.playerRoundBets[sbPlayer.id] = table.blinds.sb;

                  bbPlayer.stack -= table.blinds.bb;
                  table.playerRoundBets[bbPlayer.id] = table.blinds.bb;

                  table.pot = table.blinds.sb + table.blinds.bb;
                  table.currentBet = table.blinds.bb;

                  // Le premier joueur à parler est après la grosse blind
                  table.currentPlayerId = table.players[(bigBlindIndex + 1) % table.players.length].id;
                  table.state = 'playing';

                  console.log(`[Poker] Nouvelle main pour la table ${table.code}.`);

                  table.players.forEach(playerInTable => {
                      const socketToSendTo = io.sockets.sockets.get(playerInTable.id);
                      if (socketToSendTo) {
                          socketToSendTo.emit('poker_game_started', getPersonalizedTableState(table, playerInTable.id));
                      }
                  });
              }

              // Événement pour lancer la partie
              socket.on('poker_start_game', ({ tableCode }) => {
                  const table = pokerTables.get(tableCode);
                  if (!table) return;

                  // Vérifier si le demandeur est bien l'hôte
                  const player = table.players.find(p => p.id === socket.id);
                  if (!player || !player.isHost) {
                      return socket.emit('poker_error', { message: "Seul l'hôte peut lancer la partie." });
                  }

                  if (table.players.length < 2) {
                      return socket.emit('poker_error', { message: "Il faut au moins 2 joueurs pour commencer." });
                  }

                  startNewHand(table);
              });

              // Événement pour la main suivante
              socket.on('poker_next_hand', ({ tableCode }) => {
                  const table = pokerTables.get(tableCode);
                  if (!table) return;

                  const player = table.players.find(p => p.id === socket.id);
                  if (!player || !player.isHost) return;

                  startNewHand(table);
              });
              
              // Événement pour se lever ou se rasseoir
              socket.on('poker_toggle_spectate', ({ tableCode, isSpectating, buyInAmount }) => {
                  const table = pokerTables.get(tableCode);
                  if (!table) return;

                  const player = table.players.find(p => p.id === socket.id);
                  if (!player) return;

                  if (isSpectating) { // Le joueur veut se lever
                      if (player.stack > 0) {
                          updateCurrency(player.userId, player.stack, `Poker: Cash-out table ${tableCode}`);
                          console.log(`[Poker] ${player.username} se lève et récupère ${player.stack} pièces.`);
                          addLog(`[Poker] ${player.username} se lève de la table ${tableCode} et récupère ${player.stack} pièces.`);
                      }
                      player.isSpectating = true;
                      player.stack = 0;
                  } else { // Le joueur veut se rasseoir
                      if (buyInAmount < table.minBuyIn) {
                          return socket.emit('poker_error', { message: `La cave doit être d'au moins ${table.minBuyIn} pièces.` });
                      }
                      updateCurrency(player.userId, -buyInAmount, `Poker: Re-buy table ${tableCode}`);
                      console.log(`[Poker] ${player.username} se rassoit avec ${buyInAmount} pièces.`);
                      addLog(`[Poker] ${player.username} se rassoit à la table ${tableCode} avec ${buyInAmount} pièces.`);
                      player.isSpectating = false;
                      player.stack = buyInAmount;
                  }

                  // Informer tout le monde de la mise à jour
                  table.players.forEach(p => {
                      const socketToSendTo = io.sockets.sockets.get(p.id);
                      if (socketToSendTo) {
                          socketToSendTo.emit('poker_table_state_update', getPersonalizedTableState(table, p.id));
                      }
                  });
              });

              // Événement pour quitter la table
              socket.on('poker_leave_table', ({ tableCode }) => {
                  const table = pokerTables.get(tableCode);
                  if (!table) return;

                  const playerIndex = table.players.findIndex(p => p.id === socket.id);
                  if (playerIndex !== -1) {
                      const departingPlayer = table.players[playerIndex];
                      console.log(`[Poker] ${departingPlayer.username} quitte la table ${tableCode}.`);
                      addLog(`[Poker] ${departingPlayer.username} quitte la table ${tableCode}.`);

                      // Rembourser le stack restant sur le compte réel du joueur
                      if (departingPlayer.stack > 0) {
                          updateCurrency(departingPlayer.userId, departingPlayer.stack, `Poker: Cash-out table ${tableCode}`);
                          console.log(`[Poker] ${departingPlayer.username} a récupéré ${departingPlayer.stack} pièces.`);
                          addLog(`[Poker] ${departingPlayer.username} a récupéré ${departingPlayer.stack} pièces de la table ${tableCode}.`);
                      }

                      table.players.splice(playerIndex, 1);
                      socket.leave(tableCode);
                      // Informer les autres joueurs
                      io.to(tableCode).emit('poker_player_left', { playerId: socket.id });
                  }
              });

              // Fonction utilitaire pour personnaliser l'état de la table pour chaque joueur
              function getPersonalizedTableState(table, playerId) {
                  return {
                      ...table, // On garde toutes les propriétés de la table (y compris minBuyIn)
                      deck: null, // On ne renvoie jamais le paquet de cartes
                      players: table.players.map(p => {
                          const { hand, ...playerData } = p;
                          return {
                              ...playerData,
                              // Ne révèle la main que si c'est le joueur concerné
                              hand: p.id === playerId ? hand : (hand ? [{ suit: '?', rank: '?' }, { suit: '?', rank: '?' }] : null)
                          };
                      })
                  };
              }

              socket.on('disconnect', () => {
                console.log(`[WebSocket] Client déconnecté : ${socket.id}`);
                addLog(`[WebSocket] Client déconnecté : ${socket.id}`);
              });
            });

            console.log("✅ Serveur WebSocket attaché et en écoute.");
        });

        await loadLoLData(); // télécharge champions, runes, items, spells
        await client.login(process.env.BOT_TOKEN);
    } catch (error) {
        console.error("ERREUR FATALE AU DÉMARRAGE :", error);
        addLog(`❌ ERREUR FATALE AU DÉMARRAGE: ${error.message}`);
        process.exit(1);
    }
})();

// =============================================
// ÉVÉNEMENTS DISCORD.JS
// =============================================

// Voice tracking: simple join/leave tracker that accumulates minutes per user
const voiceJoinTimestamps = new Map(); // userId -> timestamp(ms)

function readJsonSafeSync(file) {
    if (!fs.existsSync(file)) return {};
    try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { return {}; }
}

function writeJsonSync(file, data) {
    try { fs.writeFileSync(file, JSON.stringify(data, null, 2)); } catch (e) { console.error('Erreur écriture JSON', file, e); }
}

client.on('voiceStateUpdate', (oldState, newState) => {
    try {
        const userId = newState.member?.id || oldState.member?.id;
        if (!userId) return;

        // Join
        if (!oldState.channelId && newState.channelId) {
            // ignore bots
            if (newState.member?.user?.bot) return;
            // record start (memory + persist)
            const startTs = Date.now();
            voiceJoinTimestamps.set(userId, startTs);
            const sessions = readJsonSafeSync(VOICE_SESSIONS_FILE) || {};
            sessions[userId] = startTs;
            writeJsonSync(VOICE_SESSIONS_FILE, sessions);
            // console.log(`VOICE JOIN ${newState.member.user.username}`);
            return;
        }

        // Leave
        if (oldState.channelId && !newState.channelId) {
            if (oldState.member?.user?.bot) return;
            const start = voiceJoinTimestamps.get(userId) || (readJsonSafeSync(VOICE_SESSIONS_FILE) || {})[userId] || 0;
            const now = Date.now();
            const minutes = start ? Math.max(0, Math.floor((now - start) / 60000)) : 0;
            if (minutes > 0) {
                const data = readJsonSafeSync(VOICE_MINUTES_FILE) || {};
                data[userId] = (data[userId] || 0) + minutes;
                writeJsonSync(VOICE_MINUTES_FILE, data);
                console.log(`🎧 ${oldState.member.user.username} a quitté le vocal — +${minutes} minutes (total: ${data[userId]}m)`);
            }
            // remove persisted session record
            voiceJoinTimestamps.delete(userId);
            try {
                const sessions = readJsonSafeSync(VOICE_SESSIONS_FILE) || {};
                if (sessions[userId]) { delete sessions[userId]; writeJsonSync(VOICE_SESSIONS_FILE, sessions); }
            } catch (e) { /* ignore */ }
            return;
        }

        // Move between channels: update start timestamp to now (treat as continuous)
        if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
            // do nothing special — keep original start
            return;
        }
    } catch (err) {
        console.error('Erreur voiceStateUpdate tracker', err);
    }
});

// Événement ready - Bot connecté et prêt
client.once('ready', async () => {
    console.log('✅ Bot est en ligne !');
    client.addLog("🚀 Bot démarré et connecté à Discord !");
    
    await deployCommands();
    loadVoiceConfig();
    client.addLog("🔊 Configuration des salons vocaux chargée.");
    
    leveling.init(client);
    client.addLog("🎯 Vérification des rôles de niveau en cours...");
    
    eraserLeaver(client);
    
    const guild = client.guilds.cache.first();
    if (guild) {
        await guild.members.fetch({ timeout: 60000 }).catch(err => {
            console.error('⚠️ Impossible de charger tous les membres:', err.message);
            client.addLog('⚠️ Certains membres peuvent ne pas être en cache.');
        }); // Pour s'assurer que tous les membres sont en cache
        const xpData = loadXP();

        for (const [userId, data] of Object.entries(xpData)) {
            const member = guild.members.cache.get(userId);
            if (!member) continue;

            const userLevel = getLevel(data.xp || 0);
            const expectedRole = ROLE_REWARDS.slice().reverse().find(r => userLevel >= r.level);
            const expectedRoleId = expectedRole?.roleId;

            // Supprime les anciens rôles de niveau
            for (const reward of ROLE_REWARDS) {
                if (member.roles.cache.has(reward.roleId) && reward.roleId !== expectedRoleId) {
                    await member.roles.remove(reward.roleId).catch(() => {});
                }
            }

            // Ajoute le bon rôle s'il ne l'a pas
            if (expectedRoleId && !member.roles.cache.has(expectedRoleId)) {
                await member.roles.add(expectedRoleId).catch(() => {});
            }
        }

        client.addLog("✅ Rôles de niveau mis à jour pour tous les membres.");
    } else {
        client.addLog("❌ Aucun serveur trouvé pour mettre à jour les rôles de niveau.");
    }
    
    initAirdrop(client);
    client.addLog("💧 Système d'airdrops initialisé.");
    
    startResetCheck(client);
    client.addLog("🔄 Vérification du reset KIP démarrée.");
    
    client.user.setPresence({ 
        activities: [{ name: 'NyxBot| /aide | By Kyû 🌌', type: ActivityType.Listening }], 
        status: 'listening' 
    });
    client.addLog("🎭 Présence du bot mise à jour.");
});

// Événement guildMemberAdd - Nouveau membre
client.on('guildMemberAdd', member => {
    client.addLog(`➕ ${member.user.tag} a rejoint le serveur.`);
    let info = loadServerInfo();
    info.memberCount++;
    saveServerInfo(info);
});

// Événement guildMemberRemove - Membre parti
client.on('guildMemberRemove', member => {
    client.addLog(`➖ ${member.user.tag} a quitté le serveur.`);
    let info = loadServerInfo();
    info.memberCount--;
    saveServerInfo(info);
});

// Événement messageCreate - Nouveau message
client.on('messageCreate', message => {
    if (message.author.bot) return;
    
    let info = loadServerInfo();
    info.messageCount++;
    const day = new Date().getDay();
    
    if (!info.messagesLast7Days) info.messagesLast7Days = [0, 0, 0, 0, 0, 0, 0];
    info.messagesLast7Days[day]++;
    saveServerInfo(info);
    
    // Log message dans salon de ticket
    if (message.channel.name?.startsWith('ticket-')) {
        const existing = ticketMessages.get(message.channel.id) || [];
        existing.push({
            author: message.author.tag,
            content: message.content || '[Embed ou contenu vide]',
            timestamp: new Date()
        });
        ticketMessages.set(message.channel.id, existing);
    }

    // === Append to messages_log.json for jobs and achievements ===
    try {
        const messagesLog = readJsonSafe(MESSAGES_LOG_FILE);
        if (!messagesLog[message.author.id]) messagesLog[message.author.id] = [];
        messagesLog[message.author.id].push({ channelId: message.channel.id, timestamp: new Date().toISOString(), content: message.content || '' });
        // keep last 500 messages per user to avoid huge files
        if (messagesLog[message.author.id].length > 500) messagesLog[message.author.id].shift();
        writeJson(MESSAGES_LOG_FILE, messagesLog);
    } catch (e) {
        console.error('Erreur lors de l\'écriture de messages_log.json', e);
    }
});

// Événement voiceStateUpdate - Changement d'état vocal
client.on('voiceStateUpdate', async (oldState, newState) => {
    const member = newState.member;
    const guild = newState.guild;

    // --- Création du salon temporaire ---
    if (newState.channelId === TEMP_VOICE_HUB_ID) {
        try {
            const tempChannel = await guild.channels.create({
                name: `🔊・Vocal de ${member.user.username}`,
                type: ChannelType.GuildVoice,
                parent: newState.channel?.parent ?? null,
                permissionOverwrites: [
                    {
                        id: member.id,
                        allow: [
                            PermissionFlagsBits.ManageChannels,
                            PermissionFlagsBits.MuteMembers,
                            PermissionFlagsBits.DeafenMembers,
                            PermissionFlagsBits.MoveMembers,
                            PermissionFlagsBits.Speak,
                            PermissionFlagsBits.Stream,
                            PermissionFlagsBits.UseVAD,
                        ],
                    },
                    {
                        id: guild.roles.everyone,
                        allow: [
                            PermissionFlagsBits.Connect,
                            PermissionFlagsBits.Speak,
                            PermissionFlagsBits.Stream,
                            PermissionFlagsBits.UseVAD,
                        ],
                    },
                ],
            });

            await member.voice.setChannel(tempChannel);
            tempVoiceMap.set(tempChannel.id, member.id);
            console.log(`✅ Salon temporaire créé : ${tempChannel.name} (owner: ${member.user.tag})`);
        } catch (err) {
            console.error("❌ Erreur création salon temporaire :", err);
        }
        return;
    }

    // --- Suppression si salon vide ---
    const oldChannel = oldState.channel;
    if (oldChannel && tempVoiceMap.has(oldChannel.id)) {
        try {
            const isEmpty = oldChannel.members?.size === 0;
            const channelId = oldChannel?.id;

            if (isEmpty && channelId) {
                await oldChannel.delete("Salon temporaire vide.");
                console.log(`🗑️ Salon temporaire supprimé : ${oldChannel.name}`);
            }

            tempVoiceMap.delete(channelId);
        } catch (err) {
            console.error(`❌ Erreur suppression salon temporaire (ID: ${oldChannel?.id || 'inconnu'}) :`, err);
            tempVoiceMap.delete(oldChannel?.id);
        }
        return;
    }

    // --- Unmute automatique si rejoint un vocal temporaire ---
    if (
        newState.channel &&
        tempVoiceMap.has(newState.channel.id) &&
        oldState.channelId !== newState.channelId
    ) {
        try {
            await newState.channel.permissionOverwrites.edit(member.id, {
                Speak: true,
            });

            if (member.voice.serverMute) {
                await member.voice.setMute(false, "Unmute automatique dans salon temporaire.");
            }

            console.log(`🔊 ${member.user.tag} a rejoint ${newState.channel.name} → unmute OK`);
        } catch (err) {
            console.error("❌ Erreur unmute membre :", err);
        }
    }
});

// Reaction adds/removes to track reactions made and reactions received
client.on('messageReactionAdd', async (reaction, user) => {
    try {
        if (user.bot) return;
        // fetch partials
        if (reaction.partial) await reaction.fetch();
        if (reaction.message.partial) await reaction.message.fetch();

        // log reaction made by user
        const reactionsLog = readJsonSafe(REACTIONS_LOG_FILE);
        if (!reactionsLog[user.id]) reactionsLog[user.id] = [];
        reactionsLog[user.id].push({ messageId: reaction.message.id, channelId: reaction.message.channelId || reaction.message.channel?.id, emoji: reaction.emoji.name, timestamp: new Date().toISOString() });
        if (reactionsLog[user.id].length > 500) reactionsLog[user.id].shift();
        writeJson(REACTIONS_LOG_FILE, reactionsLog);

        // increment reactions received for the message author
        const authorId = reaction.message.author?.id;
        if (authorId && !reaction.message.author.bot) {
            const rec = readJsonSafe(REACTIONS_RECEIVED_FILE);
            if (!rec[authorId]) rec[authorId] = [];
            rec[authorId].push({ from: user.id, emoji: reaction.emoji.name, messageId: reaction.message.id, timestamp: new Date().toISOString() });
            if (rec[authorId].length > 1000) rec[authorId].shift();
            writeJson(REACTIONS_RECEIVED_FILE, rec);
        }
    } catch (err) {
        console.error('Erreur reactionAdd', err);
    }
});

client.on('messageReactionRemove', async (reaction, user) => {
    try {
        if (user.bot) return;
        if (reaction.partial) await reaction.fetch();
        if (reaction.message.partial) await reaction.message.fetch();
        // For simplicity we won't remove entries from reactions_received; jobs check will count based on current day entries.
    } catch (err) {
        console.error('Erreur reactionRemove', err);
    }
});

// Invites tracking: snapshot on ready
client.on('ready', async () => {
    try {
        for (const guild of client.guilds.cache.values()) {
            const invites = await guild.invites.fetch().catch(() => []);
            const map = new Map();
            invites.forEach(inv => map.set(inv.code, inv.uses));
            previousInvites.set(guild.id, map);
        }
    } catch (err) {
        console.error('Erreur initialisation invites', err);
    }
});

// periodic invites refresh (cron every minute)
cron.schedule('* * * * *', async () => {
    try {
        for (const guild of client.guilds.cache.values()) {
            const invites = await guild.invites.fetch().catch(() => []);
            const prev = previousInvites.get(guild.id) || new Map();
            const current = new Map();
            invites.forEach(inv => current.set(inv.code, inv.uses));
            // detect increases
            for (const [code, uses] of current.entries()) {
                const old = prev.get(code) || 0;
                if (uses > old) {
                    // find inviter
                    const inv = invites.find(i => i.code === code);
                    if (inv && inv.inviter) {
                        const inviterId = inv.inviter.id;
                        const invLog = readJsonSafe(INVITES_LOG_FILE);
                        if (!invLog[inviterId]) invLog[inviterId] = [];
                        invLog[inviterId].push({ code, usesDelta: uses - old, timestamp: new Date().toISOString() });
                        if (invLog[inviterId].length > 200) invLog[inviterId].shift();
                        writeJson(INVITES_LOG_FILE, invLog);
                    }
                }
            }
            previousInvites.set(guild.id, current);
        }
    } catch (err) {
        console.error('Erreur cron invites', err);
    }
});

// Événement interactionCreate - Interactions (commandes, boutons, menus)
client.on('interactionCreate', async interaction => {
    // Vérifie si le serveur est bloqué
    if (blockedServers.includes(interaction.guildId)) {
        return interaction.reply({ content: '❌ Toutes les commandes sont désactivées sur ce serveur.', ephemeral: true });
    }

    try {
        // Gestion spécifique pour les commandes slash
        if (interaction.isChatInputCommand()) {
            const userId = interaction.user.id;
            updateDailyStreak(userId, client, checkAchievements);
            
            if (client.maintenance.isActive && interaction.user.id !== OWNER_ID) {
                const elapsed = Math.floor((Date.now() - client.maintenance.startedAt) / 1000);
                const minutes = Math.floor(elapsed / 60);
                const seconds = elapsed % 60;
                client.addLog(`🛠️ Interaction de ${interaction.user.tag} bloquée (maintenance).`);
                return interaction.reply({ content: `🛠️ Le bot est en maintenance depuis **${minutes}min ${seconds}s**.\nMerci de réessayer plus tard ou contacte <@${OWNER_ID}>.`, ephemeral: true });
            }
            
            const command = client.commands.get(interaction.commandName);
            if (!command) return;
            
            const options = interaction.options?.data?.map(opt => `${opt.name}: ${opt.value}`).join(', ');
            client.addLog(`👀 Slash utilisé : /${interaction.commandName} par ${interaction.user.tag} (${interaction.user.id})${options ? ` | Options: ${options}` : ''}`);
            await command.execute(interaction);
            return;
        }
        
        if (interaction.isModalSubmit()) {
            client.addLog(`📝 Modale soumise par ${interaction.user.tag} (ID: ${interaction.customId})`);

            // 🎯 Gestion du modal "kint"
            if (interaction.customId === 'kint_gagne_modal' || interaction.customId === 'kint_perdu_modal') {
                const kintCommand = client.commands.get("kint");
                if (kintCommand?.handleModal) await kintCommand.handleModal(interaction);
                return;
            }

            // 💱 Gestion du modal "exchange"
            if (interaction.customId === "exchange_modal") {
                const exchangeCommand = client.commands.get("exchange");
                if (exchangeCommand?.handleModalSubmit) await exchangeCommand.handleModalSubmit(interaction);
                return;
            }

            return;
        }

        
        if (interaction.isStringSelectMenu() && interaction.customId === 'validate_job_select') {
            client.addLog(`📋 ValidateJob select utilisé par ${interaction.user.tag}`);
            const validatejobCommand = client.commands.get("validatejob");
            if (validatejobCommand?.handleSelect) await validatejobCommand.handleSelect(interaction);
            return;
        }
        
        if ((interaction.isStringSelectMenu() && interaction.customId.startsWith('shop_')) || (interaction.isButton() && interaction.customId.startsWith('shop_'))) {
            client.addLog(`🛍️ Interaction Shop par ${interaction.user.tag} (ID: ${interaction.customId})`);
            await handleMenuInteraction(interaction);
            return;
        }
        
        // Gestion des menus déroulants du Black Market
        if (interaction.isStringSelectMenu() && interaction.customId.startsWith('bm_category_')) {
            client.addLog(`🕶️ Menu Black Market utilisé par ${interaction.user.tag} (ID: ${interaction.customId})`);
            await handleBlackmarket(interaction);
            return;
        }
        
        if (interaction.isStringSelectMenu() && interaction.customId === 'equip_title_select') {
            client.addLog(`👑 ${interaction.user.tag} équipe un nouveau titre.`);
            const titreCommand = require('./commands/titre.js');
            await titreCommand.handleSelect(interaction);
            return;
        }
        
        if (interaction.isButton()) {
            const { customId, channel, member, guild, user } = interaction;
            client.addLog(`🔘 Bouton cliqué par ${user.tag} (ID: ${customId})`);

            // Early catch: Jobs refresh buttons should be handled immediately
            if (customId === 'jobs_refresh_page' || customId === 'jobs_refresh_missions' || customId === 'blackmarket_refresh') {
                try {
                    const jobsModule = require('./commands/jobs');
                    if (customId === 'jobs_refresh_page' || customId === 'jobs_refresh_missions') {
                        await jobsModule.handleRefresh(interaction);
                        return;
                    }
                    if (customId === 'blackmarket_refresh') {
                        await handleBlackmarket(interaction);
                        return;
                    }
                } catch (err) {
                    console.error('Error handling refresh button', err);
                    return interaction.reply({ content: '❌ Erreur lors du rafraîchissement.', ephemeral: true });
                }
            }

            // Gestion des boutons de tickets
            if (customId.startsWith('ticket_accept_')) {
                // Vérifie les permissions (doit avoir ManageChannels ou être owner)
                if (!member.permissions.has(PermissionFlagsBits.ManageChannels) && user.id !== OWNER_ID) {
                    return interaction.reply({ content: "🚫 Tu n'as pas la permission d'accepter ce ticket.", ephemeral: true });
                }
                const embed = interaction.message.embeds[0];
                const userMentionMatch = embed?.description?.match(/<@(\d+)>/);
                const targetUserId = userMentionMatch?.[1];
                
                if (targetUserId) {
                    try {
                        const targetUser = await interaction.client.users.fetch(targetUserId);
                        await targetUser.send(`✅ ${interaction.user.username} a accepté ton ticket sur le serveur **KTS**. Un membre du support va bientôt te répondre.`);
                        client.addLog(`🎫 Ticket de ${targetUser.tag} accepté par ${interaction.user.tag}`);
                    } catch (err) {
                        console.warn(`❌ Impossible d'envoyer un DM à l'utilisateur avec l'ID ${targetUserId}.`);
                        client.addLog(`⚠️ Impossible d'envoyer un DM de confirmation d'acceptation de ticket à ${targetUserId}`);
                    }
                }
                
                const ticketId = customId.split('_')[2]; // Récupère le ticketId de l'ID original
                const closeButtonRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId(`ticket_close_${ticketId}`)
                        .setLabel('Fermer')
                        .setEmoji('🗑️')
                        .setStyle(ButtonStyle.Secondary)
                );
                
                await interaction.update({ content: `✅ Ticket accepté par <@${interaction.user.id}>`, components: [closeButtonRow] });
                return;
            }
            
            if (customId.startsWith('ticket_refuse_')) {
                // Vérifie les permissions (doit avoir ManageChannels ou être owner)
                if (!member.permissions.has(PermissionFlagsBits.ManageChannels) && user.id !== OWNER_ID) {
                    return interaction.reply({ content: "🚫 Tu n'as pas la permission de refuser ce ticket.", ephemeral: true });
                }
                const embed = interaction.message.embeds[0];
                const userMentionMatch = embed?.description?.match(/<@(\d+)>/);
                const targetUserId = userMentionMatch?.[1];
                
                if (targetUserId) {
                    try {
                        const targetUser = await interaction.client.users.fetch(targetUserId);
                        await targetUser.send(`❌ ${interaction.user.username} a refusé ton ticket sur le serveur **KTS**. Tu peux en ouvrir un nouveau si besoin.`);
                        client.addLog(`🎫 Ticket de ${targetUser.tag} refusé par ${interaction.user.tag}`);
                    } catch (err) {
                        console.warn(`❌ Impossible d'envoyer un DM à l'utilisateur avec l'ID ${targetUserId}.`);
                        client.addLog(`⚠️ Impossible d'envoyer un DM de refus de ticket à ${targetUserId}`);
                    }
                }
                
                await interaction.reply({ content: `❌ Ticket refusé par <@${interaction.user.id}>. Fermeture dans 5 secondes.`, ephemeral: false });
                setTimeout(() => {
                    channel.delete().catch(console.error);
                    ticketMessages.delete(channel.id);
                    // Nettoyer activeTickets
                    for (const [ticketId, ticketData] of activeTickets.entries()) {
                        if (ticketData.channelId === channel.id) {
                            activeTickets.delete(ticketId);
                            break;
                        }
                    }
                }, 5000);
                return;
            }
            
            if (customId.startsWith('ticket_close_')) {
                if (!member.permissions.has(PermissionFlagsBits.ManageChannels)) {
                    return interaction.reply({ content: "🚫 Tu n'as pas la permission de fermer ce ticket.", ephemeral: true });
                }
                
                client.addLog(`🎫 Ticket ${channel.name} fermé par ${user.tag}.`);
                const messages = ticketMessages.get(channel.id) || [];
                
                // Récupérer les infos du ticket depuis activeTickets
                let reason = 'Non spécifiée';
                for (const [ticketId, ticketData] of activeTickets.entries()) {
                    if (ticketData.channelId === channel.id) {
                        reason = ticketData.raison || 'Non spécifiée';
                        break;
                    }
                }
                
                let logsChannel = await client.channels.fetch('1388474710613954741').catch(err => console.warn('Impossible de récupérer le channel logs:', err));
                if (logsChannel) {
                    try {
                        const formattedMessages = messages.map(msg => {
                            const time = msg.timestamp.toISOString().replace('T', ' ').split('.')[0];
                            return `[${time}] ${msg.author}: ${msg.content}`;
                        }).join('\n');

                        if (formattedMessages.length > 4000) {
                            const buffer = Buffer.from(formattedMessages, 'utf-8');
                            await logsChannel.send({
                                embeds: [
                                    new EmbedBuilder()
                                        .setTitle(`📄 Logs du ticket ${channel.name}`)
                                        .setColor(0x5865F2)
                                        .addFields(
                                            { name: '🧑‍💼 Fermé par', value: `<@${user.id}>`, inline: true },
                                            { name: '📝 Raison', value: reason || 'Non spécifiée', inline: true }
                                        )
                                        .setTimestamp()
                                ],
                                files: [{ attachment: buffer, name: `${channel.name}_log.txt` }]
                            });
                        } else {
                            await logsChannel.send({
                                embeds: [
                                    new EmbedBuilder()
                                        .setTitle(`📄 Logs du ticket ${channel.name}`)
                                        .setColor(0x5865F2)
                                        .addFields(
                                            { name: '🧑‍💼 Fermé par', value: `<@${user.id}>`, inline: true },
                                            { name: '📝 Raison', value: reason || 'Non spécifiée', inline: true },
                                            { name: '📜 Messages', value: `\`\`\`\n${formattedMessages}\n\`\`\`` }
                                        )
                                        .setTimestamp()
                                ]
                            });
                        }

                        client.addLog(`📜 ${channel.name} envoyés.`);
                    } catch (err) {
                        console.error('Erreur lors de l’envoi des logs:', err);
                        client.addLog(`❌ Erreur envoi des logs du ticket ${channel.name}: ${err.message}`);
                    }
                }
                
                await interaction.reply({ content: `🗑️ Ticket fermé par <@${user.id}>. Suppression dans 5 secondes.`, ephemeral: false });
                setTimeout(() => {
                    channel.delete().catch(console.error);
                    ticketMessages.delete(channel.id);
                    // Nettoyer activeTickets
                    for (const [ticketId, ticketData] of activeTickets.entries()) {
                        if (ticketData.channelId === channel.id) {
                            activeTickets.delete(ticketId);
                            break;
                        }
                    }
                }, 5000);
                return;
            }
            
            // Bouton Stop musique
            if (interaction.customId === 'music_stop') {
                const conn = getVoiceConnection(guild.id);
                if (conn) conn.destroy();
                return interaction.reply({ content: '⏹️ Lecture arrêtée.', ephemeral: true });
            }

            // Blackmarket buttons
            if (interaction.customId && (interaction.customId.startsWith('blackmarket_') || interaction.customId.startsWith('bm_') )) {
                client.addLog(`🕶️ Blackmarket interaction ${interaction.customId} by ${interaction.user.tag}`);
                await handleBlackmarket(interaction);
                return;
            }

            

            // Boutons d'administration
            if (interaction.isButton()) {
                if (interaction.customId === "admin_check_birthdays") {
                    await checkBirthdays(client);
                    return interaction.reply({ content: "✅ Birthdays forcé !", ephemeral: true });
                }
                
                if (interaction.customId === "admin_init_airdrop") {
                    initAirdrop(client);
                    return interaction.reply({ content: "✅ Airdrop initialisé !", ephemeral: true });
                }
                
                if (interaction.customId === "admin_reset_kip") {
                    await assignBadgesBeforeReset(client);
                    await resetKIP(client);
                    return interaction.reply({ content: "✅ Reset KIP effectué !", ephemeral: true });
                }
                
                if (interaction.customId === "admin_check_warns") {
                    await checkKintWarns(client);
                    return interaction.reply({ content: "✅ Vérification des warns terminée !", ephemeral: true });
                }
                
                if (interaction.customId === "admin_check_polls") {
                    await checkPolls(client);
                    return interaction.reply({ content: "✅ Vérification des polls terminée !", ephemeral: true });
                }
                
                // Boutons de réaction de rôle
                if (customId.startsWith('reaction_role_')) {
                    const roleId = customId.replace('reaction_role_', '');
                    const member = interaction.member;

                    if (!member) return;

                    const role = interaction.guild.roles.cache.get(roleId);
                    if (!role) {
                        return interaction.reply({ content: '❌ Rôle introuvable.', ephemeral: true });
                    }

                    try {
                        if (member.roles.cache.has(roleId)) {
                            // Retirer le rôle si déjà présent
                            await member.roles.remove(roleId);
                            await interaction.reply({ content: `❌ Rôle ${role.name} retiré.`, ephemeral: true });
                        } else {
                            // Ajouter le rôle
                            await member.roles.add(roleId);
                            await interaction.reply({ content: `✅ Rôle ${role.name} ajouté.`, ephemeral: true });
                        }
                    } catch (err) {
                        console.error(err);
                        await interaction.reply({ content: '❌ Impossible d’ajouter/retirer le rôle.', ephemeral: true });
                    }
                }
            }
            
            // Ignorer certains IDs de boutons
            const ignoredIds = [ 
                "airdrop_open", 
                /^swaplane_accept_/, 
                /^swaplane_decline_/, 
                /^mychamp_accept_/, 
                /^mychamp_decline_/, 
                /^succès_/, 
                /^vote_/, 
                /^poll_close_/, 
                /^poll_refresh_/, 
                /^birthday_gift_/, 
                /^join_bravery/, 
            ];
            
            if (ignoredIds.some(p => p instanceof RegExp ? p.test(customId) : p === customId)) return;
            
            // Dispatch to specific command button handlers only when the customId matches their namespace
            if (customId && customId.startsWith('kint_') && kintCommand?.handleButton) {
                await kintCommand.handleButton(interaction);
                return;
            }
            if (customId && customId.startsWith('valorant_') && valorantCommand?.handleButton) {
                await valorantCommand.handleButton(interaction);
                return;
            }
            return;
        }
    } catch (error) {
        console.error("Erreur de l'interaction :", error);
        client.addLog(`💥 Erreur grave sur une interaction de ${interaction.user.tag}: ${error.message}`);
        
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: '❌ Une erreur est survenue.', ephemeral: true });
        }
    }
});

// Événement presenceUpdate - Mise à jour de présence (pour les notifications Twitch)
client.on("presenceUpdate", async (oldPresence, newPresence) => {
    if (!newPresence || !newPresence.activities) return;

    // Notifications Twitch Kuromyi via Discord
    if (newPresence.userId === KUROMYI_USER_ID) {
        // Cherche l'activité streaming
        const streamActivity = newPresence.activities.find(
            (a) => a.type === 1 // Type 1 = Streaming
        );

        const channel = client.channels.cache.get(KUROMYI_CHANNEL);
        if (!channel) return;

        if (streamActivity) {
            // Si l'URL du stream change, on considère que c'est un nouveau stream
            if (!kuromyiLive || kuromyiLiveUrl !== streamActivity.url) {
                kuromyiLive = true;
                kuromyiLiveUrl = streamActivity.url;
                const embed = new EmbedBuilder()
                    .setTitle("🔴 Kuromyi est en live !")
                    .setDescription(`**${streamActivity.name}**\n[Regarder le stream](${streamActivity.url})`)
                    .setColor(0x9146FF)
                    .setThumbnail(newPresence.user.displayAvatarURL())
                    .setImage(`https://static-cdn.jtvnw.net/previews-ttv/live_user_${streamActivity.url.split("/").pop()}-1920x1080.jpg?t=${Date.now()}`)
                    .setTimestamp();

                await channel.send({ content: "@everyone", embeds: [embed] });
                console.log("✅ Notification Twitch envoyée pour Kuromyi.");
            }
        } else if (kuromyiLive) {
            // Kuromyi arrête le stream
            kuromyiLive = false;
            kuromyiLiveUrl = null;
        }
    }
});

// =============================================
// TÂCHES CRON (AUTOMATISATION)
// =============================================

// Tâche quotidienne à minuit (résultats, streaks, etc.)
cron.schedule('0 0 * * *', async () => {
    console.log('⏰ Tâche quotidienne exécutée à minuit.');
    client.addLog("⏰ Tâche quotidienne exécutée à minuit.");
    
    try {
        // Réinitialisation des résultats de vote
        const voteResultsPath = path.join(__dirname, 'voteResults.json');
        if (fs.existsSync(voteResultsPath)) {
            const voteResults = JSON.parse(fs.readFileSync(voteResultsPath, 'utf-8'));
            voteResults.votes = {};
            fs.writeFileSync(voteResultsPath, JSON.stringify(voteResults, null, 2));
            console.log('🗳️ Résultats de vote réinitialisés.');
            client.addLog("🗳️ Résultats de vote réinitialisés.");
        }
        
        // Vérification des streaks
        const xpData = loadXP();
        for (const userId in xpData) {
            if (xpData[userId].lastMessageDate) {
                const lastDate = new Date(xpData[userId].lastMessageDate);
                const today = new Date();
                const diffTime = Math.abs(today - lastDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                if (diffDays > 1) {
                    xpData[userId].streak = 0;
                }
            }
        }
        fs.writeFileSync(XP_FILE, JSON.stringify(xpData, null, 2));
        console.log('📅 Streaks vérifiées et mises à jour.');
        client.addLog("📅 Streaks vérifiées et mises à jour.");
        
        // Reset des fichiers de tracking quotidiens pour les jobs
        try {
            const jobsModule = require('./commands/jobs.js');
            const resetResult = jobsModule.resetDailyTrackingFiles();
            if (resetResult.success) {
                console.log(`✅ Fichiers de tracking des jobs réinitialisés (${resetResult.resetCount} fichiers).`);
                client.addLog(`✅ Fichiers de tracking des jobs réinitialisés (${resetResult.resetCount} fichiers).`);
            } else {
                console.warn(`⚠️ Reset des fichiers de tracking avec erreurs: ${resetResult.errorCount} erreur(s).`);
                client.addLog(`⚠️ Reset des fichiers de tracking avec erreurs: ${resetResult.errorCount} erreur(s).`);
            }
        } catch (jobsResetError) {
            console.error('❌ Erreur lors du reset des fichiers de tracking des jobs:', jobsResetError);
            client.addLog(`❌ Erreur lors du reset des fichiers de tracking des jobs: ${jobsResetError.message}`);
        }
        
        // Rotation des promotions du Black Market
        try {
            const { rotateBlackMarketPromos } = require('./blackmarketPromoManager.js');
            const promoResult = rotateBlackMarketPromos();
            if (promoResult.success) {
                console.log(`🕶️ Rotation des promotions Black Market effectuée : ${promoResult.promosCount} promo(s) active(s).`);
                client.addLog(`🕶️ Rotation des promotions Black Market effectuée : ${promoResult.promosCount} promo(s) active(s).`);
            } else {
                console.warn('⚠️ Erreur lors de la rotation des promotions Black Market.');
                client.addLog('⚠️ Erreur lors de la rotation des promotions Black Market.');
            }
        } catch (promoError) {
            console.error('❌ Erreur lors de la rotation des promotions Black Market:', promoError);
            client.addLog(`❌ Erreur lors de la rotation des promotions Black Market: ${promoError.message}`);
        }
        
        // Vérification des anniversaires
        await checkBirthdays(client);
        console.log('🎂 Vérification des anniversaires effectuée.');
        client.addLog("🎂 Vérification des anniversaires effectuée.");
        
        // Vérification des warns Kint
        await checkKintWarns(client);
        console.log('⚠️ Vérification des warns Kint effectuée.');
        client.addLog("⚠️ Vérification des warns Kint effectuée.");
        
        // Vérification des sondages
        await checkPolls(client);
        console.log('📊 Vérification des sondages effectuée.');
        client.addLog("📊 Vérification des sondages effectuée.");
    } catch (error) {
        console.error('❌ Erreur lors de la tâche quotidienne:', error);
        client.addLog(`❌ Erreur lors de la tâche quotidienne: ${error.message}`);
    }
});

// Tâche toutes les heures pour nettoyer les effets expirés (Boost XP, VIP Trial, etc.)
cron.schedule('0 * * * *', async () => {
    try {
        console.log('🧹 Nettoyage des effets expirés...');
        client.addLog('🧹 Nettoyage des effets expirés en cours...');
        
        const result = await cleanExpiredEffects(client);
        
        if (result.cleaned > 0) {
            console.log(`✅ Nettoyage terminé : ${result.cleaned} effet(s) expiré(s), ${result.rolesRemoved} rôle(s) retiré(s)`);
            client.addLog(`✅ Nettoyage des effets : ${result.cleaned} effet(s) expiré(s), ${result.rolesRemoved} rôle(s) retiré(s)`);
        } else {
            console.log('✅ Aucun effet expiré à nettoyer');
        }
    } catch (error) {
        console.error('❌ Erreur lors du nettoyage des effets:', error);
        client.addLog(`❌ Erreur lors du nettoyage des effets: ${error.message}`);
    }
});

// Tâche toutes les 5 minutes pour mettre à jour serverInfo.json
cron.schedule('*/5 * * * *', async () => {
    try {
        const guild = client.guilds.cache.first();
        if (!guild) return;
        
        const info = {
            guildId: guild.id,
            guildName: guild.name,
            guildIcon: guild.icon,
            memberCount: guild.memberCount,
            messageCount: loadServerInfo().messageCount || 0,
            messagesLast7Days: loadServerInfo().messagesLast7Days || [0,0,0,0,0,0,0],
            members: guild.members.cache.map((member) => ({
                id: member.id,
                username: member.user.username,
                avatar: member.user.displayAvatarURL({ format: 'png', size: 128, dynamic: true }),
                joinedAt: member.joinedAt,
                status: member.presence?.status || 'offline',
            })),
            lastUpdated: new Date().toISOString(),
        };
        
        fs.writeFileSync(serverInfoPath, JSON.stringify(info, null, 2));
        console.log('✅ serverInfo.json mis à jour automatiquement');
    } catch (error) {
        console.error('❌ Erreur lors de la mise à jour automatique de serverInfo.json:', error);
    }
});

// Tâche toutes les 5 minutes pour vérifier les streams Twitch
cron.schedule('*/5 * * * *', async () => {
    try {
        // Chargement sécurisé des données Twitch
        let streams = [];
        
        if (fs.existsSync(twitchFile)) {
            try {
                const rawData = fs.readFileSync(twitchFile, 'utf-8');
                const data = JSON.parse(rawData);
                
                // Vérification que data.streams existe et est un tableau
                if (data && Array.isArray(data.streams)) {
                    streams = data.streams;
                } else if (data && Array.isArray(data)) {
                    // Compatibilité avec l'ancien format où le fichier était directement un tableau
                    streams = data;
                } else {
                    console.log('⚠️ Format de twitch.json non reconnu');
                    return;
                }
            } catch (parseError) {
                console.error('❌ Erreur parsing twitch.json:', parseError);
                return;
            }
        }

        const guild = client.guilds.cache.first();
        if (!guild) return;
        
        for (const stream of streams) {
            try {
                const member = await guild.members.fetch(stream.userId).catch(() => null);
                if (!member) continue;
                
                const presence = member.presence;
                if (!presence || !presence.activities) continue;
                
                const twitchActivity = presence.activities.find(a => a.type === 1);
                if (twitchActivity && twitchActivity.url) {
                    const channel = client.channels.cache.get(stream.channelId);
                    if (channel) {
                        const embed = new EmbedBuilder()
                            .setTitle(`🔴 ${member.user.username} est en live !`)
                            .setDescription(`**${twitchActivity.name}**\n[Regarder le stream](${twitchActivity.url})`)
                            .setColor(0x9146FF)
                            .setThumbnail(member.user.displayAvatarURL())
                            .setTimestamp();
                        
                        await channel.send({ content: `@everyone`, embeds: [embed] });
                        console.log(`✅ Notification Twitch envoyée pour ${member.user.tag}`);
                    }
                }
            } catch (streamError) {
                console.error(`❌ Erreur avec le stream de ${stream.userId}:`, streamError);
            }
        }
    } catch (error) {
        console.error('❌ Erreur vérification Twitch:', error);
    }
});

// =============================================
// GESTION DES ERREURS NON CAPTURÉES
// =============================================
process.on('unhandledRejection', (error) => {
    console.error('❌ Rejet non géré:', error);
    client.addLog(`💥 Rejet non géré: ${error.message}`);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Exception non capturée:', error);
    client.addLog(`💥 Exception non capturée: ${error.message}`);
    process.exit(1);
});

// =============================================
// EXPORTS POUR LES TESTS ET AUTRES MODULES
// =============================================
module.exports = { client, app, server, addLog, loadXP, loadServerInfo, saveServerInfo, sendPatchNoteFromJSON, deployCommands, initServerInfo, loadVoiceConfig, ROLE_REWARDS, TEMP_VOICE_HUB_ID, KUROMYI_CHANNEL, KUROMYI_USER_ID, patchNoteChannelId, tempVoiceMap, ticketMessages, blockedServers, OWNER_ID };