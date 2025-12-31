import { useEffect, useRef, useState } from "react";

type CatState =
  | "walking-right"
  | "walking-left"
  | "peeking-right"
  | "peeking-left"
  | "idle"
  | "scratching";

interface CatProps {
  onScratchSocket?: () => void;
}

const Cat = ({ onScratchSocket }: CatProps) => {
  const [position, setPosition] = useState(20);
  const [catState, setCatState] = useState<CatState>("idle");

  const positionRef = useRef(position);
  const onScratchRef = useRef(onScratchSocket);
  const busyRef = useRef(false);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

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
      if (action > 0.94) {
        busyRef.current = true;

        setCatState("walking-right");
        setPosition(88);

        later(() => {
          setCatState("scratching");
          later(() => onScratchRef.current?.(), 400);

          later(() => {
            setCatState("walking-left");
            setPosition(50 + Math.random() * 20);

            later(() => {
              setCatState("idle");
              busyRef.current = false;
            }, 5000);
          }, 1600);
        }, 9000);

        return;
      }

      // Walk right
      if (action < 0.45) {
        setCatState("walking-right");
        setPosition((prev) => Math.min(prev + (Math.random() * 5 + 2), 78));
        later(() => setCatState("idle"), 5000);
        return;
      }

      // Walk left
      if (action < 0.9) {
        setCatState("walking-left");
        setPosition((prev) => Math.max(prev - (Math.random() * 5 + 2), 10));
        later(() => setCatState("idle"), 5000);
        return;
      }

      // Peek (quick)
      if (action < 0.95) {
        setCatState("peeking-right");
        setPosition(101);
        later(() => setCatState("idle"), 2200);
      } else {
        setCatState("peeking-left");
        setPosition(-6);
        later(() => setCatState("idle"), 2200);
      }
    };

    let loopTimer = 0;
    const scheduleNext = () => {
      const delay = 5000 + Math.random() * 4000;
      loopTimer = window.setTimeout(() => {
        moveCat();
        scheduleNext();
      }, delay);
    };

    scheduleNext();
    later(moveCat, 2500);

    return () => {
      window.clearTimeout(loopTimer);
      clearAllTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isPeeking = catState === "peeking-right" || catState === "peeking-left";
  const isScratching = catState === "scratching";
  const facingLeft = catState === "walking-left" || catState === "peeking-right";

  const transitionMs = isPeeking ? 600 : 4000;

  return (
    <div
      className="fixed bottom-8 md:bottom-12 z-20 transition-[left,transform] ease-linear"
      style={{
        left: `${position}%`,
        transform: `translateX(-50%) scaleX(${facingLeft ? -1 : 1})`,
        transitionDuration: `${transitionMs}ms`,
      }}
    >
      <div className="relative">
        {isPeeking ? (
          <div className="relative">
            <div className="w-10 h-8 md:w-14 md:h-10 bg-[hsl(30_20%_25%)] rounded-t-full relative">
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
          <div className="relative">
            <div
              className={`absolute -left-6 bottom-3 w-8 h-2.5 bg-[hsl(30_20%_25%)] rounded-full origin-right ${
                catState !== "idle" ? "animate-[tailWag_0.3s_ease-in-out_infinite]" : ""
              }`}
              style={{ transform: "rotate(-20deg)" }}
            />
            <div
              className={`w-14 h-7 md:w-18 md:h-9 bg-[hsl(30_20%_25%)] rounded-full ${
                isScratching ? "animate-[scratchBody_0.15s_ease-in-out_infinite]" : ""
              }`}
            />
            <div className="absolute -top-5 right-0 w-9 h-7 md:w-11 md:h-9 bg-[hsl(30_20%_25%)] rounded-full">
              <div className="absolute -top-2.5 left-0.5 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-[hsl(30_20%_25%)]" />
              <div className="absolute -top-2.5 right-0.5 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-[hsl(30_20%_25%)]" />
              <div className="absolute top-1.5 left-1 w-2 h-2.5 bg-[hsl(60_80%_60%)] rounded-full flex items-center justify-center">
                <div className="w-0.5 h-1.5 bg-black rounded-full" />
              </div>
              <div className="absolute top-1.5 right-1 w-2 h-2.5 bg-[hsl(60_80%_60%)] rounded-full flex items-center justify-center">
                <div className="w-0.5 h-1.5 bg-black rounded-full" />
              </div>
            </div>

            <div
              className={`absolute bottom-0 left-1.5 w-2 h-4 bg-[hsl(30_20%_22%)] rounded-b ${
                catState === "walking-right" || catState === "walking-left"
                  ? "animate-[legMove_0.2s_ease-in-out_infinite]"
                  : ""
              }`}
            />
            <div
              className={`absolute bottom-0 left-5 w-2 h-4 bg-[hsl(30_20%_22%)] rounded-b ${
                catState === "walking-right" || catState === "walking-left"
                  ? "animate-[legMove_0.2s_ease-in-out_infinite_0.1s]"
                  : ""
              }`}
            />
            <div
              className={`absolute bottom-0 right-3 w-2 h-4 bg-[hsl(30_20%_22%)] rounded-b origin-top ${
                isScratching
                  ? "animate-[scratchLeg_0.1s_ease-in-out_infinite]"
                  : catState === "walking-right" || catState === "walking-left"
                    ? "animate-[legMove_0.2s_ease-in-out_infinite_0.05s]"
                    : ""
              }`}
            />
            <div
              className={`absolute bottom-0 right-0.5 w-2 h-4 bg-[hsl(30_20%_22%)] rounded-b origin-top ${
                isScratching
                  ? "animate-[scratchLeg_0.1s_ease-in-out_infinite_0.05s]"
                  : catState === "walking-right" || catState === "walking-left"
                    ? "animate-[legMove_0.2s_ease-in-out_infinite_0.15s]"
                    : ""
              }`}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Cat;
