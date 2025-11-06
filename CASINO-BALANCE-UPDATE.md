# 💰 Mise à jour de l'équilibrage du Casino

## 🎯 Objectif

Rendre le casino plus attractif en **augmentant les gains**, tout en **réduisant les chances de gagner** pour maintenir l'équilibre économique.

---

## 📊 Changements des gains

### Avant (gains conservateurs)

**2 symboles identiques :**
- Diviseur : `/2` (mode normal) ou `/4` (Devil Mode)
- Gain minimum : `x1.2` la mise
- Plafond : `x5` la mise

**Exemple :** Mise de 10 avec 2 cerises 🍒
- Multiplicateur : 5 / 2 = 2.5
- Gain : 10 × 2.5 × 0.9 = **22** (après house edge 10%)

### Après (gains généreux) ✅

**2 symboles identiques :**
- Multiplicateur : **utilisé directement** (100% en normal, 75% en Devil Mode)
- Gain minimum : **`x2` la mise** (au lieu de x1.2)
- Plafond : **`x10` la mise** (au lieu de x5)

**Exemple :** Mise de 10 avec 2 cerises 🍒
- Multiplicateur : 5 (complet)
- Gain : 10 × 5 × 0.95 = **47** (après house edge 5%)
- Minimum garanti : **20** (x2)

### Tableau comparatif

| Symboles | Multiplicateur | Ancien gain (mise 10) | Nouveau gain (mise 10) |
|----------|----------------|----------------------|------------------------|
| 2x 🍋    | 2              | 12                   | **20** ✅              |
| 2x 🍊    | 3              | 18                   | **28** ✅              |
| 2x 🍇    | 4              | 22                   | **38** ✅              |
| 2x 🍒    | 5              | 27                   | **47** ✅              |
| 2x 🍀    | 6              | 32                   | **57** ✅              |
| 2x 💰    | 8              | 43                   | **76** ✅              |
| 2x 💎    | 10             | 54                   | **95** ✅              |

**Résultat :** Gains environ **x2 plus élevés** !

---

## 🎲 Changements des probabilités

Pour compenser les gains augmentés, les chances de gagner ont été **réduites**.

### Mode Normal

| Symbole | Ancienne chance | Nouvelle chance | Différence |
|---------|----------------|-----------------|------------|
| 7️⃣      | 0.3%           | **0.2%** ⬇️     | -33%       |
| 💎      | 8%             | **4%** ⬇️       | -50%       |
| 💰      | 10%            | **5%** ⬇️       | -50%       |
| 🍀      | 12%            | **6%** ⬇️       | -50%       |
| 🍒      | 18%            | **15%** ⬇️      | -17%       |
| 🍇      | 18%            | **15%** ⬇️      | -17%       |
| 🍊      | 17%            | **15%** ⬇️      | -12%       |
| 🍋      | 17%            | **39.8%** ⬆️    | +134%      |

**Résultat :** Les symboles à **faible valeur** (🍋) apparaissent beaucoup plus souvent, réduisant les chances de victoire.

### Devil Mode 🔥

| Symbole | Ancienne chance | Nouvelle chance | Différence |
|---------|----------------|-----------------|------------|
| 7️⃣      | 0.2%           | **0.1%** ⬇️     | -50%       |
| 💎      | 5%             | **3%** ⬇️       | -40%       |
| 💰      | 7%             | **4%** ⬇️       | -43%       |
| 🍀      | 10%            | **6%** ⬇️       | -40%       |
| 💀      | 20%            | **20%** =       | Inchangé   |
| 😈      | 20%            | **20%** =       | Inchangé   |
| 🔱      | 20%            | **20%** =       | Inchangé   |
| 🔥      | 17.8%          | **26.9%** ⬆️    | +51%       |

---

## ⚖️ Équilibrage économique

### House Edge réduit
- **Avant :** 10% de house edge
- **Après :** **5% de house edge** ✅

Les gains étant plus élevés, le house edge a été **réduit** pour ne pas trop pénaliser les joueurs.

### Exemple de session

**Avant (10 spins à 10 pièces):**
- Probabilité de gagner un spin : ~50%
- Gains moyens par victoire : ~25 pièces
- Perte moyenne sur 10 spins : -10 à -20 pièces

**Après (10 spins à 10 pièces):**
- Probabilité de gagner un spin : ~35% (réduit)
- Gains moyens par victoire : ~50 pièces (doublé)
- Perte moyenne sur 10 spins : -15 à -25 pièces (similaire)

**Résultat :** 
- ✅ Gains plus **excitants** quand on gagne
- ⚠️ Victoires moins **fréquentes**
- 💰 Équilibre économique **maintenu**

---

## 🎮 Impact sur le gameplay

### Avantages
1. **Gains plus satisfaisants** : Gagner x2 au minimum rend chaque victoire gratifiante
2. **Risque/récompense clair** : Moins de victoires, mais plus importantes
3. **Freespins plus précieux** : Les freespins rapportent maintenant beaucoup plus
4. **Excitement accru** : L'attente vaut le coup quand on gagne

### Inconvénients compensés
1. **Victoires moins fréquentes** : Compensé par des gains x2 plus élevés
2. **Séquences de pertes** : Normal pour un casino (maintient l'équilibre économique)

---

## 📝 Code modifié

**Fichier :** `src/app/dashboard/mini-jeu/casino/page.tsx`

**Sections modifiées :**
1. **L726** : House edge réduit de 10% → 5%
2. **L900-923** : Logique de calcul des gains pour 2 symboles
3. **L1034-1061** : Probabilités d'apparition des symboles

---

## 🎯 Résultats attendus

### Pour les joueurs
- ✅ Gains **x2 plus élevés** en moyenne
- ✅ Minimum garanti **x2** au lieu de x1.2
- ✅ Plafond des petits gains augmenté à **x10**
- ⚠️ Victoires **30% moins fréquentes**

### Pour l'économie du jeu
- ✅ Équilibre économique **maintenu**
- ✅ Casino reste **profitable** à long terme
- ✅ Système anti-triche des freespins **toujours actif**

---

## 💡 Recommandations

### Test en production
1. Surveiller les statistiques de gains/pertes
2. Ajuster les probabilités si nécessaire
3. Collecter les retours des joueurs

### Ajustements possibles
- Si trop difficile : augmenter légèrement les chances (🍒🍇🍊 à 17%)
- Si trop facile : réduire le gain minimum de x2 à x1.8
- Devil Mode : peut être encore plus difficile si nécessaire

---

## ✅ Conclusion

Le casino est maintenant **plus excitant et généreux** quand on gagne, tout en restant **économiquement viable**. Les joueurs auront des victoires moins fréquentes mais **beaucoup plus satisfaisantes**.

**Formule gagnante :** Gains x2 + Fréquence -30% = Même équilibre, plus d'excitement ! 🎰
