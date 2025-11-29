import React, { useState } from 'react';
import { ImageStyle, MedicineAsset } from './types';
import { generateMedicineImage } from './services/geminiService';
import { AssetCard } from './components/AssetCard';
import { ChatWidget } from './components/ChatWidget';
import { LayoutGrid, ImagePlus, Wand2, Pill, Sparkles } from 'lucide-react';

function App() {
  const [inputText, setInputText] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<ImageStyle>(ImageStyle.MODERN);
  const [assets, setAssets] = useState<MedicineAsset[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!inputText.trim()) return;

    // Split text by newlines to get list of medicines
    const medicineNames = inputText.split('\n').filter(line => line.trim().length > 0);
    
    // Initialize assets
    const newAssets: MedicineAsset[] = medicineNames.map(name => ({
      id: Math.random().toString(36).substr(2, 9),
      name: name.trim(),
      status: 'loading',
      style: selectedStyle
    }));

    setAssets(prev => [...newAssets, ...prev]);
    setIsGenerating(true);
    setInputText(''); // Clear input

    // Process each asset
    // We execute them in parallel but catch errors individually so one failure doesn't stop others
    await Promise.allSettled(newAssets.map(async (asset) => {
      try {
        const imageUrl = await generateMedicineImage(asset.name, asset.style);
        setAssets(prev => prev.map(a => 
          a.id === asset.id 
            ? { ...a, status: 'completed', imageUrl } 
            : a
        ));
      } catch (error) {
        setAssets(prev => prev.map(a => 
          a.id === asset.id 
            ? { ...a, status: 'error' } 
            : a
        ));
      }
    }));
    
    setIsGenerating(false);
  };

  const retryAsset = async (id: string) => {
    const assetToRetry = assets.find(a => a.id === id);
    if (!assetToRetry) return;

    setAssets(prev => prev.map(a => a.id === id ? { ...a, status: 'loading' } : a));

    try {
      const imageUrl = await generateMedicineImage(assetToRetry.name, assetToRetry.style);
      setAssets(prev => prev.map(a => 
        a.id === id 
          ? { ...a, status: 'completed', imageUrl } 
          : a
      ));
    } catch (error) {
      setAssets(prev => prev.map(a => 
        a.id === id 
          ? { ...a, status: 'error' } 
          : a
      ));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/40 to-blue-50/40 flex flex-col md:flex-row relative selection:bg-teal-200 selection:text-teal-900 font-sans">
      
      {/* Dynamic Background Decoration */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-teal-300/10 rounded-full blur-[120px] mix-blend-multiply" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-300/10 rounded-full blur-[100px] mix-blend-multiply" />
        <div className="absolute top-[40%] left-[60%] w-[300px] h-[300px] bg-purple-200/10 rounded-full blur-[80px] mix-blend-multiply" />
      </div>

      {/* Sidebar / Configuration Panel */}
      <aside className="w-full md:w-80 lg:w-96 bg-white/80 backdrop-blur-xl border-r border-white/60 shadow-xl shadow-slate-200/50 flex flex-col h-auto md:h-screen sticky top-0 z-20">
        <div className="p-6 border-b border-slate-100/80">
          <div className="flex items-center gap-3 text-teal-700 mb-1">
            <div className="p-2 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg text-white shadow-lg shadow-teal-500/20">
              <Pill className="w-6 h-6" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-teal-700 to-teal-900">
              PharmaStudio AI
            </span>
          </div>
          <p className="text-slate-500 text-sm pl-11">Crie imagens profissionais para sua farmácia.</p>
        </div>

        <div className="p-6 flex flex-col gap-6 flex-grow overflow-y-auto">
          {/* Input Area */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <LayoutGrid className="w-4 h-4 text-teal-600" />
              Lista de Medicamentos
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Cole sua lista aqui...\nExemplo:\nParacetamol 500mg\nVitamina C Efervescente\nIbuprofeno 400mg`}
              className="w-full h-40 p-4 rounded-xl bg-white/50 border-slate-200 border focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 resize-none text-sm transition-all shadow-sm"
            />
            <p className="text-xs text-slate-400">Um medicamento por linha.</p>
          </div>

          {/* Style Selector */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-teal-600" />
              Estilo Visual
            </label>
            <div className="grid grid-cols-1 gap-3">
              {(Object.values(ImageStyle) as ImageStyle[]).map((style) => (
                <button
                  key={style}
                  onClick={() => setSelectedStyle(style)}
                  className={`p-3 rounded-xl border text-left text-sm font-medium transition-all duration-200 flex items-center justify-between group ${
                    selectedStyle === style
                      ? 'border-teal-500 bg-teal-50/80 text-teal-800 ring-1 ring-teal-500 shadow-sm'
                      : 'border-slate-200 bg-white/60 text-slate-600 hover:border-teal-300 hover:bg-white hover:shadow-md'
                  }`}
                >
                  {style}
                  {selectedStyle === style && <Sparkles className="w-4 h-4 text-teal-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleGenerate}
            disabled={!inputText.trim() || isGenerating}
            className="w-full mt-auto bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 disabled:from-slate-300 disabled:to-slate-300 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-teal-600/20 active:scale-95 transform hover:-translate-y-0.5"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Gerando Imagens...
              </>
            ) : (
              <>
                <ImagePlus className="w-5 h-5" />
                Gerar Ativos
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content / Gallery */}
      <main className="flex-grow p-6 md:p-10 overflow-y-auto z-10 relative">
        <header className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Galeria de Ativos</h2>
            <p className="text-slate-500 mt-2 text-lg">
              {assets.length === 0 
                ? 'Seus ativos gerados aparecerão aqui.' 
                : `${assets.length} item(s) na galeria`}
            </p>
          </div>
          {assets.length > 0 && (
            <button 
              onClick={() => setAssets([])}
              className="text-sm text-red-600 hover:bg-red-50 hover:text-red-700 px-4 py-2.5 rounded-lg transition-colors font-medium bg-white/50 border border-red-100 shadow-sm backdrop-blur-sm"
            >
              Limpar Galeria
            </button>
          )}
        </header>

        {assets.length === 0 ? (
          <div className="h-[60vh] border-2 border-dashed border-slate-300/60 rounded-3xl flex flex-col items-center justify-center text-slate-400 gap-6 bg-white/30 backdrop-blur-sm">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm">
              <ImagePlus className="w-10 h-10 text-teal-200" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-xl font-medium text-slate-600">Nenhum ativo gerado ainda</p>
              <p className="text-sm max-w-xs text-slate-500 mx-auto">Use o painel lateral para adicionar medicamentos e escolher um estilo.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {assets.map((asset) => (
              <AssetCard key={asset.id} asset={asset} onRetry={retryAsset} />
            ))}
          </div>
        )}
      </main>

      {/* Chat Widget */}
      <ChatWidget />
    </div>
  );
}

export default App;
