import { io } from 'socket.io-client';

// URL de votre serveur bot
const URL = 'http://193.70.34.25:20007';

export const socket = io(URL, {
    autoConnect: false // On ne se connecte pas automatiquement au chargement
});
