# Karepet Social Viral Creator 🐾

**Karepet Social Viral Creator** è un agente AI specializzato nella gestione completa dei contenuti social per Karepet (app di pet care).
Il sistema automatizza la creazione, approvazione e pubblicazione di post su Facebook, Instagram e TikTok.
Supporta strategie di contenuto, generazione di immagini e programmazione automatizzata per massimizzare l'engagement.
Progettato per mantenere un tono caldo, professionale e pratico, perfettamente in linea con il brand Karepet.

---

## Indice delle Funzionalità 🌟

### 1. 🔍 Analisi Web & Ricerca in Tempo Reale
- **Web Crawler & Scraper**: Estrae informazioni chiave direttamente dall'URL fornito (es. un articolo di blog, una pagina prodotto, o il sito di un concorrente).
- **Integrazione Search Grounding**: Cerca online i trend più recenti e le parole chiave più calde per assicurare che il contenuto sia sempre aggiornato e autorevole.

### 2. 🎯 Configurazione Avanzata del Target & SEO Locale
- **Target Audience**: Possibilità di definire con precisione l'età e gli interessi del pubblico ideale.
- **Geolocalizzazione (Local SEO)**: Ottimizzazione del testo per città o province specifiche (es. Milano, Roma), ideale per massimizzare la visibilità delle attività commerciali su GMB.
- **Tono di Voce Personalizzato**: Scelta tra diversi stili comunicativi (Persuasivo, Professionale, Divertente, Informativo, ecc.).
- **Volume Personalizzabile**: Generazione simultanea da 1 fino a un massimo di 8 post per sessione.

### 3. 📝 Generazione Post Ottimizzata per Piattaforma
- **Facebook Feed Optimizer**: Post accattivanti strutturati con ganci emozionali (hook), paragrafi scansionabili, uso bilanciato di emoji e un layout studiato per massimizzare la percentuale di click (CTR).
- **Google My Business (GMB) Specialist**: Post orientati all'azione locale, con forte accento su offerte, eventi e Call to Action chiare (es. *"Chiama ora"*, *"Prenota"*, *"Visita il sito"*).

### 4. 🏷️ Sistema hashtag di Tendenza (Novità)
- **5 Hashtag Specifici**: Per ogni post vengono generati esattamente **5 hashtag di tendenza** e pertinenti per la piattaforma.
- **Copy Interattivo**:
  - Pulsante **"Copia Tutti"** per copiare istantaneamente l'intera sequenza di hashtag negli appunti.
  - Possibilità di cliccare su **singoli hashtag** per copiarli singolarmente in un click.

### 5. 🎨 Prompt Creativi per Immagini Coordinate
- Generazione automatica di un **prompt artistico dettagliato in lingua inglese** pronto all'uso per generatori AI di immagini (come Midjourney, DALL-E 3, o Imagen 3).
- Perfetto per garantire coerenza visiva e un forte impatto estetico per ogni post generato.

### 6. 🧠 Report di Strategia di Marketing & Trend
- **Sintesi delle Ricerche**: Mostra all'utente i trend principali e le keyword SEO individuate durante la scansione web.
- **Strategia di Pubblicazione**: Include una spiegazione tecnica dettagliata sui motivi che hanno portato alla scelta di determinati argomenti, toni e tempistiche di pubblicazione consigliate.

### 7. 🌓 Interfaccia Grafica Professionale & Accessibilità
- **Tema Scuro/Chiaro automatico**: Supporto nativo per la modalità scura (Dark Mode) con controllo manuale intuitivo.
- **Accessibilità Contrasto (Risolto)**: Tutti i testi delle sezioni di copia ("Copia copy") sono stati ottimizzati con un colore ad alto contrasto (nero profondo / grigio scuro su sfondo chiaro e bianco puro su sfondo scuro) per garantire la massima leggibilità in ogni condizione di luce.
- **Stato di Copia Visivo**: Feedback interattivi istantanei quando un testo, prompt o hashtag viene copiato con successo negli appunti.

---

## Setup Locale 💻

### 1. Installazione
Clona il repository ed esegui l'installazione delle dipendenze:
```bash
npm install
```

### 2. Variabili d'Ambiente
Configura il file `.env` aggiungendo la chiave per l'AI:
```env
GEMINI_API_KEY=il_tuo_api_key_gemini_qui
# Oppure se utilizzi OpenRouter:
OPENROUTER_API_KEY=il_tuo_token_openrouter_qui
```

### 3. Avvio
Avvia l'ambiente di sviluppo locale:
```bash
npm run dev
```
L'applicazione sarà visualizzabile nel browser all'indirizzo `http://localhost:3000`.

---

## Tecnologie Principali 🛠️

- **React 18/19** & **TypeScript**
- **Vite** (bundler ultraveloce)
- **Tailwind CSS** (design responsivo)
- **Lucide React** (set di icone vettoriali e moderne)
- **Google Gen AI / OpenRouter** (motore di intelligenza artificiale)
