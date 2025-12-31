import { useState } from "react";

const Index = () => {
  const [isPluggedIn, setIsPluggedIn] = useState(true);
  const words = ["anand", "prince", "purty"];
  const flickerClasses = ["flicker-1", "flicker-2", "flicker-3", "flicker-4", "flicker-5"];

  const getFlickerClass = (index: number) => {
    return flickerClasses[index % flickerClasses.length];
  };

  return (
    <main className="min-h-screen flex items-center bg-background overflow-hidden relative">
      <div className="container px-6 md:px-12 lg:px-20 relative">
        <div className="relative inline-block">
          <h1 
            className={`text-hero font-mono transition-all duration-500 ${
              isPluggedIn ? "cfl-tube cfl-glow" : "cfl-off"
            }`}
          >
            {words.map((word, wordIndex) => (
              <span key={wordIndex} className="inline-block">
                {word.split("").map((letter, letterIndex) => (
                  <span
                    key={letterIndex}
                    className={`inline-block ${isPluggedIn ? getFlickerClass(wordIndex * 5 + letterIndex) : ""}`}
                    style={{
                      animationDelay: isPluggedIn ? `${(wordIndex * 5 + letterIndex) * 0.1}s` : undefined,
                    }}
                  >
                    {letter}
                  </span>
                ))}
                {wordIndex < words.length - 1 && (
                  <span className="inline-block">&nbsp;</span>
                )}
              </span>
            ))}
          </h1>

          {/* Cable attached to the letter - starts from end of text */}
          <svg 
            className="absolute top-1/2 -translate-y-1/2 -right-4 md:-right-6 h-40 pointer-events-none"
            style={{ width: 'calc(100vw - 100%)' }}
            viewBox="0 0 400 120"
            fill="none"
            preserveAspectRatio="xMinYMid meet"
          >
            {/* Cable connector at letter */}
            <circle
              cx="8"
              cy="60"
              r="6"
              fill="hsl(0 0% 15%)"
              stroke="hsl(0 0% 25%)"
              strokeWidth="2"
            />
            
            {/* Cable wire */}
            <path
              d={isPluggedIn 
                ? "M14 60 C 80 60, 150 55, 220 55 C 290 55, 340 58, 370 60" 
                : "M14 60 C 80 45, 150 80, 220 50 C 290 30, 320 70, 335 75"
              }
              stroke="hsl(0 0% 20%)"
              strokeWidth="5"
              strokeLinecap="round"
              className="transition-all duration-500 ease-in-out"
              fill="none"
            />
            
            {/* Cable sheath near connector */}
            <rect
              x="10"
              y="55"
              width="12"
              height="10"
              rx="2"
              fill="hsl(0 0% 18%)"
            />
          </svg>
        </div>
      </div>

      {/* Socket on the right edge */}
      <div className="fixed right-4 md:right-8 top-1/2 -translate-y-1/2 flex items-center">
        {/* Plug */}
        <div 
          className={`absolute transition-all duration-500 ease-in-out ${
            isPluggedIn 
              ? "right-[52px] md:right-[68px]" 
              : "right-[80px] md:right-[100px] rotate-12"
          }`}
        >
          {/* Plug body */}
          <div className="w-6 h-5 bg-[hsl(0_0%_22%)] rounded-sm relative">
            {/* Prongs */}
            <div className="absolute -right-2 top-1 w-2 h-1 bg-[hsl(45_70%_55%)] rounded-r-sm" />
            <div className="absolute -right-2 bottom-1 w-2 h-1 bg-[hsl(45_70%_55%)] rounded-r-sm" />
          </div>
        </div>

        {/* Socket */}
        <button
          onClick={() => setIsPluggedIn(!isPluggedIn)}
          className="relative w-14 h-20 md:w-16 md:h-24 bg-[hsl(0_0%_12%)] rounded-md border-2 border-[hsl(0_0%_20%)] flex flex-col items-center justify-center gap-2 hover:border-muted-foreground transition-colors cursor-pointer shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]"
          aria-label={isPluggedIn ? "Unplug cable" : "Plug in cable"}
        >
          {/* Socket plate texture */}
          <div className="absolute inset-1 rounded bg-[hsl(0_0%_10%)] opacity-50" />
          
          {/* Socket holes */}
          <div className="relative flex gap-2">
            <div className={`w-1.5 h-3 md:w-2 md:h-4 rounded-sm transition-colors duration-300 ${
              isPluggedIn ? "bg-[hsl(0_0%_8%)]" : "bg-[hsl(0_0%_5%)] shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]"
            }`} />
            <div className={`w-1.5 h-3 md:w-2 md:h-4 rounded-sm transition-colors duration-300 ${
              isPluggedIn ? "bg-[hsl(0_0%_8%)]" : "bg-[hsl(0_0%_5%)] shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]"
            }`} />
          </div>
          
          {/* Socket indicator light */}
          <div 
            className={`relative w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-all duration-300 ${
              isPluggedIn 
                ? "bg-green-400 shadow-[0_0_8px_3px_rgba(74,222,128,0.5)]" 
                : "bg-[hsl(0_0%_20%)]"
            }`} 
          />
        </button>
      </div>
    </main>
  );
};

export default Index;
