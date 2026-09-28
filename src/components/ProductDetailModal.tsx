import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { FurnitureItem } from '../types/furniture';

interface ProductDetailModalProps {
  item: FurnitureItem | null;
  onClose: () => void;
  onDeleteItem?: (itemId: string) => void;
  onOpenInquiryForProduct?: (productName: string) => void;
  onUpdateItemImage?: (itemId: string, newImageUrl: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  item,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!item) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 sm:p-8 animate-fade-in-scale select-none cursor-pointer"
      onClick={onClose}
    >
      {/* Floating Close Button */}
      <div
        className="absolute top-4 right-4 z-50 flex items-center gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          type="button"
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#171512]/90 text-xs font-sans uppercase tracking-[0.2em] text-[#c4bdae] hover:text-white border border-[#302c26] hover:border-[#575044] transition-all cursor-pointer shadow-lg"
          aria-label="Close presentation"
        >
          <span>CLOSE</span>
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Pure High-Resolution Image Presentation */}
      <div
        className="relative max-w-6xl max-h-[92vh] flex items-center justify-center cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={item.imageUrl}
          alt={item.name}
          className="max-w-full max-h-[90vh] w-auto h-auto object-contain filter drop-shadow-[0_25px_60px_rgba(0,0,0,0.95)] select-none transition-none rounded-xs border border-[#2b2723]"
          draggable={false}
          loading="eager"
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  );
};
