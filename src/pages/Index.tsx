import { useState, useRef, useEffect } from "react";

const Index = () => {
  const [isPluggedIn, setIsPluggedIn] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [plugPosition, setPlugPosition] = useState({ x: 30, y: 180 }); // Hanging down longer by default
  const containerRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLSpanElement>(null);
  const flickerClasses = ["flicker-1", "flicker-2", "flicker-3", "flicker-4", "flicker-5"];

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
    
    // Check if plug is close enough to socket to snap
    if (Math.abs(plugPosition.x - socketTargetX) < 60 && Math.abs(plugPosition.y - socketTargetY) < 40) {
      setIsPluggedIn(true);
      setPlugPosition({ x: socketTargetX, y: socketTargetY });
    } else {
      // Drop and hang down
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

  // Cable path from fixed anchor (0,0) to plug position
  const getCablePath = () => {
    const endX = plugPosition.x - 8;
    const endY = plugPosition.y;
    
    if (isPluggedIn && !isDragging) {
      // Natural sag when plugged in - gravity pulls the middle down
      const cableLength = Math.sqrt(endX * endX + endY * endY);
      const sagAmount = Math.max(40, cableLength * 0.25); // More sag for longer cables
      const midX = endX * 0.5;
      const midY = Math.max(endY * 0.5, endY * 0.3) + sagAmount;
      
      return `M 0 0 Q ${midX} ${midY} ${endX} ${endY}`;
    }
    
    // Smooth curvy zig-zag - like cable lying naturally
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
      
      // Alternate wave direction
      const waveDir = i % 2 === 0 ? 1 : -1;
      const controlX = xProgress + (xProgressNext - xProgress) / 2 + (waveAmplitude * waveDir);
      
      path += ` Q ${controlX} ${midY} ${xProgressNext} ${endSegY}`;
    }
    
    // Final connection to plug
    path += ` L ${endX} ${endY}`;
    
    return path;
  };

  return (
    <main className="min-h-screen flex items-center bg-background overflow-hidden relative" ref={containerRef}>
      <div className="w-full px-6 md:px-12 lg:px-20">
        <h1 
          className={`text-hero font-pixel transition-all duration-500 flex flex-col text-center md:text-left ${
            isPluggedIn ? "cfl-tube cfl-glow" : "cfl-off"
          }`}
        >
          {/* First line: anand prince */}
          <span className="flex flex-wrap justify-center md:justify-start">
            {["anand", "prince"].map((word, i) => 
              renderWord(word, i, false)
            )}
          </span>

          {/* Second line: purty + cable */}
          <span className="flex items-start justify-center md:justify-start">
            <span className="flex items-center">
              {renderWord("purty", 2, true)}
              
              {/* Fixed cable anchor point - attached to end of text */}
              <span 
                ref={anchorRef} 
                className="relative inline-block w-0 h-0"
                style={{ marginTop: '0.5em' }}
              >
                {/* SVG Cable - starts from anchor, extends to plug */}
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

                {/* Draggable Plug - positioned at end of cable */}
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
                    {/* Plug body */}
                    <div className="w-5 h-5 md:w-6 md:h-6 bg-[hsl(0_0%_18%)] rounded-sm flex flex-col justify-center items-end pr-0.5 gap-1 shadow-md border border-[hsl(0_0%_25%)]">
                      {/* Prongs */}
                      <div className="w-3 h-1 bg-[hsl(45_60%_50%)] rounded-r-sm" />
                      <div className="w-3 h-1 bg-[hsl(45_60%_50%)] rounded-r-sm" />
                    </div>
                  </div>
                </div>
              </span>
            </span>
          </span>
        </h1>
      </div>

      {/* Socket - fixed at bottom right */}
      <div 
        ref={socketRef}
        className={`fixed bottom-8 right-8 md:bottom-12 md:right-12 w-12 h-16 md:w-16 md:h-24 bg-[hsl(0_0%_8%)] rounded border-2 transition-all duration-300 shadow-[inset_0_2px_8px_rgba(0,0,0,0.6)] z-20 ${
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
      </div>
    </main>
  );
};

export default Index;
