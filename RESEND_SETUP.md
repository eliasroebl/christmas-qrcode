# 📧 Resend Setup Guide (3 Minuten)

**Problem:** Railway blockiert SMTP-Ports (587, 465) → E-Mails können nicht versendet werden

**Lösung:** Resend verwendet HTTPS statt SMTP und funktioniert perfekt mit Railway!

## 🚀 Schnell-Setup

### 1. Resend Account erstellen

Gehe zu: https://resend.com/signup

- Kostenlos: **100 E-Mails/Tag**
- Keine Kreditkarte erforderlich
- Sofort einsatzbereit

### 2. API-Key generieren

1. Nach dem Login → **API Keys** (linke Sidebar)
2. Klicke **"Create API Key"**
3. Name: z.B. "Christmas QR Code App"
4. Permission: **"Sending access"**
5. Klicke **"Create"**
6. **Kopiere den Key** (beginnt mit `re_...`)

### 3. Railway Environment Variables setzen

Gehe zu deinem Railway-Projekt → **Variables** Tab:

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

### 6. Test

Öffne deine Scan-URL und gib eine E-Mail-Adresse ein:
```
https://christmas-qrcode-production.up.railway.app/scan?code=xyz
```

**Du solltest in den Railway-Logs sehen:**
```
✓ Email service using: Resend
✓ Email sent via Resend: abc123-def456
```

✅ **Fertig!** E-Mails funktionieren jetzt.

---

## 🎯 Für Produktion: Eigene Domain verwenden

Sobald du produktiv gehst, solltest du deine eigene Domain verwenden:

### 1. Domain in Resend hinzufügen

1. Resend Dashboard → **Domains**
2. Klicke **"Add Domain"**
3. Gib deine Domain ein: z.B. `yourdomain.com`
4. Resend zeigt DNS-Records

### 2. DNS-Records setzen

Bei deinem Domain-Provider (z.B. Namecheap, GoDaddy):

**SPF Record (TXT):**
```
Type: TXT
Name: @
Value: (von Resend angezeigter Wert)
```

**DKIM Records (TXT):**
```
Type: TXT
Name: resend._domainkey
Value: (von Resend angezeigter Wert)
```

### 3. Verifizierung warten

- Dauert 5-30 Minuten
- Resend prüft automatisch
- Status wird grün ✅

### 4. EMAIL_FROM aktualisieren

In Railway-Variables:
```env
EMAIL_FROM=noreply@yourdomain.com
```

Jetzt kommen E-Mails von deiner eigenen Domain! 🎉

---

## 🆚 Resend vs. SMTP (Vergleich)

| Feature | Resend | SMTP (Gmail) |
|---------|--------|--------------|
| **Funktioniert auf Railway** | ✅ Ja | ❌ Nein (Port blockiert) |
| **Kostenlos** | 100/Tag | 500/Tag |
| **Setup** | 3 Minuten | 10 Minuten |
| **Reliability** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Tracking** | ✅ Delivery, Opens | ❌ Nein |
| **Eigene Domain** | ✅ Ja | ❌ Nein |

---

## 🐛 Troubleshooting

### E-Mail kommt nicht an

1. **Spam-Ordner prüfen** (besonders bei ersten E-Mails)
2. **Railway Logs prüfen**:
   ```
   ✓ Email sent via Resend: abc123
   ```
   Wenn du das siehst → E-Mail wurde versendet!

3. **Resend Dashboard prüfen**:
   - Dashboard → **Logs**
   - Siehst du die E-Mail? Status?

### "Invalid API Key" Fehler

- API-Key kopiert? (beginnt mit `re_`)
- In Railway-Variables richtig eingetragen?
- Keine Leerzeichen vor/nach dem Key?

### E-Mails landen im Spam

**Lösung:** Eigene Domain verwenden (siehe oben) + SPF/DKIM setzen

---

## 📊 E-Mail-Limits

**Resend Free Plan:**
- 100 E-Mails/Tag
- 3.000 E-Mails/Monat
- Perfekt für 50-100 QR-Codes

**Wenn du mehr brauchst:**
- **Pro Plan**: $20/Monat → 50.000 E-Mails
- Oder: Kombiniere mit **SendGrid** (ebenfalls kostenlos)

---

## ✅ Checkliste

- [ ] Resend Account erstellt
- [ ] API-Key generiert und kopiert
- [ ] `RESEND_API_KEY` in Railway gesetzt
- [ ] `EMAIL_FROM=onboarding@resend.dev` gesetzt
- [ ] SMTP-Variablen entfernt/auskommentiert
- [ ] Railway neu deployed
- [ ] Test-E-Mail versendet
- [ ] E-Mail erhalten ✅

---

**Alles funktioniert? Perfekt! 🎉**

Falls Probleme auftreten, schau in die Railway-Logs oder erstelle ein GitHub Issue.
