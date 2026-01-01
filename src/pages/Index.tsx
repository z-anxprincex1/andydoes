import { useState, useRef, useEffect } from "react";
import { MapPin, HelpCircle, X } from "lucide-react";
import Cat from "@/components/Cat";
import profileImage from "@/assets/profile.png";

const Index = () => {
  const [isPluggedIn, setIsPluggedIn] = useState(false);
  const [isPhoneOpen, setIsPhoneOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{text: string; isMe: boolean}[]>([
    { text: "Hey! Welcome to my portfolio 👋", isMe: false },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isGeneratorOn, setIsGeneratorOn] = useState(false);
  const [wasGeneratorOn, setWasGeneratorOn] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [plugPosition, setPlugPosition] = useState({ x: 30, y: 180 }); // Hanging down longer by default
  const [anchorScreenPos, setAnchorScreenPos] = useState({ x: 0, y: 0 });
  const [spiderDescending, setSpiderDescending] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLSpanElement>(null);
  const flickerClasses = ["flicker-1", "flicker-2", "flicker-3", "flicker-4", "flicker-5"];

  // Spider descends randomly to unplug
  useEffect(() => {
    if (!isPluggedIn) return;
    
    const scheduleSpiderAttack = () => {
      const delay = Math.random() * 15000 + 10000; // 10-25 seconds
      return setTimeout(() => {
        if (isPluggedIn && Math.random() > 0.5) {
          setSpiderDescending(true);
          // Spider reaches the cable and unplugs after animation
          setTimeout(() => {
            setIsPluggedIn(false);
            setPlugPosition({ x: 30, y: 180 });
            setTimeout(() => setSpiderDescending(false), 1500);
          }, 2000);
        } else {
          scheduleSpiderAttack();
        }
      }, delay);
    };
    
    const timer = scheduleSpiderAttack();
    return () => clearTimeout(timer);
  }, [isPluggedIn]);

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

  // Track when generator turns off
  useEffect(() => {
    if (!isGeneratorOn && wasGeneratorOn) {
      // Generator just turned off, animation will play
      const timer = setTimeout(() => setWasGeneratorOn(false), 1000);
      return () => clearTimeout(timer);
    }
    if (isGeneratorOn) {
      setWasGeneratorOn(true);
    }
  }, [isGeneratorOn]);

  // Track anchor screen position for fixed plug - continuously during animations
  useEffect(() => {
    let animationId: number;
    const updateAnchorPos = () => {
      if (anchorRef.current) {
        const rect = anchorRef.current.getBoundingClientRect();
        setAnchorScreenPos({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
      }
      animationId = requestAnimationFrame(updateAnchorPos);
    };
    updateAnchorPos();
    window.addEventListener('resize', updateAnchorPos);
    window.addEventListener('scroll', updateAnchorPos);
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', updateAnchorPos);
      window.removeEventListener('scroll', updateAnchorPos);
    };
  }, []);

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
      {/* Cobweb - Top Left (smaller) */}
      <svg 
        className="fixed top-0 left-0 w-24 h-24 md:w-36 md:h-36 pointer-events-none opacity-25"
        viewBox="0 0 100 100"
      >
        {/* Radial threads - curved and irregular */}
        <path d="M0 0 Q55 48 98 95" stroke="hsl(0 0% 60%)" strokeWidth="0.4" fill="none" />
        <path d="M0 0 Q32 52 68 98" stroke="hsl(0 0% 55%)" strokeWidth="0.3" fill="none" />
        <path d="M0 0 Q18 45 38 96" stroke="hsl(0 0% 58%)" strokeWidth="0.35" fill="none" />
        <path d="M0 0 Q52 32 96 68" stroke="hsl(0 0% 55%)" strokeWidth="0.3" fill="none" />
        <path d="M0 0 Q48 18 95 38" stroke="hsl(0 0% 60%)" strokeWidth="0.35" fill="none" />
        <path d="M0 0 Q42 8 92 16" stroke="hsl(0 0% 52%)" strokeWidth="0.3" fill="none" />
        <path d="M0 0 Q8 38 14 94" stroke="hsl(0 0% 58%)" strokeWidth="0.3" fill="none" />
        {/* Spiral threads - wobbly curves */}
        <path d="M6 3 Q10 7 4 11 Q2 9 6 3" stroke="hsl(0 0% 55%)" strokeWidth="0.3" fill="none" />
        <path d="M18 5 Q26 14 12 22 Q6 18 5 12" stroke="hsl(0 0% 58%)" strokeWidth="0.3" fill="none" />
        <path d="M32 8 Q44 22 22 38 Q10 32 8 22" stroke="hsl(0 0% 55%)" strokeWidth="0.3" fill="none" />
        <path d="M52 12 Q68 35 32 58 Q14 48 12 34" stroke="hsl(0 0% 60%)" strokeWidth="0.3" fill="none" />
        <path d="M74 16 Q92 52 48 82 Q22 68 18 48" stroke="hsl(0 0% 55%)" strokeWidth="0.3" fill="none" />
      </svg>

      {/* Cobweb - Top Right */}
      <svg 
        className="fixed top-0 right-0 w-28 h-28 md:w-40 md:h-40 pointer-events-none opacity-25"
        viewBox="0 0 100 100"
        style={{ transform: 'scaleX(-1)' }}
      >
        {/* Radial threads - organic curves */}
        <path d="M0 0 Q42 55 88 92" stroke="hsl(0 0% 55%)" strokeWidth="0.4" fill="none" />
        <path d="M0 0 Q22 48 55 95" stroke="hsl(0 0% 58%)" strokeWidth="0.35" fill="none" />
        <path d="M0 0 Q12 40 28 90" stroke="hsl(0 0% 52%)" strokeWidth="0.3" fill="none" />
        <path d="M0 0 Q50 25 92 52" stroke="hsl(0 0% 55%)" strokeWidth="0.35" fill="none" />
        <path d="M0 0 Q40 12 85 28" stroke="hsl(0 0% 58%)" strokeWidth="0.3" fill="none" />
        <path d="M0 0 Q5 32 10 88" stroke="hsl(0 0% 55%)" strokeWidth="0.3" fill="none" />
        {/* Connecting threads - sagging curves */}
        <path d="M12 4 Q16 10 6 15" stroke="hsl(0 0% 52%)" strokeWidth="0.3" fill="none" />
        <path d="M28 8 Q38 22 16 32" stroke="hsl(0 0% 55%)" strokeWidth="0.3" fill="none" />
        <path d="M48 14 Q62 38 28 55" stroke="hsl(0 0% 58%)" strokeWidth="0.3" fill="none" />
        <path d="M72 22 Q85 52 45 75" stroke="hsl(0 0% 55%)" strokeWidth="0.3" fill="none" />
      </svg>

      {/* Spider hanging from right cobweb */}
      <div className="fixed top-0 right-16 md:right-24 pointer-events-none z-30">
        {/* Spider thread - extends when descending */}
        <div 
          className={`w-px bg-[hsl(0_0%_50%)] origin-top transition-all duration-2000 ease-in-out ${
            !spiderDescending ? 'animate-spider-swing' : ''
          }`}
          style={{ 
            height: spiderDescending ? 'calc(100vh - 120px)' : '200px',
          }}
        >
          {/* Spider body */}
          <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 ${
            !spiderDescending ? 'animate-spider-bob' : ''
          }`}>
            {/* Legs left */}
            <svg className={`absolute -left-5 top-1 w-5 h-6 ${spiderDescending ? 'animate-spider-legs' : ''}`} viewBox="0 0 12 16">
              <path d="M12 2 Q6 4 0 0" stroke="hsl(0 0% 15%)" strokeWidth="1.2" fill="none" />
              <path d="M12 6 Q5 7 0 4" stroke="hsl(0 0% 15%)" strokeWidth="1.2" fill="none" />
              <path d="M12 10 Q4 10 0 8" stroke="hsl(0 0% 15%)" strokeWidth="1.2" fill="none" />
              <path d="M12 14 Q5 13 0 16" stroke="hsl(0 0% 15%)" strokeWidth="1.2" fill="none" />
            </svg>
            {/* Legs right */}
            <svg className={`absolute -right-5 top-1 w-5 h-6 ${spiderDescending ? 'animate-spider-legs' : ''}`} viewBox="0 0 12 16" style={{ transform: 'scaleX(-1)' }}>
              <path d="M12 2 Q6 4 0 0" stroke="hsl(0 0% 15%)" strokeWidth="1.2" fill="none" />
              <path d="M12 6 Q5 7 0 4" stroke="hsl(0 0% 15%)" strokeWidth="1.2" fill="none" />
              <path d="M12 10 Q4 10 0 8" stroke="hsl(0 0% 15%)" strokeWidth="1.2" fill="none" />
              <path d="M12 14 Q5 13 0 16" stroke="hsl(0 0% 15%)" strokeWidth="1.2" fill="none" />
            </svg>
            {/* Body */}
            <div className="w-4 h-6 bg-[hsl(0_0%_12%)] rounded-full" />
            {/* Head with cute eyes */}
            <div className="w-4 h-4 bg-[hsl(0_0%_10%)] rounded-full -mt-1.5 mx-auto relative flex items-center justify-center gap-1">
              {/* Left eye */}
              <div className="w-1.5 h-1.5 bg-[hsl(0_0%_95%)] rounded-full relative animate-spider-blink">
                <div className="absolute top-0.5 left-0.5 w-0.5 h-0.5 bg-[hsl(0_0%_5%)] rounded-full" />
              </div>
              {/* Right eye */}
              <div className="w-1.5 h-1.5 bg-[hsl(0_0%_95%)] rounded-full relative animate-spider-blink">
                <div className="absolute top-0.5 left-0.5 w-0.5 h-0.5 bg-[hsl(0_0%_5%)] rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Ambient light glow behind text when on */}
      <div 
        className={`fixed inset-0 transition-opacity duration-700 pointer-events-none ${
          isPluggedIn ? "opacity-40" : "opacity-0"
        }`}
        style={{
          background: 'radial-gradient(ellipse 50% 40% at 50% 50%, hsl(60 80% 85% / 0.15) 0%, transparent 60%)',
        }}
      />

      {/* Main content - picture left, text right */}
      {/* About me tooltip - positioned above the main content */}
      <div className={`fixed top-[38%] md:top-[35%] left-1/2 -translate-x-1/2 -translate-y-full z-40 transition-all duration-300 ${
        isAboutOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
      }`}>
        <div className="relative bg-[hsl(50_90%_60%)] px-5 py-4 rounded-lg border-2 border-[hsl(0_0%_10%)] shadow-[4px_4px_0_hsl(0_0%_10%)] w-[90vw] max-w-xl md:max-w-2xl">
          {/* Close button */}
          <button 
            onClick={() => setIsAboutOpen(false)}
            className="absolute -top-2 -right-2 w-6 h-6 bg-[hsl(0_0%_10%)] rounded-full flex items-center justify-center hover:scale-110 transition-transform"
          >
            <X className="w-4 h-4 text-[hsl(50_90%_60%)]" />
          </button>
          
          <div className="text-[hsl(0_0%_10%)] text-sm md:text-base" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
            <span className="font-bold block mb-2 text-base md:text-lg">About Me</span>
            <p>Hey! I&apos;m a Software developer and AI enthusiast who enjoys building practical tools and systems that solve real-world problems. I work across cloud platforms, machine learning pipelines, and data-driven applications.</p>
          </div>
        </div>
      </div>

      {/* Whoosh text - appears when generator turns on */}
      {isGeneratorOn && (
        <div className="fixed top-1/2 left-1/2 z-50 pointer-events-none animate-whoosh-text">
          <span 
            className="text-[hsl(50_90%_60%)] text-4xl md:text-6xl font-extrabold whitespace-nowrap drop-shadow-[3px_3px_0_hsl(0_0%_10%)]" 
            style={{ fontFamily: 'Comic Sans MS, cursive' }}
          >
            whoosh!
          </span>
        </div>
      )}

      {/* Phewnn text - appears when generator turns off */}
      {!isGeneratorOn && wasGeneratorOn && (
        <div className="fixed top-1/2 left-1/2 z-50 pointer-events-none animate-phewnn-text">
          <span 
            className="text-[hsl(180_70%_60%)] text-4xl md:text-6xl font-extrabold whitespace-nowrap drop-shadow-[3px_3px_0_hsl(0_0%_10%)]" 
            style={{ fontFamily: 'Comic Sans MS, cursive' }}
          >
            phewnn!
          </span>
        </div>
      )}

      <div className={`w-full px-6 md:px-12 lg:px-20 relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12 lg:gap-16 ${
        isGeneratorOn ? 'animate-whoosh-up pointer-events-none' : wasGeneratorOn ? 'animate-slide-down-in' : ''
      }`}>
        {/* Profile picture with about me */}
        <div className="flex-shrink-0 flex flex-col items-center relative">
          {/* Question mark icon with connected tooltip arrow */}
          <div className="absolute -top-2 right-0 md:right-4 lg:right-8 z-20">
            <button 
              onClick={() => setIsAboutOpen(!isAboutOpen)}
              className="w-8 h-8 md:w-10 md:h-10 bg-[hsl(50_90%_60%)] rounded-full flex items-center justify-center border-2 border-[hsl(0_0%_10%)] shadow-[2px_2px_0_hsl(0_0%_10%)] hover:scale-110 transition-transform"
            >
              <HelpCircle className="w-5 h-5 md:w-6 md:h-6 text-[hsl(0_0%_10%)]" />
            </button>
          </div>
          
          <div className={`w-40 h-40 md:w-56 md:h-56 lg:w-72 lg:h-72 rounded-full overflow-hidden border-4 border-[hsl(0_0%_20%)] shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-all duration-700 ${isPluggedIn ? '' : 'grayscale'}`}>
            <img 
              src={profileImage} 
              alt="Anand Prince Purty" 
              className="w-full h-full object-cover"
            />
          </div>
          {/* Location */}
          <div className="flex items-center gap-2 mt-4">
            <MapPin className="w-6 h-6 md:w-8 md:h-8 text-[hsl(0_70%_50%)]" />
            <span className="text-[hsl(0_0%_60%)] text-sm md:text-base font-medium">New York</span>
          </div>
        </div>

        {/* Text */}
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
              </span>
            </span>
          </span>
        </h1>
      </div>

      {/* Draggable Plug - fixed position, always on top */}
      <div 
        onMouseDown={handleMouseDown}
        className={`fixed cursor-grab active:cursor-grabbing z-[9999] ${
          isDragging ? "" : "transition-all duration-500"
        } ${isGeneratorOn ? 'pointer-events-none opacity-0' : ''}`}
        style={{
          left: anchorScreenPos.x + plugPosition.x,
          top: anchorScreenPos.y + plugPosition.y,
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

      <div 
        className={`fixed left-4 md:left-8 z-30 transition-all duration-500 pointer-events-none ${
          isPhoneOpen ? 'opacity-0 bottom-[520px] md:bottom-[580px]' : 'opacity-100 bottom-24 md:bottom-28'
        }`}
      >
        <div className="relative bg-[hsl(50_90%_60%)] px-3 py-2 rounded-lg border-2 border-[hsl(0_0%_10%)] shadow-[3px_3px_0_hsl(0_0%_10%)]">
          <span className="text-[hsl(0_0%_10%)] text-xs md:text-sm font-bold whitespace-nowrap" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
            got a question for me?
          </span>
          {/* Arrow pointing down */}
          <div className="absolute -bottom-3 left-6 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[12px] border-t-[hsl(0_0%_10%)]" />
          <div className="absolute -bottom-[9px] left-[26px] w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[10px] border-t-[hsl(50_90%_60%)]" />
        </div>
      </div>

      {/* Mobile phone - half visible at bottom left */}
      <div 
        className={`fixed left-4 md:left-8 z-30 cursor-pointer transition-all duration-500 ease-out ${
          isPhoneOpen 
            ? 'bottom-4 md:bottom-8' 
            : '-bottom-20 md:-bottom-24 hover:-bottom-16 md:hover:-bottom-20'
        }`}
        onClick={() => setIsPhoneOpen(true)}
      >
        {/* iPhone-style phone */}
        <div className={`bg-[hsl(0_0%_10%)] rounded-[2rem] border-2 border-[hsl(0_0%_20%)] relative shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-all duration-500 ${
          isPhoneOpen ? 'w-72 h-[500px] md:w-80 md:h-[550px]' : 'w-20 h-40 md:w-24 md:h-48'
        }`}>
          {/* Screen */}
          <div className={`absolute bg-[hsl(0_0%_5%)] transition-all duration-500 ${
            isPhoneOpen ? 'inset-2 rounded-[1.5rem]' : 'inset-[3px] rounded-2xl'
          }`}>
            {isPhoneOpen ? (
              /* Chat interface */
              <div className="h-full flex flex-col p-3 pt-8">
                {/* Chat header */}
                <div className="flex items-center gap-3 pb-3 border-b border-[hsl(0_0%_15%)]">
                  <div className="w-8 h-8 rounded-full bg-[hsl(0_0%_20%)] overflow-hidden">
                    <img src={profileImage} alt="Anand" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="text-white text-sm font-medium">Anand Prince Purty</div>
                    <div className="text-[hsl(0_0%_50%)] text-xs">Online</div>
                  </div>
                </div>
                
                {/* Messages */}
                <div className="flex-1 overflow-y-auto py-3 space-y-2">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                        msg.isMe 
                          ? 'bg-[hsl(210_100%_50%)] text-white rounded-br-md' 
                          : 'bg-[hsl(0_0%_18%)] text-white rounded-bl-md'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Input */}
                <div className="flex gap-2 pt-2 border-t border-[hsl(0_0%_15%)]">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newMessage.trim()) {
                        setChatMessages(prev => [...prev, { text: newMessage, isMe: true }]);
                        setNewMessage('');
                        // Auto reply after a short delay
                        setTimeout(() => {
                          setChatMessages(prev => [...prev, { text: "Thanks for reaching out! Feel free to connect with me on LinkedIn.", isMe: false }]);
                        }, 1000);
                      }
                    }}
                    placeholder="Type a message..."
                    className="flex-1 bg-[hsl(0_0%_15%)] text-white text-sm px-4 py-2 rounded-full outline-none placeholder:text-[hsl(0_0%_40%)]"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (newMessage.trim()) {
                        setChatMessages(prev => [...prev, { text: newMessage, isMe: true }]);
                        setNewMessage('');
                        setTimeout(() => {
                          setChatMessages(prev => [...prev, { text: "Thanks for reaching out! Feel free to connect with me on LinkedIn.", isMe: false }]);
                        }, 1000);
                      }
                    }}
                    className="w-9 h-9 bg-[hsl(210_100%_50%)] rounded-full flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </div>
            ) : (
              /* Minimized state - notification hint */
              <div className="h-full flex flex-col items-center justify-center">
                <div className="w-3 h-3 bg-[hsl(0_70%_50%)] rounded-full animate-pulse" />
                <div className="text-[8px] text-[hsl(0_0%_40%)] mt-2">1 message</div>
              </div>
            )}
          </div>
          
          {/* Dynamic Island */}
          <div className={`absolute left-1/2 -translate-x-1/2 bg-[hsl(0_0%_0%)] rounded-full transition-all duration-500 ${
            isPhoneOpen ? 'top-3 w-24 h-6' : 'top-1.5 w-6 h-2'
          }`} />
          
          {/* Home indicator */}
          <div className={`absolute bottom-2 left-1/2 -translate-x-1/2 bg-[hsl(0_0%_30%)] rounded-full transition-all duration-500 ${
            isPhoneOpen ? 'w-32 h-1' : 'w-8 h-0.5'
          }`} />
          
          {/* Close button when open */}
          {isPhoneOpen && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsPhoneOpen(false);
              }}
              className="absolute -top-3 -right-3 w-8 h-8 bg-[hsl(0_0%_20%)] rounded-full flex items-center justify-center border border-[hsl(0_0%_30%)] hover:bg-[hsl(0_0%_25%)] transition-colors"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Floor */}
      <div className="fixed bottom-0 left-0 right-0 h-8 md:h-12 bg-[hsl(0_0%_6%)] border-t border-[hsl(0_0%_15%)] z-10">
        {/* Floor texture lines */}
        <div className="absolute inset-0 opacity-30">
          <div className="h-full w-full" style={{
            backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 40px, hsl(0 0% 12%) 40px, hsl(0 0% 12%) 41px)',
          }} />
        </div>
        {/* Floor highlight */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[hsl(0_0%_20%)] to-transparent" />
      </div>

      {/* Tip above generator */}
      <div className={`fixed bottom-[8.5rem] md:bottom-[10.5rem] left-[calc(50%-1rem)] md:left-[calc(50%-1.5rem)] -translate-x-1/2 z-20 pointer-events-none animate-bounce transition-opacity duration-500 ${
        isGeneratorOn ? 'opacity-0' : 'opacity-100'
      }`}>
        <span 
          className="text-[hsl(0_0%_100%)] text-sm md:text-base font-extrabold whitespace-nowrap drop-shadow-[2px_2px_0_hsl(0_0%_10%)] inline-block -rotate-6" 
          style={{ fontFamily: 'Comic Sans MS, cursive' }}
        >
          click here to view my work!
        </span>
      </div>

      {/* Diesel Generator - center of floor */}
      <div 
        className="fixed bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 z-20 cursor-pointer"
        onClick={() => setIsGeneratorOn(!isGeneratorOn)}
      >
        <div className={`relative ${isGeneratorOn ? 'animate-[vibrate_0.1s_linear_infinite]' : ''}`}>
          {/* Generator body - main housing */}
          <div className="w-28 h-18 md:w-36 md:h-24 bg-gradient-to-b from-[hsl(35_25%_28%)] to-[hsl(35_30%_18%)] rounded border-2 border-[hsl(35_20%_22%)] shadow-[0_4px_8px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] relative" style={{ height: '5rem' }}>
            
            {/* Flywheel viewing window on left side */}
            <div className="absolute left-1 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 bg-[hsl(0_0%_8%)] rounded-full border-2 border-[hsl(35_15%_20%)] overflow-hidden">
              {/* Visible flywheel inside */}
              <div className={`absolute inset-0 bg-gradient-to-br from-[hsl(0_0%_32%)] to-[hsl(0_0%_18%)] rounded-full ${isGeneratorOn ? 'animate-spin' : ''}`}
                style={{ animationDuration: isGeneratorOn ? '0.3s' : undefined }}
              >
                {/* Flywheel ridges */}
                <div className="absolute inset-1 border-2 border-[hsl(0_0%_42%)] rounded-full" />
                <div className="absolute inset-2.5 border border-[hsl(0_0%_35%)] rounded-full" />
                {/* Spokes */}
                <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-gradient-to-r from-[hsl(0_0%_25%)] via-[hsl(0_0%_50%)] to-[hsl(0_0%_25%)] -translate-y-1/2" />
                <div className="absolute left-1/2 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[hsl(0_0%_25%)] via-[hsl(0_0%_50%)] to-[hsl(0_0%_25%)] -translate-x-1/2" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45 w-full h-1 bg-gradient-to-r from-transparent via-[hsl(0_0%_45%)] to-transparent" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-45 w-full h-1 bg-gradient-to-r from-transparent via-[hsl(0_0%_45%)] to-transparent" />
                {/* Center hub */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 bg-gradient-to-br from-[hsl(0_0%_45%)] to-[hsl(0_0%_25%)] rounded-full border-2 border-[hsl(0_0%_50%)] shadow-[inset_0_1px_2px_rgba(255,255,255,0.4)]">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[hsl(0_0%_20%)] rounded-full" />
                </div>
              </div>
              {/* Subtle glass reflection */}
              <div className="absolute inset-0 bg-gradient-to-br from-[hsl(0_0%_100%)] to-transparent opacity-5 rounded-full pointer-events-none" />
            </div>
            
            {/* Top panel with controls */}
            <div className="absolute top-1 left-14 md:left-16 right-1 h-4 md:h-5 bg-gradient-to-b from-[hsl(35_20%_22%)] to-[hsl(35_25%_18%)] rounded-sm flex items-center px-2 gap-1.5 border-b border-[hsl(35_15%_15%)]">
              {/* Start switch */}
              <div className="w-3 h-3 md:w-4 md:h-4 bg-[hsl(0_0%_12%)] rounded border border-[hsl(0_0%_25%)] flex items-center justify-center">
                <div className={`w-1.5 h-1.5 rounded-full ${isGeneratorOn ? 'bg-[hsl(120_70%_45%)]' : 'bg-[hsl(0_0%_30%)]'}`} />
              </div>
              {/* Choke knob */}
              <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-[hsl(0_0%_8%)] rounded-full border border-[hsl(0_0%_20%)] shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]" />
              {/* Fuel valve */}
              <div className="w-2 h-3 md:w-2.5 md:h-4 bg-[hsl(0_70%_30%)] rounded-sm border border-[hsl(0_60%_20%)]" />
              {/* Power indicator */}
              <div className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full ml-auto transition-all duration-300 ${
                isGeneratorOn ? 'bg-[hsl(120_70%_50%)] shadow-[0_0_8px_3px_rgba(74,222,128,0.7)]' : 'bg-[hsl(0_0%_15%)] border border-[hsl(0_0%_25%)]'
              }`} />
            </div>
            
            {/* Engine block texture */}
            <div className="absolute top-7 left-1 right-1 bottom-1 bg-[hsl(35_20%_15%)] rounded-sm overflow-hidden">
              {/* Cooling fins */}
              <div className="flex gap-0.5 h-full p-0.5">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="flex-1 bg-gradient-to-b from-[hsl(35_25%_22%)] to-[hsl(35_20%_12%)] rounded-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]" />
                ))}
              </div>
            </div>
            
            {/* Side panel rivets */}
            <div className="absolute top-2 left-0.5 flex flex-col gap-3">
              <div className="w-1 h-1 bg-[hsl(0_0%_35%)] rounded-full shadow-[inset_0_-1px_1px_rgba(0,0,0,0.5)]" />
              <div className="w-1 h-1 bg-[hsl(0_0%_35%)] rounded-full shadow-[inset_0_-1px_1px_rgba(0,0,0,0.5)]" />
            </div>
            <div className="absolute top-2 right-0.5 flex flex-col gap-3">
              <div className="w-1 h-1 bg-[hsl(0_0%_35%)] rounded-full shadow-[inset_0_-1px_1px_rgba(0,0,0,0.5)]" />
              <div className="w-1 h-1 bg-[hsl(0_0%_35%)] rounded-full shadow-[inset_0_-1px_1px_rgba(0,0,0,0.5)]" />
            </div>
            
            {/* Exhaust muffler */}
            <div className="absolute -right-4 top-3 w-5 h-8 md:w-6 md:h-10 bg-gradient-to-r from-[hsl(0_0%_18%)] to-[hsl(0_0%_12%)] rounded-r-lg border-2 border-l-0 border-[hsl(0_0%_22%)] shadow-[inset_0_2px_3px_rgba(0,0,0,0.4)]">
              {/* Exhaust cap */}
              <div className="absolute -top-1 left-1 right-0 h-2 bg-[hsl(0_0%_15%)] rounded-t border border-b-0 border-[hsl(0_0%_25%)]" />
              {/* Heat lines */}
              <div className="absolute top-3 left-1 right-1 flex flex-col gap-1">
                <div className="h-px bg-[hsl(0_0%_25%)]" />
                <div className="h-px bg-[hsl(0_0%_25%)]" />
                <div className="h-px bg-[hsl(0_0%_25%)]" />
              </div>
              {/* Smoke */}
              {isGeneratorOn && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-0.5">
                  <div className="w-1.5 h-1.5 bg-[hsl(0_0%_50%)] rounded-full animate-ping opacity-40" />
                  <div className="w-2 h-2 bg-[hsl(0_0%_45%)] rounded-full animate-ping opacity-30" style={{ animationDelay: '0.15s' }} />
                  <div className="w-2.5 h-2.5 bg-[hsl(0_0%_40%)] rounded-full animate-ping opacity-20" style={{ animationDelay: '0.3s' }} />
                </div>
              )}
            </div>
          </div>
          
          {/* Fuel tank */}
          <div className="absolute -top-5 md:-top-6 left-1 w-8 h-5 md:w-10 md:h-6 bg-gradient-to-b from-[hsl(0_65%_40%)] to-[hsl(0_70%_28%)] rounded-t border border-[hsl(0_60%_22%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
            {/* Fuel cap */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-3 h-2 bg-[hsl(0_0%_15%)] rounded-t border border-[hsl(0_0%_25%)]" />
            {/* Fuel level indicator */}
            <div className="absolute bottom-1 left-1 right-1 h-1.5 bg-[hsl(0_0%_10%)] rounded-sm overflow-hidden">
              <div className="h-full w-3/4 bg-gradient-to-r from-[hsl(35_80%_45%)] to-[hsl(35_70%_35%)]" />
            </div>
          </div>
          
          {/* Frame/base */}
          <div className="absolute -bottom-2 -left-1 -right-1 h-2 bg-gradient-to-b from-[hsl(0_0%_20%)] to-[hsl(0_0%_10%)] rounded-b border border-t-0 border-[hsl(0_0%_15%)]" />
          
          {/* Wheels with rubber tires */}
          <div className="absolute -bottom-3 left-0 w-5 h-5 md:w-6 md:h-6">
            <div className="w-full h-full bg-[hsl(0_0%_8%)] rounded-full border-2 border-[hsl(0_0%_15%)] shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
              <div className="absolute inset-1 bg-[hsl(0_0%_25%)] rounded-full border border-[hsl(0_0%_30%)]">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-[hsl(0_0%_15%)] rounded-full" />
              </div>
            </div>
          </div>
          <div className="absolute -bottom-3 right-2 w-5 h-5 md:w-6 md:h-6">
            <div className="w-full h-full bg-[hsl(0_0%_8%)] rounded-full border-2 border-[hsl(0_0%_15%)] shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
              <div className="absolute inset-1 bg-[hsl(0_0%_25%)] rounded-full border border-[hsl(0_0%_30%)]">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-[hsl(0_0%_15%)] rounded-full" />
              </div>
            </div>
          </div>
          
          {/* Folding handle */}
          <div className="absolute -top-3 right-2 md:right-3">
            <div className="w-10 h-2 md:w-12 md:h-2.5 bg-gradient-to-b from-[hsl(0_0%_30%)] to-[hsl(0_0%_18%)] rounded-full border border-[hsl(0_0%_35%)] shadow-[0_1px_2px_rgba(0,0,0,0.3)]" />
            {/* Handle grips */}
            <div className="absolute top-0.5 left-1 w-1 h-1 bg-[hsl(0_0%_40%)] rounded-full" />
            <div className="absolute top-0.5 right-1 w-1 h-1 bg-[hsl(0_0%_40%)] rounded-full" />
          </div>
          
          {/* Power output socket */}
          <div className="absolute bottom-2 -right-2 w-3 h-4 bg-[hsl(0_0%_12%)] rounded border border-[hsl(0_0%_20%)]">
            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1 h-0.5 bg-[hsl(0_0%_30%)]" />
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-0.5 bg-[hsl(0_0%_30%)]" />
          </div>
        </div>
      </div>

      {/* Cable from generator to socket - curvy zig zag on floor */}
      <div className="fixed bottom-6 md:bottom-9 pointer-events-none z-10" style={{ left: 'calc(50% + 1rem)', width: 'calc(50% - 6rem)' }}>
        <svg className="w-full h-6" viewBox="0 0 200 20" preserveAspectRatio="none">
          <path 
            d="M 0 10 C 20 5, 30 15, 50 10 C 70 5, 80 15, 100 10 C 120 5, 130 15, 150 10 C 170 5, 180 15, 200 10" 
            stroke="hsl(0 0% 38%)" 
            strokeWidth="4" 
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </div>


      {/* Projector Screen - slides down from top when generator is on */}
      {isGeneratorOn && (
        <div className="fixed top-0 left-0 right-0 flex justify-center z-15 pointer-events-none">
          <div className="animate-screen-down">
            {/* Screen mount bar */}
            <div className="w-[75vw] h-3 bg-gradient-to-b from-[hsl(0_0%_25%)] to-[hsl(0_0%_15%)] rounded-b border-x-2 border-b-2 border-[hsl(0_0%_20%)]" />
            {/* Screen */}
            <div className="w-[75vw] h-[calc(100vh-10rem)] md:h-[calc(100vh-12rem)] bg-gradient-to-b from-[hsl(0_0%_95%)] to-[hsl(0_0%_88%)] border-x-4 border-b-4 border-[hsl(0_0%_20%)] shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
              {/* Screen content area */}
              <div className="w-full h-full flex items-center justify-center p-8">
                <div className="text-[hsl(0_0%_20%)] text-center" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                  <p className="text-2xl md:text-4xl font-bold mb-4">My Work</p>
                  <p className="text-sm md:text-lg opacity-70">Projects coming soon...</p>
                </div>
              </div>
            </div>
            {/* Screen bottom weight bar */}
            <div className="w-[75vw] h-2 bg-gradient-to-b from-[hsl(0_0%_20%)] to-[hsl(0_0%_10%)] rounded-b" />
          </div>
        </div>
      )}

      {/* Projector Light Beam - visible when generator is on */}
      {isGeneratorOn && (
        <div className="fixed bottom-8 md:bottom-11 right-24 md:right-32 z-19 pointer-events-none animate-light-beam">
          <svg 
            className="absolute" 
            style={{ 
              left: '-2rem',
              bottom: '0.5rem',
              width: 'calc(100vw - 10rem)',
              height: '60vh',
              transform: 'rotate(-25deg)',
              transformOrigin: 'bottom right'
            }}
            viewBox="0 0 400 300"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="beamGradient" x1="100%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="hsl(50 80% 90%)" stopOpacity="0.6" />
                <stop offset="30%" stopColor="hsl(50 70% 85%)" stopOpacity="0.3" />
                <stop offset="70%" stopColor="hsl(50 60% 80%)" stopOpacity="0.1" />
                <stop offset="100%" stopColor="hsl(50 50% 75%)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon 
              points="400,300 380,280 0,0 50,0" 
              fill="url(#beamGradient)"
            />
          </svg>
        </div>
      )}

      {/* Projector - lying on floor left of socket */}
      <div className="fixed bottom-8 md:bottom-11 right-24 md:right-32 z-20">
        {/* Projector body */}
        <div className="w-16 h-10 md:w-24 md:h-14 bg-[hsl(0_0%_15%)] rounded relative">
          {/* Lens */}
          <div className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 w-5 h-5 md:w-7 md:h-7 bg-[hsl(0_0%_8%)] rounded-full border-2 border-[hsl(0_0%_25%)] transition-all duration-300 ${
            isGeneratorOn ? 'shadow-[0_0_15px_5px_rgba(255,220,100,0.6)]' : ''
          }`}>
            <div className={`absolute inset-1 rounded-full transition-all duration-300 ${
              isGeneratorOn ? 'bg-[hsl(50_80%_70%)]' : 'bg-[hsl(220_20%_15%)]'
            }`} />
          </div>
          {/* Top vent lines */}
          <div className="absolute top-1.5 right-3 flex gap-1">
            <div className="w-0.5 h-3 md:h-5 bg-[hsl(0_0%_10%)]" />
            <div className="w-0.5 h-3 md:h-5 bg-[hsl(0_0%_10%)]" />
            <div className="w-0.5 h-3 md:h-5 bg-[hsl(0_0%_10%)]" />
            <div className="w-0.5 h-3 md:h-5 bg-[hsl(0_0%_10%)]" />
          </div>
          {/* Power LED - off */}
          <div className={`absolute bottom-1.5 right-3 w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-all duration-300 ${
            isGeneratorOn ? 'bg-[hsl(120_70%_45%)] shadow-[0_0_4px_rgba(74,222,128,0.6)]' : 'bg-[hsl(0_0%_25%)]'
          }`} />
          {/* Feet */}
          <div className="absolute -bottom-1 left-3 w-2 h-1.5 bg-[hsl(0_0%_10%)] rounded-sm" />
          <div className="absolute -bottom-1 right-4 w-2 h-1.5 bg-[hsl(0_0%_10%)] rounded-sm" />
        </div>
      </div>

      {/* Socket - fixed at bottom right, sitting on floor */}
      <div 
        ref={socketRef}
        className={`fixed bottom-8 md:bottom-12 right-8 md:right-12 w-12 h-16 md:w-16 md:h-24 bg-[hsl(0_0%_8%)] rounded-t border-2 border-b-0 transition-all duration-300 shadow-[inset_0_2px_8px_rgba(0,0,0,0.6)] z-20 ${
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

      {/* Cat */}
      <Cat onScratchSocket={() => {
        setIsPluggedIn(false);
        setPlugPosition({ x: 30, y: 180 });
      }} />
      </div>
    </main>
  );
};

export default Index;
