import { useState, useRef, useEffect } from "react";
import Cat from "@/components/Cat";

const Index = () => {
  const [isPluggedIn, setIsPluggedIn] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [plugPosition, setPlugPosition] = useState({ x: 30, y: 180 });
  const [spiderDescending, setSpiderDescending] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLSpanElement>(null);
  const flickerClasses = ["flicker-1", "flicker-2", "flicker-3", "flicker-4", "flicker-5"];

  // Spider descends randomly to unplug
  useEffect(() => {
    if (!isPluggedIn) return;
    
    const scheduleSpiderAttack = () => {
      const delay = Math.random() * 15000 + 10000;
      return setTimeout(() => {
        if (isPluggedIn && Math.random() > 0.5) {
          setSpiderDescending(true);
          setTimeout(() => {
            setIsPluggedIn(false);
            setPlugPosition({ x: 30, y: 180 });
            setTimeout(() => setSpiderDescending(false), 1500);
          }, 2000);
        } else {
          scheduleSpiderAttack();
        }
      }, delay);
    };
    
    const timer = scheduleSpiderAttack();
    return () => clearTimeout(timer);
  }, [isPluggedIn]);

  const getFlickerClass = (index: number) => {
    return flickerClasses[index % flickerClasses.length];
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    if (isPluggedIn) {
      setIsPluggedIn(false);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !anchorRef.current) return;
    
    const anchorRect = anchorRef.current.getBoundingClientRect();
    const anchorX = anchorRect.left + anchorRect.width / 2;
    const anchorY = anchorRect.top + anchorRect.height / 2;
    
    setPlugPosition({
      x: e.clientX - anchorX,
      y: e.clientY - anchorY,
    });
  };

  const handleMouseUp = () => {
    if (!isDragging || !socketRef.current || !anchorRef.current) return;
    setIsDragging(false);
    
    const socketRect = socketRef.current.getBoundingClientRect();
    const anchorRect = anchorRef.current.getBoundingClientRect();
    
    const anchorX = anchorRect.left + anchorRect.width / 2;
    const anchorY = anchorRect.top + anchorRect.height / 2;
    
    const socketTargetX = socketRect.left - anchorX;
    const socketTargetY = socketRect.top + socketRect.height / 2 - anchorY;
    
    if (Math.abs(plugPosition.x - socketTargetX) < 60 && Math.abs(plugPosition.y - socketTargetY) < 40) {
      setIsPluggedIn(true);
      setPlugPosition({ x: socketTargetX, y: socketTargetY });
    } else {
      setPlugPosition({ x: 30, y: 180 });
    }
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, plugPosition]);

  const renderWord = (word: string, wordIndex: number, isLast: boolean) => {
    return (
      <span key={wordIndex} className="inline-flex items-center">
        {word.split("").map((letter, letterIndex) => {
          return (
            <span
              key={letterIndex}
              className={`inline-block relative ${isPluggedIn ? getFlickerClass(wordIndex * 5 + letterIndex) : ""}`}
              style={{
                animationDelay: isPluggedIn ? `${(wordIndex * 5 + letterIndex) * 0.1}s` : undefined,
              }}
            >
              {letter}
            </span>
          );
        })}
        {!isLast && <span className="inline-block">&nbsp;</span>}
      </span>
    );
  };

  const getCablePath = () => {
    const endX = plugPosition.x - 8;
    const endY = plugPosition.y;
    
    if (isPluggedIn && !isDragging) {
      const cableLength = Math.sqrt(endX * endX + endY * endY);
      const sagAmount = Math.max(40, cableLength * 0.25);
      const midX = endX * 0.5;
      const midY = Math.max(endY * 0.5, endY * 0.3) + sagAmount;
      
      return `M 0 0 Q ${midX} ${midY} ${endX} ${endY}`;
    }
    
    const waveAmplitude = 18;
    const segments = 4;
    const segmentHeight = endY / segments;
    
    let path = `M 0 0`;
    
    for (let i = 0; i < segments; i++) {
      const startY = segmentHeight * i;
      const endSegY = segmentHeight * (i + 1);
      const midY = (startY + endSegY) / 2;
      
      const xProgress = (endX / segments) * i;
      const xProgressNext = (endX / segments) * (i + 1);
      
      const waveDir = i % 2 === 0 ? 1 : -1;
      const controlX = xProgress + (xProgressNext - xProgress) / 2 + (waveAmplitude * waveDir);
      
      path += ` Q ${controlX} ${midY} ${xProgressNext} ${endSegY}`;
    }
    
    path += ` L ${endX} ${endY}`;
    
    return path;
  };

  return (
    <main className="min-h-screen flex items-center bg-background overflow-hidden relative" ref={containerRef}>
      {/* Cobweb - Top Left */}
      <svg 
        className="fixed top-0 left-0 w-24 h-24 md:w-36 md:h-36 pointer-events-none opacity-25"
        viewBox="0 0 100 100"
      >
        <path d="M0 0 Q55 48 98 95" stroke="hsl(0 0% 60%)" strokeWidth="0.4" fill="none" />
        <path d="M0 0 Q32 52 68 98" stroke="hsl(0 0% 55%)" strokeWidth="0.3" fill="none" />
        <path d="M0 0 Q18 45 38 96" stroke="hsl(0 0% 58%)" strokeWidth="0.35" fill="none" />
        <path d="M0 0 Q52 32 96 68" stroke="hsl(0 0% 55%)" strokeWidth="0.3" fill="none" />
        <path d="M0 0 Q48 18 95 38" stroke="hsl(0 0% 60%)" strokeWidth="0.35" fill="none" />
        <path d="M0 0 Q42 8 92 16" stroke="hsl(0 0% 52%)" strokeWidth="0.3" fill="none" />
        <path d="M0 0 Q8 38 14 94" stroke="hsl(0 0% 58%)" strokeWidth="0.3" fill="none" />
        <path d="M6 3 Q10 7 4 11 Q2 9 6 3" stroke="hsl(0 0% 55%)" strokeWidth="0.3" fill="none" />
        <path d="M18 5 Q26 14 12 22 Q6 18 5 12" stroke="hsl(0 0% 58%)" strokeWidth="0.3" fill="none" />
        <path d="M32 8 Q44 22 22 38 Q10 32 8 22" stroke="hsl(0 0% 55%)" strokeWidth="0.3" fill="none" />
        <path d="M52 12 Q68 35 32 58 Q14 48 12 34" stroke="hsl(0 0% 60%)" strokeWidth="0.3" fill="none" />
        <path d="M74 16 Q92 52 48 82 Q22 68 18 48" stroke="hsl(0 0% 55%)" strokeWidth="0.3" fill="none" />
      </svg>

      {/* Cobweb - Top Right */}
      <svg 
        className="fixed top-0 right-0 w-28 h-28 md:w-40 md:h-40 pointer-events-none opacity-25"
        viewBox="0 0 100 100"
        style={{ transform: 'scaleX(-1)' }}
      >
        <path d="M0 0 Q42 55 88 92" stroke="hsl(0 0% 55%)" strokeWidth="0.4" fill="none" />
        <path d="M0 0 Q22 48 55 95" stroke="hsl(0 0% 58%)" strokeWidth="0.35" fill="none" />
        <path d="M0 0 Q12 40 28 90" stroke="hsl(0 0% 52%)" strokeWidth="0.3" fill="none" />
        <path d="M0 0 Q50 25 92 52" stroke="hsl(0 0% 55%)" strokeWidth="0.35" fill="none" />
        <path d="M0 0 Q40 12 85 28" stroke="hsl(0 0% 58%)" strokeWidth="0.3" fill="none" />
        <path d="M0 0 Q5 32 10 88" stroke="hsl(0 0% 55%)" strokeWidth="0.3" fill="none" />
        <path d="M12 4 Q16 10 6 15" stroke="hsl(0 0% 52%)" strokeWidth="0.3" fill="none" />
        <path d="M28 8 Q38 22 16 32" stroke="hsl(0 0% 55%)" strokeWidth="0.3" fill="none" />
        <path d="M48 14 Q62 38 28 55" stroke="hsl(0 0% 58%)" strokeWidth="0.3" fill="none" />
        <path d="M72 22 Q85 52 45 75" stroke="hsl(0 0% 55%)" strokeWidth="0.3" fill="none" />
      </svg>

      {/* Spider hanging from right cobweb */}
      <div className="fixed top-0 right-16 md:right-24 pointer-events-none z-30">
        <div 
          className={`w-px bg-[hsl(0_0%_50%)] origin-top transition-all duration-2000 ease-in-out ${
            !spiderDescending ? 'animate-spider-swing' : ''
          }`}
          style={{ 
            height: spiderDescending ? 'calc(100vh - 120px)' : '200px',
          }}
        >
          <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 ${
            !spiderDescending ? 'animate-spider-bob' : ''
          }`}>
            <svg className={`absolute -left-5 top-1 w-5 h-6 ${spiderDescending ? 'animate-spider-legs' : ''}`} viewBox="0 0 12 16">
              <path d="M12 2 Q6 4 0 0" stroke="hsl(0 0% 15%)" strokeWidth="1.2" fill="none" />
              <path d="M12 6 Q5 7 0 4" stroke="hsl(0 0% 15%)" strokeWidth="1.2" fill="none" />
              <path d="M12 10 Q4 10 0 8" stroke="hsl(0 0% 15%)" strokeWidth="1.2" fill="none" />
              <path d="M12 14 Q5 13 0 16" stroke="hsl(0 0% 15%)" strokeWidth="1.2" fill="none" />
            </svg>
            <svg className={`absolute -right-5 top-1 w-5 h-6 ${spiderDescending ? 'animate-spider-legs' : ''}`} viewBox="0 0 12 16" style={{ transform: 'scaleX(-1)' }}>
              <path d="M12 2 Q6 4 0 0" stroke="hsl(0 0% 15%)" strokeWidth="1.2" fill="none" />
              <path d="M12 6 Q5 7 0 4" stroke="hsl(0 0% 15%)" strokeWidth="1.2" fill="none" />
              <path d="M12 10 Q4 10 0 8" stroke="hsl(0 0% 15%)" strokeWidth="1.2" fill="none" />
              <path d="M12 14 Q5 13 0 16" stroke="hsl(0 0% 15%)" strokeWidth="1.2" fill="none" />
            </svg>
            <div className="w-4 h-6 bg-[hsl(0_0%_12%)] rounded-full" />
            <div className="w-4 h-4 bg-[hsl(0_0%_10%)] rounded-full -mt-1.5 mx-auto relative flex items-center justify-center gap-1">
              <div className="w-1.5 h-1.5 bg-[hsl(0_0%_95%)] rounded-full relative animate-spider-blink">
                <div className="absolute top-0.5 left-0.5 w-0.5 h-0.5 bg-[hsl(0_0%_5%)] rounded-full" />
              </div>
              <div className="w-1.5 h-1.5 bg-[hsl(0_0%_95%)] rounded-full relative animate-spider-blink">
                <div className="absolute top-0.5 left-0.5 w-0.5 h-0.5 bg-[hsl(0_0%_5%)] rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ambient light glow behind text when on */}
      <div 
        className={`fixed inset-0 transition-opacity duration-700 pointer-events-none ${
          isPluggedIn ? "opacity-40" : "opacity-0"
        }`}
        style={{
          background: 'radial-gradient(ellipse 50% 40% at 50% 50%, hsl(60 80% 85% / 0.15) 0%, transparent 60%)',
        }}
      />

      {/* Hero Text with Cable */}
      <div className="w-full flex items-center justify-end px-4 md:px-12 lg:px-20 relative z-10">
        <h1 
          className={`text-hero font-pixel transition-all duration-500 flex flex-col text-center relative ${
            isPluggedIn ? "cfl-tube cfl-glow" : "cfl-off"
          }`}
        >
          <span className="flex justify-end">{renderWord("anand", 0, true)}</span>
          <span className="flex justify-end">{renderWord("prince", 1, true)}</span>
          <span className="flex justify-end">
            {renderWord("purty", 2, true)}
            {/* Cable anchor on last letter */}
            <span 
              ref={anchorRef}
              className="relative inline-block"
              style={{ width: 0, height: 0 }}
            >
              {/* SVG Cable */}
              <svg 
                className="absolute pointer-events-none"
                style={{
                  left: 0,
                  top: 0,
                  width: Math.abs(plugPosition.x) + 50,
                  height: Math.abs(plugPosition.y) + 50,
                  overflow: 'visible',
                }}
              >
                <path
                  d={getCablePath()}
                  stroke="hsl(0 0% 22%)"
                  strokeWidth="5"
                  strokeLinecap="round"
                  className={`transition-all ${isDragging ? "duration-0" : "duration-500"} ease-out`}
                  fill="none"
                />
              </svg>

              {/* Draggable Plug */}
              <div 
                onMouseDown={handleMouseDown}
                className={`absolute cursor-grab active:cursor-grabbing z-10 ${
                  isDragging ? "" : "transition-all duration-500"
                }`}
                style={{
                  left: plugPosition.x,
                  top: plugPosition.y,
                  transform: `translate(-8px, -50%) ${!isPluggedIn && !isDragging ? "rotate(90deg)" : "rotate(0deg)"}`,
                  transformOrigin: 'left center',
                }}
              >
                <div className="flex items-center">
                  <div className="w-5 h-5 md:w-6 md:h-6 bg-[hsl(0_0%_18%)] rounded-sm flex flex-col justify-center items-end pr-0.5 gap-1 shadow-md border border-[hsl(0_0%_25%)]">
                    <div className="w-3 h-1 bg-[hsl(45_60%_50%)] rounded-r-sm" />
                    <div className="w-3 h-1 bg-[hsl(45_60%_50%)] rounded-r-sm" />
                  </div>
                </div>
              </div>
            </span>
          </span>
        </h1>
      </div>

      {/* Floor */}
      <div className="fixed bottom-0 left-0 right-0 h-8 md:h-12 bg-[hsl(0_0%_6%)] border-t border-[hsl(0_0%_15%)] z-10">
        <div className="absolute inset-0 opacity-30">
          <div className="h-full w-full" style={{
            backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 40px, hsl(0 0% 12%) 40px, hsl(0 0% 12%) 41px)',
          }} />
        </div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[hsl(0_0%_20%)] to-transparent" />
      </div>

      {/* Socket */}
      <div 
        ref={socketRef}
        className={`fixed bottom-8 md:bottom-12 right-8 md:right-12 w-12 h-16 md:w-16 md:h-24 bg-[hsl(0_0%_8%)] rounded-t border-2 border-b-0 transition-all duration-300 shadow-[inset_0_2px_8px_rgba(0,0,0,0.6)] z-20 ${
          isDragging 
            ? "border-[hsl(120_40%_30%)] shadow-[inset_0_2px_8px_rgba(0,0,0,0.6),0_0_15px_rgba(74,222,128,0.3)]" 
            : "border-[hsl(0_0%_18%)]"
        }`}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <div className="flex gap-2 md:gap-3">
            <div className="w-2 h-4 md:w-2.5 md:h-5 bg-[hsl(0_0%_3%)] rounded-sm shadow-[inset_0_1px_3px_rgba(0,0,0,0.9)]" />
            <div className="w-2 h-4 md:w-2.5 md:h-5 bg-[hsl(0_0%_3%)] rounded-sm shadow-[inset_0_1px_3px_rgba(0,0,0,0.9)]" />
          </div>
          <div 
            className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full transition-all duration-300 ${
              isPluggedIn 
                ? "bg-green-400 shadow-[0_0_6px_2px_rgba(74,222,128,0.6)]" 
                : "bg-[hsl(0_0%_20%)]"
            }`} 
          />
        </div>

        {/* Cat */}
        <Cat onScratchSocket={() => {
          setIsPluggedIn(false);
          setPlugPosition({ x: 30, y: 180 });
        }} />
      </div>
    </main>
  );
};

export default Index;
