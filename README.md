# 🎁 QR-Code Spenden-Plattform

Eine Web-Applikation, die österreichische Spender mit ukrainischen Empfängern durch QR-Codes und personalisierte Dankesnachrichten verbindet.

## 💡 Konzept

1. **Hilfsorganisation (GAiN Austria)** druckt QR-Codes und klebt sie auf Geschenkpakete
2. **Spender (AT)** scannt QR-Code → gibt E-Mail-Adresse ein
3. **Paket** wird in die Ukraine verschickt
4. **Empfänger (UA)** öffnet Paket → scannt QR-Code → lädt bis zu 5 Dankesfotos hoch
5. **Spender** erhält automatisch E-Mail mit Fotos und Nachricht

## ✨ Features

- 📱 **QR-Code Generierung**: Erstellt 100-500 eindeutige QR-Codes als PDF (15/Seite)
- 🖼️ **Multi-Foto Upload**: Empfänger können 1-5 Fotos gleichzeitig hochladen
- 🇦🇹 **Deutsche UI**: Für österreichische Spender
- 🇺🇦 **Ukrainische UI**: Für ukrainische Empfänger
- 📧 **E-Mail-Verifizierung**: Sicherstellen der korrekten E-Mail-Adresse
- 📸 **Foto-Upload**: Bis zu 5 Fotos, max. 5MB pro Foto, JPG/PNG
- 💌 **Automatischer E-Mail-Versand**: Mit allen Fotos und Nachricht
- 📊 **Admin-Dashboard**: Statistiken, Verwaltung und QR-Code-Viewer
- 🔒 **DSGVO-konform**: Auto-Löschung nach 12 Monaten
- 🚫 **Datenschutz**: Keine direkten Kontaktdaten-Austausch
- ✅ **Spam-optimiert**: Multipart-E-Mails mit Plain-Text-Versionen

## 🛠️ Tech Stack

- **Backend**: Node.js + Express
- **Database**: PostgreSQL (Production) / SQLite (Development)
- **QR-Generierung**: qrcode + PDFKit
- **E-Mail**: Resend API (Railway-kompatibel) / Nodemailer SMTP
- **Upload**: Multer (multi-file support)
- **Frontend**: Vanilla HTML/CSS/JS
- **Deployment**: Railway (empfohlen)

## 📋 Voraussetzungen

- Node.js (v18 oder höher)
- npm
- PostgreSQL (für Production) oder SQLite (für Development)
- Resend Account (kostenlos bis 3.000 E-Mails/Monat) ODER SMTP-Server

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

Bearbeite `.env`:

```env
# Server
PORT=3000
NODE_ENV=production
APP_URL=https://ihre-domain.com

# E-Mail Option 1: Resend (empfohlen für Railway)
RESEND_API_KEY=re_your_key_here
EMAIL_FROM=noreply@ihre-domain.com

# E-Mail Option 2: SMTP (funktioniert nicht auf Railway!)
# EMAIL_HOST=smtp.gmail.com
# EMAIL_PORT=587
# EMAIL_USER=ihre-email@gmail.com
# EMAIL_PASSWORD=ihr-app-passwort
# EMAIL_FROM=noreply@ihre-organisation.at

# Admin-Passwort (ÄNDERN!)
ADMIN_PASSWORD=sicheres-passwort-hier

# Datenbank (optional, für lokale Entwicklung)
DB_PATH=./database.sqlite
```

**Resend Setup** (empfohlen):
1. Account erstellen: [resend.com](https://resend.com)
2. API Key erstellen
3. Domain verifizieren (für Production)
4. Siehe `RESEND_SETUP.md` für Details

### 4. Server starten

**Entwicklung (SQLite):**
```bash
npm run dev
```

**Produktion (PostgreSQL auf Railway):**
```bash
npm start
```

Server läuft auf `http://localhost:3000`

## 📖 Verwendung

### Admin-Bereich

1. Öffne `http://localhost:3000/admin`
2. Login mit dem Passwort aus `.env` (Standard: `admin123`)
3. QR-Codes generieren (100-500 Stück)
4. PDF herunterladen und ausdrucken
5. QR-Codes auf Geschenkpakete kleben
6. **Neu:** Einzelne QR-Codes anzeigen mit "QR anzeigen"-Button

### Workflow

**Schritt 1: Spender (Österreich)**
- Scannt QR-Code → Deutsche UI erscheint
- Gibt E-Mail-Adresse ein
- Erhält Bestätigungs-E-Mail
- Klickt auf Bestätigungs-Link

**Schritt 2: Empfänger (Ukraine)**
- Öffnet Geschenkpaket
- Scannt denselben QR-Code → Ukrainische UI erscheint
- **Wählt 1-5 Fotos aus** (max. 5MB pro Foto)
- Sieht Vorschau-Thumbnails aller ausgewählten Fotos
- Schreibt optionale Nachricht
- Sendet Dankesnachricht

**Schritt 3: Automatisch**
- System sendet E-Mail an Spender
- E-Mail enthält **alle hochgeladenen Fotos** als Anhänge
- Fotos heißen: `dankesfoto_1.jpg`, `dankesfoto_2.jpg`, etc.
- Spender erhält persönliche Dankesnachricht

## 🗂️ Projektstruktur

```
christmas-qrcode/
├── server.js                 # Express-Server
├── package.json
├── .env                      # Umgebungsvariablen (nicht in Git!)
├── database.sqlite           # SQLite DB (Development)
│
├── src/
│   ├── config/
│   │   └── database.js       # DB-Konfiguration (PostgreSQL/SQLite)
│   │
│   ├── models/
│   │   ├── QRCode.js         # QR-Code Model
│   │   └── EmailLog.js       # E-Mail Log Model
│   │
│   ├── routes/
│   │   ├── qrRoutes.js       # QR-Generierung
│   │   ├── scanRoutes.js     # Scan & Upload (Multi-File)
│   │   └── adminRoutes.js    # Admin-Endpoints
│   │
│   ├── services/
│   │   ├── qrService.js      # QR/PDF-Generierung
│   │   └── emailService.js   # E-Mail (Resend/SMTP)
│   │
├── public/                   # Frontend
│   ├── index.html           # Landingpage
│   ├── scan.html            # Scan-Seite (DE/UA, Multi-Upload)
│   ├── verify.html          # E-Mail-Verifizierung
│   ├── status.html          # Status-Tracking
│   ├── admin.html           # Admin-Dashboard + QR Viewer
│   └── privacy.html         # Datenschutzerklärung
│
└── uploads/                 # Hochgeladene Fotos (nicht in Git!)
```

## 🔌 API-Endpoints

### QR-Code Generierung
```
POST /api/qr/generate
Headers: Authorization: Bearer {ADMIN_PASSWORD}
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

### Empfänger-Upload (Multi-File)
```
POST /api/scan/upload-recipient
FormData: {
  "token": "qr-token",
  "photos": File[], // 1-5 Dateien
  "message": "Дякую!"
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

| Feld | Typ (PostgreSQL) | Typ (SQLite) | Beschreibung |
|------|------------------|--------------|--------------|
| id | SERIAL | INTEGER | Primary Key |
| token | VARCHAR(255) | TEXT | Eindeutiger QR-Token (UUID) |
| status | VARCHAR(50) | TEXT | UNUSED, DONOR_REGISTERED, COMPLETED, EXPIRED |
| donor_email | VARCHAR(255) | TEXT | E-Mail des Spenders |
| donor_verified | BOOLEAN | INTEGER | TRUE/FALSE (E-Mail bestätigt?) |
| verification_token | VARCHAR(255) | TEXT | Token für E-Mail-Verifizierung |
| recipient_photo_path | TEXT | TEXT | **JSON Array** mit Foto-Pfaden |
| recipient_message | TEXT | TEXT | Dankes-Nachricht |
| created_at | TIMESTAMP | DATETIME | Erstellungsdatum |
| expires_at | TIMESTAMP | DATETIME | Ablaufdatum (18 Monate) |
| completed_at | TIMESTAMP | DATETIME | Abschlussdatum |
| email_sent_at | TIMESTAMP | DATETIME | E-Mail versandt |

**Beispiel `recipient_photo_path`:**
```json
["uploads/abc123.jpg", "uploads/def456.jpg", "uploads/ghi789.jpg"]
```

### `email_log` Tabelle

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| id | SERIAL/INTEGER | Primary Key |
| qr_code_id | INTEGER | Foreign Key zu qr_codes |
| recipient_email | VARCHAR(255)/TEXT | Empfänger-E-Mail |
| subject | VARCHAR(255)/TEXT | E-Mail-Betreff |
| sent_at | TIMESTAMP/DATETIME | Versandzeitpunkt |
| status | VARCHAR(50)/TEXT | sent, failed |
| error_message | TEXT | Fehlermeldung (falls failed) |

## 🚢 Deployment auf Railway

### 1. PostgreSQL-Datenbank hinzufügen

1. Railway-Projekt öffnen
2. **"New"** → **"Database"** → **"Add PostgreSQL"**
3. Railway erstellt automatisch `DATABASE_URL`
4. ✅ Fertig! App erkennt PostgreSQL automatisch

### 2. Umgebungsvariablen setzen

```env
# Railway setzt automatisch:
DATABASE_URL=postgresql://...  # Von Railway

# Du musst setzen:
NODE_ENV=production
APP_URL=https://your-app.up.railway.app
RESEND_API_KEY=re_your_key
EMAIL_FROM=noreply@your-domain.com
ADMIN_PASSWORD=your-secure-password
```

### 3. Deploy

- Push zu GitHub → Railway deployed automatisch
- Oder: Manuell deployen im Railway Dashboard

### Wichtige Hinweise für Railway:

✅ **PostgreSQL wird automatisch erkannt** (via `DATABASE_URL`)
✅ **Tabellen werden automatisch erstellt** beim Start
✅ **Daten bleiben nach Deployments erhalten**
❌ **SMTP funktioniert NICHT** (Ports 587/465 blockiert) → Verwende Resend!

## 🔒 Sicherheit

- ✅ HTTPS verwenden (Railway hat automatisch SSL)
- ✅ Admin-Passwort ändern
- ✅ E-Mail-Credentials sicher speichern
- ✅ File-Upload-Validierung (Größe, Typ, Anzahl)
- ✅ SQL-Injection-Schutz (Prepared Statements)
- ✅ PostgreSQL/SQLite Boolean-Handling kompatibel

## 🧪 Testing

### Lokaler Test

1. **QR-Codes generieren**: `/admin` → Login → 100 QR-Codes generieren
2. **Spender-Flow**: QR scannen → E-Mail eingeben → E-Mail bestätigen
3. **Empfänger-Flow**: Gleichen QR scannen → **1-5 Fotos wählen** → Nachricht → Senden
4. **E-Mail prüfen**: Spender erhält E-Mail mit **allen Fotos** als Anhänge

### Test mit mehreren Fotos

1. Wähle 5 unterschiedliche Fotos aus
2. Sehe Vorschau-Grid (5 Thumbnails)
3. Upload → Prüfe E-Mail
4. E-Mail sollte 5 Anhänge haben: `dankesfoto_1.jpg` bis `dankesfoto_5.jpg`

## 📧 E-Mail-Deliverability

### Spam vermeiden

✅ **Domain verifizieren** in Resend (SPF, DKIM, DMARC)
✅ **Plain-Text-Version** automatisch inkludiert
✅ **Keine Emojis** in Subject-Lines
✅ **Multipart-E-Mails** (HTML + Text)

### Mail-Tester verwenden

1. Gehe zu: [mail-tester.com](https://www.mail-tester.com)
2. Kopiere Test-E-Mail-Adresse
3. Registriere QR mit Test-Adresse
4. Prüfe Score (sollte 9/10+ sein)

## 🐛 Troubleshooting

### E-Mails werden nicht versendet

1. **Resend**: Domain verifiziert? API Key korrekt?
2. **SMTP auf Railway**: Funktioniert NICHT → Verwende Resend!
3. Logs prüfen: `Resend API response` oder `SMTP error`

### Mehrere Fotos werden nicht hochgeladen

1. Browser-Konsole prüfen: `Uploading X photo(s)`
2. Server-Logs: `photos count: X`
3. Dateigröße: Jedes Foto < 5MB?
4. Format: Nur JPG/PNG erlaubt

### PostgreSQL Fehler auf Railway

1. PostgreSQL hinzugefügt? `DATABASE_URL` gesetzt?
2. Tables automatisch erstellt? Logs: `✓ Database tables initialized`
3. Boolean-Werte: `donor_verified` sollte TRUE/FALSE sein (nicht 1/0)

### Container stoppt auf Railway

1. Server bindet an `0.0.0.0`? ✅ (sollte)
2. Health-Check: `/health` endpoint funktioniert?
3. Logs: `✅ Application ready` sollte erscheinen

## 🔄 Updates & Wartung

### Automatisches Cleanup (PostgreSQL Cron-Job)

In Railway kannst du einen Cron-Job einrichten:

```sql
DELETE FROM qr_codes WHERE created_at < NOW() - INTERVAL '12 months';
```

### Manuelles Cleanup (SQLite)

```bash
sqlite3 database.sqlite
> DELETE FROM qr_codes WHERE created_at < datetime('now', '-12 months');
```

## 🆕 Changelog

### Version 2.0 (Aktuell)
- ✨ **Multi-Photo Upload**: 1-5 Fotos gleichzeitig
- ✨ **PostgreSQL Support**: Automatische DB-Erkennung
- ✨ **Resend Integration**: Railway-kompatibel
- ✨ **Admin QR Viewer**: QR-Codes direkt anzeigen
- 🐛 **E-Mail Deliverability**: Multipart, Plain-Text
- 🐛 **Boolean Handling**: PostgreSQL TRUE/FALSE kompatibel
- 🐛 **Railway Deployment**: Container-Stabilität

### Version 1.0
- Initial Release mit Single-Photo Upload

## 📝 Lizenz

MIT License - frei verwendbar für Hilfsprojekte

## 🤝 Contribution

Contributions sind willkommen! Bitte erstelle ein Issue oder Pull Request.

## 📧 Support

Bei Fragen oder Problemen:
- GitHub Issues: [github.com/eliasroebl/christmas-qrcode/issues](https://github.com/eliasroebl/christmas-qrcode/issues)

---

**Entwickelt mit ❤️ für GAiN Austria und ukrainische Hilfsorganisationen**

🇦🇹 🤝 🇺🇦
