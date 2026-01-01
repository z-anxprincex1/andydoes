import { useEffect, useRef, useState } from "react";

type CatState =
  | "walking-right"
  | "walking-left"
  | "running-right"
  | "running-left"
  | "peeking-right"
  | "peeking-left"
  | "idle"
  | "idle-sit"
  | "idle-lick"
  | "scratching";

interface CatProps {
  onScratchSocket?: () => void;
  onPositionChange?: (position: number) => void;
  onStateChange?: (state: CatState) => void;
}

export type { CatState };

const Cat = ({ onScratchSocket, onPositionChange, onStateChange }: CatProps) => {
  const [position, setPosition] = useState(20);
  const [catState, setCatState] = useState<CatState>("idle");
  const [facingRight, setFacingRight] = useState(true);

  const positionRef = useRef(position);
  const onScratchRef = useRef(onScratchSocket);
  const onPositionChangeRef = useRef(onPositionChange);
  const onStateChangeRef = useRef(onStateChange);
  const busyRef = useRef(false);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    positionRef.current = position;
    onPositionChangeRef.current?.(position);
  }, [position]);

  useEffect(() => {
    onStateChangeRef.current?.(catState);
  }, [catState]);

  useEffect(() => {
    onPositionChangeRef.current = onPositionChange;
  }, [onPositionChange]);

  useEffect(() => {
    onStateChangeRef.current = onStateChange;
  }, [onStateChange]);

  useEffect(() => {
    onScratchRef.current = onScratchSocket;
  }, [onScratchSocket]);

  const later = (fn: () => void, ms: number) => {
    const t = window.setTimeout(fn, ms);
    timersRef.current.push(t);
    return t;
  };

  const clearAllTimers = () => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
  };

  useEffect(() => {
    const moveCat = () => {
      if (busyRef.current) return;

      const action = Math.random();

      // Very rare: scratch socket
      if (action > 0.96) {
        busyRef.current = true;
        setFacingRight(true);
        setCatState("running-right");
        setPosition(88);

        later(() => {
          setCatState("scratching");
          later(() => onScratchRef.current?.(), 400);

          later(() => {
            setFacingRight(false);
            setCatState("running-left");
            setPosition(50 + Math.random() * 20);

            later(() => {
              setCatState("idle");
              busyRef.current = false;
            }, 3000);
          }, 1600);
        }, 3000);

        return;
      }

      // Walk right
      if (action < 0.25) {
        setFacingRight(true);
        setCatState("walking-right");
        setPosition((prev) => Math.min(prev + (Math.random() * 6 + 3), 78));
        later(() => setCatState("idle"), 4000);
        return;
      }

      // Walk left
      if (action < 0.5) {
        setFacingRight(false);
        setCatState("walking-left");
        setPosition((prev) => Math.max(prev - (Math.random() * 6 + 3), 10));
        later(() => setCatState("idle"), 4000);
        return;
      }

      // Run right (faster, longer distance)
      if (action < 0.6) {
        setFacingRight(true);
        setCatState("running-right");
        setPosition((prev) => Math.min(prev + (Math.random() * 15 + 10), 78));
        later(() => setCatState("idle"), 2000);
        return;
      }

      // Run left
      if (action < 0.7) {
        setFacingRight(false);
        setCatState("running-left");
        setPosition((prev) => Math.max(prev - (Math.random() * 15 + 10), 10));
        later(() => setCatState("idle"), 2000);
        return;
      }

      // Idle sit
      if (action < 0.8) {
        setCatState("idle-sit");
        later(() => setCatState("idle"), 3000);
        return;
      }

      // Idle lick (grooming)
      if (action < 0.88) {
        setCatState("idle-lick");
        later(() => setCatState("idle"), 2500);
        return;
      }

      // Peek right
      if (action < 0.94) {
        setFacingRight(false);
        setCatState("peeking-right");
        setPosition(101);
        later(() => {
          setCatState("idle");
          setPosition(75);
        }, 2200);
        return;
      }

      // Peek left
      setFacingRight(true);
      setCatState("peeking-left");
      setPosition(-6);
      later(() => {
        setCatState("idle");
        setPosition(15);
      }, 2200);
    };

    let loopTimer = 0;
    const scheduleNext = () => {
      const delay = 4000 + Math.random() * 3000;
      loopTimer = window.setTimeout(() => {
        moveCat();
        scheduleNext();
      }, delay);
    };

    scheduleNext();
    later(moveCat, 2000);

    return () => {
      window.clearTimeout(loopTimer);
      clearAllTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isPeeking = catState === "peeking-right" || catState === "peeking-left";
  const isScratching = catState === "scratching";
  const isRunning = catState === "running-right" || catState === "running-left";
  const isWalking = catState === "walking-right" || catState === "walking-left";
  const isSitting = catState === "idle-sit";
  const isLicking = catState === "idle-lick";

  // Different transition speeds for different actions
  const getTransitionMs = () => {
    if (isPeeking) return 600;
    if (isRunning) return 2000;
    return 4000;
  };

  return (
    <div
      className="fixed bottom-8 md:bottom-12 z-[10000]"
      style={{
        left: `${position}%`,
        transitionProperty: "left",
        transitionTimingFunction: "ease-in-out",
        transitionDuration: `${getTransitionMs()}ms`,
        perspective: "200px",
      }}
    >
      {/* 3D container with perspective */}
      <div
        className="transition-transform duration-500 ease-in-out"
        style={{
          transformStyle: "preserve-3d",
          transform: `translateX(-50%) rotateY(${facingRight ? 0 : 180}deg)`,
        }}
      >
        <div className="relative" style={{ transformStyle: "preserve-3d" }}>
          {isPeeking ? (
            // Peeking cat - only head visible
            <div className="relative" style={{ transform: "translateZ(5px)" }}>
              <div className="w-10 h-8 md:w-14 md:h-10 bg-[hsl(30_20%_25%)] rounded-t-full relative shadow-lg">
                <div className="absolute -top-3 left-1 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[12px] border-b-[hsl(30_20%_25%)]" />
                <div className="absolute -top-3 right-1 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[12px] border-b-[hsl(30_20%_25%)]" />
                <div className="absolute -top-1.5 left-2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[8px] border-b-[hsl(350_30%_40%)]" />
                <div className="absolute -top-1.5 right-2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[8px] border-b-[hsl(350_30%_40%)]" />
                <div className="absolute top-2 left-1.5 w-2.5 h-3 md:w-3 md:h-4 bg-[hsl(60_80%_60%)] rounded-full flex items-center justify-center">
                  <div className="w-1 h-2 bg-black rounded-full" />
                </div>
                <div className="absolute top-2 right-1.5 w-2.5 h-3 md:w-3 md:h-4 bg-[hsl(60_80%_60%)] rounded-full flex items-center justify-center">
                  <div className="w-1 h-2 bg-black rounded-full" />
                </div>
                <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-1 bg-[hsl(350_30%_45%)] rounded-full" />
              </div>
            </div>
          ) : (
            // Full cat with 3D depth
            <div className="relative" style={{ transformStyle: "preserve-3d" }}>
              {/* Tail - back layer */}
              <div
                className={`absolute -left-6 bottom-3 w-8 h-2.5 bg-[hsl(30_20%_22%)] rounded-full origin-right shadow-md ${
                  isWalking || isRunning || isScratching ? "animate-[tailWag_0.3s_ease-in-out_infinite]" : 
                  isLicking ? "animate-[tailSlow_2s_ease-in-out_infinite]" : ""
                }`}
                style={{ 
                  transform: `translateZ(-8px) rotate(${isSitting ? "-40deg" : "-20deg"})`,
                }}
              />
              
              {/* Body - middle layer */}
              <div
                className={`bg-[hsl(30_20%_25%)] rounded-full shadow-lg ${
                  isScratching ? "animate-[scratchBody_0.15s_ease-in-out_infinite]" : ""
                } ${isSitting ? "w-12 h-8 md:w-14 md:h-10" : "w-14 h-7 md:w-18 md:h-9"}`}
                style={{ 
                  transform: `translateZ(0px) ${isSitting ? "rotate(-10deg)" : ""}`,
                }}
              />
              
              {/* Head - front layer */}
              <div 
                className={`absolute w-9 h-7 md:w-11 md:h-9 bg-[hsl(30_20%_28%)] rounded-full shadow-lg ${
                  isLicking ? "animate-[headBob_0.5s_ease-in-out_infinite]" : ""
                }`}
                style={{ 
                  transform: `translateZ(10px)`,
                  top: isSitting ? "-1.5rem" : "-1.25rem",
                  right: isSitting ? "-0.5rem" : "0",
                }}
              >
                {/* Ears */}
                <div 
                  className="absolute -top-2.5 left-0.5 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-[hsl(30_20%_28%)]"
                  style={{ transform: "translateZ(2px)" }}
                />
                <div 
                  className="absolute -top-2.5 right-0.5 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-[hsl(30_20%_28%)]"
                  style={{ transform: "translateZ(2px)" }}
                />
                {/* Eyes */}
                <div 
                  className={`absolute top-1.5 left-1 w-2 h-2.5 bg-[hsl(60_80%_60%)] rounded-full flex items-center justify-center ${
                    isLicking ? "h-1" : ""
                  }`}
                  style={{ transform: "translateZ(3px)" }}
                >
                  <div className={`w-0.5 bg-black rounded-full ${isLicking ? "h-0.5" : "h-1.5"}`} />
                </div>
                <div 
                  className={`absolute top-1.5 right-1 w-2 h-2.5 bg-[hsl(60_80%_60%)] rounded-full flex items-center justify-center ${
                    isLicking ? "h-1" : ""
                  }`}
                  style={{ transform: "translateZ(3px)" }}
                >
                  <div className={`w-0.5 bg-black rounded-full ${isLicking ? "h-0.5" : "h-1.5"}`} />
                </div>
                {/* Nose */}
                <div 
                  className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1 bg-[hsl(350_30%_45%)] rounded-full"
                  style={{ transform: "translateZ(5px)" }}
                />
                {/* Tongue when licking */}
                {isLicking && (
                  <div 
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-2 bg-[hsl(350_50%_55%)] rounded-b-full animate-[lick_0.3s_ease-in-out_infinite]"
                    style={{ transform: "translateZ(6px)" }}
                  />
                )}
              </div>

              {/* Legs with 3D positioning */}
              {!isSitting ? (
                <>
                  {/* Back legs */}
                  <div
                    className={`absolute bottom-0 left-1.5 w-2 h-4 bg-[hsl(30_20%_20%)] rounded-b ${
                      isRunning ? "animate-[legRun_0.15s_ease-in-out_infinite]" :
                      isWalking ? "animate-[legMove_0.25s_ease-in-out_infinite]" : ""
                    }`}
                    style={{ transform: "translateZ(-4px)" }}
                  />
                  <div
                    className={`absolute bottom-0 left-5 w-2 h-4 bg-[hsl(30_20%_20%)] rounded-b ${
                      isRunning ? "animate-[legRun_0.15s_ease-in-out_infinite_0.075s]" :
                      isWalking ? "animate-[legMove_0.25s_ease-in-out_infinite_0.125s]" : ""
                    }`}
                    style={{ transform: "translateZ(-2px)" }}
                  />
                  {/* Front legs */}
                  <div
                    className={`absolute bottom-0 right-3 w-2 h-4 bg-[hsl(30_20%_22%)] rounded-b origin-top ${
                      isScratching ? "animate-[scratchLeg_0.1s_ease-in-out_infinite]" :
                      isRunning ? "animate-[legRun_0.15s_ease-in-out_infinite_0.05s]" :
                      isWalking ? "animate-[legMove_0.25s_ease-in-out_infinite_0.05s]" : ""
                    }`}
                    style={{ transform: "translateZ(4px)" }}
                  />
                  <div
                    className={`absolute bottom-0 right-0.5 w-2 h-4 bg-[hsl(30_20%_24%)] rounded-b origin-top ${
                      isScratching ? "animate-[scratchLeg_0.1s_ease-in-out_infinite_0.05s]" :
                      isRunning ? "animate-[legRun_0.15s_ease-in-out_infinite_0.1s]" :
                      isWalking ? "animate-[legMove_0.25s_ease-in-out_infinite_0.175s]" : ""
                    }`}
                    style={{ transform: "translateZ(6px)" }}
                  />
                </>
              ) : (
                // Sitting legs (tucked)
                <>
                  <div
                    className="absolute bottom-0 left-2 w-5 h-3 bg-[hsl(30_20%_22%)] rounded-full"
                    style={{ transform: "translateZ(2px)" }}
                  />
                  <div
                    className="absolute bottom-0 right-1 w-3 h-2 bg-[hsl(30_20%_24%)] rounded-full"
                    style={{ transform: "translateZ(6px)" }}
                  />
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cat;
