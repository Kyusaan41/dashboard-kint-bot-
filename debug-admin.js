// Script pour vérifier les IDs d'admin
const adminIds = (process.env.NEXT_PUBLIC_ADMIN_IDS ?? '').split(',').map(id => id.trim());
console.log('Admin IDs:', adminIds);
console.log('User ID:', 'ID_DE_VOTRE_AMI'); // Remplacez avec l'ID réel
console.log('Is admin?', adminIds.includes('ID_DE_VOTRE_AMI'));
