import type { Request, Response } from "express";
import { callOpenRouter } from "../services/contentService";

export default async function handler(req: Request, res: Response) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Metodo non consentito. Usa POST." });
  }

  const { brandName, keyword, websiteUrl } = req.body;
  
  if (websiteUrl) {
    try {
      console.log(`Analisi pubblico per sito web: ${websiteUrl}`);
      // Use OpenRouter for audience research
      const prompt = `Analyze this website: ${websiteUrl}. Identify the target audience (age, interests, behaviors) and recommend global locations for advertising. Return JSON: { "audienceDescription": string, "topInterests": string[], "recommendedGlobalLocations": string[] }.`;
      const result = await callOpenRouter("google/gemini-2.5-flash", [{ role: "user", content: prompt }]);
      return res.json({ audience: JSON.parse(result), isResearch: true });
    } catch (error: any) {
      console.error("Errore durante la ricerca pubblico:", error);
      return res.status(500).json({ error: `Errore durante la ricerca pubblico: ${error.message}` });
    }
  }

  const query = (brandName || keyword || "").trim();
  if (!query) {
    return res.status(400).json({ error: "Nome brand competitor, keyword di nicchia o URL sito richiesto." });
  }

  const apifyToken = process.env.APIFY_TOKEN;

  // Se l'APIFY_TOKEN non è configurato o è vuoto, restituiamo dati simulati di alta qualità per la demo
  if (!apifyToken || apifyToken === "PLACEHOLDER_APIFY_TOKEN" || apifyToken === "") {
    console.log("APIFY_TOKEN non configurato o placeholder. Restituzione di dati competitor simulati di alto livello.");
    const simulatedAds = getSimulatedCompetitorAds(query);
    return res.json({
      posts: simulatedAds,
      isDemo: true,
      message: "Mostrato in modalità demo. Configura APIFY_TOKEN nelle variabili d'ambiente per connettere la Facebook Ad Library reale."
    });
  }

  try {
    console.log(`Avvio Facebook Ad Library Scraper su Apify per la query: "${query}" in Italia...`);
    
    // Chiamata sincrona all'actor Apify apify/facebook-ads-scraper (alias canonicalizzato apify~facebook-ads-scraper)
    const url = `https://api.apify.com/v2/acts/apify~facebook-ads-scraper/run-sync-get-dataset-items?token=${apifyToken}`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "searchQuery": query,
        "country": "IT",
        "limit": 8,
        "activeStatus": "ACTIVE",
        "searchType": "KEYWORD",
        "publisherPlatform": ["FACEBOOK", "INSTAGRAM", "MESSENGER", "AUDIENCE_NETWORK"]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`La chiamata Apify ha risposto con errore (Status ${response.status}): ${errorText}. Ritorno ai dati simulati.`);
      throw new Error(errorText);
    }

    const items = await response.json() as any[];
    console.log(`Scraper completato con successo. Ricevuti ${items?.length || 0} risultati da Apify.`);

    if (!items || items.length === 0) {
      // Se non ci sono risultati reali, restituiamo comunque dati simulati per non lasciare l'utente a mani vuote
      return res.json({
        posts: getSimulatedCompetitorAds(query),
        isDemo: true,
        message: "Nessun annuncio attivo trovato di recente su Facebook Ad Library per questa query. Mostrati trend di nicchia simulati."
      });
    }

    // Mappiamo i risultati di Apify nel formato atteso dal frontend
    const mappedPosts = items.map((item: any, idx: number) => {
      const textBody = item.adText || item.body || item.title || item.ad_creative_body || "";
      const pageName = item.pageName || item.page?.name || item.pageTitle || `Competitor Brand #${idx + 1}`;
      const ctaText = item.cta || item.ctaText || item.callToAction || "Scopri di più";
      const imageUrl = item.imageUrl || item.images?.[0] || item.snapshotUrl || getRandomPlaceholderImage(query, idx);
      
      // Calcolo stimato dell'engagement
      const wordCount = textBody.split(/\s+/).length;
      let score = "Medio (2.9% CTR)";
      if (wordCount > 60) score = "Molto Alto (5.4% CTR)";
      else if (wordCount > 35) score = "Alto (4.1% CTR)";
      else if (wordCount > 15) score = "Stabile (3.2% CTR)";

      return {
        id: idx + 1,
        title: item.title || `Campagna di Comunicazione - ${pageName}`,
        body: textBody,
        cta: ctaText,
        engagementEstimate: score,
        pageName: pageName,
        imageUrl: imageUrl
      };
    });

    return res.json({
      posts: mappedPosts,
      isDemo: false
    });

  } catch (error: any) {
    console.error("Errore durante il recupero dei dati da Apify:", error);
    // In caso di errore di rete o altro, facciamo fallback per garantire continuità
    return res.json({
      posts: getSimulatedCompetitorAds(query),
      isDemo: true,
      message: `Errore nella connessione con Apify (${error.message || error}). Mostrati dati simulati di emergenza.`
    });
  }
}

// Funzione di utilità per ricavare immagini realistiche e ad alta qualità da Unsplash in base alla nicchia
function getRandomPlaceholderImage(query: string, index: number): string {
  const q = query.toLowerCase();
  const images = {
    food: [
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop"
    ],
    fitness: [
      "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=600&auto=format&fit=crop"
    ],
    marketing: [
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1542744094-3a31f103e35f?w=600&auto=format&fit=crop"
    ],
    realestate: [
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop"
    ],
    generic: [
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&auto=format&fit=crop"
    ]
  };

  let category: keyof typeof images = "generic";
  if (q.includes("ristorante") || q.includes("pizza") || q.includes("cibo") || q.includes("food") || q.includes("bar") || q.includes("pasticceria")) {
    category = "food";
  } else if (q.includes("palestra") || q.includes("fitness") || q.includes("sport") || q.includes("allenamento") || q.includes("personal trainer")) {
    category = "fitness";
  } else if (q.includes("marketing") || q.includes("agenzia") || q.includes("social") || q.includes("consulente") || q.includes("seo")) {
    category = "marketing";
  } else if (q.includes("casa") || q.includes("immobiliare") || q.includes("appartamento") || q.includes("villa") || q.includes("agenzia casa")) {
    category = "realestate";
  }

  const list = images[category];
  return list[index % list.length];
}

// Funzione per generare annunci competitor simulati di altissima qualità
function getSimulatedCompetitorAds(query: string): any[] {
  const q = query.toLowerCase();

  // Caso 1: Ristorazione / Food / Bar
  if (q.includes("ristorante") || q.includes("pizza") || q.includes("cibo") || q.includes("food") || q.includes("bar") || q.includes("pasticceria") || q.includes("osteria") || q.includes("sushi")) {
    return [
      {
        id: 1,
        title: "Campagna Gourmet Autunnale - Ristorante da Mimmo",
        body: "🔥 ECCO PERCHÈ IL 91% DEI NOSTRI CLIENTI TORNA ENTRO 14 GIORNI. Non è solo per la pasta fresca fatta a mano secondo la ricetta originale del 1974. È per l'esperienza sensoriale che provi fin dal primo morso. \n\nQuesta settimana abbiamo inaugurato il nuovo menù degustazione: 5 portate della tradizione rivisitate con ingredienti a KM Zero della nostra terra. 🍇\n\nDisponibilità limitata a soli 12 coperti a sera. Assicurati il tuo tavolo ora!",
        cta: "Prenota subito",
        engagementEstimate: "Molto Alto (5.8% CTR)",
        pageName: "Mimmo Tradizione & Gusto",
        imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600"
      },
      {
        id: 2,
        title: "Annuncio Locale - Pizzeria Romana Croccante",
        body: "⚡ LA VERA PIZZA IN TEGLIA ALLA ROMANA CHE SCROCCHIA SOTTO I DENTI. Lievitata per ben 72 ore per una digeribilità leggendaria. \n\nTroppo spesso ordini una pizza a domicilio e ti arriva a casa molle o fredda. Noi abbiamo sviluppato un contenitore termico brevettato che preserva la fragranza fino a 40 minuti dal forno alla tua tavola! Prova la nostra speciale Margherita Royale con Bufala a crudo e basilico fresco. 🍕",
        cta: "Ordina ora",
        engagementEstimate: "Alto (4.5% CTR)",
        pageName: "La Regina della Pizza Roma",
        imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600"
      },
      {
        id: 3,
        title: "Promo Aperitivo Trend - Terrazza Duomo Lounge",
        body: "🌅 L'Aperitivo panoramico a Milano con la vista più instagrammabile della città. Nessun costo di coperto nascosto, solo ottimi cocktail preparati da mixologist pluripremiati e una selezione di finger food gourmet inclusa nel prezzo. \n\nOgni giovedì dalle 18:30 dj set live per staccare dallo stress settimanale. I posti in prima fila sulla balconata vanno a ruba in meno di 2 ore. Registrati per ricevere l'accesso prioritario! 🍹",
        cta: "Iscriviti",
        engagementEstimate: "Stabile (3.6% CTR)",
        pageName: "Skyline Lounge Milano",
        imageUrl: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600"
      }
    ];
  }

  // Caso 2: Palestra / Fitness / Sport / Coach
  if (q.includes("palestra") || q.includes("fitness") || q.includes("sport") || q.includes("allenamento") || q.includes("personal trainer") || q.includes("corsa") || q.includes("crossfit")) {
    return [
      {
        id: 1,
        title: "Programma Trasformazione Fisica - Iron Club Gym",
        body: "🚫 BASTA PERDERE TEMPO CON SCHEDE DI ALLENAMENTO COPIATE SU INTERNET. Se dopo 3 mesi di sacrifici non vedi ancora i risultati che desideri, il problema non è la tua genetica, ma il metodo. \n\nCon il nostro protocollo personalizzato 'Metabolic-30' ti alleni solo 3 volte alla settimana per 45 minuti, focalizzandoti sull'attivazione muscolare e sull'ottimizzazione del metabolismo basale. Più di 340 persone hanno già trasformato il loro corpo quest'anno. Richiedi la tua prima consulenza gratuita con analisi corporea!",
        cta: "Richiedi un preventivo",
        engagementEstimate: "Molto Alto (6.2% CTR)",
        pageName: "Evolution Fitness Studio",
        imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600"
      },
      {
        id: 2,
        title: "Annuncio Pilates & Wellness - Studio Balance",
        body: "🧘‍♀️ DÌ ADDIO AL MAL DI SCHIENA IN SOLI 21 GIORNI. Chi passa più di 6 ore al giorno seduto davanti a un PC sa bene quanto la postura possa influire sull'energia quotidiana. \n\nLe nostre classi di Pilates Reformer a numero chiuso (massimo 6 persone) ti permettono di essere seguito passo dopo passo da un istruttore certificato, correggendo ogni movimento in tempo reale. Ritrova flessibilità, forza profonda e una mente distesa. Clicca per prenotare la tua lezione di prova a metà prezzo! ✨",
        cta: "Prenota ora",
        engagementEstimate: "Alto (4.2% CTR)",
        pageName: "Spazio Equilibrio Corporeo",
        imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600"
      }
    ];
  }

  // Caso 3: Immobiliare / Case
  if (q.includes("casa") || q.includes("immobiliare") || q.includes("appartamento") || q.includes("villa") || q.includes("agenzia") || q.includes("vendita")) {
    return [
      {
        id: 1,
        title: "Annuncio Valutazione Professionale - Agenzia Premium",
        body: "🏠 QUANTO VALE DAVVERO LA TUA CASA SUL MERCATO ODIERNO? Nel 2026 i prezzi degli immobili sono cambiati del +12% rispetto allo scorso anno. Basarsi sulle stime automatiche dei siti web o su dicerie del vicino può farti perdere decine di migliaia di euro. \n\nIl nostro team offre una perizia certificata basata sulle transazioni reali concluse nella tua stessa via negli ultimi 90 giorni. Nessuna stima ipotetica, solo dati reali per vendere al miglior prezzo in meno di 45 giorni. Richiedi la valutazione gratuita!",
        cta: "Contattaci",
        engagementEstimate: "Molto Alto (5.1% CTR)",
        pageName: "Lux & Co. Real Estate",
        imageUrl: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600"
      },
      {
        id: 2,
        title: "Open House Esclusivo - Residenza Giardini",
        body: "✨ TRILOCALE NUOVO IN CLASSE A4 CON TERRAZZO ABITABILE. Vuoi abbattere le bollette del gas e vivere in un'oasi tecnologica immersa nel verde? \n\nSiamo felici di presentare l'esclusivo trilocale in via dei Platani: domotica integrata, riscaldamento a pavimento con pompa di calore, impianto fotovoltaico privato e box auto incluso. Sabato prossimo terremo un evento Open House dalle 10:00 alle 16:00. L'ingresso è su invito riservato per le prime 15 coppie prenotate.",
        cta: "Scopri di più",
        engagementEstimate: "Alto (4.8% CTR)",
        pageName: "Domus Nova Costruzioni",
        imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600"
      }
    ];
  }

  // Caso 4: Generico per qualsiasi altra keyword
  return [
    {
      id: 1,
      title: `Campagna Virale per ${query}`,
      body: `🚀 IL SEGRETO DEL SUCCESSO DI UN BRAND NELLA NICCHIA "${query.toUpperCase()}". Troppo spesso si sprecano budget enormi in pubblicità che nessuno nota. La verità è che il consumatore moderno cerca autenticità, trasparenza e soluzioni immediate ai propri problemi quotidiani.\n\nEcco le 3 regole auree che applichiamo per far crescere del +45% le conversioni dei nostri clienti:\n👉 Analisi ossessiva dei concorrenti e dei loro punti deboli\n👉 Offerta irresistibile priva di rischi per chi acquista\n👉 Copywriting ipnotico che parla alla pancia del cliente, non alla testa.`,
      cta: "Scopri come fare",
      engagementEstimate: "Molto Alto (4.9% CTR)",
      pageName: `${query.charAt(0).toUpperCase() + query.slice(1)} Innovation Group`,
      imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600"
    },
    {
      id: 2,
      title: `Annuncio Offerta Speciale - Professionisti ${query}`,
      body: `⚡ ATTENZIONE: Se operi nel settore "${query.toUpperCase()}", questa notizia potrebbe stravolgere i tuoi piani per i prossimi 6 mesi. Il mercato si sta evolvendo rapidamente e l'80% degli operatori tradizionali rischia di rimanere tagliato fuori entro fine anno.\n\nAbbiamo preparato una guida strategica completa in PDF che spiega passo-passo la nostra metodologia proprietaria per scalare i profitti riducendo del 30% i costi operativi. Clicca sul link ed effettua il download immediato prima che venga rimossa!`,
      cta: "Scarica il PDF",
      engagementEstimate: "Alto (4.0% CTR)",
      pageName: `Studio Consulting ${query.charAt(0).toUpperCase() + query.slice(1)}`,
      imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600"
    }
  ];
}
