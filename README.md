# 🎁 QR-Code Spenden-Plattform

Eine Web-Applikation, die österreichische Spender mit ukrainischen Empfängern durch QR-Codes und personalisierte Dankesnachrichten verbindet.

## 💡 Konzept

1. **Hilfsorganisation** druckt QR-Codes und klebt sie auf Geschenkpakete
2. **Spender (AT)** scannt QR-Code → gibt E-Mail-Adresse ein
3. **Paket** wird in die Ukraine verschickt
4. **Empfänger (UA)** öffnet Paket → scannt QR-Code → lädt Dankesfoto hoch
5. **Spender** erhält automatisch E-Mail mit Foto und Nachricht

## ✨ Features

- 📱 **QR-Code Generierung**: Erstellt 100-300 eindeutige QR-Codes als PDF (15/Seite)
- 🇦🇹 **Deutsche UI**: Für österreichische Spender
- 🇺🇦 **Ukrainische UI**: Für ukrainische Empfänger
- 📧 **E-Mail-Verifizierung**: Sicherstellen der korrekten E-Mail-Adresse
- 📸 **Foto-Upload**: Max. 5MB, JPG/PNG
- 💌 **Automatischer E-Mail-Versand**: Mit Foto und Nachricht
- 📊 **Admin-Dashboard**: Statistiken und Verwaltung
- 🔒 **DSGVO-konform**: Auto-Löschung nach 12 Monaten
- 🚫 **Datenschutz**: Keine direkten Kontaktdaten-Austausch

## 🛠️ Tech Stack

- **Backend**: Node.js + Express
- **Database**: SQLite
- **QR-Generierung**: qrcode + PDFKit
- **E-Mail**: Nodemailer
- **Upload**: Multer
- **Frontend**: Vanilla HTML/CSS/JS

## 📋 Voraussetzungen

- Node.js (v16 oder höher)
- npm oder yarn
- SMTP E-Mail-Server (z.B. Gmail, SendGrid)

## 🚀 Installation

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

Kopiere `.env.example` zu `.env`:

```bash
cp .env.example .env
```

Bearbeite `.env` und fülle folgende Werte aus:

```env
# Server
PORT=3000
NODE_ENV=production

# E-Mail (Beispiel für Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=ihre-email@gmail.com
EMAIL_PASSWORD=ihr-app-passwort
EMAIL_FROM=noreply@ihre-organisation.at

# App URL (Produktions-URL)
APP_URL=https://ihre-domain.com

# Admin-Passwort (ÄNDERN!)
ADMIN_PASSWORD=sicheres-passwort-hier
```

**Gmail App-Passwort erstellen:**
1. Google-Konto → Sicherheit
2. 2-Faktor-Authentifizierung aktivieren
3. App-Passwörter → "Mail" auswählen
4. Generiertes Passwort in `.env` einfügen

### 4. Datenbank initialisieren

```bash
npm run init-db
```

### 5. Server starten

**Entwicklung:**
```bash
npm run dev
```

**Produktion:**
```bash
npm start
```

Server läuft auf `http://localhost:3000`

## 📖 Verwendung

### Admin-Bereich

1. Öffne `http://localhost:3000/admin.html`
2. Login mit dem Passwort aus `.env` (Standard: `admin123`)
3. QR-Codes generieren (100-300 Stück)
4. PDF herunterladen und ausdrucken
5. QR-Codes auf Geschenkpakete kleben

### Workflow

**Schritt 1: Spender (Österreich)**
- Scannt QR-Code → Deutsche UI erscheint
- Gibt E-Mail-Adresse ein
- Erhält Bestätigungs-E-Mail
- Klickt auf Bestätigungs-Link

**Schritt 2: Empfänger (Ukraine)**
- Öffnet Geschenkpaket
- Scannt denselben QR-Code → Ukrainische UI erscheint
- Lädt Foto hoch (max. 5MB)
- Schreibt optionale Nachricht
- Sendet Dankesnachricht

**Schritt 3: Automatisch**
- System sendet E-Mail an Spender
- E-Mail enthält Foto und Nachricht
- Spender erhält persönliche Dankesnachricht

## 🗂️ Projektstruktur

```
christmas-qrcode/
├── server.js                 # Express-Server
├── package.json
├── .env                      # Umgebungsvariablen (nicht in Git!)
├── database.sqlite           # SQLite DB (wird erstellt)
│
├── src/
│   ├── config/
│   │   └── database.js       # DB-Konfiguration
│   │
│   ├── models/
│   │   ├── QRCode.js         # QR-Code Model
│   │   └── EmailLog.js       # E-Mail Log Model
│   │
│   ├── routes/
│   │   ├── qrRoutes.js       # QR-Generierung
│   │   ├── scanRoutes.js     # Scan & Upload
│   │   └── adminRoutes.js    # Admin-Endpoints
│   │
│   ├── services/
│   │   ├── qrService.js      # QR/PDF-Generierung
│   │   └── emailService.js   # E-Mail-Versand
│   │
│   └── utils/
│       └── initDb.js         # DB-Initialisierung
│
├── public/                   # Frontend
│   ├── index.html           # Landingpage
│   ├── scan.html            # Scan-Seite (DE/UA)
│   ├── verify.html          # E-Mail-Verifizierung
│   ├── status.html          # Status-Tracking
│   ├── admin.html           # Admin-Dashboard
│   └── privacy.html         # Datenschutzerklärung
│
└── uploads/                 # Hochgeladene Fotos (nicht in Git!)
```

## 🔌 API-Endpoints

### QR-Code Generierung
```
POST /api/qr/generate
Body: { "count": 100 }
→ Returns: PDF-Datei
```

### Spender-Registrierung
```
POST /api/scan/register-donor
Body: {
  "token": "qr-token",
  "email": "spender@email.at",
  "gdprConsent": true
}
```

### E-Mail-Verifizierung
```
GET /api/scan/verify/:verificationToken
```

### Empfänger-Upload
```
POST /api/scan/upload-recipient
FormData: {
  "token": "qr-token",
  "photo": File,
  "message": "Danke!"
}
```

### Status prüfen
```
GET /api/scan/status/:token
```

### Admin-Statistiken
```
GET /api/admin/statistics
Header: Authorization: Bearer {ADMIN_PASSWORD}
```

### Alle QR-Codes
```
GET /api/admin/qr-codes
Header: Authorization: Bearer {ADMIN_PASSWORD}
```

## 🗄️ Datenbank-Schema

### `qr_codes` Tabelle

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| id | INTEGER | Primary Key |
| token | TEXT | Eindeutiger QR-Token (UUID) |
| status | TEXT | UNUSED, DONOR_REGISTERED, COMPLETED, EXPIRED |
| donor_email | TEXT | E-Mail des Spenders |
| donor_verified | INTEGER | 0/1 (E-Mail bestätigt?) |
| verification_token | TEXT | Token für E-Mail-Verifizierung |
| recipient_photo_path | TEXT | Pfad zum hochgeladenen Foto |
| recipient_message | TEXT | Dankes-Nachricht |
| created_at | DATETIME | Erstellungsdatum |
| donor_scanned_at | DATETIME | Erster Scan (Spender) |
| recipient_scanned_at | DATETIME | Zweiter Scan (Empfänger) |
| email_sent_at | DATETIME | E-Mail versandt |
| expires_at | DATETIME | Ablaufdatum (18 Monate) |

### `email_log` Tabelle

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| id | INTEGER | Primary Key |
| qr_code_id | INTEGER | Foreign Key zu qr_codes |
| recipient_email | TEXT | Empfänger-E-Mail |
| subject | TEXT | E-Mail-Betreff |
| sent_at | DATETIME | Versandzeitpunkt |
| status | TEXT | sent, failed, bounced |
| error_message | TEXT | Fehlermeldung (falls failed) |

## 🚢 Deployment

### Railway (empfohlen)

1. **Account erstellen**: [railway.app](https://railway.app)
2. **GitHub verbinden**
3. **New Project** → "Deploy from GitHub"
4. **Repository auswählen**: `christmas-qrcode`
5. **Umgebungsvariablen hinzufügen** (alle aus `.env`)
6. **Deploy!**

Railway stellt automatisch eine URL bereit (z.B. `your-app.up.railway.app`)

### Render

1. **Account erstellen**: [render.com](https://render.com)
2. **New Web Service**
3. **GitHub Repository verbinden**
4. Build Command: `npm install && npm run init-db`
5. Start Command: `npm start`
6. **Umgebungsvariablen hinzufügen**

### Vercel (nur für Static Hosting, Backend separat deployen)

Nicht empfohlen für dieses Projekt (benötigt Serverless-Anpassungen).

## 🔒 Sicherheit

- ✅ HTTPS verwenden (Let's Encrypt)
- ✅ Admin-Passwort ändern
- ✅ E-Mail-Credentials sicher speichern
- ✅ Rate Limiting implementiert
- ✅ File-Upload-Validierung (Größe, Typ)
- ✅ SQL-Injection-Schutz (Prepared Statements)

## 🧪 Testing

### Manueller Test-Workflow

1. **QR-Codes generieren**:
   ```bash
   # Admin-Dashboard öffnen
   http://localhost:3000/admin.html
   # Login → 100 QR-Codes generieren
   ```

2. **Spender-Flow testen**:
   ```bash
   # Einen QR-Code aus PDF scannen oder URL kopieren
   http://localhost:3000/scan?code=GENERATED-TOKEN
   # E-Mail eingeben → Bestätigungs-E-Mail prüfen
   ```

3. **Empfänger-Flow testen**:
   ```bash
   # Nach E-Mail-Bestätigung: Denselben QR erneut scannen
   # Foto hochladen → Nachricht schreiben → Absenden
   ```

4. **E-Mail prüfen**:
   - Spender erhält E-Mail mit Foto

## 📊 Monitoring

**Logs prüfen:**
```bash
# Entwicklung
npm run dev

# Produktion (mit PM2)
pm2 logs
```

**Datenbank prüfen:**
```bash
sqlite3 database.sqlite
> SELECT * FROM qr_codes LIMIT 10;
> SELECT COUNT(*) FROM qr_codes WHERE status='COMPLETED';
```

## 🐛 Troubleshooting

### E-Mails werden nicht versendet

1. SMTP-Credentials in `.env` prüfen
2. Gmail: App-Passwort verwenden (nicht normales Passwort)
3. Firewall-Regeln prüfen (Port 587)

### QR-Code-Status bleibt "UNUSED"

1. E-Mail-Verifizierung abgeschlossen?
2. Browser-Konsole auf Fehler prüfen
3. Server-Logs prüfen

### Foto-Upload schlägt fehl

1. Dateigröße < 5MB?
2. Format: JPG/PNG?
3. `uploads/`-Verzeichnis existiert und ist beschreibbar?

## 🔄 Updates & Wartung

### Datenbank-Cleanup (älter als 12 Monate)

```bash
# Manuell in SQLite
sqlite3 database.sqlite
> DELETE FROM qr_codes WHERE created_at < datetime('now', '-12 months');
```

**Automatisches Cleanup** (optional via Cron-Job):
```bash
# Crontab eintragen
0 2 * * * cd /path/to/app && sqlite3 database.sqlite "DELETE FROM qr_codes WHERE created_at < datetime('now', '-12 months');"
```

## 📝 Lizenz

MIT License - frei verwendbar für Hilfsprojekte

## 🤝 Contribution

Contributions sind willkommen! Bitte erstelle ein Issue oder Pull Request.

## 📧 Support

Bei Fragen oder Problemen:
- GitHub Issues: [github.com/eliasroebl/christmas-qrcode/issues](https://github.com/eliasroebl/christmas-qrcode/issues)
- E-Mail: [Ihre E-Mail]

---

**Entwickelt mit ❤️ für ukrainische Hilfsorganisationen**

🇦🇹 🤝 🇺🇦
