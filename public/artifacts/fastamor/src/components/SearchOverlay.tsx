import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Search, CheckCircle2 } from 'lucide-react';

interface SearchOverlayProps {
  isVisible: boolean;
}

export function SearchOverlay({ isVisible }: SearchOverlayProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (isVisible) {
      setStep(0);
      const t1 = setTimeout(() => setStep(1), 800);
      const t2 = setTimeout(() => setStep(2), 1800);
      const t3 = setTimeout(() => setStep(3), 2600);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }
  }, [isVisible]);

  const steps = [
    "Checking 200+ partners",
    "Comparing prices",
    "Finding best rates"
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 bg-[#FFFDF7]/90 backdrop-blur-md flex flex-col items-center justify-center"
        >
          <div className="relative w-24 h-24 mb-8">
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="absolute inset-0 rounded-full border-t-4 border-[#FF6B35] border-r-4 border-transparent shadow-[0_0_15px_rgba(255,107,53,0.3)]"
            />
            <motion.div 
              animate={{ rotate: -360 }} 
              transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
              className="absolute inset-2 rounded-full border-b-4 border-[#FFD23F] border-l-4 border-transparent shadow-[0_0_15px_rgba(255,210,63,0.3)]"
            />
            <div className="absolute inset-0 flex items-center justify-center text-[#00C9B1]">
              <Search className="w-8 h-8" />
            </div>
          </div>

          <div className="space-y-4 text-center">
            {steps.map((text, i) => (
              <div key={i} className="flex items-center gap-3 text-lg font-bold">
                {step > i ? (
                  <CheckCircle2 className="w-5 h-5 text-[#00C9B1]" />
                ) : step === i ? (
                  <Loader2 className="w-5 h-5 text-[#FF6B35] animate-spin" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-border" />
                )}
                <span className={step >= i ? "text-foreground" : "text-muted"}>
                  {text}...
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
