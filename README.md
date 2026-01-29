# Guide de Modification : GM Base → PumpMyBag

## 🎯 Objectif
Transformer l'interface utilisateur de "GM Base" en "PumpMyBag" tout en gardant la logique et les noms de constantes intacts.

---

## 📁 Fichiers à Modifier

### 1. **README.md**
**Localisation** : Racine du projet

**À modifier** :
```markdown
# Ancien
# GM Base Mini App
A daily GM tracker on Base blockchain...

# Nouveau
# PumpMyBag Mini App
Track your daily bag pumps on Base blockchain where users can pump their bags once per day and build their streak!
```

**Autres changements dans README** :
- `## Features` : Remplacer "🎯 Say GM" → "🎯 Pump your bag"
- `🔥 Track your GM streak` → `🔥 Track your pump streak`
- `👥 GM to friends` → `👥 Pump for friends`
- `⏰ Countdown timer to next GM reset` → `⏰ Countdown timer to next pump reset`
- `📊 View global GM stats` → `📊 View global pump stats`

---

### 2. **minikit.config.ts**
**Localisation** : Racine du projet

**À modifier** :
```typescript
// Ancien
{
  name: "GM Base",
  subtitle: "Say GM every day on Base",
  description: "Daily GM streak tracker on Base blockchain",
  primaryCategory: "social",
  tags: ["social", "daily", "gm", "streak", "base", "blockchain"]
}

// Nouveau
{
  name: "PumpMyBag",
  subtitle: "Pump your bag every day on Base",
  description: "Daily pump streak tracker on Base blockchain",
  primaryCategory: "social",
  tags: ["social", "daily", "pump", "bags", "streak", "base", "blockchain"]
}
```

---

### 3. **app/page.tsx**
**Localisation** : `app/page.tsx`

**Textes à modifier** :
- `"Connect Wallet"` → Garder tel quel
- `"Tap to GM"` → `"Tap to Pump"`
- `"Global GM Count"` → `"Global Pumps"`
- `"Your GMs"` → `"Your Pumps"`
- `"GMs Received"` → `"Pumps Received"`
- Titre de la page : `<title>GM Base</title>` → `<title>PumpMyBag</title>`
- Tout texte "GM" affiché à l'utilisateur → "Pump"

**Notes** :
- Garder les noms de constantes/variables (ex: `gmCount`, `lastGM`)
- Modifier uniquement les strings affichées dans le JSX

---

### 4. **components/GMModal.tsx**
**Localisation** : `components/GMModal.tsx`

**À modifier** :
- Titre du modal : `"Choose GM Type"` → `"Choose Pump Type"`
- Bouton 1 : `"GM"` → `"Pump"`
- Description : `"Say GM to yourself"` → `"Pump your own bag"`
- Bouton 2 : `"GM to a Fren"` → `"Pump for a Fren"`
- Description : `"Say GM to a friend's address"` → `"Pump a friend's bag"`
- Message d'erreur : `"You've already GM'd today"` → `"You've already pumped today"`
- Messages de succès : `"GM sent!"` → `"Bag pumped!"`

---

### 5. **components/CountdownTimer.tsx**
**Localisation** : `components/CountdownTimer.tsx`

**À modifier** :
- `"Next GM available in:"` → `"Next pump available in:"`
- `"GM available now!"` → `"Pump available now!"`

---

### 6. **components/Stats.tsx**
**Localisation** : `components/Stats.tsx`

**À modifier** :
- `"Global GM Count"` → `"Global Pumps"`
- `"Your GMs"` → `"Your Pumps"`
- `"GMs Received"` → `"Pumps Received"`
- `"Current Streak"` → Garder ou `"Pump Streak"`

---

### 7. **components/WalletConnect.tsx**
**Localisation** : `components/WalletConnect.tsx`

**À modifier** :
- `"Connect Wallet"` → Garder tel quel (c'est standard)
- Si messages d'erreur avec "GM" → remplacer par "Pump"

---

### 8. **public/** (Images)
**Tu t'en occupes déjà !** ✅
- `icon.png` → Nouvelle icône PumpMyBag
- `cover.png` → Nouvelle image de couverture

---

## 🔍 Recherche Globale Suggérée

Pour ne rien oublier, fais une recherche dans tout le projet pour :
1. `"GM"` (entre guillemets) → Remplacer par `"Pump"` là où c'est visible par l'user
2. `"gm"` (entre guillemets) → Remplacer par `"pump"` si visible
3. Vérifier les balises `<title>`, `<meta>`, alt text d'images

---

## ⚠️ Ne PAS Modifier

- Noms de fonctions (ex: `gm()`, `gmTo()`)
- Noms de variables (ex: `gmCount`, `lastGM`, `streakGM`)
- Noms de constantes
- Adresse du smart contract
- Événements blockchain (`GMSent`, `StreakUpdated`)
- Code de logique métier

---

## 🎨 Exemple de Modification

**Avant (app/page.tsx)** :
```tsx
<button className="...">
  Tap to GM
</button>
<div>
  <p>Global GM Count: {globalGMs}</p>
  <p>Your GMs: {yourGMs}</p>
</div>
```

**Après** :
```tsx
<button className="...">
  Tap to Pump
</button>
<div>
  <p>Global Pumps: {globalGMs}</p>
  <p>Your Pumps: {yourGMs}</p>
</div>
```

---

## 📦 Checklist Finale

- [ ] README.md mis à jour
- [ ] minikit.config.ts mis à jour
- [ ] app/page.tsx - Tous les textes UI modifiés
- [ ] components/GMModal.tsx - Modal et messages modifiés
- [ ] components/CountdownTimer.tsx - Messages modifiés
- [ ] components/Stats.tsx - Labels modifiés
- [ ] Images dans public/ remplacées (ton travail ✅)
- [ ] Test : `npm run dev` pour vérifier l'interface
- [ ] Recherche globale `"GM"` pour vérifier qu'aucun texte visible n'a été oublié

---

## 🚀 Après les Modifications

1. Teste localement : `npm run dev`
2. Vérifie que tous les textes affichent "Pump" au lieu de "GM"
3. Vérifie que la connexion wallet et les transactions fonctionnent toujours
4. Deploy sur Vercel

Bonne chance ! 💪
