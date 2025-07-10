import { io } from 'socket.io-client';

// URL de votre serveur bot
const URL = 'http://51.83.103.24:20077';

export const socket = io(URL, {
    autoConnect: false // On ne se connecte pas automatiquement au chargement
});