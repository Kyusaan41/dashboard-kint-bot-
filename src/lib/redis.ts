import { createClient } from 'redis';

// Assurez-vous que votre variable d'environnement REDIS_URL est bien définie
// dans votre projet Vercel et dans votre fichier .env.local pour le développement.
const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  // En production, Vercel lèvera une erreur si la variable n'est pas définie.
  // En local, cela vous alertera qu'il manque la configuration.
  console.error('La variable d\'environnement REDIS_URL n\'est pas définie.');
}

const redisClient = createClient({
  url: redisUrl
});

redisClient.on('error', (err) => console.error('Erreur du client Redis:', err));

redisClient.connect();

export default redisClient;