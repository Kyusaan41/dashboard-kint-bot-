import type { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // VÃ©rifier mÃ©thode POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // TODO: Ajouter authentification/admin check ici pour sÃ©curiser

  // Commande PM2 pour redÃ©marrer le bot (adapter selon ton nom de process)
  exec('pm2 restart my-discord-bot', (error, stdout, stderr) => {
    if (error) {
      console.error('Erreur lors du redÃ©marrage :', error);
      return res.status(500).json({ message: 'Erreur serveur lors du redÃ©marrage' });
    }
    console.log('RedÃ©marrage rÃ©ussi:', stdout);
    return res.status(200).json({ message: 'Bot redÃ©marrÃ© avec succÃ¨s' });
  });
}

