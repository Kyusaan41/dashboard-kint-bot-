import GachaLoader from './GachaLoader';

/**
 * C'est un Composant Serveur.
 * Son seul rôle est de rendre le composant Loader, qui est un composant client
 * et qui gère la logique de maintenance et de chargement dynamique.
 */
export default function GachaPage() {
  // On délègue toute la logique au composant client GachaLoader.
  return <GachaLoader />;
}