# Social Viral Creator - Riepilogo delle Funzionalità

Benvenuto in **Social Viral Creator**, un'applicazione full-stack professionale sviluppata per analizzare siti web ed estrarre trend competitor attivi al fine di generare post ad altissimo impatto organico e conversioni in Italia.

L'applicazione unisce la potenza del grounding di **Google Gemini** all'analisi strategica dei competitor attivi ricavata direttamente dalla **Facebook Ad Library (tramite Apify)**.

---

## 🚀 1. Funzionalità Principale: Crea da URL (Generatore Multi-Feed)

Questa funzionalità ti permette di trasformare qualsiasi articolo di blog, pagina prodotto o sito web in una pianificazione editoriale completa di **16 post social strategici** (8 per Facebook e 8 per Google My Business).

### Caratteristiche principali:
* **Analisi Semantica Avanzata**: Estrae automaticamente i concetti chiave, i dati salienti e l'intento di ricerca della pagina fornita.
* **Targetizzazione Demografica & Geografica (Local SEO)**: Ottimizza il tono di voce e i riferimenti in base all'età (es. 25-44 anni) e alla località selezionata (es. Milano, Italia).
* **Doppio Canale Strategico**:
  * **Facebook (8 Post)**: Post scritti con formule di storytelling, testimonianze, domande e ganci emozionali mirati alla condivisione organica.
  * **Google Business / GMB (8 Post)**: Post ottimizzati per il posizionamento locale su Google Maps, focalizzati su prossimità, fiducia, recensioni, sconti e aggiornamenti.
* **Hashtag Personalizzati**: Ogni post include **5 hashtag di tendenza** specifici per la piattaforma utilizzata.
* **Prompt per Immagini AI**: Fornisce un prompt descrittivo dettagliato in inglese per ciascun post, pronto per essere copiato e utilizzato su strumenti come Midjourney, DALL-E 3 o Imagen.
* **Integrazione File Multimediali**: Supporto per il caricamento di immagini o video di riferimento per contestualizzare la generazione dell'AI.

---

## 🔥 2. Nuova Funzionalità: Meta Viral Research Lab

Il **Meta Viral Research Lab** è una sezione di intelligence competitiva avanzata progettata per analizzare cosa sta funzionando *ora* sul mercato e replicare i pattern di successo con copie originali ottimizzate.

### Flusso di lavoro:
1. **Scansione Competitor**: L'utente inserisce la keyword della propria nicchia o il nome di un brand competitor (es: "Ristorante Milano" o "Palestra").
2. **Facebook Ad Library Scraper (Backend)**: L'applicazione interroga in tempo reale la Facebook Ad Library in Italia per estrarre gli annunci attivi ed i post con le migliori stime di engagement.
3. **Decostruzione Strategica**: L'AI analizza la struttura dei post competitor trovati (ganci cognitivi, formule di copy, posizionamento delle emoji, formati di pubblicazione).
4. **Generazione di 5 Varianti Virali**:
  * **Hook ad Alto Impatto**: Ogni variante inizia con un gancio magnetico (uno scenario reale specifico, un numero shock o un'opinione controcorrente).
  * **No Domande Retoriche**: Sono rigorosamente banditi ganci inflazionati come "Sei stanco di...".
  * **Elementi Quantitativi**: Ogni post contiene almeno un numero o una statistica reale specifica.
  * **Hashtag Dedicati**: Generazione di 5 hashtag focalizzati sul trend specifico.
  * **Prompt Immagine Dedicato**: Un prompt visivo in inglese per ciascuna variante.
5. **Relazione Strategica Integrata**:
  * **Analisi Competitor**: Perché i post della concorrenza funzionano e quali ganci emozionali sfruttano.
  * **Trend Emergenti**: Keyword e argomenti più caldi nella nicchia specifica.
  * **Consiglio Pubblicazione**: Fasce orarie ottimali e strategie di risposta per massimizzare la distribuzione algoritmica dei post generati.

---

## 🛠️ 3. Architettura Tecnica & Integrazione

L'applicazione è strutturata con un'architettura full-stack protetta:
* **Frontend (React + Vite)**: Un'interfaccia utente fluida con supporto nativo per la modalità Dark Mode (ottimizzata per l'accessibilità visiva) e stati di caricamento animati.
* **Backend Protettivo (Express.js)**: Gestisce in modo sicuro le chiamate esterne e la comunicazione con le API senza mai esporre le chiavi private al browser.
* **Fallback Demistificato (Sandbox Mode)**: Se le chiavi API nel file `.env` non sono ancora configurate, l'applicazione attiva un motore locale di copywriting intelligente e contestuale, permettendo di testare e comprendere appieno tutte le funzionalità senza interruzioni o crash.

### Variabili d'ambiente richieste (`.env`):
```env
GEMINI_API_KEY=        # Per l'utilizzo dell'SDK ufficiale di Google Gemini
OPENROUTER_API_KEY=    # Per l'utilizzo alternativo dei modelli Gemini 2.5 Pro/Flash
APIFY_TOKEN=           # Per la connessione in tempo reale con la Facebook Ad Library
```
