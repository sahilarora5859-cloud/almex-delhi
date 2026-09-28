import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Maximize2 } from 'lucide-react';
import { FurnitureItem, PrimaryCategory } from '../types/furniture';

interface CategoryViewProps {
  category: PrimaryCategory;
  items: FurnitureItem[];
  onSelectCategory: (cat: PrimaryCategory) => void;
  onSelectProduct: (item: FurnitureItem) => void;
  onDeleteItem?: (itemId: string) => void;
  onBackToHome: () => void;
  coverImageUrl: string;
}

export const CategoryView: React.FC<CategoryViewProps> = ({
  category,
  items,
  onSelectCategory,
  onSelectProduct,
  onDeleteItem,
  onBackToHome,
  coverImageUrl,
}) => {
  const isChairs = category === 'office-chairs';
  const categoryTitle = isChairs ? 'OFFICE CHAIRS' : 'OFFICE DESKS';
  const categorySubtitle = isChairs
    ? 'Contemporary Ergonomic & Executive Seating'
    : 'Contemporary Executive Suites & Architectural Desks';
  const otherCategory: PrimaryCategory = isChairs ? 'office-desks' : 'office-chairs';
  const otherCategoryTitle = isChairs ? 'Office Desks' : 'Office Chairs';

  return (
    <div className="min-h-screen bg-[#0c0b0a] text-[#eae7e1]">
      {/* Category Cinematic Header Banner */}
      <div className="relative min-h-[45vh] sm:min-h-[50vh] flex items-end justify-start border-b border-[#22201d] overflow-hidden">
        {/* Ambient Backdrop */}
        <div className="absolute inset-0">
          <img
            src={coverImageUrl}
            alt={categoryTitle}
            className="w-full h-full object-cover object-center scale-105 filter brightness-75 transition-all duration-1000"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0b0a] via-[#0c0b0a]/75 to-[#0c0b0a]/40" />
        </div>

        {/* Header Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full">
          {/* Navigation link to other category */}
          <div className="flex items-center justify-end mb-6">
            <button
              onClick={() => onSelectCategory(otherCategory)}
              type="button"
              className="text-xs uppercase tracking-[0.2em] text-[#a69e90] hover:text-white transition-colors border-b border-[#3b362f] pb-0.5"
            >
              Switch to {otherCategoryTitle} →
            </button>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-light tracking-[0.1em] text-[#faf8f5] uppercase">
                {categoryTitle}
              </h1>
              <p className="font-serif italic text-lg sm:text-xl text-[#d4cdbf] mt-2">
                {categorySubtitle}
              </p>
            </div>

            <div className="text-xs uppercase tracking-[0.25em] text-[#857d70] border-l border-[#2e2a24] pl-4 py-1">
              <span>{items.length} Curated Models</span>
              <span className="block text-[11px] text-[#635d53] mt-1 normal-case tracking-normal">
                Click any piece for high-resolution view
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Gallery Section with Visual Rhythm */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {items.length === 0 ? (
          <div className="py-24 text-center border border-dashed border-[#2b2723] p-12">
            <p className="font-serif text-2xl text-[#b5ada0]">No items in this collection yet.</p>
            <p className="text-xs text-[#736c62] mt-2">Use the Showroom Curator in the menu to add original furniture images.</p>
          </div>
        ) : (
          <div className="space-y-24 sm:space-y-36">
            {/* Visual Rhythm Groupings */}
            {groupItemsIntoRhythm(items).map((group, groupIdx) => {
              if (group.type === 'featured') {
                const item = group.items[0];
                return (
                  <div key={item.id} className="relative group">
                    <div
                      onClick={() => onSelectProduct(item)}
                      className="cursor-pointer border border-[#272420] hover:border-[#524b42] bg-[#12110f] transition-all duration-500 overflow-hidden relative aspect-[16/9] sm:aspect-[21/9]"
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                        draggable={false}
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-[#141311]/80 backdrop-blur-xs p-2 text-[#a89f91]">
                          <Maximize2 className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              if (group.type === 'duo') {
                return (
                  <div
                    key={groupIdx}
                    className={`grid gap-8 lg:gap-12 ${
                      group.items.length === 1 ? 'grid-cols-1 max-w-2xl mx-auto' : 'grid-cols-1 md:grid-cols-2'
                    }`}
                  >
                    {group.items.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => onSelectProduct(item)}
                        className="group cursor-pointer border border-[#272420] hover:border-[#524b42] bg-[#12110f] transition-all duration-500 overflow-hidden relative aspect-[4/3] sm:aspect-[16/11]"
                      >
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                          draggable={false}
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-[#141311]/80 backdrop-blur-xs p-2 text-[#a89f91]">
                            <Maximize2 className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              }

              // Asymmetric group (one larger 7-col, one 5-col)
              if (group.type === 'asymmetric') {
                const [itemA, itemB] = group.items;
                return (
                  <div key={groupIdx} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
                    {/* Item A */}
                    <div
                      onClick={() => onSelectProduct(itemA)}
                      className={`${itemB ? 'lg:col-span-7' : 'lg:col-span-12'} group cursor-pointer border border-[#272420] hover:border-[#524b42] bg-[#12110f] transition-all duration-500 overflow-hidden relative aspect-[16/11]`}
                    >
                      <img
                        src={itemA.imageUrl}
                        alt={itemA.name}
                        className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                        draggable={false}
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-[#141311]/80 backdrop-blur-xs p-2 text-[#a89f91]">
                          <Maximize2 className="w-4 h-4" />
                        </div>
                      </div>
                    </div>

                    {/* Item B (5 cols) */}
                    {itemB && (
                      <div
                        onClick={() => onSelectProduct(itemB)}
                        className="lg:col-span-5 group cursor-pointer border border-[#272420] hover:border-[#524b42] bg-[#12110f] transition-all duration-500 overflow-hidden relative aspect-[4/3] lg:aspect-auto min-h-[300px]"
                      >
                        <img
                          src={itemB.imageUrl}
                          alt={itemB.name}
                          className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                          draggable={false}
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-[#141311]/80 backdrop-blur-xs p-2 text-[#a89f91]">
                            <Maximize2 className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              return null;
            })}
          </div>
        )}

        {/* Bottom Navigation & Category Switcher */}
        <div className="mt-28 pt-12 border-t border-[#22201d] flex flex-col sm:flex-row items-center justify-between gap-6">
          <button
            onClick={onBackToHome}
            type="button"
            className="flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-[#a69e90] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Showroom Overview</span>
          </button>

          <button
            onClick={() => onSelectCategory(otherCategory)}
            type="button"
            className="px-6 py-3 border border-[#38332c] hover:border-[#c89d5c] bg-[#141311] text-xs uppercase tracking-[0.25em] text-[#ded9ce] hover:text-white transition-all flex items-center gap-2"
          >
            <span>Proceed to {otherCategoryTitle}</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#c89d5c]" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper function to create an organic editorial rhythm (as requested: full-width, split-duo, asymmetric)
type RhythmGroup = {
  type: 'featured' | 'duo' | 'asymmetric';
  items: FurnitureItem[];
};

function groupItemsIntoRhythm(items: FurnitureItem[]): RhythmGroup[] {
  const groups: RhythmGroup[] = [];
  let i = 0;
  let cycle = 0;

  while (i < items.length) {
    if (cycle === 0) {
      // 1 featured full-width item
      groups.push({
        type: 'featured',
        items: [items[i]],
      });
      i += 1;
      cycle = 1;
    } else if (cycle === 1) {
      // 2 split-duo items
      const duo = items.slice(i, i + 2);
      groups.push({
        type: 'duo',
        items: duo,
      });
      i += duo.length;
      cycle = 2;
    } else {
      // Asymmetric (up to 2 items)
      const asym = items.slice(i, i + 2);
      groups.push({
        type: 'asymmetric',
        items: asym,
      });
      i += asym.length;
      cycle = 0;
    }
  }

  return groups;
}
