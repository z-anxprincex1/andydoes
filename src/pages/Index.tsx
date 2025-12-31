import { useState, useRef, useEffect } from "react";

const Index = () => {
  const [isPluggedIn, setIsPluggedIn] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [plugPosition, setPlugPosition] = useState({ x: 0, y: 80 }); // Hanging down by default
  const plugRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<HTMLDivElement>(null);
  const cableStartRef = useRef<HTMLSpanElement>(null);
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
    if (!isDragging || !cableStartRef.current) return;
    
    const startRect = cableStartRef.current.getBoundingClientRect();
    const startX = startRect.right;
    const startY = startRect.top + startRect.height / 2;
    
    const offsetX = e.clientX - startX;
    const offsetY = e.clientY - startY;
    
    setPlugPosition({ x: offsetX, y: offsetY });
  };

  const handleMouseUp = () => {
    if (!isDragging || !socketRef.current || !cableStartRef.current) return;
    setIsDragging(false);
    
    const socketRect = socketRef.current.getBoundingClientRect();
    const startRect = cableStartRef.current.getBoundingClientRect();
    
    const socketCenterX = socketRect.left + socketRect.width / 2 - startRect.right;
    const socketCenterY = socketRect.top + socketRect.height / 2 - (startRect.top + startRect.height / 2);
    
    // Check if plug is close enough to socket to snap
    if (Math.abs(plugPosition.x - socketCenterX) < 50 && Math.abs(plugPosition.y - socketCenterY) < 50) {
      setIsPluggedIn(true);
      setPlugPosition({ x: socketCenterX, y: socketCenterY });
    } else {
      // Drop and hang
      setPlugPosition({ x: 0, y: 80 });
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

  return (
    <main className="min-h-screen flex items-center bg-background overflow-hidden">
      <div className="w-full px-6 md:px-12 lg:px-20">
        <h1 
          className={`text-hero font-mono transition-all duration-500 flex flex-col text-center md:text-left ${
            isPluggedIn ? "cfl-tube cfl-glow" : "cfl-off"
          }`}
        >
          {/* First line: anand prince */}
          <span className="flex flex-wrap justify-center md:justify-start">
            {["anand", "prince"].map((word, i) => 
              renderWord(word, i, false)
            )}
          </span>

          {/* Second line: purty + cable + socket */}
          <span className="flex items-center justify-center md:justify-start relative">
            {renderWord("purty", 2, true)}
            
            {/* Cable anchor point */}
            <span ref={cableStartRef} className="relative">
              {/* SVG Cable - positioned absolutely to allow unlimited extension */}
              <svg 
                className="absolute top-1/2 left-0 -translate-y-1/2 pointer-events-none overflow-visible"
                style={{
                  width: Math.max(Math.abs(plugPosition.x) + 100, 150),
                  height: Math.max(Math.abs(plugPosition.y) * 2 + 100, 200),
                  left: plugPosition.x < 0 ? plugPosition.x - 20 : 0,
                  top: `calc(50% - ${Math.max(Math.abs(plugPosition.y) + 50, 100)}px)`,
                }}
                viewBox={`${plugPosition.x < 0 ? plugPosition.x - 20 : 0} ${-Math.max(Math.abs(plugPosition.y) + 50, 100)} ${Math.max(Math.abs(plugPosition.x) + 100, 150)} ${Math.max(Math.abs(plugPosition.y) * 2 + 100, 200)}`}
                fill="none"
              >
                <path
                  d={(() => {
                    const endX = plugPosition.x;
                    const endY = plugPosition.y;
                    
                    if (isPluggedIn && !isDragging) {
                      // Straight-ish line to socket when plugged in
                      return `M 0 0 Q ${endX * 0.5} ${endY * 0.3} ${endX - 15} ${endY}`;
                    }
                    
                    // Natural hanging cable with gravity curve
                    const sagAmount = Math.max(30, Math.abs(endX) * 0.3 + 20);
                    const controlY = Math.max(endY, sagAmount);
                    
                    return `M 0 0 Q ${endX * 0.3} ${controlY} ${endX - 15} ${endY}`;
                  })()}
                  stroke="hsl(0 0% 18%)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  className={`transition-all ${isDragging ? "duration-0" : "duration-500"} ease-out`}
                  fill="none"
                />
              </svg>

              {/* Draggable Plug */}
              <div 
                ref={plugRef}
                onMouseDown={handleMouseDown}
                className={`absolute top-1/2 left-0 -translate-y-1/2 flex items-center cursor-grab active:cursor-grabbing z-10 ${
                  isDragging ? "" : "transition-all duration-500"
                }`}
                style={{
                  transform: `translate(${plugPosition.x - 20}px, calc(-50% + ${plugPosition.y}px)) ${!isPluggedIn && !isDragging ? "rotate(90deg)" : ""}`,
                }}
              >
                <div className="w-5 h-4 md:w-6 md:h-5 bg-[hsl(0_0%_20%)] rounded-l-sm flex flex-col justify-center items-end pr-0.5 gap-1 shadow-md">
                  <div className="w-3 h-1 bg-[hsl(45_60%_50%)] rounded-r-sm" />
                  <div className="w-3 h-1 bg-[hsl(45_60%_50%)] rounded-r-sm" />
                </div>
              </div>
            </span>

            {/* Socket - positioned with gap */}
            <div 
              ref={socketRef}
              className={`ml-24 md:ml-40 relative w-10 h-14 md:w-14 md:h-20 bg-[hsl(0_0%_10%)] rounded border-2 transition-colors shadow-[inset_0_2px_8px_rgba(0,0,0,0.6)] ${
                isDragging 
                  ? "border-[hsl(0_0%_40%)]" 
                  : "border-[hsl(0_0%_18%)]"
              }`}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <div className="flex gap-1.5 md:gap-2">
                  <div className="w-1.5 h-3 md:w-2 md:h-4 bg-[hsl(0_0%_5%)] rounded-sm shadow-[inset_0_1px_3px_rgba(0,0,0,0.9)]" />
                  <div className="w-1.5 h-3 md:w-2 md:h-4 bg-[hsl(0_0%_5%)] rounded-sm shadow-[inset_0_1px_3px_rgba(0,0,0,0.9)]" />
                </div>
                <div 
                  className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-all duration-300 ${
                    isPluggedIn 
                      ? "bg-green-400 shadow-[0_0_6px_2px_rgba(74,222,128,0.6)]" 
                      : "bg-[hsl(0_0%_20%)]"
                  }`} 
                />
              </div>
            </div>
          </span>
        </h1>
      </div>
    </main>
  );
};

export default Index;
