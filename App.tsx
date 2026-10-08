import React, { useState, useRef, useEffect } from 'react';
import { 
  Share2, Facebook, Store, Search, Loader2, Link, 
  FileText, ExternalLink, AlertCircle, Upload, Users, 
  MapPin, CheckSquare, Square, Zap, X, Sun, Moon,
  Sparkles, RotateCcw, Copy, Check, Image, HelpCircle, Hash
} from 'lucide-react';
import { PostResult, SocialPlatforms, MediaData, CompetitorPost, MetaViralResult } from './types';

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  
  // Navigation
  const [mainTab, setMainTab] = useState<'generate' | 'meta-viral'>('generate');

  // URL Generation State
  const [url, setUrl] = useState('');
  const [instructions, setInstructions] = useState('');
  const [platforms, setPlatforms] = useState<SocialPlatforms>({ facebook: true, instagram: true, tiktok: true });
  const [media, setMedia] = useState<MediaData | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  
  const [state, setState] = useState<'IDLE' | 'RESEARCHING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [result, setResult] = useState<PostResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState<'facebook' | 'instagram' | 'tiktok'>('facebook');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [postFilter, setPostFilter] = useState<number | 'all'>('all');

  // Meta Viral Research State
  const [metaSearchQuery, setMetaSearchQuery] = useState('');
  const [metaLocation, setMetaLocation] = useState('Milano');
  const [metaTarget, setMetaTarget] = useState('25-44 anni, professionisti');
  const [metaTone, setMetaTone] = useState('Persuasivo');

  const [metaIsResearching, setMetaIsResearching] = useState(false);
  const [metaIsGenerating, setMetaIsGenerating] = useState(false);
  const [metaCompetitors, setMetaCompetitors] = useState<CompetitorPost[] | null>(null);
  const [metaResult, setMetaResult] = useState<MetaViralResult | null>(null);
  const [metaError, setMetaError] = useState<string | null>(null);
  const [metaDemoMessage, setMetaDemoMessage] = useState<string | null>(null);
  const [metaCopiedId, setMetaCopiedId] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const metaResultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError("Il file è troppo grande. Massimo 10MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      setMedia({ data: base64String, mimeType: file.type });
      setMediaPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const triggerUrlGeneration = async () => {
    if (!url) {
      setError("Inserisci un URL valido da analizzare.");
      return;
    }
    if (!platforms.facebook && !platforms.instagram && !platforms.tiktok) {
      setError("Seleziona almeno un canale social.");
      return;
    }

    setState('RESEARCHING');
    setError(null);

    try {
      const response = await fetch("/api/generate-social-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          instructions,
          audience: { location: "Global" },
          platforms,
          media: media || undefined
        })
      });

      if (!response.ok) {
        throw new Error("Errore durante la generazione dei contenuti.");
      }
      
      const data = await response.json();
      setResult(data);
      setState('SUCCESS');
      
      if (platforms.facebook) {
        setActiveTab('facebook');
      } else if (platforms.instagram) {
        setActiveTab('instagram');
      } else if (platforms.tiktok) {
        setActiveTab('tiktok');
      }
      
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Errore nella generazione dei contenuti. Verifica le impostazioni e riprova.");
      setState('ERROR');
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerUrlGeneration();
  };

  const handleCopy = (text: string, idKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(idKey);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const handleMetaCopy = (text: string, idKey: string) => {
    navigator.clipboard.writeText(text);
    setMetaCopiedId(idKey);
    setTimeout(() => {
      setMetaCopiedId(null);
    }, 2000);
  };

  const discoverMetaTrends = async () => {
    if (!metaSearchQuery.trim()) {
      setMetaError("Inserisci nome brand competitor o keyword di nicchia.");
      return;
    }

    setMetaIsResearching(true);
    setMetaIsGenerating(true);
    setMetaError(null);
    setMetaDemoMessage(null);
    setMetaCompetitors(null);
    setMetaResult(null);

    try {
      // 1. Chiamata ad Apify (Meta Research)
      const researchRes = await fetch("/api/meta-research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName: metaSearchQuery,
          keyword: metaSearchQuery
        })
      });

      if (!researchRes.ok) {
        throw new Error("Impossibile contattare il server per l'analisi competitor.");
      }

      const researchData = await researchRes.json();
      setMetaCompetitors(researchData.posts);
      
      if (researchData.isDemo) {
        setMetaDemoMessage(researchData.message);
      }
      
      setMetaIsResearching(false);

      // 2. Chiamata a OpenRouter / Gemini per generare i copy virali
      const copyRes = await fetch("/api/generate-viral-copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          posts: researchData.posts,
          tono: metaTone,
          target: metaTarget,
          localita: metaLocation,
          keyword: metaSearchQuery
        })
      });

      if (!copyRes.ok) {
        throw new Error("Impossibile generare le copie virali. Riprova più tardi.");
      }

      const copyData = await copyRes.json();
      setMetaResult(copyData);

      if (copyData.isDemo && !researchData.isDemo) {
        setMetaDemoMessage(copyData.message);
      }

      setTimeout(() => {
        metaResultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);

    } catch (err: any) {
      console.error(err);
      setMetaError(err.message || "Errore nel flusso Meta Viral Research.");
    } finally {
      setMetaIsResearching(false);
      setMetaIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 flex flex-col items-center py-8 px-4 md:px-8">
      {/* Header */}
      <header className="w-full max-w-5xl text-center mb-6 relative">
        <button 
          onClick={() => setDarkMode(!darkMode)}
          className="absolute top-0 right-0 p-3 rounded-full bg-white dark:bg-slate-900 shadow-md border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:scale-105 transition-all z-10"
          title="Cambia tema"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <div className="flex justify-center mb-4">
          <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-3 rounded-2xl shadow-xl">
            <Sparkles className="text-white w-8 h-8 animate-pulse" />
          </div>
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
          Social<span className="text-blue-600 dark:text-blue-400">Viral</span> Creator
        </h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto font-medium text-sm md:text-base">
          Crea contenuti ad alte prestazioni partendo da siti web, o studia i competitor attivi per generare copy virali.
        </p>
      </header>

      {/* Main Tab Navigation */}
      <div className="w-full max-w-5xl flex justify-center mb-8">
        <div className="bg-white dark:bg-slate-900 p-1.5 rounded-2xl shadow-md border border-slate-200/60 dark:border-slate-800 flex gap-2 w-full max-w-md">
          <button
            onClick={() => setMainTab('generate')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-black text-xs md:text-sm transition-all ${mainTab === 'generate' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            <Sparkles className="w-4 h-4" />
            Crea da URL
          </button>
          <button
            onClick={() => setMainTab('meta-viral')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-black text-xs md:text-sm transition-all ${mainTab === 'meta-viral' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/10' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            <Zap className="w-4 h-4" />
            Meta Viral Research
          </button>
        </div>
      </div>

      <main className="w-full max-w-5xl space-y-6">
        {/* VIEW 1: URL GENERATOR */}
        {mainTab === 'generate' && (
          <div className="space-y-6">
            {/* Form Section */}
            <section className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
              <form onSubmit={handleUrlSubmit} className="divide-y divide-slate-100 dark:divide-slate-800">
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div className="space-y-5">
                    <div>
                      <label className="flex items-center gap-2 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                        <Link className="w-3.5 h-3.5" /> Sorgente Articolo / Sito Web
                      </label>
                      <input
                        type="url"
                        required
                        placeholder="https://esempio.it/tuo-articolo-o-pagina"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                        <Users className="w-3.5 h-3.5" /> Pubblico & Localizzazione
                      </label>
                      <div className="grid grid-cols-1 gap-3">
                        <div className="relative">
                          <p className="w-full pl-4 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-sm italic">
                            Localizzazione: Tutto il mondo
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                        <CheckSquare className="w-3.5 h-3.5" /> Canali Da Generare
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          type="button"
                          onClick={() => setPlatforms(p => ({...p, facebook: !p.facebook}))}
                          className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all font-bold text-sm ${platforms.facebook ? 'border-blue-500 bg-blue-50/50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400' : 'border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600'}`}
                        >
                          {platforms.facebook ? <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" /> : <Square className="w-5 h-5" />}
                          Facebook (8 Post)
                        </button>
                        <button 
                          type="button"
                          onClick={() => setPlatforms(p => ({...p, instagram: !p.instagram}))}
                          className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all font-bold text-sm ${platforms.instagram ? 'border-orange-500 bg-orange-50/50 text-orange-700 dark:bg-orange-950/20 dark:text-orange-400' : 'border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600'}`}
                        >
                          {platforms.instagram ? <CheckSquare className="w-5 h-5 text-orange-600 dark:text-orange-400" /> : <Square className="w-5 h-5" />}
                          Instagram (8 Post)
                        </button>
                        <button 
                          type="button"
                          onClick={() => setPlatforms(p => ({...p, tiktok: !p.tiktok}))}
                          className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all font-bold text-sm ${platforms.tiktok ? 'border-orange-500 bg-orange-50/50 text-orange-700 dark:bg-orange-950/20 dark:text-orange-400' : 'border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600'}`}
                        >
                          {platforms.tiktok ? <CheckSquare className="w-5 h-5 text-orange-600 dark:text-orange-400" /> : <Square className="w-5 h-5" />}
                          TikTok (8 Post)
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-5">
                    <div>
                      <label className="flex items-center gap-2 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                        <Upload className="w-3.5 h-3.5" /> Allegato Di Riferimento (Opzionale)
                      </label>
                      {!mediaPreview ? (
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl h-44 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-900/5 transition-all group"
                        >
                          <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full group-hover:scale-110 transition-transform">
                            <Upload className="w-6 h-6 text-slate-400" />
                          </div>
                          <span className="text-xs text-slate-500 font-bold uppercase tracking-tighter text-center px-4">Trascina un file o clicca per caricare</span>
                          <input type="file" hidden ref={fileInputRef} onChange={handleFileUpload} accept="image/*,video/*" />
                        </div>
                      ) : (
                        <div className="relative h-44 rounded-2xl overflow-hidden shadow-inner group border border-slate-100 dark:border-slate-800">
                          {media?.mimeType.startsWith('image') ? (
                            <img src={mediaPreview} className="w-full h-full object-cover" alt="Anteprima caricata" />
                          ) : (
                            <video src={mediaPreview} className="w-full h-full object-cover" />
                          )}
                          <button 
                            type="button"
                            onClick={() => { setMedia(null); setMediaPreview(null); }}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:scale-110 transition-all"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Form Section */}
                <div className="p-6 bg-slate-50/50 dark:bg-slate-900/50">
                  <label className="flex items-center gap-2 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
                    <FileText className="w-3.5 h-3.5" /> Note Strategiche & Obiettivi (Opzionale)
                  </label>
                  <textarea
                    placeholder="Es: Evidenzia i prezzi competitivi, usa uno stile narrativo, focalizzati sui benefici ecologici locali..."
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all h-28 resize-none mb-6"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                  />

                  <button
                    type="submit"
                    disabled={state === 'RESEARCHING'}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-200 dark:shadow-none transition-all flex items-center justify-center gap-4 text-xl group"
                  >
                    {state === 'RESEARCHING' ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        ANALISI E CREAZIONE IN CORSO...
                      </>
                    ) : (
                      <>
                        <Zap className="w-6 h-6 fill-current group-hover:animate-pulse" />
                        GENERA 16 POST STRATEGICI
                      </>
                    )}
                  </button>
                </div>
              </form>
            </section>

            {/* Error message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-6 py-4 rounded-2xl flex items-center gap-3 animate-pulse">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="font-bold text-sm">{error}</p>
              </div>
            )}

            {/* Standard Results Render */}
            {(result || state === 'RESEARCHING') && (
              <div ref={resultsRef} className="space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-700 pb-20">
                {state === 'SUCCESS' && (
                  <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-2 px-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Pianificazione Contenuti Generata con Successo</span>
                    </div>
                    <button 
                      onClick={triggerUrlGeneration}
                      disabled={state === 'RESEARCHING'}
                      className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-xl text-sm font-black transition-all group"
                    >
                      <RotateCcw className={`w-4 h-4 group-hover:rotate-180 transition-transform duration-500 ${state === 'RESEARCHING' ? 'animate-spin' : ''}`} />
                      RIGENERA TUTTO
                    </button>
                  </div>
                )}

                {result && state === 'SUCCESS' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-indigo-600 text-white rounded-3xl p-6 shadow-xl">
                        <h3 className="text-sm font-black mb-4 flex items-center gap-2 uppercase tracking-tighter opacity-80">
                          <Search className="w-4 h-4" /> SEO & Trend Locali Trovati
                        </h3>
                        <p className="text-indigo-50 leading-relaxed text-sm font-medium">
                          {result.researchSummary || "Sintesi non disponibile."}
                        </p>
                        {result.sources && result.sources.length > 0 && (
                          <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-indigo-500/30">
                            {result.sources.map((source, i) => (
                              <a key={i} href={source.uri} target="_blank" rel="noopener noreferrer" className="text-[10px] bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full flex items-center gap-1 transition-colors">
                                {source.title.length > 25 ? source.title.substring(0, 25) + '...' : source.title} <ExternalLink className="w-2 h-2" />
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="bg-slate-900 dark:bg-slate-800 text-slate-100 rounded-3xl p-6 shadow-xl">
                        <h3 className="text-sm font-black mb-4 flex items-center gap-2 uppercase tracking-tighter opacity-80">
                          <Sparkles className="w-4 h-4 text-yellow-400" /> Logica di Marketing Strategica
                        </h3>
                        <p className="text-slate-300 leading-relaxed text-sm font-medium italic">
                          "{result.marketingStrategy || "Logica di marketing non disponibile."}"
                        </p>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-lg border border-slate-100 dark:border-slate-800">
                      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-slate-805">
                        <div className="flex gap-2">
                          {platforms.facebook && (
                            <button
                              onClick={() => { setActiveTab('facebook'); setPostFilter('all'); }}
                              className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-sm transition-all ${activeTab === 'facebook' ? 'bg-[#1877F2] text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'}`}
                            >
                              <Facebook className="w-4 h-4" />
                              Facebook
                              <span className="text-xs bg-white/25 px-2 py-0.5 rounded-full ml-1">8 post</span>
                            </button>
                          )}
                          {platforms.gmb && (
                            <button
                              onClick={() => { setActiveTab('gmb'); setPostFilter('all'); }}
                              className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-sm transition-all ${activeTab === 'gmb' ? 'bg-[#F25C05] text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'}`}
                            >
                              <Store className="w-4 h-4" />
                              Google Business
                              <span className="text-xs bg-white/25 px-2 py-0.5 rounded-full ml-1">8 post</span>
                            </button>
                          )}
                          
                          {/* Semplice pulsante di redirect rapido verso Meta Research */}
                          <button
                            onClick={() => { setMainTab('meta-viral'); }}
                            className="flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-sm transition-all bg-indigo-50/50 hover:bg-indigo-100 text-indigo-700 dark:bg-slate-800 dark:text-indigo-400"
                          >
                            <Zap className="w-4 h-4 text-indigo-500" />
                            Meta Viral
                            <span className="text-[10px] bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 rounded-full ml-1 hidden sm:inline">Nuovo!</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-1 overflow-x-auto py-1">
                          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-2 hidden md:inline">Filtra:</span>
                          <button
                            onClick={() => setPostFilter('all')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${postFilter === 'all' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100'}`}
                          >
                            Tutti
                          </button>
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                            <button
                              key={num}
                              onClick={() => setPostFilter(num)}
                              className={`w-8 h-8 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center ${postFilter === num ? 'bg-blue-600 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100'}`}
                            >
                              {num}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-6">
                        {activeTab === 'facebook' && result.facebookPosts && (
                          result.facebookPosts.length === 0 ? (
                            <div className="text-center py-10 text-slate-400">Nessun post Facebook generato.</div>
                          ) : (
                            result.facebookPosts
                              .filter(post => postFilter === 'all' || post.id === postFilter)
                              .map((post) => (
                                <div key={post.id} className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                                  <div className="bg-blue-50/50 dark:bg-blue-950/20 px-6 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-2">
                                      <span className="w-6 h-6 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-xs font-black">{post.id}</span>
                                      <h4 className="font-black text-sm text-slate-800 dark:text-slate-200 uppercase tracking-tight">Facebook Post #{post.id}</h4>
                                    </div>
                                    <button 
                                      onClick={() => handleCopy(post.text, `fb-text-${post.id}`)}
                                      className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${copiedId === `fb-text-${post.id}` ? 'bg-green-500 text-white' : 'bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-black dark:text-slate-200'}`}
                                    >
                                      {copiedId === `fb-text-${post.id}` ? <><Check className="w-3 h-3" /> Copiato!</> : <><Copy className="w-3 h-3" /> Copia Copy</>}
                                    </button>
                                  </div>
                                  <div className="p-6">
                                    <div className="whitespace-pre-wrap text-black dark:text-slate-100 leading-relaxed text-sm font-medium mb-5 bg-slate-100 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                                      {post.text}
                                    </div>

                                    {post.hashtags && post.hashtags.length > 0 && (
                                      <div className="mb-5 bg-blue-50/20 dark:bg-slate-900/40 p-4 rounded-xl border border-blue-100/30 dark:border-slate-800">
                                        <div className="flex justify-between items-center mb-2.5">
                                          <span className="text-[10px] font-black uppercase tracking-wider text-[#1877F2] dark:text-blue-400 flex items-center gap-1.5">
                                            <Hash className="w-3.5 h-3.5 text-[#1877F2] dark:text-blue-500" /> 5 Hashtag di Tendenza Facebook
                                          </span>
                                          <button 
                                            type="button"
                                            onClick={() => handleCopy(post.hashtags.join(" "), `fb-tags-${post.id}`)}
                                            className={`text-[10px] px-2.5 py-1 rounded-md font-bold transition-all ${copiedId === `fb-tags-${post.id}` ? 'bg-green-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300'}`}
                                          >
                                            {copiedId === `fb-tags-${post.id}` ? 'Copiati!' : 'Copia Tutti'}
                                          </button>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                          {post.hashtags.map((tag, idx) => (
                                            <span 
                                              key={idx} 
                                              onClick={() => handleCopy(tag, `fb-tag-${post.id}-${idx}`)}
                                              className={`text-xs font-bold px-2.5 py-1 rounded-lg cursor-pointer transition-all border ${copiedId === `fb-tag-${post.id}-${idx}` ? 'bg-green-500 text-white border-green-500' : 'bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950 text-blue-600 dark:text-blue-400 border-slate-200/60 dark:border-slate-800'}`}
                                            >
                                              {tag}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    <div className="bg-indigo-50/40 dark:bg-slate-900/30 border border-indigo-100/50 dark:border-slate-800 rounded-xl p-4">
                                      <div className="flex justify-between items-center mb-2">
                                        <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                                          <Image className="w-3.5 h-3.5 text-indigo-500" /> Prompt Immagine Coordinata (AI)
                                        </span>
                                        <button 
                                          onClick={() => handleCopy(post.imagePrompt, `fb-prompt-${post.id}`)}
                                          className={`text-[10px] px-2.5 py-1 rounded-md font-bold transition-all flex items-center gap-1 ${copiedId === `fb-prompt-${post.id}` ? 'bg-green-500 text-white' : 'bg-indigo-50 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-slate-700'}`}
                                        >
                                          {copiedId === `fb-prompt-${post.id}` ? 'Prompt Copiato!' : 'Copia Prompt'}
                                        </button>
                                      </div>
                                      <p className="text-xs font-mono text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-800 leading-relaxed select-all">
                                        {post.imagePrompt}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))
                          )
                        )}

                        {activeTab === 'gmb' && result.gmbPosts && (
                          result.gmbPosts.length === 0 ? (
                            <div className="text-center py-10 text-slate-400">Nessun post Google Business generato.</div>
                          ) : (
                            result.gmbPosts
                              .filter(post => postFilter === 'all' || post.id === postFilter)
                              .map((post) => (
                                <div key={post.id} className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                                  <div className="bg-orange-50/50 dark:bg-orange-950/20 px-6 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-2">
                                      <span className="w-6 h-6 rounded-full bg-[#F25C05] text-white flex items-center justify-center text-xs font-black">{post.id}</span>
                                      <h4 className="font-black text-sm text-slate-800 dark:text-slate-200 uppercase tracking-tight">Google Post #{post.id}</h4>
                                    </div>
                                    <button 
                                      onClick={() => handleCopy(post.text, `gmb-text-${post.id}`)}
                                      className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${copiedId === `gmb-text-${post.id}` ? 'bg-green-500 text-white' : 'bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-black dark:text-slate-200'}`}
                                    >
                                      {copiedId === `gmb-text-${post.id}` ? <><Check className="w-3 h-3" /> Copiato!</> : <><Copy className="w-3 h-3" /> Copia Copy</>}
                                    </button>
                                  </div>
                                  <div className="p-6">
                                    <div className="whitespace-pre-wrap text-black dark:text-slate-100 leading-relaxed text-sm font-medium mb-5 bg-slate-100 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                                      {post.text}
                                    </div>

                                    {post.hashtags && post.hashtags.length > 0 && (
                                      <div className="mb-5 bg-orange-50/20 dark:bg-slate-900/40 p-4 rounded-xl border border-orange-100/20 dark:border-slate-800">
                                        <div className="flex justify-between items-center mb-2.5">
                                          <span className="text-[10px] font-black uppercase tracking-wider text-[#F25C05] dark:text-orange-400 flex items-center gap-1.5">
                                            <Hash className="w-3.5 h-3.5 text-[#F25C05] dark:text-orange-500" /> 5 Hashtag di Tendenza GMB (Local SEO)
                                          </span>
                                          <button 
                                            type="button"
                                            onClick={() => handleCopy(post.hashtags.join(" "), `gmb-tags-${post.id}`)}
                                            className={`text-[10px] px-2.5 py-1 rounded-md font-bold transition-all ${copiedId === `gmb-tags-${post.id}` ? 'bg-green-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300'}`}
                                          >
                                            {copiedId === `gmb-tags-${post.id}` ? 'Copiati!' : 'Copia Tutti'}
                                          </button>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                          {post.hashtags.map((tag, idx) => (
                                            <span 
                                              key={idx} 
                                              onClick={() => handleCopy(tag, `gmb-tag-${post.id}-${idx}`)}
                                              className={`text-xs font-bold px-2.5 py-1 rounded-lg cursor-pointer transition-all border ${copiedId === `gmb-tag-${post.id}-${idx}` ? 'bg-green-500 text-white border-green-500' : 'bg-white dark:bg-slate-800 hover:bg-orange-50 dark:hover:bg-orange-950 text-orange-600 dark:text-orange-400 border-slate-200/60 dark:border-slate-800'}`}
                                            >
                                              {tag}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    <div className="bg-orange-50/30 dark:bg-slate-900/30 border border-orange-100/50 dark:border-slate-800 rounded-xl p-4">
                                      <div className="flex justify-between items-center mb-2">
                                        <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 dark:text-orange-400 flex items-center gap-1.5">
                                          <Image className="w-3.5 h-3.5 text-orange-500" /> Prompt Immagine Coordinata (AI)
                                        </span>
                                        <button 
                                          onClick={() => handleCopy(post.imagePrompt, `gmb-prompt-${post.id}`)}
                                          className={`text-[10px] px-2.5 py-1 rounded-md font-bold transition-all flex items-center gap-1 ${copiedId === `gmb-prompt-${post.id}` ? 'bg-green-500 text-white' : 'bg-orange-50 dark:bg-slate-800 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-slate-700'}`}
                                        >
                                          {copiedId === `gmb-prompt-${post.id}` ? 'Prompt Copiato!' : 'Copia Prompt'}
                                        </button>
                                      </div>
                                      <p className="text-xs font-mono text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-800 leading-relaxed select-all">
                                        {post.imagePrompt}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))
                          )
                        )}
                      </div>
                    </div>
                    
                    <div className="flex justify-center pt-8">
                      <button 
                        onClick={triggerUrlGeneration}
                        disabled={state === 'RESEARCHING'}
                        className="flex items-center gap-3 bg-white dark:bg-slate-900 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 px-8 py-4 rounded-2xl text-lg font-black shadow-lg hover:shadow-blue-200 dark:hover:shadow-none transition-all group"
                      >
                        <RotateCcw className={`w-5 h-5 group-hover:rotate-180 transition-transform duration-700 ${state === 'RESEARCHING' ? 'animate-spin' : ''}`} />
                        RIGENERA NUOVE VARIANTI
                      </button>
                    </div>
                  </>
                )}
                
                {state === 'RESEARCHING' && (
                  <div className="flex flex-col items-center justify-center py-20 space-y-6">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                    <div className="text-center">
                      <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase">Analisi Web, SEO & AI Generativa</h3>
                      <p className="text-slate-500 dark:text-slate-400 font-medium font-semibold">Stiamo studiando i trend della pagina e programmando i 16 post...</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: META VIRAL RESEARCH */}
        {mainTab === 'meta-viral' && (
          <div className="space-y-6">
            {/* Input Config Panel */}
            <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-indigo-600 p-2.5 rounded-xl text-white">
                  <Zap className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">META VIRAL RESEARCH LAB</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Scansiona annunci reali in Italia ed estrai trend, formule ed emoji vincenti per generare post magnetici.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                <div>
                  <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                    <Search className="w-3.5 h-3.5 text-indigo-500" /> Brand Competitor o Nicchia
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Es: Ristorante Mimmo, palestra, copywriting"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none font-medium"
                    value={metaSearchQuery}
                    onChange={(e) => setMetaSearchQuery(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-indigo-500" /> Località (Local SEO)
                  </label>
                  <input
                    type="text"
                    placeholder="Es: Milano, Italia"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none font-medium"
                    value={metaLocation}
                    onChange={(e) => setMetaLocation(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-indigo-500" /> Tono di Voce
                  </label>
                  <select
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none cursor-pointer font-black"
                    value={metaTone}
                    onChange={(e) => setMetaTone(e.target.value)}
                  >
                    <option value="Persuasivo">Persuasivo (Forte conversione)</option>
                    <option value="Professionale">Professionale (Istituzionale)</option>
                    <option value="Divertente">Divertente (Ironico / Virale)</option>
                    <option value="Informativo">Informativo (Valore puro)</option>
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Target Pubblico Dettagliato</label>
                <input
                  type="text"
                  placeholder="Es: Imprenditori locali a Milano, donne 30-50 anni interessate allo yoga, appassionati di pizza gourmet..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none font-medium"
                  value={metaTarget}
                  onChange={(e) => setMetaTarget(e.target.value)}
                />
              </div>

              <button
                onClick={discoverMetaTrends}
                disabled={metaIsResearching || metaIsGenerating}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-200 dark:shadow-none transition-all flex items-center justify-center gap-3 text-lg group"
              >
                {metaIsResearching ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    ESTRAZIONE IN CORSO DA FACEBOOK AD LIBRARY...
                  </>
                ) : metaIsGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    AI ELABORAZIONE POST IN CORSO...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 fill-current group-hover:animate-pulse" />
                    Scopri Trend Virali
                  </>
                )}
              </button>
            </section>

            {/* Error notifications */}
            {metaError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-6 py-4 rounded-2xl flex items-center gap-3 animate-pulse">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="font-bold text-sm">{metaError}</p>
              </div>
            )}

            {/* Demo notifications */}
            {metaDemoMessage && (
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-400 px-6 py-4 rounded-2xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-500" />
                <div className="text-sm">
                  <span className="font-extrabold block mb-0.5">Sandbox Mode Attivo</span>
                  <p className="font-medium opacity-90">{metaDemoMessage}</p>
                </div>
              </div>
            )}

            {/* Loading Indicators */}
            {(metaIsResearching || metaIsGenerating) && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 shadow-lg border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center space-y-4">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                <div>
                  <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
                    {metaIsResearching ? "Scansione Attiva Facebook Ad Library IT" : "Ingegneria Strategica del Copy"}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold max-w-md mx-auto mt-1 leading-relaxed">
                    {metaIsResearching 
                      ? `Estrazione e categorizzazione di post attivi con alto livello di interazione per "${metaSearchQuery || "la nicchia"}"...`
                      : "Generazione di 5 varianti di post virali unici basati sulla decostruzione dei migliori annunci competitor trovati."}
                  </p>
                </div>
              </div>
            )}

            {/* Complete Results Grid */}
            {metaCompetitors && metaResult && !metaIsResearching && !metaIsGenerating && (
              <div ref={metaResultsRef} className="space-y-8 animate-in fade-in duration-500">
                {/* 3 Columns Board */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                  
                  {/* Column 1: Post Virali Trovati */}
                  <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-md flex flex-col h-[780px]">
                    <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-4 flex items-center justify-between">
                      <h3 className="font-black text-sm text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <Facebook className="w-4 h-4 text-[#1877F2]" /> Post Virali Trovati
                      </h3>
                      <span className="text-[10px] bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">Competitor Live</span>
                    </div>

                    <div className="overflow-y-auto space-y-4 flex-1 pr-1 custom-scrollbar">
                      {metaCompetitors.map((post, idx) => (
                        <div key={post.id || idx} className="bg-slate-50 dark:bg-slate-850/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80 space-y-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex items-center justify-center text-xs font-black text-slate-600 dark:text-slate-300">
                              {post.pageName ? post.pageName.substring(0, 2).toUpperCase() : "FB"}
                            </div>
                            <div>
                              <div className="font-black text-xs text-slate-800 dark:text-slate-200 leading-tight">{post.pageName}</div>
                              <div className="text-[9px] font-bold text-emerald-600 dark:text-green-400">{post.engagementEstimate}</div>
                            </div>
                          </div>

                          <div className="text-xs text-slate-700 dark:text-slate-300 line-clamp-6 leading-relaxed whitespace-pre-wrap font-medium">
                            {post.body}
                          </div>

                          {post.imageUrl && (
                            <div className="rounded-xl overflow-hidden h-24 bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800">
                              <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                          )}

                          <div className="flex justify-between items-center pt-2 border-t border-slate-200/50 dark:border-slate-800/50">
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">CTA: {post.cta}</span>
                            <button
                              onClick={() => handleMetaCopy(post.body, `meta-comp-${idx}`)}
                              className={`text-[9px] font-extrabold px-2.5 py-1 rounded-md transition-all ${metaCopiedId === `meta-comp-${idx}` ? 'bg-green-500 text-white border-green-500' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300'}`}
                            >
                              {metaCopiedId === `meta-comp-${idx}` ? 'Copiato!' : 'Copia'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Column 2: Pattern Virali */}
                  <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-md flex flex-col h-[780px]">
                    <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-4 flex items-center justify-between">
                      <h3 className="font-black text-sm text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <Search className="w-4 h-4 text-indigo-500" /> Pattern Virali
                      </h3>
                      <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">Analisi</span>
                    </div>

                    <div className="overflow-y-auto space-y-4 flex-1 pr-1 custom-scrollbar">
                      <div className="space-y-4">
                        <div className="bg-indigo-50/30 dark:bg-indigo-950/10 p-4 rounded-2xl border border-indigo-100/50 dark:border-slate-800">
                          <h4 className="font-black text-xs text-indigo-700 dark:text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Perché Funzionano (Emotional Matrix)
                          </h4>
                          <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2 whitespace-pre-wrap font-medium leading-relaxed">
                            {metaResult.competitorAnalysis}
                          </div>
                        </div>

                        <div className="bg-emerald-50/30 dark:bg-slate-950/40 p-4 rounded-2xl border border-emerald-100/30 dark:border-slate-800">
                          <h4 className="font-black text-xs text-emerald-700 dark:text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5 text-emerald-500" /> Trend & Parole Chiave Calde
                          </h4>
                          <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2 whitespace-pre-wrap font-medium leading-relaxed">
                            {metaResult.emergingTrends}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Column 3: Post Generati per Te */}
                  <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-md flex flex-col h-[780px]">
                    <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-4 flex items-center justify-between">
                      <h3 className="font-black text-sm text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-yellow-500" /> Post Generati per Te
                      </h3>
                      <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-black px-2 py-0.5 rounded-full uppercase tracking-tighter font-extrabold">PRONTI ALL'USO</span>
                    </div>

                    <div className="overflow-y-auto space-y-5 flex-1 pr-1 custom-scrollbar">
                      {metaResult.viralVariants?.map((post, idx) => (
                        <div key={post.id || idx} className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                          <div className="bg-indigo-50/50 dark:bg-indigo-950/20 px-4 py-2.5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                            <span className="text-xs font-black text-indigo-700 dark:text-indigo-400">Variante #{post.id}</span>
                            <button
                              onClick={() => handleMetaCopy(`${post.hook}\n\n${post.body}\n\n${post.cta}\n\n${post.hashtags?.join(" ")}`, `meta-gen-${idx}`)}
                              className={`text-[9px] font-black px-2.5 py-1 rounded-md transition-all ${metaCopiedId === `meta-gen-${idx}` ? 'bg-green-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-black dark:text-slate-200 hover:bg-slate-300'}`}
                            >
                              {metaCopiedId === `meta-gen-${idx}` ? 'Copiato!' : 'Copia Tutto'}
                            </button>
                          </div>

                          <div className="p-4 space-y-3">
                            {/* Hook */}
                            <div className="bg-rose-50/40 dark:bg-slate-950 p-3 rounded-xl border border-rose-100/30 dark:border-slate-800">
                              <span className="text-[8px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-wider block mb-1">🔥 GANCIO VIRALE (HOOK)</span>
                              <p className="text-xs font-extrabold text-black dark:text-slate-100 leading-relaxed">{post.hook}</p>
                            </div>

                            {/* Body */}
                            <div className="bg-slate-100 dark:bg-slate-900 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800">
                              <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">📝 CORPO DEL POST (BODY)</span>
                              <p className="text-xs text-black dark:text-slate-100 leading-relaxed font-medium whitespace-pre-wrap">{post.body}</p>
                            </div>

                            {/* CTA */}
                            <div className="bg-blue-50/40 dark:bg-slate-950 p-2.5 rounded-xl border border-blue-100/30 dark:border-slate-800">
                              <span className="text-[8px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider block mb-1">🎯 CHIAMATA ALL'AZIONE (CTA)</span>
                              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{post.cta}</p>
                            </div>

                            {/* Hashtags */}
                            {post.hashtags && post.hashtags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {post.hashtags.map((tag, tIdx) => (
                                  <span key={tIdx} className="text-[10px] font-extrabold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-lg border border-indigo-100/30 dark:border-slate-800">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Image Prompt */}
                            <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800 text-[10px]">
                              <span className="text-[8px] font-black text-indigo-500 uppercase tracking-wider block mb-1">🎨 PROMPT IMMAGINE AI</span>
                              <p className="font-mono text-slate-500 dark:text-slate-400 select-all leading-normal">{post.imagePrompt}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Bottom Strategy Report Card */}
                <section className="bg-slate-900 dark:bg-slate-800 text-white rounded-3xl p-6 shadow-xl space-y-6">
                  <div className="flex items-center gap-2.5 border-b border-slate-800 pb-4">
                    <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
                    <h3 className="font-black text-base uppercase tracking-wider">REPORT STRATEGICO DI MARKETING</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm font-medium">
                    <div className="space-y-3 bg-slate-850 p-4 rounded-2xl border border-slate-800">
                      <h4 className="font-black text-xs text-yellow-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" /> Analisi Competitor
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{metaResult.competitorAnalysis}</p>
                    </div>
                    <div className="space-y-3 bg-slate-850 p-4 rounded-2xl border border-slate-800">
                      <h4 className="font-black text-xs text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Search className="w-3.5 h-3.5" /> Trend Emergenti
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{metaResult.emergingTrends}</p>
                    </div>
                    <div className="space-y-3 bg-slate-850 p-4 rounded-2xl border border-slate-800">
                      <h4 className="font-black text-xs text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Store className="w-3.5 h-3.5" /> Consiglio Pubblicazione
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{metaResult.postingAdvice}</p>
                    </div>
                  </div>
                </section>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="mt-auto py-10 text-slate-400 dark:text-slate-600 text-[10px] font-black uppercase tracking-[0.3em] text-center">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="h-px w-10 bg-slate-200 dark:bg-slate-800" />
          <span>Powered by Gemini 3 Flash, Search Grounding & Apify Scraper</span>
          <div className="h-px w-10 bg-slate-200 dark:bg-slate-800" />
        </div>
        <p>© 2026 Social Viral Creator • Built for Performance</p>
      </footer>
    </div>
  );
};

export default App;
