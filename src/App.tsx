import React, { useState, useEffect } from 'react';
import { FurnitureItem, PrimaryCategory, ShowroomConfig } from './types/furniture';
import {
  loadSavedFurnitureItems,
  saveFurnitureItems,
  loadSavedConfig,
  saveShowroomConfig,
  STORAGE_KEY_ITEMS,
  STORAGE_KEY_CONFIG,
} from './data/furnitureData';
import { idbGet } from './utils/storageUtils';
import { OpeningIntro } from './components/OpeningIntro';
import { SHOWROOM_ASSETS } from './assets/showroomImages';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { CollectionSection } from './components/CollectionSection';
import { CategoryView } from './components/CategoryView';
import { ShowroomSection } from './components/ShowroomSection';
import { ClosingSection } from './components/ClosingSection';
import { Footer } from './components/Footer';
import { ProductDetailModal } from './components/ProductDetailModal';
import { InquiryModal } from './components/InquiryModal';
import { ImageManagerModal } from './components/ImageManagerModal';
import { Save, Check, RefreshCw, Sparkles, ExternalLink } from 'lucide-react';

export default function App() {
  const [showIntro, setShowIntro] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<'home' | PrimaryCategory>('home');
  const [items, setItems] = useState<FurnitureItem[]>(() => loadSavedFurnitureItems());
  const [config, setConfig] = useState<ShowroomConfig>(() => loadSavedConfig());
  const [selectedProduct, setSelectedProduct] = useState<FurnitureItem | null>(null);
  const [isInquiryOpen, setIsInquiryOpen] = useState<boolean>(false);
  const [inquiryProduct, setInquiryProduct] = useState<string>('');
  const [isAssetManagerOpen, setIsAssetManagerOpen] = useState<boolean>(false);

  // Sync state for committing custom user designs to the permanent codebase
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'saved' | 'error'>('idle');
  const [syncMessage, setSyncMessage] = useState<string>('');

  const handleSyncToPermanentCode = async (itemsToSync = items, configToSync = config) => {
    setSyncStatus('syncing');
    setSyncMessage('Saving all your chair images & customized showroom design into the GitHub codebase...');
    try {
      const res = await fetch('/api/save-showroom-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: itemsToSync, config: configToSync }),
      });
      const data = await res.json();
      if (data.success) {
        setSyncStatus('saved');
        setSyncMessage(`All ${data.count} items, custom chair photos and designs are now baked into the code!`);
        setTimeout(() => setSyncStatus('idle'), 8000);
      } else {
        setSyncStatus('idle');
      }
    } catch (e) {
      setSyncStatus('idle');
    }
  };

  // Hydrate custom items and config from IndexedDB (preserves high-res assets without quota limits)
  useEffect(() => {
    let isMounted = true;
    async function hydrate() {
      try {
        const idbItems = await idbGet<FurnitureItem[]>(STORAGE_KEY_ITEMS);
        if (isMounted && idbItems && Array.isArray(idbItems) && idbItems.length > 0) {
          const filtered = idbItems.filter(
            (item) =>
              ![
                'chair-02',
                'chair-08',
                'chair-10',
                'chair-11',
                'desk-02',
                'desk-08',
                'desk-10',
                'desk-11',
              ].includes(item.id)
          );
          setItems(filtered);
          if (filtered.length !== idbItems.length) {
            handleSaveItems(filtered);
          }
        }
        const idbConfig = await idbGet<ShowroomConfig>(STORAGE_KEY_CONFIG);
        if (isMounted && idbConfig) {
          setConfig((prev) => ({ ...prev, ...idbConfig }));
        }
      } catch {
        // non-blocking
      }
    }
    hydrate();
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync items changes
  const handleSaveItems = (newItems: FurnitureItem[]) => {
    setItems(newItems);
    saveFurnitureItems(newItems);
  };

  const handleDeleteItem = (itemId: string) => {
    const updated = items.filter((item) => item.id !== itemId);
    handleSaveItems(updated);
    if (selectedProduct && selectedProduct.id === itemId) {
      setSelectedProduct(null);
    }
  };

  // Sync config changes
  const handleSaveConfig = (newConfig: ShowroomConfig) => {
    setConfig(newConfig);
    saveShowroomConfig(newConfig);
  };

  const handleSelectCategory = (cat: PrimaryCategory) => {
    setActiveView(cat);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoHome = () => {
    setActiveView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenInquiryForProduct = (productName: string) => {
    setInquiryProduct(productName);
    setIsInquiryOpen(true);
  };

  const chairsItems = items.filter((it) => it.category === 'office-chairs');
  const desksItems = items.filter((it) => it.category === 'office-desks');

  return (
    <div className="min-h-screen bg-[#0c0b0a] text-[#eae7e1] selection:bg-[#c89d5c] selection:text-black">
      {/* 1. Cinematic Opening Intro */}
      {showIntro && (
        <OpeningIntro
          introImageUrl={config.introBackgroundUrl}
          onComplete={() => setShowIntro(false)}
        />
      )}

      {/* 2. Top Navigation Bar (Strict One-Row Three-Zone Contract) */}
      <Navbar
        onSelectCategory={handleSelectCategory}
        onOpenInquiry={() => {
          setInquiryProduct('');
          setIsInquiryOpen(true);
        }}
        onOpenAssetManager={() => setIsAssetManagerOpen(true)}
        activeView={activeView}
        onGoHome={handleGoHome}
      />

      {/* Main View Router */}
      <main>
        {activeView === 'home' ? (
          <>
            {/* 3. Hero Section */}
            <HeroSection
              heroImageUrl={config.heroBackgroundUrl || SHOWROOM_ASSETS.heroSuite}
              onExploreClick={() => {
                document.getElementById('collection-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              onSelectCategory={handleSelectCategory}
            />

            {/* 4. About Section */}
            <AboutSection
              showroomImageUrl={config.showroomBackgroundUrl || SHOWROOM_ASSETS.facade}
              onUpdateShowroomImage={(newUrl) => {
                handleSaveConfig({
                  ...config,
                  showroomBackgroundUrl: newUrl,
                  introBackgroundUrl: newUrl,
                });
              }}
            />

            {/* 5. Main Collection Section (Editorial Panels: 01 Chairs, 02 Desks) */}
            <CollectionSection
              onSelectCategory={handleSelectCategory}
              chairsCoverUrl={config.chairsCoverUrl || SHOWROOM_ASSETS.cognacChair}
              desksCoverUrl={config.desksCoverUrl || SHOWROOM_ASSETS.desksCollection}
              chairsCount={chairsItems.length}
              desksCount={desksItems.length}
            />

            {/* 6. Showroom Section (Kirti Nagar, New Delhi) */}
            <ShowroomSection
              showroomImageUrl={config.showroomBackgroundUrl || SHOWROOM_ASSETS.showroomInterior}
              onOpenInquiry={() => {
                setInquiryProduct('Showroom Private Appointment');
                setIsInquiryOpen(true);
              }}
            />

            {/* 7. Final Cinematic Section */}
            <ClosingSection
              backgroundImageUrl={config.heroBackgroundUrl || SHOWROOM_ASSETS.heroSuite}
              onSelectCategory={handleSelectCategory}
            />
          </>
        ) : (
          /* Dedicated Category View for OFFICE CHAIRS or OFFICE DESKS */
          <CategoryView
            category={activeView}
            items={activeView === 'office-chairs' ? chairsItems : desksItems}
            onSelectCategory={handleSelectCategory}
            onSelectProduct={(product) => setSelectedProduct(product)}
            onDeleteItem={handleDeleteItem}
            onBackToHome={handleGoHome}
            coverImageUrl={
              activeView === 'office-chairs'
                ? config.chairsCoverUrl || SHOWROOM_ASSETS.cognacChair
                : config.desksCoverUrl || SHOWROOM_ASSETS.desksCollection
            }
          />
        )}
      </main>

      {/* 8. Minimal Luxury Footer */}
      <Footer
        onSelectCategory={handleSelectCategory}
        onOpenAssetManager={() => setIsAssetManagerOpen(true)}
        onOpenInquiry={() => {
          setInquiryProduct('');
          setIsInquiryOpen(true);
        }}
      />

      {/* Permanent GitHub Sync Floating Action Bar */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 pointer-events-auto">
        {syncStatus === 'syncing' && (
          <div className="bg-[#1a1715]/95 backdrop-blur-md border border-[#c89d5c]/60 text-xs px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2.5 text-[#eae7e1] animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 text-[#c89d5c] animate-spin" />
            <span>Saving your chair photos & updating GitHub codebase...</span>
          </div>
        )}
        {syncStatus === 'saved' && (
          <div className="bg-[#142318]/95 backdrop-blur-md border border-emerald-500/50 text-xs px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2.5 text-emerald-300">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>{syncMessage}</span>
          </div>
        )}
        <button
          onClick={() => handleSyncToPermanentCode()}
          disabled={syncStatus === 'syncing'}
          title="Save all currently visible chairs and designs into GitHub permanent build"
          className="group relative flex items-center gap-2.5 bg-[#171513]/95 hover:bg-[#23201d] text-[#eae7e1] text-xs font-medium tracking-wide uppercase px-4 py-2.5 rounded-full border border-[#c89d5c]/60 hover:border-[#c89d5c] shadow-[0_4px_24px_rgba(0,0,0,0.6)] transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#c89d5c]" />
          <span>Save Preview As Final for GitHub</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        </button>
      </div>

      {/* 9. Full-screen Product Detail Lightbox */}
      <ProductDetailModal
        item={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onDeleteItem={handleDeleteItem}
        onOpenInquiryForProduct={(prodName) => {
          setSelectedProduct(null);
          handleOpenInquiryForProduct(prodName);
        }}
        onUpdateItemImage={(itemId, newImageUrl) => {
          const updated = items.map((it) => (it.id === itemId ? { ...it, imageUrl: newImageUrl } : it));
          handleSaveItems(updated);
          if (selectedProduct && selectedProduct.id === itemId) {
            setSelectedProduct({ ...selectedProduct, imageUrl: newImageUrl });
          }
        }}
      />

      {/* 10. Showroom Concierge & Direct Inquiry Modal */}
      <InquiryModal
        isOpen={isInquiryOpen}
        onClose={() => setIsInquiryOpen(false)}
        initialProduct={inquiryProduct}
      />

      {/* 11. Showroom Curator & Image Upload Manager */}
      <ImageManagerModal
        isOpen={isAssetManagerOpen}
        onClose={() => setIsAssetManagerOpen(false)}
        items={items}
        onSaveItems={handleSaveItems}
        config={config}
        onSaveConfig={handleSaveConfig}
      />
    </div>
  );
}
