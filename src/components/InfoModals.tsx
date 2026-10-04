import React from 'react';
import { X, ShieldAlert, Mail, CheckCircle2 } from 'lucide-react';

interface InfoModalProps {
  type: 'about' | 'disclosure' | 'contact' | null;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl bg-white dark:bg-[#16171C] rounded-3xl shadow-2xl border border-[#E9E9E6] dark:border-[#272932] overflow-hidden max-h-[85vh] flex flex-col transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B00]" />
            <h3 className="text-base font-bold text-[#111111] dark:text-white">
              {type === 'about' && 'About TechCheck'}
              {type === 'disclosure' && 'Affiliate Disclosure Policy'}
              {type === 'contact' && 'Contact & Editorial Inquiries'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-7 overflow-y-auto space-y-4 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed font-normal">
          {type === 'about' && (
            <>
              <p className="font-semibold text-[#111111] dark:text-neutral-100 text-base">
                "Small space. Serious setup."
              </p>
              <p>
                TechCheck was founded with a singular focus: helping gamers maximize limited desk spaces through intelligent, high-utility accessories.
              </p>
              <p>
                Most modern gaming setups suffer from spatial clutter—not because the desks are inherently too small, but because accessories compete for the same flat surfaces without taking advantage of vertical planes, under-desk mounting points, and low-profile form factors.
              </p>
              <h4 className="font-bold text-[#111111] dark:text-white pt-2">Our Editorial Standards:</h4>
              <ul className="space-y-2.5 pl-1">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#FF6B00] shrink-0 mt-0.5" />
                  <span><strong>Dimensional Precision:</strong> We measure actual clamp clearance, desk thickness tolerance, and cable routing capacities.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#FF6B00] shrink-0 mt-0.5" />
                  <span><strong>Zero Clutter:</strong> We reject unnecessary RGB gimmicks that add cables and power blocks without functional benefits.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#FF6B00] shrink-0 mt-0.5" />
                  <span><strong>Educational Discovery:</strong> You learn why an accessory works for your specific setup before viewing live marketplace availability.</span>
                </li>
              </ul>
            </>
          )}

          {type === 'disclosure' && (
            <>
              <div className="p-4 bg-orange-50/70 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800/80 rounded-2xl flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-[#FF6B00] shrink-0 mt-0.5" />
                <p className="text-xs text-neutral-800 dark:text-neutral-200 leading-relaxed font-medium">
                  TechCheck is committed to absolute transparency in accordance with Federal Trade Commission (FTC) guidelines and international affiliate media standards.
                </p>
              </div>
              <h4 className="font-bold text-[#111111] dark:text-white">How We Earn:</h4>
              <p>
                TechCheck participates in various affiliate marketing programs. When you click on links labeled "View Live Product" and complete a qualifying purchase at our partner stores, we may receive a modest referral commission at no additional cost to you.
              </p>
              <h4 className="font-bold text-[#111111] dark:text-white">Independence Guarantee:</h4>
              <p>
                Our recommendations are never determined by commission rates. We curate hardware based on ergonomic utility, mechanical stability, and real space savings for compact workstations. We never fabricate reviews or pretend to be an ecommerce retailer.
              </p>
            </>
          )}

          {type === 'contact' && (
            <>
              <p>
                Have a question about a specific desk measurement, or represent a hardware maker with space-saving accessories? We welcome editorial inquiries.
              </p>
              <div className="bg-neutral-50 dark:bg-[#1D1F27] rounded-2xl p-4 border border-neutral-200 dark:border-neutral-800 space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-[#FF6B00]" />
                  <div>
                    <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 block">Editorial Desk</span>
                    <span className="font-mono text-[#111111] dark:text-neutral-100 font-medium">editorial@techcheck.media</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Response times typically range from 24 to 48 business hours.
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-neutral-50 dark:bg-[#1D1F27]/80 border-t border-neutral-200 dark:border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-bold text-white bg-[#111111] dark:bg-white dark:text-[#111111] hover:bg-[#FF6B00] dark:hover:bg-[#FF6B00] dark:hover:text-white rounded-2xl transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
