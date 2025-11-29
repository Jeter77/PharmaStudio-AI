import React from 'react';
import { MedicineAsset } from '../types';
import { Download, RefreshCw, AlertCircle } from 'lucide-react';

interface AssetCardProps {
  asset: MedicineAsset;
  onRetry: (id: string) => void;
}

export const AssetCard: React.FC<AssetCardProps> = ({ asset, onRetry }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      <div className="relative aspect-square w-full bg-slate-100 flex items-center justify-center">
        {asset.status === 'loading' && (
          <div className="flex flex-col items-center gap-2 text-teal-600">
            <RefreshCw className="w-8 h-8 animate-spin" />
            <span className="text-xs font-medium text-slate-500">Gerando IA...</span>
          </div>
        )}
        
        {asset.status === 'error' && (
          <div className="flex flex-col items-center gap-2 text-red-500 px-4 text-center">
            <AlertCircle className="w-8 h-8" />
            <span className="text-xs">Falha ao gerar</span>
            <button 
              onClick={() => onRetry(asset.id)}
              className="mt-2 text-xs bg-white border border-red-200 px-3 py-1 rounded-full hover:bg-red-50"
            >
              Tentar Novamente
            </button>
          </div>
        )}

        {asset.status === 'completed' && asset.imageUrl && (
          <img 
            src={asset.imageUrl} 
            alt={asset.name} 
            className="w-full h-full object-cover animate-in fade-in duration-700"
          />
        )}
        
        {/* Badge Style */}
        <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded-full uppercase tracking-wider">
          {asset.style.split('/')[0]}
        </div>
      </div>

      <div className="p-4 flex flex-col gap-2 flex-grow">
        <h3 className="font-semibold text-slate-800 text-lg leading-tight truncate" title={asset.name}>
          {asset.name}
        </h3>
        
        <div className="mt-auto pt-2 flex items-center justify-between">
            <span className={`text-xs px-2 py-1 rounded-full ${
              asset.status === 'completed' ? 'bg-green-100 text-green-700' :
              asset.status === 'loading' ? 'bg-blue-100 text-blue-700' :
              asset.status === 'error' ? 'bg-red-100 text-red-700' :
              'bg-slate-100 text-slate-600'
            }`}>
              {asset.status === 'completed' ? 'Pronto' : 
               asset.status === 'loading' ? 'Processando' : 
               asset.status === 'error' ? 'Erro' : 'Pendente'}
            </span>
            
            {asset.status === 'completed' && (
              <a 
                href={asset.imageUrl} 
                download={`pharma-asset-${asset.name.replace(/\s+/g, '-').toLowerCase()}.png`}
                className="p-2 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                title="Baixar Imagem"
              >
                <Download className="w-5 h-5" />
              </a>
            )}
        </div>
      </div>
    </div>
  );
};
