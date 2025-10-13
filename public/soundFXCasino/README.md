# 🎰 Sons du Casino - Guide d'installation

Ce dossier contient tous les effets sonores et la musique de fond pour la page Casino Slot Machine.

## 📁 Fichiers audio requis

Placez vos fichiers audio dans ce dossier avec les noms **EXACTS** suivants :

### 🎵 Musique de fond
- **`bg_sound.mp3`** - Musique d'ambiance du casino (joue en boucle)
  - Volume: 15% (réglé automatiquement)
  - Format recommandé: MP3, durée 1-3 minutes

### 🎮 Effets sonores du jeu

1. **`spin_sound.mp3`** - Son joué quand on lance les roues
   - Moment: Au début du spin
   - Durée recommandée: 0.5-1 seconde

2. **`reel_stop.mp3`** - Son joué à chaque arrêt de roue
   - Moment: Quand chaque roue s'arrête (3 fois par tour)
   - Durée recommandée: 0.2-0.5 seconde

3. **`win_sound.mp3`** - Son de victoire pour 2 symboles alignés
   - Moment: Gain avec 2 symboles identiques
   - Durée recommandée: 1-2 secondes

4. **`sequence3_sound.mp3`** - Son spécial pour 3 symboles alignés
   - Moment: Gain avec 3 symboles identiques (mais pas jackpot)
   - Durée recommandée: 2-3 secondes
   - Style: Plus impressionnant que win_sound

5. **`jackpot_sound.mp3`** - Son de JACKPOT (7️⃣ x3)
   - Moment: Jackpot avec 3 symboles 7️⃣
   - Durée recommandée: 3-5 secondes
   - Style: Le plus spectaculaire !

6. **`lose_sound.mp3`** - Son de défaite
   - Moment: Quand le joueur perd
   - Durée recommandée: 0.5-1 seconde

## 🔊 Paramètres de volume

- **Musique de fond**: 15% (volume bas pour ne pas couvrir les effets)
- **Effets sonores**: 40% (volume modéré)

## 🎨 Recommandations

### Formats supportés
- MP3 (recommandé)
- WAV
- OGG

### Style sonore suggéré
- **bg_sound**: Musique électronique/synthwave, ambiance casino moderne
- **spin_sound**: Son mécanique de roue qui tourne
- **reel_stop**: "Clunk" ou "Click" satisfaisant
- **win_sound**: Jingle joyeux, pièces qui tombent
- **sequence3_sound**: Fanfare courte, plus intense que win_sound
- **jackpot_sound**: Fanfare complète, célébration maximale
- **lose_sound**: Son descendant, "aww" ou triste

## 🔧 Contrôle des sons

Un bouton de contrôle du son (🔊/🔇) est disponible en haut à droite de la page pour :
- Activer/désactiver tous les sons
- Mettre en pause/reprendre la musique de fond

## ⚠️ Important

- Les noms de fichiers doivent être **EXACTEMENT** comme indiqué ci-dessus
- Si un fichier est manquant, une erreur sera affichée dans la console du navigateur
- Les fichiers doivent être placés directement dans `/public/soundFXCasino/`
- Pas de sous-dossiers !

## 🎯 Exemple de structure

```
public/
└── soundFXCasino/
    ├── bg_sound.mp3
    ├── spin_sound.mp3
    ├── reel_stop.mp3
    ├── win_sound.mp3
    ├── sequence3_sound.mp3
    ├── jackpot_sound.mp3
    ├── lose_sound.mp3
    └── README.md (ce fichier)
```

## 🎼 Ressources pour trouver des sons

- [Freesound.org](https://freesound.org/) - Sons gratuits et libres
- [Zapsplat.com](https://www.zapsplat.com/) - Effets sonores gratuits
- [Incompetech.com](https://incompetech.com/) - Musique libre de droits
- [Pixabay Music](https://pixabay.com/music/) - Musique et sons gratuits

---

**Créé pour le Casino Slot Machine de Kint Dashboard**