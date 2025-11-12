# 📧 Resend Setup Guide (3 Minuten)

**Problem:** Railway blockiert SMTP-Ports (587, 465) → E-Mails können nicht versendet werden

**Lösung:** Resend verwendet HTTPS statt SMTP und funktioniert perfekt mit Railway!

## 🚀 Schnell-Setup

### 1. Resend Account erstellen

Gehe zu: https://resend.com/signup

- Kostenlos: **3.000 E-Mails/Monat** (100/Tag)
- Keine Kreditkarte erforderlich
- Sofort einsatzbereit

### 2. API-Key generieren

1. Nach dem Login → **API Keys** (linke Sidebar)
2. Klicke **"Create API Key"**
3. Name: z.B. "Christmas QR Code App"
4. Permission: **"Sending access"**
5. Klicke **"Create"**
6. **Kopiere den Key** (beginnt mit `re_...`)

⚠️ **Wichtig:** Der Key wird nur einmal angezeigt!

### 3. Railway Environment Variables setzen

Gehe zu deinem Railway-Projekt → Service → **Variables** Tab:

```env
RESEND_API_KEY=re_dein_kopierter_key_hier
EMAIL_FROM=onboarding@resend.dev
```

**Wichtig:** Verwende zunächst `onboarding@resend.dev` als `EMAIL_FROM` für Tests!

### 4. SMTP-Variablen entfernen (wichtig!)

**Lösche** oder kommentiere diese Variablen in Railway:

- ~~EMAIL_HOST~~
- ~~EMAIL_PORT~~
- ~~EMAIL_USER~~
- ~~EMAIL_PASSWORD~~

Der Code erkennt automatisch, dass Resend verwendet werden soll!

### 5. Railway neu deployen

Railway deployt automatisch nach der Variable-Änderung. Warte 2-3 Minuten.

**Erwartete Logs:**
```
✓ Email service using: Resend
✓ Connected to PostgreSQL database
✓ Database tables initialized
📊 Database type: postgres
🚀 Server running on port 8080
✅ Application ready
```

### 6. Test

Öffne deine Scan-URL und gib **deine eigene E-Mail-Adresse** ein:
```
https://your-app.up.railway.app/scan?code=xyz
```

**Ohne Domain-Verifizierung** kannst du nur an deine registrierte E-Mail senden!

**Du solltest in den Railway-Logs sehen:**
```
Resend API response: {"data":{"id":"abc123-def456-..."},"error":null}
✓ Email sent via Resend: abc123-def456
```

✅ **Fertig!** E-Mails funktionieren jetzt (an deine eigene Adresse).

---

## 🎯 Für Produktion: Eigene Domain verifizieren

**Wichtig:** Ohne Domain-Verifizierung:
- ❌ Kannst nur an **deine eigene** E-Mail senden
- ❌ E-Mails landen oft im Spam

**Mit Domain-Verifizierung:**
- ✅ Kannst an **beliebige** E-Mail-Adressen senden
- ✅ Bessere Deliverability (SPF, DKIM, DMARC)
- ✅ Professioneller Absender (z.B. `noreply@gain-austria.org`)

### 1. Domain in Resend hinzufügen

1. Resend Dashboard → **Domains**
2. Klicke **"Add Domain"**
3. Gib deine Domain ein: z.B. `gain-austria.org` (oder Subdomain `mail.yourdomain.com`)
4. Resend zeigt 3 DNS-Records

### 2. DNS-Records setzen

Bei deinem Domain-Provider (Namecheap, GoDaddy, Cloudflare, etc.):

**SPF Record (TXT):**
```
Type: TXT
Name: @ (oder yourdomain.com)
Value: v=spf1 include:resend.com ~all
```

**DKIM Record (TXT):**
```
Type: TXT
Name: resend._domainkey
Value: (von Resend angezeigter langer Wert)
```

**DMARC Record (TXT):**
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com
```

### 3. Verifizierung warten

- Dauert **5-60 Minuten** (DNS-Propagation)
- Resend prüft automatisch alle 5 Minuten
- Status wird grün ✅ wenn alle Records verifiziert sind

### 4. EMAIL_FROM aktualisieren

In Railway-Variables:
```env
EMAIL_FROM=noreply@gain-austria.org
```

Jetzt kommen E-Mails von deiner eigenen Domain! 🎉

---

## 📧 E-Mail-Deliverability verbessern

Die App sendet bereits optimierte E-Mails:
- ✅ **Multipart-E-Mails** (HTML + Plain-Text)
- ✅ **Keine Emojis** in Subject-Lines
- ✅ **Plain-Text-Fallback** für bessere Spam-Scores
- ✅ **Alle Fotos als Anhänge** (bis zu 5)

### Spam-Score testen

1. Gehe zu: https://www.mail-tester.com
2. Kopiere die Test-E-Mail-Adresse
3. Registriere einen QR-Code mit dieser Adresse
4. Prüfe den Score

**Ziel: 9/10 oder höher**

**Wenn Score niedriger:**
- SPF/DKIM/DMARC Records gesetzt? ✅
- Domain verifiziert in Resend? ✅
- E-Mails von verifizierter Domain? ✅

---

## 🆚 Resend vs. SMTP (Vergleich)

| Feature | Resend | SMTP (Gmail) |
|---------|--------|--------------|
| **Funktioniert auf Railway** | ✅ Ja | ❌ Nein (Port blockiert) |
| **Kostenlos** | 3.000/Monat | 500/Tag |
| **Setup** | 3 Minuten | 10 Minuten |
| **Reliability** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Tracking** | ✅ Delivery, Opens | ❌ Nein |
| **Eigene Domain** | ✅ Ja | ❌ Nein |
| **Spam-Score** | ⭐⭐⭐⭐⭐ (mit Domain) | ⭐⭐⭐ |
| **Multi-Attachments** | ✅ Ja | ✅ Ja |

---

## 🐛 Troubleshooting

### Fehler: "You can only send testing emails to your own email"

**Problem:** Domain nicht verifiziert, versuchst an andere E-Mails zu senden

**Lösung:**
1. **Option A:** Verifiziere deine Domain (siehe oben)
2. **Option B:** Für Tests: Verwende nur deine eigene E-Mail-Adresse

### E-Mail kommt nicht an

1. **Spam-Ordner prüfen** (besonders bei ersten E-Mails ohne Domain)
2. **Railway Logs prüfen**:
   ```bash
   Resend API response: {"data":{"id":"..."},"error":null}
   ✓ Email sent via Resend: abc123
   ```
   Wenn du das siehst → E-Mail wurde versendet!

3. **Resend Dashboard prüfen**:
   - Dashboard → **Logs**
   - Siehst du die E-Mail? Status?
   - Click → Siehe Delivery-Details

### "Invalid API Key" oder "unknown" ID

**Problem:** API Key falsch oder Response nicht korrekt geparst

**Lösung:**
- API-Key in Railway korrekt? (beginnt mit `re_`)
- Keine Leerzeichen vor/nach dem Key
- Logs: `Resend API response` sollte ein `data.id` zeigen

### E-Mails landen im Spam

**Ursachen:**
- ❌ Domain nicht verifiziert
- ❌ SPF/DKIM/DMARC Records fehlen
- ❌ Absender-Domain nicht verifiziert

**Lösung:**
1. Domain verifizieren (siehe oben)
2. Alle 3 DNS-Records setzen (SPF, DKIM, DMARC)
3. Mail-Tester verwenden → Score prüfen
4. Warte einige Stunden für Domain-Reputation

### Mehrere Fotos werden nicht als Anhänge gesendet

**Problem:** Recipient hat 5 Fotos hochgeladen, aber nur 1 kommt an

**Check:**
1. Server-Logs: `Attaching X photo(s) to email` sollte X = 5 zeigen
2. Photo Paths im JSON-Format gespeichert?
3. Alle Files existieren auf dem Server?

**Lösung:** Bereits implementiert - die App sendet automatisch alle Fotos als separate Anhänge!

---

## 📊 E-Mail-Limits

**Resend Free Plan:**
- **3.000 E-Mails/Monat**
- **100 E-Mails/Tag**
- Perfekt für 100-300 QR-Codes

**Rechenbeispiel:**
- 100 QR-Codes generiert
- 100 Donor-Verifications (100 E-Mails)
- 50 Recipients antworten (50 E-Mails)
- **= 150 E-Mails/Monat** → Gut im Limit! ✅

**Wenn du mehr brauchst:**
- **Pro Plan**: $20/Monat → 50.000 E-Mails
- **Business Plan**: $80/Monat → 100.000 E-Mails

---

## 🔒 Sicherheits-Best-Practices

1. **API Key geheim halten** - Nie in Git committen!
2. **Domain-Verifizierung** - Verhindert Missbrauch
3. **Email-From Domain** - Nur verifizierte Domains verwenden
4. **Rate Limiting** - Bereits implementiert
5. **Monitoring** - Resend Dashboard regelmäßig prüfen

---

## ✅ Checkliste

### Für Tests:
- [ ] Resend Account erstellt
- [ ] API-Key generiert und kopiert
- [ ] `RESEND_API_KEY` in Railway gesetzt
- [ ] `EMAIL_FROM=onboarding@resend.dev` gesetzt
- [ ] SMTP-Variablen entfernt
- [ ] Railway neu deployed
- [ ] Test-E-Mail an eigene Adresse versendet
- [ ] E-Mail erhalten ✅

### Für Production:
- [ ] Domain gekauft/vorhanden
- [ ] Domain in Resend hinzugefügt
- [ ] SPF Record gesetzt
- [ ] DKIM Record gesetzt
- [ ] DMARC Record gesetzt
- [ ] Domain verifiziert (grüner Status) ✅
- [ ] `EMAIL_FROM` auf eigene Domain geändert
- [ ] Mail-Tester Score: 9/10+ ✅
- [ ] Test an fremde E-Mail-Adresse → Funktioniert! ✅

---

## 📈 Features der App

Die App nutzt Resend optimal:

- ✨ **Multi-Photo Attachments**: Bis zu 5 Fotos pro E-Mail
- ✨ **Multipart E-Mails**: HTML + Plain-Text
- ✨ **Deliverability-optimiert**: Keine Emojis in Subjects
- ✨ **Automatic Fallback**: SMTP als Backup (für lokale Tests)
- ✨ **Detailed Logging**: Alle E-Mail-Sends werden geloggt

---

**Alles funktioniert? Perfekt! 🎉**

Falls Probleme auftreten:
1. Prüfe Railway-Logs → `✓ Email sent via Resend`
2. Prüfe Resend Dashboard → Logs
3. Teste Mail-Tester Score
4. GitHub Issues: https://github.com/eliasroebl/christmas-qrcode/issues
