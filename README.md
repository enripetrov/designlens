# DesignLens - Website Analysis Tool

AI-powered website analyzer that generates comprehensive PRDs, design system analysis, and technical insights.

## 🚀 Quick Start (Windows)

### ⚡ Easiest Way (Recommended)

1. **Clone the repository**

   ```bash
   git clone https://github.com/enripetrov/designlens.git
   cd designlens
   ```

2. **Double-click `SETUP.bat`**
   - Automatically checks Node.js installation
   - Installs npm dependencies
   - Helps you create `.env.local` file
   - Starts the application

**That's it!** The setup wizard handles everything else! 🚀

---

### 📋 Manual Setup

### Prerequisites

1. **Node.js** (version 18 or higher)
   - Download: <https://nodejs.org/>
   - Check version: `node --version`

2. **Anthropic API Key**
   - Get it from: <https://console.anthropic.com/>
   - You need this for AI-powered PRD generation

### Installation Steps

1. **Clone the repository**

   ```bash
   git clone https://github.com/enripetrov/designlens.git
   cd designlens
   ```

2. **Create `.env.local` file**
   - Create a new file named `.env.local` in the root directory
   - Add your API key:

   ```
   ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxx
   ```

3. **Run the application**

   **Option A: Development Mode** (with hot reload)
   - Double-click `start-dev.bat`
   - Or run: `npm install && npm run dev`

   **Option B: Production Mode** (optimized)
   - Double-click `start-designlens.bat`
   - Or run: `npm install && npm run build && npm start`

4. **Open browser**
   - Automatically opens at <http://localhost:3000>
   - If not, manually navigate to this URL

## 📋 What You Need on a New Computer

### Required Files After Git Clone

- ✅ All project files (cloned from GitHub)
- ❌ `node_modules/` folder (will be auto-installed)
- ❌ `.next/` folder (will be auto-built)
- ⚠️ `.env.local` file (YOU MUST CREATE THIS!)

### Setup Checklist

- [ ] Node.js installed (check: `node --version`)
- [ ] Git installed (check: `git --version`)
- [ ] Repository cloned
- [ ] `.env.local` created with `ANTHROPIC_API_KEY`
- [ ] Run `start-dev.bat` or `start-designlens.bat`

## 🛠️ Manual Installation (if .bat files don't work)

```bash
# 1. Install dependencies
npm install

# 2. Run development server
npm run dev

# OR build for production
npm run build
npm start
```

## 🔑 Getting Your API Key

1. Go to <https://console.anthropic.com/>
2. Sign up / Log in
3. Go to "API Keys"
4. Create new key
5. Copy the key (starts with `sk-ant-`)
6. Paste into `.env.local` file

## 📁 Project Structure

```
designlens/
├── src/
│   ├── app/              # Next.js pages
│   ├── components/       # React components
│   ├── lib/             # Core logic
│   │   ├── analyzers/   # Analysis engines
│   │   └── scraper/     # Web scraping
│   └── types/           # TypeScript types
├── .env.local           # API keys (CREATE THIS!)
├── start-dev.bat        # Dev mode launcher
├── start-designlens.bat # Production launcher
└── package.json         # Dependencies
```

## ⚙️ Features

- 🌐 **Multi-page web scraping** (up to 12 subpages)
- 🤖 **AI-powered PRD generation** (using Claude 3.5 Sonnet)
- 🎨 **Design system extraction** (colors, typography, layout)
- 📊 **Visual diagrams** (page structure, typography scale)
- 📄 **Detailed subpage analysis** (5,000 chars per page)
- 🖨️ **Print-friendly reports**
- ⚡ **SEO & Performance insights**

## 🐛 Troubleshooting

### "Node is not recognized"

- Install Node.js from <https://nodejs.org/>
- Restart your terminal/command prompt

### "ANTHROPIC_API_KEY is not defined"

- Create `.env.local` file in root directory
- Add: `ANTHROPIC_API_KEY=your-key-here`

### Port 3000 already in use

- Kill the process: `npx kill-port 3000`
- Or change port in `package.json` (dev script)

### Dependencies not installing

- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

## 📝 Usage

1. Enter a website URL
2. Click "Analyze Website"
3. Wait for scraping & AI analysis (30-60 seconds)
4. View comprehensive report:
   - Executive Summary
   - User Stories
   - Functional Requirements
   - Data Model
   - API Endpoints
   - Design System
   - SEO Analysis
5. Print/Save as PDF

## 🔒 Security Notes

- **Never commit `.env.local`** to Git (already in `.gitignore`)
- Keep your API key secret
- API usage costs money - monitor your Anthropic dashboard

## 📞 Support

- **Issues**: <https://github.com/enripetrov/designlens/issues>
- **API Docs**: <https://docs.anthropic.com/>

## 📄 License

MIT License - see LICENSE file for details

---

Made with ❤️ using Next.js, TypeScript, Puppeteer, and Claude AI
