import { useState, useRef, useEffect } from "react";

const Index = () => {
  const [isPluggedIn, setIsPluggedIn] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [plugOffset, setPlugOffset] = useState({ x: 0, y: 0 });
  const plugRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<HTMLDivElement>(null);
  const flickerClasses = ["flicker-1", "flicker-2", "flicker-3", "flicker-4", "flicker-5"];

  const getFlickerClass = (index: number) => {
    return flickerClasses[index % flickerClasses.length];
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    if (isPluggedIn) {
      setIsPluggedIn(false);
      setPlugOffset({ x: -20, y: 10 });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !socketRef.current) return;
    
    const socketRect = socketRef.current.getBoundingClientRect();
    const socketCenterX = socketRect.left + socketRect.width / 2;
    const socketCenterY = socketRect.top + socketRect.height / 2;
    
    const offsetX = e.clientX - socketCenterX;
    const offsetY = e.clientY - socketCenterY;
    
    setPlugOffset({ x: offsetX - 40, y: offsetY });
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    // Check if plug is close enough to socket to snap
    if (Math.abs(plugOffset.x + 40) < 30 && Math.abs(plugOffset.y) < 30) {
      setIsPluggedIn(true);
      setPlugOffset({ x: 0, y: 0 });
    } else {
      // Keep unplugged position
      setPlugOffset({ x: -30, y: 15 });
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
  }, [isDragging, plugOffset]);

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

  // Calculate cable path based on plug position
  const getCablePath = () => {
    if (isPluggedIn) {
      return "M0 40 C 50 40, 100 40, 150 40 L 200 40";
    }
    // Dynamic path based on plug offset
    const endX = 185 + (plugOffset.x * 0.1);
    const endY = 40 + (plugOffset.y * 0.3);
    const midY1 = 40 + (plugOffset.y * 0.2);
    const midY2 = 40 + (plugOffset.y * 0.4);
    return `M0 40 C 40 ${midY1}, 100 ${midY2}, 150 ${endY - 5} Q 170 ${endY}, ${endX} ${endY + 15}`;
  };

  return (
    <main className="min-h-screen flex items-center bg-background overflow-x-hidden">
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
          <span className="flex items-center justify-center md:justify-start">
            {renderWord("purty", 2, true)}
            
            {/* Cable section */}
            <span className={`inline-flex items-center h-12 md:h-16 w-20 md:w-32 relative ${isPluggedIn ? "cable-hover" : ""}`}>
              <svg 
                className="w-full h-full absolute inset-0"
                viewBox="0 0 200 80"
                fill="none"
                preserveAspectRatio="none"
              >
                <path
                  d={getCablePath()}
                  stroke="hsl(0 0% 18%)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  className={`transition-all ${isDragging ? "duration-75" : "duration-500"} ease-in-out ${isPluggedIn ? "cable-jiggly" : ""}`}
                  fill="none"
                />
              </svg>
            </span>

            {/* Socket area */}
            <div className="relative flex items-center">
              {/* Draggable Plug */}
              <div 
                ref={plugRef}
                onMouseDown={handleMouseDown}
                className={`flex items-center cursor-grab active:cursor-grabbing z-10 transition-transform ${
                  isDragging ? "duration-75" : "duration-300"
                } ${!isDragging && !isPluggedIn ? "-rotate-12" : ""}`}
                style={{
                  transform: `translate(${isPluggedIn ? 0 : plugOffset.x}px, ${isPluggedIn ? 0 : plugOffset.y}px) ${!isDragging && !isPluggedIn ? "rotate(-12deg)" : ""}`,
                }}
              >
                <div className="w-5 h-4 md:w-6 md:h-5 bg-[hsl(0_0%_20%)] rounded-l-sm flex flex-col justify-center items-end pr-0.5 gap-1 shadow-md">
                  <div className="w-3 h-1 bg-[hsl(45_60%_50%)] rounded-r-sm" />
                  <div className="w-3 h-1 bg-[hsl(45_60%_50%)] rounded-r-sm" />
                </div>
              </div>

              {/* Socket */}
              <div 
                ref={socketRef}
                className={`relative w-10 h-14 md:w-14 md:h-20 bg-[hsl(0_0%_10%)] rounded border-2 transition-colors shadow-[inset_0_2px_8px_rgba(0,0,0,0.6)] ${
                  isDragging && Math.abs(plugOffset.x + 40) < 50 && Math.abs(plugOffset.y) < 50
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
            </div>
          </span>
        </h1>
      </div>
    </main>
  );
};

export default Index;
