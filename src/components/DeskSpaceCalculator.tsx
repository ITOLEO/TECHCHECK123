import React, { useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Product } from '../types';

interface DeskSpaceCalculatorProps {
  products: Product[];
  onSelectProduct: (slug: string) => void;
}

export const DeskSpaceCalculator: React.FC<DeskSpaceCalculatorProps> = ({
  products,
  onSelectProduct,
}) => {
  const [deskWidth, setDeskWidth] = useState<number>(100);
  const [hasMonitorStand, setHasMonitorStand] = useState(true);
  const [hasDeskHeadphone, setHasDeskHeadphone] = useState(true);
  const [hasFullSizeKeyboard, setHasFullSizeKeyboard] = useState(true);
  const [hasFloorCables, setHasFloorCables] = useState(true);

  // Calculate approximate saved surface area in percentage & cm
  const monitorSavings = hasMonitorStand ? 25 : 0;
  const headphoneSavings = hasDeskHeadphone ? 15 : 0;
  const keyboardSavings = hasFullSizeKeyboard ? 14 : 0;
  const cableSavings = hasFloorCables ? 10 : 0;

  const totalReclaimedPercent = Math.min(58, Math.round(((monitorSavings + headphoneSavings + keyboardSavings) / deskWidth) * 100));

  return (
    <section className="my-16 bg-white dark:bg-[#16171C] rounded-3xl border border-[#E9E9E6] dark:border-[#272932] p-6 sm:p-10 shadow-xs">
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-50 dark:bg-orange-950/40 text-[#FF6B00] border border-orange-200/80 dark:border-orange-800/80 mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          Interactive Setup Visualizer
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111111] dark:text-white tracking-tight">
          How much desk space can you reclaim?
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed font-normal">
          Select your desk dimensions and current accessories to calculate how much usable surface area can be recovered using vertical and under-desk mounting.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Options */}
        <div className="lg:col-span-7 space-y-6">
          {/* Desk Width Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
              Select Your Desk Width
            </label>
            <div className="grid grid-cols-4 gap-2.5">
              {[80, 100, 120, 140].map((width) => (
                <button
                  key={width}
                  onClick={() => setDeskWidth(width)}
                  className={`py-3 px-3 rounded-2xl text-xs font-bold transition-all cursor-pointer text-center ${
                    deskWidth === width
                      ? 'bg-[#111111] dark:bg-white text-white dark:text-[#111111] shadow-xs'
                      : 'bg-neutral-100 dark:bg-[#1D1F27] text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-[#252833]'
                  }`}
                >
                  {width} cm
                  <span className="block text-[10px] font-normal opacity-80 mt-0.5">
                    {width === 80 ? 'Ultra-Compact' : width === 100 ? 'Small Desk' : width === 120 ? 'Standard' : 'Spacious'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Current Pain Points Checklist */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
              Current Workspace Bottlenecks
            </label>
            <div className="space-y-2.5">
              <label className="flex items-center gap-3 p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-[#1D1F27]/60 hover:bg-neutral-100/60 dark:hover:bg-[#252833]/60 transition-colors cursor-pointer text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                <input
                  type="checkbox"
                  checked={hasMonitorStand}
                  onChange={(e) => setHasMonitorStand(e.target.checked)}
                  className="w-4 h-4 accent-[#FF6B00] rounded"
                />
                <span>Large factory monitor stand resting in the center of the desk</span>
              </label>

              <label className="flex items-center gap-3 p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-[#1D1F27]/60 hover:bg-neutral-100/60 dark:hover:bg-[#252833]/60 transition-colors cursor-pointer text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                <input
                  type="checkbox"
                  checked={hasDeskHeadphone}
                  onChange={(e) => setHasDeskHeadphone(e.target.checked)}
                  className="w-4 h-4 accent-[#FF6B00] rounded"
                />
                <span>Headphones sitting directly on the mouse pad or on a desktop stand</span>
              </label>

              <label className="flex items-center gap-3 p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-[#1D1F27]/60 hover:bg-neutral-100/60 dark:hover:bg-[#252833]/60 transition-colors cursor-pointer text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                <input
                  type="checkbox"
                  checked={hasFullSizeKeyboard}
                  onChange={(e) => setHasFullSizeKeyboard(e.target.checked)}
                  className="w-4 h-4 accent-[#FF6B00] rounded"
                />
                <span>Full-size 104-key keyboard taking up horizontal mouse swipe space</span>
              </label>

              <label className="flex items-center gap-3 p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-[#1D1F27]/60 hover:bg-neutral-100/60 dark:hover:bg-[#252833]/60 transition-colors cursor-pointer text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                <input
                  type="checkbox"
                  checked={hasFloorCables}
                  onChange={(e) => setHasFloorCables(e.target.checked)}
                  className="w-4 h-4 accent-[#FF6B00] rounded"
                />
                <span>Power bricks and dangling cables resting on the floor and blocking legroom</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Calculation Display: Pitch-Black Card */}
        <div className="lg:col-span-5 bg-[#111111] dark:bg-[#16171E] text-white p-7 rounded-3xl border border-neutral-800 flex flex-col justify-between shadow-xl">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B00]">
              Estimated Spatial Recovery
            </span>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-5xl sm:text-6xl font-extrabold text-white tracking-tight">
                +{totalReclaimedPercent}%
              </span>
              <span className="text-xs text-neutral-400 font-medium">Usable Surface Area</span>
            </div>
            <p className="mt-3 text-xs text-neutral-300 leading-relaxed font-normal">
              On a <strong>{deskWidth} cm</strong> desk, these upgrades recover approximately <strong>{monitorSavings + headphoneSavings + keyboardSavings} cm</strong> of linear width and clear the entire rear footprint for keyboard positioning.
            </p>

            {/* Recommended Target Accessories */}
            <div className="mt-6 pt-5 border-t border-neutral-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-3">
                Key Upgrades for This Setup:
              </span>
              {products.length > 0 ? (
                <ul className="space-y-2 text-xs">
                  {hasMonitorStand && (
                    <li
                      onClick={() => {
                        const match = products.find(p => p.category.toLowerCase().includes('monitor') || p.name.toLowerCase().includes('arm'));
                        if (match) onSelectProduct(match.slug);
                        else onSelectProduct(products[0].slug);
                      }}
                      className="flex items-center justify-between p-2.5 rounded-2xl bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 transition-colors cursor-pointer group"
                    >
                      <span className="text-neutral-200 group-hover:text-[#FF6B00] transition-colors">
                        {products.find(p => p.category.toLowerCase().includes('monitor') || p.name.toLowerCase().includes('arm'))?.name || 'Monitor Arm Mount'}
                      </span>
                      <span className="text-[10px] text-neutral-400 flex items-center gap-1 group-hover:text-[#FF6B00]">
                        View Details <ArrowRight className="w-3 h-3" />
                      </span>
                    </li>
                  )}
                  {hasDeskHeadphone && (
                    <li
                      onClick={() => {
                        const match = products.find(p => p.name.toLowerCase().includes('headphone') || p.name.toLowerCase().includes('hook'));
                        if (match) onSelectProduct(match.slug);
                        else onSelectProduct(products[0].slug);
                      }}
                      className="flex items-center justify-between p-2.5 rounded-2xl bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 transition-colors cursor-pointer group"
                    >
                      <span className="text-neutral-200 group-hover:text-[#FF6B00] transition-colors">
                        {products.find(p => p.name.toLowerCase().includes('headphone') || p.name.toLowerCase().includes('hook'))?.name || 'Under-Desk Headphone Mount'}
                      </span>
                      <span className="text-[10px] text-neutral-400 flex items-center gap-1 group-hover:text-[#FF6B00]">
                        View Details <ArrowRight className="w-3 h-3" />
                      </span>
                    </li>
                  )}
                  {hasFloorCables && (
                    <li
                      onClick={() => {
                        const match = products.find(p => p.category.toLowerCase().includes('cable') || p.name.toLowerCase().includes('cable'));
                        if (match) onSelectProduct(match.slug);
                        else onSelectProduct(products[0].slug);
                      }}
                      className="flex items-center justify-between p-2.5 rounded-2xl bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 transition-colors cursor-pointer group"
                    >
                      <span className="text-neutral-200 group-hover:text-[#FF6B00] transition-colors">
                        {products.find(p => p.category.toLowerCase().includes('cable') || p.name.toLowerCase().includes('cable'))?.name || 'Cable Management Kit'}
                      </span>
                      <span className="text-[10px] text-neutral-400 flex items-center gap-1 group-hover:text-[#FF6B00]">
                        View Details <ArrowRight className="w-3 h-3" />
                      </span>
                    </li>
                  )}
                </ul>
              ) : (
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Use monitor arms and under-desk mounts to free up to {totalReclaimedPercent}% of your desk surface.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
