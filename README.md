# Premiers Pas — Application Mobile

> Application mobile destinée aux nouveaux arrivants au Québec pour faciliter leur intégration dans la vie quotidienne.

**Développeur :** Franchesco Jordan  
**Programme :** DEC Technique informatique — Collège O'Sullivan Québec  
**Version :** 1.0.0  
**Année :** 2026  

---

## 📱 Aperçu

Premiers Pas est une application React Native / Expo qui aide les nouveaux arrivants au Québec à naviguer dans leur nouvelle vie. Elle couvre six modules essentiels : démarches administratives, transport, climat, santé, vocabulaire québécois et vie quotidienne.

---

## 🚀 Installation et démarrage

### Prérequis

Avant de commencer, assure-toi d'avoir installé :

| Outil | Version recommandée |
|-------|-------------------|
| Node.js | 18.x ou plus |
| npm | 9.x ou plus |
| Expo CLI | Dernière version |
| Git | Dernière version |

Pour vérifier tes versions :
```bash
node --version
npm --version
git --version
```

### Cloner le projet

```bash
git clone <https://github.com/Spirituel-Franchesco/Premiers-Pas>
cd premiers-pas
```

### Installer les dépendances

```bash
npm install --legacy-peer-deps
```

### Lancer le projet

```bash
npx expo start
```

Ensuite :
- **iPhone** : Scanne le QR code avec l'app **Expo Go**
- **Android** : Scanne le QR code avec l'app **Expo Go**
- **Émulateur Android** : Appuie sur `a` dans le terminal
- **Simulateur iOS** : Appuie sur `i` dans le terminal

---

## 📦 Dépendances principales

```json
{
  "expo": "~54.0.0",
  "react": "18.3.2",
  "react-native": "0.76.7",
  "@react-navigation/native": "^7.0.14",
  "@react-navigation/stack": "^7.1.1",
  "firebase": "^11.2.0",
  "@react-native-async-storage/async-storage": "^2.1.0",
  "react-i18next": "^15.4.0",
  "i18next": "^24.2.2",
  "expo-location": "~18.0.4",
  "expo-av": "~15.0.2",
  "@expo-google-fonts/poppins": "^0.2.3"
}
```

Pour installer toutes les dépendances Expo :
```bash
npx expo install expo-location expo-av @expo-google-fonts/poppins
```

---

## ⚙️ Configuration Firebase

### 1. Créer un projet Firebase

1. Va sur [console.firebase.google.com](https://console.firebase.google.com)
2. Crée un nouveau projet nommé `premiers-pas`
3. Active **Cloud Firestore** en mode production

### 2. Configurer les variables

Dans le fichier `firebaseConfig.js` à la racine du projet :

```javascript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "VOTRE_API_KEY",
  authDomain: "VOTRE_AUTH_DOMAIN",
  projectId: "VOTRE_PROJECT_ID",
  storageBucket: "VOTRE_STORAGE_BUCKET",
  messagingSenderId: "VOTRE_MESSAGING_SENDER_ID",
  appId: "VOTRE_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app;
```

### 3. Structure Firestore requise

```
cities/
├── quebec/
│   ├── transport/info
│   ├── health/info
│   └── places/ (collection)
├── levis/
│   ├── transport/info
│   ├── health/info
│   └── places/ (collection)
└── montreal/
    ├── transport/info
    ├── health/info
    └── places/ (collection)

vocabulary/
└── expressions/
    └── items/ (collection)
```

---

## 🗂️ Structure du projet

```
premiers-pas/
├── assets/                    # Assets racine (icônes, splash)
│   ├── icon.png
│   └── splash-icon.png
├── src/
│   ├── assets/
│   │   ├── audio/             # Fichiers MP3 prononciation
│   │   ├── images/
│   │   │   └── places/        # Images des lieux historiques
│   │   └── logo.png
│   ├── context/
│   │   └── ThemeContext.js    # Contexte thème sombre/clair
│   ├── locales/
│   │   ├── fr.json            # Traductions françaises
│   │   ├── en.json            # Traductions anglaises
│   │   └── es.json            # Traductions espagnoles
│   ├── screens/
│   │   ├── SplashScreen.js
│   │   ├── OnboardingScreen.js
│   │   ├── HomeScreen.js
│   │   ├── AdminStepsScreen.js
│   │   ├── TransportScreen.js
│   │   ├── ClimateScreen.js
│   │   ├── HealthScreen.js
│   │   ├── VocabularyScreen.js
│   │   ├── DailyLifeScreen.js
│   │   ├── GuidesScreen.js
│   │   └── SettingsScreen.js
│   ├── services/
│   │   ├── firebaseService.js
│   │   ├── storageService.js
│   │   └── translationService.js
│   └── styles/
│       ├── colors.js
│       ├── typography.js
│       └── globalStyles.js
├── App.js
├── firebaseConfig.js
└── package.json
```

---

## 🌍 Langues supportées

| Code | Langue |
|------|--------|
| `fr` | Français (défaut) |
| `en` | Anglais |
| `es` | Espagnol |

---

## 📋 Modules de l'application

| Module | Description |
|--------|-------------|
| 📋 Démarches | Étapes administratives essentielles (NAS, RAMQ, banque...) |
| 🚌 Transport | Tarifs, guides, itinéraires et stations par ville |
| ❄️ Climat | Météo en temps réel et guide des 4 saisons |
| 🏥 Santé | RAMQ, CLSC, cliniques et Info-Santé 811 |
| 💬 Vocabulaire | 30+ expressions québécoises avec audio |
| 🏪 Vie Quotidienne | Services GPS et lieux historiques par ville |
| 📚 Guides | Manuel d'utilisation de l'application |
| ⚙️ Réglages | Langue, ville, thème clair/sombre |

---

## 🏙️ Villes supportées

- **Québec** — Réseau RTC
- **Lévis** — Réseau STLévis
- **Montréal** — Réseau STM

---

## 🛠️ Technologies utilisées

| Technologie | Usage |
|-------------|-------|
| React Native | Framework mobile |
| Expo SDK 54 | Plateforme de développement |
| Firebase Firestore | Base de données cloud |
| AsyncStorage | Stockage local |
| React Navigation | Navigation entre écrans |
| react-i18next | Internationalisation |
| expo-location | Géolocalisation GPS |
| expo-av | Lecture audio MP3 |
| Open-Meteo API | Données météo (gratuite) |

---

## 🔒 Permissions requises

| Permission | Usage |
|------------|-------|
| Localisation | Trouver services et arrêts proches |
| Internet | Données Firestore et météo |

---

## 📝 Notes de développement

- Le projet utilise `--legacy-peer-deps` pour la compatibilité des dépendances
- Les images des lieux historiques sont stockées localement dans `src/assets/images/places/`
- Les fichiers audio MP3 sont stockés localement dans `src/assets/audio/`
- Le thème sombre/clair est géré via React Context et sauvegardé dans AsyncStorage
- Aucune authentification requise — l'app fonctionne sans compte utilisateur

---

## 📞 Contact

**Franchesco Jordan Seugue Seyanze** 
jordanseugue@gmail.com 
Collège O'Sullivan Québec  
DEC Technique informatique — 2026
