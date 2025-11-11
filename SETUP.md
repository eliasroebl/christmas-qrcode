# 🚀 Schnellstart-Anleitung

Diese Anleitung hilft dir, die QR-Code Spenden-Plattform in 5 Minuten zum Laufen zu bringen.

## ⚡ Quick Setup (Lokal)

### 1. Repository klonen
```bash
git clone https://github.com/eliasroebl/christmas-qrcode.git
cd christmas-qrcode
```

### 2. Dependencies installieren
```bash
npm install
```

### 3. Umgebungsvariablen konfigurieren

Die `.env`-Datei existiert bereits, aber du musst die E-Mail-Einstellungen anpassen:

**Option A: Gmail verwenden**

1. Gehe zu deinem Google-Konto: https://myaccount.google.com/
2. Sicherheit → 2-Faktor-Authentifizierung aktivieren
3. Sicherheit → App-Passwörter
4. Wähle "Mail" → Gerät auswählen
5. Kopiere das generierte 16-stellige Passwort

Bearbeite `.env`:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=deine-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx  # 16-stelliges App-Passwort
EMAIL_FROM=deine-email@gmail.com
```

**Option B: SendGrid verwenden (empfohlen für Produktion)**

1. Account erstellen: https://sendgrid.com/
2. API-Key generieren
3. SMTP-Credentials notieren

Bearbeite `.env`:
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=dein-sendgrid-api-key
EMAIL_FROM=noreply@deine-domain.com
```

**Admin-Passwort ändern:**
```env
ADMIN_PASSWORD=dein-sicheres-passwort
```

### 4. Datenbank initialisieren

```bash
npm run init-db
```

Du solltest sehen:
```
✓ Connected to SQLite database
✓ Database tables created successfully
```

### 5. Server starten

```bash
npm run dev
```

Öffne im Browser: http://localhost:3000

## 📱 Erste Schritte

### Admin-Dashboard öffnen

1. Gehe zu: http://localhost:3000/admin.html
2. Login mit deinem `ADMIN_PASSWORD` aus `.env`
3. Klicke auf "PDF Generieren & Herunterladen"
4. Wähle z.B. 10 QR-Codes zum Testen
5. PDF wird heruntergeladen

### QR-Code testen

**Als Spender (Österreich):**

1. Öffne das heruntergeladene PDF
2. Scanne einen QR-Code mit deinem Handy ODER
3. Kopiere die URL aus dem Browser-Network-Tab
4. Gib deine E-Mail-Adresse ein
5. Bestätige deine E-Mail (check Posteingang!)

**Als Empfänger (Ukraine):**

1. Nach E-Mail-Bestätigung: Scanne denselben QR-Code nochmal
2. Die Seite zeigt jetzt die ukrainische UI
3. Lade ein Testbild hoch
4. Schreibe eine Nachricht
5. Absenden

**Ergebnis:**

Die Spender-E-Mail erhält automatisch eine E-Mail mit:
- Dem hochgeladenen Foto als Anhang
- Der Nachricht im E-Mail-Text

## 🐳 Docker Setup (Optional)

Wenn du Docker bevorzugst:

```bash
# .env-Datei anpassen (siehe oben)

# Docker-Container starten
docker-compose up -d

# Logs anzeigen
docker-compose logs -f
```

Server läuft auf: http://localhost:3000

## 🌐 Deployment (Produktion)

### Railway (Empfohlen, kostenlos)

1. Erstelle Account: https://railway.app
2. "New Project" → "Deploy from GitHub"
3. Repository auswählen
4. **Environment Variables** hinzufügen (alle aus `.env`):
   ```
   NODE_ENV=production
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=...
   EMAIL_PASSWORD=...
   EMAIL_FROM=...
   APP_URL=https://deine-railway-url.up.railway.app
   ADMIN_PASSWORD=...
   ```
5. Deploy!

Railway generiert automatisch eine URL wie: `your-app.up.railway.app`

**WICHTIG:** Setze `APP_URL` auf deine Railway-URL!

### Render.com

1. Account erstellen: https://render.com
2. "New Web Service"
3. GitHub-Repository verbinden
4. Settings:
   - **Build Command**: `npm install && npm run init-db`
   - **Start Command**: `npm start`
5. Environment Variables hinzufügen (siehe Railway)
6. Deploy!

## ✅ Checkliste vor Produktiv-Betrieb

- [ ] `.env` Datei vollständig ausgefüllt
- [ ] E-Mail-Versand getestet (Test-E-Mail erhalten?)
- [ ] Admin-Passwort geändert
- [ ] `APP_URL` auf Produktions-URL gesetzt
- [ ] QR-Codes generiert und ausgedruckt
- [ ] Kompletten Workflow einmal durchgespielt
- [ ] Datenschutzerklärung angepasst (Organisations-Name)
- [ ] HTTPS aktiviert (Railway/Render machen das automatisch)

## 🆘 Hilfe bei Problemen

### E-Mails kommen nicht an

1. **Spam-Ordner prüfen**
2. **Gmail**: Stelle sicher, dass du ein App-Passwort verwendest (nicht dein normales Passwort)
3. **Server-Logs prüfen**: `npm run dev` (im Terminal nach Fehlern suchen)
4. **E-Mail-Credentials testen**:
   ```bash
   # Im Terminal
   node -e "console.require('dotenv').config(); console.log(process.env.EMAIL_USER)"
   ```

### QR-Code funktioniert nicht

1. **URL prüfen**: Sollte so aussehen: `http://localhost:3000/scan?code=XXXXXXXX-XXXX-...`
2. **Browser-Konsole öffnen** (F12) → Fehler prüfen
3. **Datenbank prüfen**:
   ```bash
   sqlite3 database.sqlite
   > SELECT * FROM qr_codes LIMIT 1;
   ```

### Port 3000 bereits belegt

Ändere in `.env`:
```env
PORT=3001
```

## 📞 Support

- **GitHub Issues**: https://github.com/eliasroebl/christmas-qrcode/issues
- **README**: Siehe `README.md` für detaillierte Dokumentation

---

**Viel Erfolg mit deinem Hilfsprojekt! 🎁💙💛**
