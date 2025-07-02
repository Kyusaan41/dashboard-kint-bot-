import type { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Vérifier méthode POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // TODO: Ajouter authentification/admin check ici pour sécuriser

  // Commande PM2 pour redémarrer le bot (adapter selon ton nom de process)
  exec('pm2 restart my-discord-bot', (error, stdout, stderr) => {
    if (error) {
      console.error('Erreur lors du redémarrage :', error);
      return res.status(500).json({ message: 'Erreur serveur lors du redémarrage' });
    }
    console.log('Redémarrage réussi:', stdout);
    return res.status(200).json({ message: 'Bot redémarré avec succès' });
  });
}
