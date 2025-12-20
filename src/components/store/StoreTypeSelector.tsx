import { Store, Globe, Download, Check } from 'lucide-react';
import { STORE_TYPES } from '@/lib/pi-sdk';

interface StoreTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const icons = {
  physical: Store,
  online: Globe,
  digital: Download,
};

export function StoreTypeSelector({ value, onChange }: StoreTypeSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Object.values(STORE_TYPES).map((type) => {
        const Icon = icons[type.id as keyof typeof icons];
        const isSelected = value === type.id;
        
        return (
          <button
            key={type.id}
            type="button"
            onClick={() => onChange(type.id)}
            className={`relative p-4 rounded-xl border-2 text-left transition-all ${
              isSelected
                ? 'border-primary bg-secondary'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                isSelected ? 'gradient-hero' : 'bg-muted'
              }`}>
                <Icon className={`w-5 h-5 ${isSelected ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
              </div>
              <h4 className="font-semibold text-foreground">{type.name}</h4>
            </div>
            <p className="text-sm text-muted-foreground">{type.description}</p>
            {isSelected && (
              <div className="absolute top-2 right-2 w-6 h-6 gradient-hero rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-primary-foreground" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function StoreTypeInstructions({ storeType }: { storeType: string }) {
  const type = STORE_TYPES[storeType as keyof typeof STORE_TYPES];
  if (!type) return null;

  return (
    <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
      <h4 className="font-semibold text-foreground flex items-center gap-2">
        Setup Instructions for {type.name}
      </h4>
      <ol className="space-y-2">
        {type.instructions.map((instruction, index) => (
          <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
            <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
              {index + 1}
            </span>
            {instruction}
          </li>
        ))}
      </ol>
    </div>
  );
}