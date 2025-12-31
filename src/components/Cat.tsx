import { useState, useEffect } from "react";

type CatState = "walking-right" | "walking-left" | "peeking-right" | "peeking-left" | "idle" | "scratching";

interface CatProps {
  onScratchSocket?: () => void;
}

const Cat = ({ onScratchSocket }: CatProps) => {
  const [position, setPosition] = useState(20);
  const [catState, setCatState] = useState<CatState>("idle");
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const moveCat = () => {
      const action = Math.random();
      
      if (action < 0.25) {
        // Walk right
        setCatState("walking-right");
        setIsVisible(true);
        const newPos = Math.min(position + Math.random() * 8 + 3, 75);
        setPosition(newPos);
        
        setTimeout(() => setCatState("idle"), 4000);
      } else if (action < 0.5) {
        // Walk left
        setCatState("walking-left");
        setIsVisible(true);
        const newPos = Math.max(position - Math.random() * 8 - 3, 10);
        setPosition(newPos);
        
        setTimeout(() => setCatState("idle"), 4000);
      } else if (action < 0.65) {
        // Hide and peek from right
        setCatState("peeking-right");
        setPosition(98);
        setIsVisible(true);
      } else if (action < 0.8) {
        // Hide and peek from left
        setCatState("peeking-left");
        setPosition(-3);
        setIsVisible(true);
      } else if (action < 0.88) {
        // Scratch the socket! (rare action)
        setCatState("walking-right");
        setIsVisible(true);
        setPosition(85); // Move towards socket
        
        setTimeout(() => {
          setCatState("scratching");
          // Trigger disconnect after scratching animation starts
          setTimeout(() => {
            onScratchSocket?.();
          }, 500);
          
          // Return to idle after scratching
          setTimeout(() => {
            setCatState("idle");
            // Walk away after scratching
            setTimeout(() => {
              setCatState("walking-left");
              setPosition(50 + Math.random() * 20);
              setTimeout(() => setCatState("idle"), 4000);
            }, 1000);
          }, 1500);
        }, 6000);
      } else {
        // Just idle
        setCatState("idle");
      }
    };

    const interval = setInterval(moveCat, 8000 + Math.random() * 5000);
    
    // Initial movement
    setTimeout(moveCat, 2000);
    
    return () => clearInterval(interval);
  }, [position, onScratchSocket]);

  const isPeeking = catState === "peeking-right" || catState === "peeking-left";
  const isScratching = catState === "scratching";
  const facingLeft = catState === "walking-left" || catState === "peeking-right";

  return (
    <div
      className={`fixed bottom-8 md:bottom-12 z-15 transition-all duration-[6000ms] ease-linear ${
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
            <div className="w-10 h-8 md:w-14 md:h-10 bg-[hsl(30_20%_25%)] rounded-t-full relative">
              {/* Ears */}
              <div className="absolute -top-3 left-1 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[12px] border-b-[hsl(30_20%_25%)]" />
              <div className="absolute -top-3 right-1 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[12px] border-b-[hsl(30_20%_25%)]" />
              {/* Inner ears */}
              <div className="absolute -top-1.5 left-2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[8px] border-b-[hsl(350_30%_40%)]" />
              <div className="absolute -top-1.5 right-2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[8px] border-b-[hsl(350_30%_40%)]" />
              {/* Eyes */}
              <div className="absolute top-2 left-1.5 w-2.5 h-3 md:w-3 md:h-4 bg-[hsl(60_80%_60%)] rounded-full flex items-center justify-center">
                <div className="w-1 h-2 bg-black rounded-full" />
              </div>
              <div className="absolute top-2 right-1.5 w-2.5 h-3 md:w-3 md:h-4 bg-[hsl(60_80%_60%)] rounded-full flex items-center justify-center">
                <div className="w-1 h-2 bg-black rounded-full" />
              </div>
              {/* Nose */}
              <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-1 bg-[hsl(350_30%_45%)] rounded-full" />
            </div>
          </div>
        ) : (
          // Full cat
          <div className="relative">
            {/* Tail */}
            <div 
              className={`absolute -left-6 bottom-3 w-8 h-2.5 bg-[hsl(30_20%_25%)] rounded-full origin-right ${
                catState !== "idle" ? "animate-[tailWag_0.3s_ease-in-out_infinite]" : ""
              }`}
              style={{ transform: "rotate(-20deg)" }}
            />
            {/* Body */}
            <div className={`w-14 h-7 md:w-18 md:h-9 bg-[hsl(30_20%_25%)] rounded-full ${
              isScratching ? "animate-[scratchBody_0.15s_ease-in-out_infinite]" : ""
            }`} />
            {/* Head */}
            <div className="absolute -top-5 right-0 w-9 h-7 md:w-11 md:h-9 bg-[hsl(30_20%_25%)] rounded-full">
              {/* Ears */}
              <div className="absolute -top-2.5 left-0.5 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-[hsl(30_20%_25%)]" />
              <div className="absolute -top-2.5 right-0.5 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-[hsl(30_20%_25%)]" />
              {/* Eyes */}
              <div className="absolute top-1.5 left-1 w-2 h-2.5 bg-[hsl(60_80%_60%)] rounded-full flex items-center justify-center">
                <div className="w-0.5 h-1.5 bg-black rounded-full" />
              </div>
              <div className="absolute top-1.5 right-1 w-2 h-2.5 bg-[hsl(60_80%_60%)] rounded-full flex items-center justify-center">
                <div className="w-0.5 h-1.5 bg-black rounded-full" />
              </div>
            </div>
            {/* Legs - front legs scratch when scratching */}
            <div className={`absolute bottom-0 left-1.5 w-2 h-4 bg-[hsl(30_20%_22%)] rounded-b ${
              catState === "walking-right" || catState === "walking-left" ? "animate-[legMove_0.2s_ease-in-out_infinite]" : ""
            }`} />
            <div className={`absolute bottom-0 left-5 w-2 h-4 bg-[hsl(30_20%_22%)] rounded-b ${
              catState === "walking-right" || catState === "walking-left" ? "animate-[legMove_0.2s_ease-in-out_infinite_0.1s]" : ""
            }`} />
            <div className={`absolute bottom-0 right-3 w-2 h-4 bg-[hsl(30_20%_22%)] rounded-b origin-top ${
              isScratching ? "animate-[scratchLeg_0.1s_ease-in-out_infinite]" : 
              catState === "walking-right" || catState === "walking-left" ? "animate-[legMove_0.2s_ease-in-out_infinite_0.05s]" : ""
            }`} />
            <div className={`absolute bottom-0 right-0.5 w-2 h-4 bg-[hsl(30_20%_22%)] rounded-b origin-top ${
              isScratching ? "animate-[scratchLeg_0.1s_ease-in-out_infinite_0.05s]" : 
              catState === "walking-right" || catState === "walking-left" ? "animate-[legMove_0.2s_ease-in-out_infinite_0.15s]" : ""
            }`} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Cat;