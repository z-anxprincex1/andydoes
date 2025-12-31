import { useState } from "react";

const Index = () => {
  const [isPluggedIn, setIsPluggedIn] = useState(true);
  const flickerClasses = ["flicker-1", "flicker-2", "flicker-3", "flicker-4", "flicker-5"];

  const getFlickerClass = (index: number) => {
    return flickerClasses[index % flickerClasses.length];
  };

  const renderWord = (word: string, wordIndex: number, isLast: boolean) => {
    return (
      <span key={wordIndex} className="inline-flex items-center">
        {word.split("").map((letter, letterIndex) => {
          const isLastLetter = isLast && letterIndex === word.length - 1;
          return (
            <span
              key={letterIndex}
              className={`inline-block relative ${isPluggedIn ? getFlickerClass(wordIndex * 5 + letterIndex) : ""}`}
              style={{
                animationDelay: isPluggedIn ? `${(wordIndex * 5 + letterIndex) * 0.1}s` : undefined,
              }}
            >
              {letter}
              {/* Cable connector attached to last letter */}
              {isLastLetter && (
                <span className="absolute left-full top-1/2 -translate-y-1/2 flex items-center">
                  {/* Small connector box on letter */}
                  <span className="w-3 h-4 md:w-4 md:h-5 bg-[hsl(0_0%_15%)] border border-[hsl(0_0%_25%)] rounded-sm" />
                </span>
              )}
            </span>
          );
        })}
        {!isLast && <span className="inline-block">&nbsp;</span>}
      </span>
    );
  };

  return (
    <main className="min-h-screen flex items-center bg-background overflow-x-hidden">
      <div className="w-full px-6 md:px-12 lg:px-20">
        <h1 
          className={`text-hero font-mono transition-all duration-500 flex flex-col text-center md:text-left ${
            isPluggedIn ? "cfl-tube cfl-glow" : "cfl-off"
          }`}
        >
          {/* First line: anand prince + cable + socket */}
          <span className="flex flex-wrap items-center justify-center md:justify-start">
            {["anand", "prince"].map((word, i) => 
              renderWord(word, i, false)
            )}
            
            {/* Cable section */}
            <span className={`inline-flex items-center h-12 md:h-16 w-24 md:w-40 relative mx-2 ${isPluggedIn ? "cable-hover" : ""}`}>
              <svg 
                className="w-full h-full absolute inset-0 cursor-pointer"
                viewBox="0 0 200 80"
                fill="none"
                preserveAspectRatio="none"
              >
                <path
                  d={isPluggedIn 
                    ? "M0 40 C 50 40, 100 40, 150 40 L 200 40" 
                    : "M0 40 C 40 25, 80 55, 120 35 C 160 15, 175 50, 185 55"
                  }
                  stroke="hsl(0 0% 18%)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  className={`transition-all duration-500 ease-in-out ${isPluggedIn ? "cable-jiggly" : ""}`}
                  fill="none"
                />
              </svg>
            </span>

            {/* Socket with plug */}
            <button
              onClick={() => setIsPluggedIn(!isPluggedIn)}
              className="relative flex items-center cursor-pointer group"
              aria-label={isPluggedIn ? "Unplug cable" : "Plug in cable"}
            >
              {/* Plug */}
              <div 
                className={`flex items-center transition-all duration-500 ease-in-out ${
                  isPluggedIn 
                    ? "translate-x-0" 
                    : "-translate-x-4 -rotate-12 translate-y-2"
                }`}
              >
                <div className="w-5 h-4 md:w-6 md:h-5 bg-[hsl(0_0%_20%)] rounded-l-sm flex flex-col justify-center items-end pr-0.5 gap-1">
                  <div className="w-3 h-1 bg-[hsl(45_60%_50%)] rounded-r-sm" />
                  <div className="w-3 h-1 bg-[hsl(45_60%_50%)] rounded-r-sm" />
                </div>
              </div>

              {/* Socket */}
              <div 
                className="relative w-10 h-14 md:w-14 md:h-20 bg-[hsl(0_0%_10%)] rounded border-2 border-[hsl(0_0%_18%)] flex flex-col items-center justify-center gap-2 group-hover:border-[hsl(0_0%_30%)] transition-colors shadow-[inset_0_2px_8px_rgba(0,0,0,0.6)]"
              >
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
            </button>
          </span>

          {/* Second line: purty */}
          <span className="flex justify-center md:justify-start">
            {renderWord("purty", 2, false)}
          </span>
        </h1>
      </div>
    </main>
  );
};

export default Index;
