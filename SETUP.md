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

Kopiere `.env.example` zu `.env`:

```bash
cp .env.example .env
```

**Option A: Resend (Empfohlen für Railway/Production)**

1. Konto erstellen: https://resend.com (kostenlos bis 3.000 E-Mails/Monat)
2. API Key generieren: Dashboard → API Keys → Create API Key
3. (Optional) Domain verifizieren für Production: Dashboard → Domains

Bearbeite `.env`:
```env
# Resend Email
RESEND_API_KEY=re_your_key_here
EMAIL_FROM=onboarding@resend.dev  # Für Tests, oder deine-domain.com nach Verifizierung

# Admin Passwort
ADMIN_PASSWORD=dein-sicheres-passwort

# App URL (für lokale Entwicklung)
APP_URL=http://localhost:3000
```

**Option B: Gmail (Nur für lokale Tests, funktioniert NICHT auf Railway!)**

1. Google-Konto → Sicherheit → 2-Faktor-Authentifizierung aktivieren
2. Sicherheit → App-Passwörter → "Mail" auswählen
3. 16-stelliges Passwort kopieren

Bearbeite `.env`:
```env
# Gmail SMTP
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=deine-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx  # App-Passwort (ohne Leerzeichen!)
EMAIL_FROM=deine-email@gmail.com

# Admin
ADMIN_PASSWORD=dein-sicheres-passwort
APP_URL=http://localhost:3000
```

### 4. Server starten

```bash
# Entwicklung (SQLite)
npm run dev
```

**Erwartete Ausgabe:**
```
✓ Email service using: Resend  (oder: SMTP (Nodemailer))
✓ Connected to SQLite database
✓ Database tables initialized
📊 Database type: sqlite
🚀 Server running on port 3000
📱 Scan URL: http://localhost:3000
✅ Application ready
```

Öffne im Browser: http://localhost:3000

**Hinweis:** Datenbank-Tabellen werden automatisch beim Start erstellt - kein manuelles `init-db` nötig!

## 📱 Erste Schritte

### Admin-Dashboard öffnen

1. Gehe zu: http://localhost:3000/admin
2. Login mit deinem `ADMIN_PASSWORD` aus `.env`
3. Klicke auf "PDF Generieren & Herunterladen"
4. Wähle z.B. 10 QR-Codes zum Testen
5. PDF wird heruntergeladen

**Neu:** Klicke auf "📱 QR anzeigen" neben jedem QR-Code, um ihn direkt im Browser anzuzeigen!

### QR-Code testen

**Als Spender (Österreich):**

1. Öffne das heruntergeladene PDF
2. Scanne einen QR-Code mit deinem Handy ODER kopiere die URL
3. Gib deine E-Mail-Adresse ein
4. Bestätige deine E-Mail (check Posteingang!)

**Als Empfänger (Ukraine):**

1. Nach E-Mail-Bestätigung: Scanne denselben QR-Code nochmal
2. Die Seite zeigt jetzt die ukrainische UI
3. **Neu: Wähle 1-5 Fotos aus** (nicht nur eines!)
4. Sehe Vorschau-Thumbnails aller Fotos
5. Schreibe eine optionale Nachricht
6. Absenden

**Ergebnis:**

Die Spender-E-Mail erhält automatisch:
- **Alle hochgeladenen Fotos** als Anhänge (`dankesfoto_1.jpg`, `dankesfoto_2.jpg`, etc.)
- Die Nachricht im E-Mail-Text
- Plain-Text-Version für bessere Spam-Scores

## 🌐 Deployment auf Railway (Empfohlen)

Railway ist die empfohlene Plattform, weil:
- ✅ Kostenloser Tier verfügbar
- ✅ PostgreSQL-Integration
- ✅ Automatisches HTTPS
- ✅ Einfaches Deployment
- ✅ **Resend funktioniert** (SMTP ist blockiert!)

### Schritt 1: Railway-Account erstellen

1. Gehe zu: https://railway.app
2. "Start a New Project" → "Deploy from GitHub"
3. Verbinde dein GitHub-Konto
4. Wähle das `christmas-qrcode` Repository

### Schritt 2: PostgreSQL hinzufügen

1. In deinem Railway-Projekt: **"New"** → **"Database"** → **"Add PostgreSQL"**
2. Railway erstellt automatisch `DATABASE_URL` → App erkennt PostgreSQL automatisch
3. ✅ Fertig! Daten bleiben nach Deployments erhalten

### Schritt 3: Environment Variables setzen

Gehe zu: Service → **"Variables"** Tab

**Erforderliche Variablen:**
```env
NODE_ENV=production
APP_URL=https://your-app.up.railway.app  # Deine Railway-URL
RESEND_API_KEY=re_your_key_here
EMAIL_FROM=noreply@your-domain.com  # Oder onboarding@resend.dev für Tests
ADMIN_PASSWORD=dein-sicheres-passwort
```

**Railway setzt automatisch:**
```env
DATABASE_URL=postgresql://...  # Von Railway automatisch gesetzt
PORT=...  # Von Railway automatisch gesetzt
```

### Schritt 4: Deploy

- Push zu GitHub → Railway deployed automatisch
- Oder: Klicke "Deploy" im Railway Dashboard

**Was passiert beim Deployment:**
1. Railway baut die App
2. Server startet und bindet an `0.0.0.0`
3. Datenbank-Tabellen werden automatisch erstellt
4. App ist unter `https://your-app.up.railway.app` erreichbar

### Schritt 5: Testen

1. Öffne: `https://your-app.up.railway.app/admin`
2. Login mit Admin-Passwort
3. Generiere QR-Codes
4. Teste den kompletten Workflow

## ⚠️ Wichtige Hinweise für Railway

### ✅ Was funktioniert:
- PostgreSQL (automatisch erkannt via `DATABASE_URL`)
- Resend Email API
- File Uploads (im Container gespeichert)
- HTTPS (automatisch)

### ❌ Was NICHT funktioniert:
- SMTP E-Mail (Ports 587/465 blockiert) → **Verwende Resend!**
- SQLite (Daten gehen bei jedem Deployment verloren) → **Verwende PostgreSQL!**

## 📧 E-Mail-Setup (Production)

### Resend Domain verifizieren (für Production)

Damit du E-Mails an beliebige Empfänger senden kannst:

1. Gehe zu: https://resend.com/domains
2. Klicke "Add Domain"
3. Gib deine Domain ein (z.B. `gain-austria.org`)
4. Füge die DNS-Records hinzu (SPF, DKIM, DMARC)
5. Warte auf Verifizierung (~5-60 Minuten)
6. Update `EMAIL_FROM` in Railway: `noreply@gain-austria.org`

**Ohne Domain-Verifizierung:** Kannst nur an deine eigene E-Mail senden (gut für Tests).

## 🧪 Testing & Debugging

### Lokale Tests

**Mit mehreren Fotos testen:**
```bash
# Browser öffnen
http://localhost:3000/scan?code=TEST-TOKEN

# Als Empfänger:
1. Wähle 5 verschiedene Fotos aus
2. Sehe Vorschau-Grid mit 5 Thumbnails
3. Upload → Prüfe Logs: "Uploading 5 photo(s)"
4. Prüfe E-Mail: 5 Anhänge (dankesfoto_1.jpg - dankesfoto_5.jpg)
```

### Railway Logs prüfen

```bash
# Im Railway Dashboard:
Service → "Deployments" → Aktuellstes Deployment → "View Logs"

# Erwartete Ausgabe:
✓ Connected to PostgreSQL database
✓ Email service using: Resend
✓ Database tables initialized
📊 Database type: postgres
🚀 Server running on port 8080
✅ Application ready
```

### Häufige Fehler & Lösungen

**Container stoppt auf Railway:**
- ✅ Lösung: Server bindet an `0.0.0.0` (bereits implementiert)
- Check Logs: `✅ Application ready` sollte erscheinen

**E-Mails kommen nicht an:**
- Resend: Domain verifiziert? API Key korrekt?
- SMTP: Funktioniert NICHT auf Railway → Verwende Resend!
- Logs: `✗ Resend API error` oder `✗ SMTP error`

**PostgreSQL-Fehler:**
- PostgreSQL in Railway hinzugefügt? `DATABASE_URL` gesetzt?
- Logs: `✓ Connected to PostgreSQL database` sollte erscheinen
- Boolean-Werte: `donor_verified` sollte TRUE/FALSE sein

**Mehrere Fotos werden nicht hochgeladen:**
- Browser-Konsole: `Uploading X photo(s)` prüfen
- Server-Logs: `photos count: X` prüfen
- Dateigröße: Jedes Foto < 5MB?
- Format: Nur JPG/PNG

## 🔒 Sicherheits-Checkliste

Vor Production-Deployment:

- [ ] `ADMIN_PASSWORD` geändert (nicht `admin123`!)
- [ ] `APP_URL` auf Railway-URL gesetzt
- [ ] Resend Domain verifiziert (SPF, DKIM, DMARC)
- [ ] PostgreSQL-Datenbank hinzugefügt
- [ ] HTTPS aktiv (Railway macht automatisch)
- [ ] Kompletten Workflow getestet
- [ ] Datenschutzerklärung angepasst (Organisation, Kontakt)

## 📊 Monitoring

### E-Mail-Deliverability testen

1. Gehe zu: https://www.mail-tester.com
2. Kopiere die Test-E-Mail-Adresse
3. Registriere QR-Code mit Test-Adresse
4. Prüfe Score (sollte 9/10+ sein)
5. Falls niedriger: DNS-Records (SPF, DKIM, DMARC) prüfen

### Datenbank-Status prüfen

**PostgreSQL (auf Railway):**
```bash
# Im Railway Dashboard:
PostgreSQL Service → "Data" Tab → "Query"

# Queries:
SELECT COUNT(*) FROM qr_codes;
SELECT COUNT(*) FROM qr_codes WHERE status = 'COMPLETED';
```

**SQLite (lokal):**
```bash
sqlite3 database.sqlite
> SELECT COUNT(*) FROM qr_codes;
> SELECT * FROM qr_codes WHERE status = 'COMPLETED' LIMIT 5;
```

## 🔄 Updates deployen

```bash
# Änderungen machen
git add .
git commit -m "Feature XYZ"
git push

# Railway deployed automatisch!
```

## 🆘 Support

Bei Problemen:
- **GitHub Issues**: https://github.com/eliasroebl/christmas-qrcode/issues
- **README**: Siehe `README.md` für detaillierte Dokumentation
- **Resend-Setup**: Siehe `RESEND_SETUP.md` für E-Mail-Konfiguration

---

**Viel Erfolg mit deinem Hilfsprojekt! 🎁💙💛**
