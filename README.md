# Währungsrechner

Live-Währungsrechner mit Daten der Europäischen Zentralbank via [frankfurter.app](https://frankfurter.app).

## 🚀 Auf GitHub Pages hosten

### 1. Repository erstellen
- Gehe zu github.com → „New repository"
- Name: `currency-converter` (oder beliebig)
- Public ✓ → Create

### 2. vite.config.js anpassen
Öffne `vite.config.js` und ersetze `currency-converter` mit deinem Repository-Namen:
```js
base: '/DEIN-REPO-NAME/',
```

### 3. Dateien hochladen
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/DEIN-USERNAME/DEIN-REPO-NAME.git
git push -u origin main
```

### 4. GitHub Pages aktivieren
- Repository → Settings → Pages
- Source: **GitHub Actions**
- Speichern

Nach dem nächsten Push wird die App automatisch gebaut und unter  
`https://DEIN-USERNAME.github.io/DEIN-REPO-NAME/` erreichbar sein.

## 💻 Lokal starten
```bash
npm install
npm run dev
```

## Datenquelle
Wechselkurse von der Europäischen Zentralbank via [frankfurter.app](https://frankfurter.app) – kostenlos, kein API-Key nötig.
