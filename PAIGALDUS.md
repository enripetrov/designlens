# DesignLens - Paigaldusjuhend (Eesti keeles)

## 🎯 Mis on vaja uues arvutis?

### 1. Tarkvara mis peab olema installitud

- ✅ **Node.js** (versioon 18 või uuem)
  - Laadi alla: <https://nodejs.org/>
  - Kontrolli: ava CMD ja kirjuta `node --version`
  
- ✅ **Git** (kui tahad GitHubist kloonida)
  - Laadi alla: <https://git-scm.com/downloads>
  - Kontrolli: kirjuta `git --version`

### 2. Antropic API võti

- Mine: <https://console.anthropic.com/>
- Loo konto / logi sisse
- "API Keys" -> "Create Key"
- Kopeeri võti (algab `sk-ant-...`)

---

## 📥 Sammud teises arvutis käivitamiseks

### ⚡ KIIRE VIIS (Soovitatud)

1. **Kloon GitHubist:**

```bash
git clone https://github.com/enripetrov/designlens.git
cd designlens
```

1. **Topeltklõps `SETUP.bat` failil**
   - Kontrollib kõike automaatselt
   - Installib npm paketid
   - Aitab luua `.env.local` faili
   - Käivitab rakenduse

**See on kõik!** Setup wizard teeb ülejäänu ära! 🚀

---

### 📋 Samm-sammuline viis

### Samm 1: Kloon projekt GitHubist

```bash
git clone https://github.com/enripetrov/designlens.git
cd designlens
```

### Samm 2: Loo `.env.local` fail

1. Ava `designlens` kaust
2. Loo uus fail nimega `.env.local` (täpselt see nimi!)
3. Lisa sellesse üks rida:

```
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxx
```

(asenda oma päris võtmega)

### Samm 3: Käivita rakendus

**Lihtsaim viis:**

- Topeltklõps `start-dev.bat` failil

**Või käsitsi:**

```bash
npm install
npm run dev
```

### Samm 4: Ava brauser

- Peaks avanema automaatselt
- Kui ei avane: mine aadressile <http://localhost:3000>

---

## ✅ Kontrollnimekiri

Enne käivitamist kontrolli:

- [ ] Node.js on installitud (`node --version` näitab versiooni)
- [ ] Git on installitud (`git --version` töötab)
- [ ] Projekt on GitHubist alla laetud
- [ ] `.env.local` fail on loodud JA sisaldab API võtit
- [ ] Käivitasid `start-dev.bat` või `npm run dev`

---

## 🚨 Levinud probleemid

### "node is not recognized"

**Lahendus:** Node.js pole installitud või pole käivitatav

- Installi Node.js: <https://nodejs.org/>
- Taaskäivita arvuti
- Proovi uuesti

### "Cannot find module"

**Lahendus:** Sõltuvused pole installitud

```bash
npm install
```

### "ANTHROPIC_API_KEY is not defined"

**Lahendus:** `.env.local` fail puudub või on valesti

- Kontrolli, et fail on täpselt nimega `.env.local`
- Kontrolli, et failis on rida: `ANTHROPIC_API_KEY=sk-ant-...`
- **OLULINE:** Fail peab olema projekti juurkaustas, mitte mujal!

### "Port 3000 is already in use"

**Lahendus:** Port on hõivatud

```bash
npx kill-port 3000
```

Või taaskäivita arvuti.

---

## 📦 Mida GitHub SISALDAB

✅ Kogu lähtekood (`src/` kaust)
✅ Konfiguratsioonifailid
✅ `package.json` (sõltuvuste nimekiri)
✅ Käivitusfailid (`.bat`)
✅ See README

## 📦 Mida GitHub EI SISALDA (need tekivad automaatselt)

❌ `node_modules/` - installitakse käsuga `npm install`
❌ `.next/` - genereeritakse käsuga `npm run build`
❌ `.env.local` - **PEAD ISE LOOMA!**

---

## 💡 Näpunäited

1. **API võti on SALADUS** - ära jaga kellegagi!
2. **API kasutamine maksab raha** - kontrolli Anthropic'i armatuurlauda
3. **`.env.local` on ignoreeritud Git'is** - see ei lähe GitHubi
4. **Kui midagi ei tööta** - kontrolli, kas Node.js versioon on 18 või uuem

---

## 🎮 Kasutamine

1. Sisesta veebilehe URL
2. Vajuta "Analyze Website"
3. Oota 30-60 sekundit (AI analüüsib lehte)
4. Vaata tulemusi:
   - PRD dokument
   - Disainisüsteem
   - SEO analüüs
   - Visuaalsed diagrammid
5. Prindi või salvesta PDF-ina (Ctrl+P)

---

## 📞 Abi

Kui midagi ei tööta:

1. Kontrolli README.md faili (inglise keeles, rohkem detaile)
2. Vaata: <https://github.com/enripetrov/designlens/issues>

**Head analüüsimist!** 🚀
