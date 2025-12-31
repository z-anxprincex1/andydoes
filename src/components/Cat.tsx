import { useState, useEffect } from "react";

type CatState = "walking-right" | "walking-left" | "peeking-right" | "peeking-left" | "idle";

const Cat = () => {
  const [position, setPosition] = useState(20);
  const [catState, setCatState] = useState<CatState>("idle");
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const moveCat = () => {
      const action = Math.random();
      
      if (action < 0.3) {
        // Walk right
        setCatState("walking-right");
        setIsVisible(true);
        const newPos = Math.min(position + Math.random() * 15 + 5, 75);
        setPosition(newPos);
        
        setTimeout(() => setCatState("idle"), 4000);
      } else if (action < 0.6) {
        // Walk left
        setCatState("walking-left");
        setIsVisible(true);
        const newPos = Math.max(position - Math.random() * 15 - 5, 10);
        setPosition(newPos);
        
        setTimeout(() => setCatState("idle"), 4000);
      } else if (action < 0.8) {
        // Hide and peek from right
        setCatState("peeking-right");
        setPosition(98);
        setIsVisible(true);
      } else {
        // Hide and peek from left
        setCatState("peeking-left");
        setPosition(-3);
        setIsVisible(true);
      }
    };

    const interval = setInterval(moveCat, 6000 + Math.random() * 4000);
    
    // Initial movement
    setTimeout(moveCat, 2000);
    
    return () => clearInterval(interval);
  }, [position]);

  const isPeeking = catState === "peeking-right" || catState === "peeking-left";
  const facingLeft = catState === "walking-left" || catState === "peeking-right";

  return (
    <div
      className={`fixed bottom-8 md:bottom-12 z-15 transition-all duration-[4000ms] ease-in-out ${
        !isVisible ? "opacity-0" : "opacity-100"
      }`}
      style={{
        left: `${position}%`,
        transform: `translateX(-50%) scaleX(${facingLeft ? -1 : 1})`,
      }}
    >
      {/* Cat body */}
      <div className="relative">
        {isPeeking ? (
          // Peeking cat - only head visible
          <div className="relative">
            {/* Head */}
            <div className="w-6 h-5 md:w-8 md:h-6 bg-[hsl(30_20%_25%)] rounded-t-full relative">
              {/* Ears */}
              <div className="absolute -top-2 left-0.5 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[8px] border-b-[hsl(30_20%_25%)]" />
              <div className="absolute -top-2 right-0.5 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[8px] border-b-[hsl(30_20%_25%)]" />
              {/* Inner ears */}
              <div className="absolute -top-1 left-1 w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[5px] border-b-[hsl(350_30%_40%)]" />
              <div className="absolute -top-1 right-1 w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[5px] border-b-[hsl(350_30%_40%)]" />
              {/* Eyes */}
              <div className="absolute top-1.5 left-1 w-1.5 h-2 md:w-2 md:h-2.5 bg-[hsl(60_80%_60%)] rounded-full flex items-center justify-center">
                <div className="w-0.5 h-1.5 bg-black rounded-full" />
              </div>
              <div className="absolute top-1.5 right-1 w-1.5 h-2 md:w-2 md:h-2.5 bg-[hsl(60_80%_60%)] rounded-full flex items-center justify-center">
                <div className="w-0.5 h-1.5 bg-black rounded-full" />
              </div>
              {/* Nose */}
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-0.5 bg-[hsl(350_30%_45%)] rounded-full" />
            </div>
          </div>
        ) : (
          // Full cat
          <div className="relative">
            {/* Tail */}
            <div 
              className={`absolute -left-4 bottom-2 w-5 h-1.5 bg-[hsl(30_20%_25%)] rounded-full origin-right ${
                catState !== "idle" ? "animate-[tailWag_0.3s_ease-in-out_infinite]" : ""
              }`}
              style={{ transform: "rotate(-20deg)" }}
            />
            {/* Body */}
            <div className="w-8 h-4 md:w-10 md:h-5 bg-[hsl(30_20%_25%)] rounded-full" />
            {/* Head */}
            <div className="absolute -top-3 right-0 w-5 h-4 md:w-6 md:h-5 bg-[hsl(30_20%_25%)] rounded-full">
              {/* Ears */}
              <div className="absolute -top-1.5 left-0 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[6px] border-b-[hsl(30_20%_25%)]" />
              <div className="absolute -top-1.5 right-0 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[6px] border-b-[hsl(30_20%_25%)]" />
              {/* Eyes */}
              <div className="absolute top-1 left-0.5 w-1 h-1.5 bg-[hsl(60_80%_60%)] rounded-full flex items-center justify-center">
                <div className="w-0.5 h-1 bg-black rounded-full" />
              </div>
              <div className="absolute top-1 right-0.5 w-1 h-1.5 bg-[hsl(60_80%_60%)] rounded-full flex items-center justify-center">
                <div className="w-0.5 h-1 bg-black rounded-full" />
              </div>
            </div>
            {/* Legs */}
            <div className={`absolute bottom-0 left-1 w-1 h-2 bg-[hsl(30_20%_22%)] rounded-b ${
              catState !== "idle" ? "animate-[legMove_0.2s_ease-in-out_infinite]" : ""
            }`} />
            <div className={`absolute bottom-0 left-3 w-1 h-2 bg-[hsl(30_20%_22%)] rounded-b ${
              catState !== "idle" ? "animate-[legMove_0.2s_ease-in-out_infinite_0.1s]" : ""
            }`} />
            <div className={`absolute bottom-0 right-2 w-1 h-2 bg-[hsl(30_20%_22%)] rounded-b ${
              catState !== "idle" ? "animate-[legMove_0.2s_ease-in-out_infinite_0.05s]" : ""
            }`} />
            <div className={`absolute bottom-0 right-0.5 w-1 h-2 bg-[hsl(30_20%_22%)] rounded-b ${
              catState !== "idle" ? "animate-[legMove_0.2s_ease-in-out_infinite_0.15s]" : ""
            }`} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Cat;