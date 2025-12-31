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
      <div className="container px-6 md:px-12 lg:px-20">
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
      </div>

      {/* Cable and Socket */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center">
        {/* Cable */}
        <svg 
          className="h-32 w-48 md:w-64"
          viewBox="0 0 200 100"
          fill="none"
        >
          {/* Cable wire */}
          <path
            d={isPluggedIn 
              ? "M0 50 Q 60 50 100 50 Q 140 50 160 50" 
              : "M0 50 Q 60 30 100 60 Q 140 80 145 70"
            }
            stroke="hsl(0 0% 20%)"
            strokeWidth="6"
            strokeLinecap="round"
            className="transition-all duration-300"
          />
          {/* Cable end / plug */}
          <rect
            x={isPluggedIn ? "156" : "140"}
            y={isPluggedIn ? "42" : "62"}
            width="20"
            height="16"
            rx="2"
            fill="hsl(0 0% 25%)"
            className="transition-all duration-300"
          />
          {/* Plug prongs */}
          <rect
            x={isPluggedIn ? "176" : "160"}
            y={isPluggedIn ? "45" : "65"}
            width="8"
            height="4"
            fill="hsl(45 80% 60%)"
            className="transition-all duration-300"
          />
          <rect
            x={isPluggedIn ? "176" : "160"}
            y={isPluggedIn ? "51" : "71"}
            width="8"
            height="4"
            fill="hsl(45 80% 60%)"
            className="transition-all duration-300"
          />
        </svg>

        {/* Socket */}
        <button
          onClick={() => setIsPluggedIn(!isPluggedIn)}
          className="relative w-16 h-24 md:w-20 md:h-28 bg-secondary rounded-md border-2 border-muted flex flex-col items-center justify-center gap-3 hover:border-muted-foreground transition-colors cursor-pointer mr-4 md:mr-8"
          aria-label={isPluggedIn ? "Unplug cable" : "Plug in cable"}
        >
          {/* Socket holes */}
          <div className="flex gap-2">
            <div className={`w-2 h-4 rounded-sm transition-colors duration-300 ${isPluggedIn ? "bg-muted" : "bg-muted-foreground/50"}`} />
            <div className={`w-2 h-4 rounded-sm transition-colors duration-300 ${isPluggedIn ? "bg-muted" : "bg-muted-foreground/50"}`} />
          </div>
          {/* Socket indicator light */}
          <div 
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              isPluggedIn 
                ? "bg-green-500 shadow-[0_0_8px_2px_rgba(34,197,94,0.6)]" 
                : "bg-muted-foreground/30"
            }`} 
          />
        </button>
      </div>
    </main>
  );
};

export default Index;
