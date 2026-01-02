import { useState, useRef, useEffect } from "react";
import { MapPin, HelpCircle, X, Github, Linkedin } from "lucide-react";
import Cat from "@/components/Cat";
import profileImage from "@/assets/profile.png";
const Index = () => {
  const [isPluggedIn, setIsPluggedIn] = useState(false);
  const [isPhoneOpen, setIsPhoneOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{
    text: string;
    isMe: boolean;
  }[]>([{
    text: "Hey! Welcome to my portfolio 👋",
    isMe: false
  }]);
  const [newMessage, setNewMessage] = useState("");
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isGeneratorOn, setIsGeneratorOn] = useState(false);
  const [wasGeneratorOn, setWasGeneratorOn] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [catPosition, setCatPosition] = useState(20);
  const [plugPosition, setPlugPosition] = useState({
    x: 30,
    y: 180
  }); // Hanging down longer by default
  const [activeFolder, setActiveFolder] = useState<'projects' | 'experience'>('projects');
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const projects = [{
    title: "Multi-Modal Deep Learning for VQA",
    description: "Constructed a multimodal architecture for Visual Question Answering by synthesizing image features via ResNet and textual embeddings via BERT, attaining high precision in contextual responses."
  }, {
    title: "VirtualEye – Drowning Detection",
    description: "Deployed YOLOv5 on IBM Cloud to architect a real-time drowning detection system, triggering immediate alerts for drowning risks via Flask API endpoints."
  }, {
    title: "Signease – Sign Language Detection",
    description: "Developed a browser-based sign language translator leveraging Mobilenet SSD and TensorFlow.js, enabling seamless gesture-to-text conversion in real time."
  }, {
    title: "Skin Disease Classification CNN",
    description: "Built and fine-tuned a convolutional neural network achieving 93% accuracy in classifying dermatological conditions across multiple categories."
  }, {
    title: "Smart Door Lock with Face Detection",
    description: "Built a security system integrating Raspberry Pi, facial recognition, and fingerprint validation to automate intelligent door access."
  }];
  const plugRef = useRef<HTMLDivElement>(null);
  const plugPositionRef = useRef(plugPosition);
  const [spiderDescending, setSpiderDescending] = useState(false);
  const [spiderAtCoffee, setSpiderAtCoffee] = useState(false);
  const [githubEyeDirection, setGithubEyeDirection] = useState<'center' | 'left' | 'right'>('center');
  const [githubBlinking, setGithubBlinking] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLSpanElement>(null);
  const flickerClasses = ["flicker-1", "flicker-2", "flicker-3", "flicker-4", "flicker-5"];

  // GitHub eyes random looking and blinking
  useEffect(() => {
    // Random eye direction changes
    const lookInterval = setInterval(() => {
      const directions: ('center' | 'left' | 'right')[] = ['center', 'left', 'right', 'center'];
      const randomDirection = directions[Math.floor(Math.random() * directions.length)];
      setGithubEyeDirection(randomDirection);
    }, 2000 + Math.random() * 3000);

    // Random blinking
    const blinkInterval = setInterval(() => {
      setGithubBlinking(true);
      setTimeout(() => setGithubBlinking(false), 150);
    }, 3000 + Math.random() * 4000);

    return () => {
      clearInterval(lookInterval);
      clearInterval(blinkInterval);
    };
  }, []);

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
            setPlugPosition({
              x: 30,
              y: 180
            });
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

  // Spider visits coffee randomly
  useEffect(() => {
    const scheduleCoffeeVisit = () => {
      const delay = Math.random() * 40000 + 45000; // 45-85 seconds
      return setTimeout(() => {
        if (!spiderDescending && Math.random() > 0.6) {
          setSpiderAtCoffee(true);
          // Stay at coffee for a few seconds
          setTimeout(() => setSpiderAtCoffee(false), 5000);
        }
        scheduleCoffeeVisit();
      }, delay);
    };
    const timer = scheduleCoffeeVisit();
    return () => clearTimeout(timer);
  }, [spiderDescending]);
  const getFlickerClass = (index: number) => {
    return flickerClasses[index % flickerClasses.length];
  };
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsDragging(true);
    if (isPluggedIn) {
      setIsPluggedIn(false);
    }
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !anchorRef.current) return;
    const anchorRect = anchorRef.current.getBoundingClientRect();
    const anchorX = anchorRect.left + anchorRect.width / 2;
    const anchorY = anchorRect.top + anchorRect.height / 2;
    setPlugPosition({
      x: e.clientX - anchorX,
      y: e.clientY - anchorY
    });
  };
  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging || !socketRef.current || !anchorRef.current) return;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    setIsDragging(false);
    const socketRect = socketRef.current.getBoundingClientRect();
    const anchorRect = anchorRef.current.getBoundingClientRect();
    const anchorX = anchorRect.left + anchorRect.width / 2;
    const anchorY = anchorRect.top + anchorRect.height / 2;
    const socketTargetX = socketRect.left - anchorX;
    const socketTargetY = socketRect.top + socketRect.height * 0.4 - anchorY; // Align with socket holes (upper-center)

    // Check if plug is close enough to socket to snap
    if (Math.abs(plugPosition.x - socketTargetX) < 60 && Math.abs(plugPosition.y - socketTargetY) < 40) {
      setIsPluggedIn(true);
      setPlugPosition({
        x: socketTargetX,
        y: socketTargetY
      });
    } else {
      // Drop and hang down
      setPlugPosition({
        x: 30,
        y: 180
      });
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

  // Keep latest plugPosition available for animation loop
  useEffect(() => {
    plugPositionRef.current = plugPosition;
  }, [plugPosition]);

  // Keep the fixed plug glued to the moving anchor (no React render lag)
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      if (anchorRef.current && plugRef.current) {
        const rect = anchorRef.current.getBoundingClientRect();
        const {
          x,
          y
        } = plugPositionRef.current;
        plugRef.current.style.left = `${rect.left + rect.width / 2 + x}px`;
        plugRef.current.style.top = `${rect.top + rect.height / 2 + y}px`;
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, []);
  const renderWord = (word: string, wordIndex: number, isLast: boolean) => {
    return <span key={wordIndex} className="inline-flex items-center">
        {word.split("").map((letter, letterIndex) => {
        return <span key={letterIndex} className={`inline-block relative ${isPluggedIn ? getFlickerClass(wordIndex * 5 + letterIndex) : ""}`} style={{
          animationDelay: isPluggedIn ? `${(wordIndex * 5 + letterIndex) * 0.1}s` : undefined
        }}>
              {letter}
            </span>;
      })}
        {!isLast && <span className="inline-block">&nbsp;</span>}
      </span>;
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
      const xProgress = endX / segments * i;
      const xProgressNext = endX / segments * (i + 1);

      // Alternate wave direction
      const waveDir = i % 2 === 0 ? 1 : -1;
      const controlX = xProgress + (xProgressNext - xProgress) / 2 + waveAmplitude * waveDir;
      path += ` Q ${controlX} ${midY} ${xProgressNext} ${endSegY}`;
    }

    // Final connection to plug
    path += ` L ${endX} ${endY}`;
    return path;
  };
  return <main className="fixed inset-0 flex items-center bg-background overflow-hidden" ref={containerRef}>
      {/* Swinging Filament Bulb - Top Left */}
      <div className="fixed top-0 left-12 md:left-20 z-20 pointer-events-none animate-bulb-swing origin-top">
        {/* Cable */}
        <div className="w-0.5 h-32 md:h-40 bg-gradient-to-b from-[hsl(0_0%_20%)] to-[hsl(0_0%_30%)] mx-auto" />
        {/* Bulb socket/cap */}
        <div className="w-5 h-4 bg-gradient-to-b from-[hsl(35_30%_25%)] via-[hsl(35_25%_35%)] to-[hsl(35_20%_28%)] mx-auto rounded-t-sm relative">
          {/* Screw thread lines */}
          <div className="absolute top-1 left-0 right-0 h-px bg-[hsl(35_20%_20%)]" />
          <div className="absolute top-2 left-0 right-0 h-px bg-[hsl(35_20%_20%)]" />
        </div>
        {/* Glass bulb */}
        <div className="w-8 h-10 mx-auto relative">
          {/* Bulb glass shape */}
          <div className={`absolute inset-0 rounded-[40%_40%_50%_50%] border transition-all duration-300 ${isPluggedIn ? 'bg-gradient-to-b from-[hsl(45_40%_35%/_0.5)] via-[hsl(45_35%_30%/_0.4)] to-[hsl(45_30%_25%/_0.5)] border-[hsl(45_30%_50%/_0.4)]' : 'bg-gradient-to-b from-[hsl(45_10%_18%/_0.3)] via-[hsl(45_8%_15%/_0.25)] to-[hsl(45_5%_12%/_0.3)] border-[hsl(45_5%_25%/_0.2)]'}`} />
          {/* Inner glass reflection */}
          <div className="absolute top-1 left-1 w-2 h-3 bg-[hsl(45_20%_60%/_0.15)] rounded-full blur-[1px] rotate-[-20deg]" />
          {/* Filament structure */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-6">
            {/* Filament support wires */}
            <div className="absolute left-0.5 top-0 w-px h-full bg-[hsl(0_0%_40%)]" />
            <div className="absolute right-0.5 top-0 w-px h-full bg-[hsl(0_0%_40%)]" />
            {/* Filament coil - only glows when plugged in */}
            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-2 h-4 flex flex-col items-center justify-center gap-px">
              <div className={`w-2 h-px transition-all duration-300 ${isPluggedIn ? 'bg-[hsl(35_80%_50%)] flicker-1 shadow-[0_0_4px_hsl(35_90%_60%),0_0_8px_hsl(35_90%_50%)]' : 'bg-[hsl(0_0%_30%)]'}`} />
              <div className={`w-2 h-px transition-all duration-300 ${isPluggedIn ? 'bg-[hsl(35_80%_50%)] flicker-2 shadow-[0_0_4px_hsl(35_90%_60%),0_0_8px_hsl(35_90%_50%)]' : 'bg-[hsl(0_0%_30%)]'}`} />
              <div className={`w-2.5 h-px transition-all duration-300 ${isPluggedIn ? 'bg-[hsl(35_80%_55%)] flicker-3 shadow-[0_0_5px_hsl(35_90%_60%),0_0_10px_hsl(35_90%_50%)]' : 'bg-[hsl(0_0%_32%)]'}`} />
              <div className={`w-2 h-px transition-all duration-300 ${isPluggedIn ? 'bg-[hsl(35_80%_50%)] flicker-4 shadow-[0_0_4px_hsl(35_90%_60%),0_0_8px_hsl(35_90%_50%)]' : 'bg-[hsl(0_0%_30%)]'}`} />
              <div className={`w-1.5 h-px transition-all duration-300 ${isPluggedIn ? 'bg-[hsl(35_80%_45%)] flicker-5 shadow-[0_0_3px_hsl(35_90%_60%),0_0_6px_hsl(35_90%_50%)]' : 'bg-[hsl(0_0%_28%)]'}`} />
            </div>
          </div>
          {/* Bottom tip of bulb */}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gradient-to-b from-[hsl(45_15%_20%/_0.3)] to-[hsl(45_10%_15%/_0.5)] rounded-full" />
        </div>
        {/* Warm glow around bulb - only visible when plugged in */}
        <div className={`absolute top-28 md:top-36 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full blur-xl transition-opacity duration-500 flicker-1 ${isPluggedIn ? 'bg-[hsl(35_80%_50%/_0.2)] opacity-100' : 'opacity-0'}`} />
      </div>

      {/* Cobweb - Top Left (smaller) */}
      <svg className="fixed top-0 left-0 w-24 h-24 md:w-36 md:h-36 pointer-events-none opacity-25" viewBox="0 0 100 100">
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
      <svg className="fixed top-0 right-0 w-28 h-28 md:w-40 md:h-40 pointer-events-none opacity-25" viewBox="0 0 100 100" style={{
      transform: 'scaleX(-1)'
    }}>
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

      {/* 90s Style Wall Frames - Right Side */}
      <div className="fixed top-32 md:top-40 right-12 md:right-28 z-10 flex flex-col gap-6 md:gap-8 items-center">
        {/* LinkedIn Frame - Square (now first/top) */}
        <a 
          href="https://www.linkedin.com/in/anandprince1/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group cursor-pointer transition-transform hover:scale-105 active:scale-95"
        >
          {/* Frame - ornate 90s gold style square */}
          <div className="relative w-16 h-16 md:w-20 md:h-20">
            {/* Decorative corner accents */}
            <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-[hsl(35_60%_50%)]" />
            <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-[hsl(35_60%_50%)]" />
            <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-[hsl(35_60%_50%)]" />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-[hsl(35_60%_50%)]" />
            {/* Outer ornate frame with beveled effect */}
            <div className="absolute inset-0 rounded-sm bg-gradient-to-br from-[hsl(35_55%_45%)] via-[hsl(35_50%_35%)] to-[hsl(35_40%_25%)] p-0.5 shadow-[3px_5px_10px_rgba(0,0,0,0.6),inset_2px_2px_3px_rgba(255,255,255,0.4),inset_-1px_-1px_2px_rgba(0,0,0,0.3)]">
              {/* Ridge detail */}
              <div className="w-full h-full rounded-sm bg-gradient-to-br from-[hsl(35_45%_28%)] to-[hsl(35_40%_22%)] p-0.5 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.15)]">
                {/* Inner raised rim */}
                <div className="w-full h-full rounded-sm bg-gradient-to-br from-[hsl(35_60%_48%)] via-[hsl(35_55%_42%)] to-[hsl(35_50%_35%)] p-1 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3)]">
                  {/* Inner groove */}
                  <div className="w-full h-full rounded-sm bg-gradient-to-br from-[hsl(35_40%_22%)] via-[hsl(35_45%_28%)] to-[hsl(35_35%_20%)] p-0.5 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.5)]">
                    {/* Inner gold rim */}
                    <div className="w-full h-full rounded-sm bg-gradient-to-br from-[hsl(35_58%_45%)] via-[hsl(35_52%_50%)] to-[hsl(35_48%_38%)] p-0.5">
                      {/* Picture area - LinkedIn blue background with hand writing */}
                      <div className="w-full h-full rounded-sm bg-[hsl(201_100%_25%)] flex items-center justify-center group-hover:bg-[hsl(201_100%_35%)] transition-colors shadow-[inset_0_0_8px_rgba(0,0,0,0.4)] overflow-visible relative">
                        <Linkedin className="w-5 h-5 md:w-6 md:h-6 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]" />
                        
                        {/* Hand with pen writing on paper - bottom LEFT */}
                        <div className="absolute -bottom-6 -left-5 md:-bottom-8 md:-left-6">
                          {/* Paper - positioned first (behind hand) */}
                          <div className="absolute bottom-4 left-2 md:bottom-5 md:left-2 w-6 h-7 md:w-7 md:h-8 bg-white rounded-[2px] shadow-md transform rotate-[8deg] z-0">
                            {/* Written lines */}
                            <div className="absolute top-2 left-1 right-1 flex flex-col gap-[3px]">
                              <div className="h-[0.5px] bg-[hsl(220_15%_60%)] w-[70%]" />
                              <div className="h-[0.5px] bg-[hsl(220_15%_60%)] w-[90%]" />
                              <div className="h-[0.5px] bg-[hsl(220_15%_60%)] w-[55%]" />
                              <div className="h-[0.5px] bg-[hsl(220_15%_60%)] w-[80%]" />
                            </div>
                          </div>
                          
                          {/* Hand gripping pen properly */}
                          <svg width="28" height="32" viewBox="0 0 28 32" className="md:w-9 md:h-11 animate-pen-write drop-shadow-sm relative z-10 transform translate-x-0 translate-y-2 md:translate-y-3 -scale-x-100">
                            <defs>
                              <linearGradient id="skinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="hsl(25 55% 75%)" />
                                <stop offset="50%" stopColor="hsl(25 50% 68%)" />
                                <stop offset="100%" stopColor="hsl(25 45% 62%)" />
                              </linearGradient>
                              <linearGradient id="penGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="hsl(220 20% 25%)" />
                                <stop offset="50%" stopColor="hsl(220 15% 35%)" />
                                <stop offset="100%" stopColor="hsl(220 20% 20%)" />
                              </linearGradient>
                            </defs>
                            
                            {/* Pen - drawn first so hand overlaps it */}
                            <rect x="8" y="2" width="2.5" height="18" rx="1.2" fill="url(#penGrad)" transform="rotate(30 9.25 11)" />
                            <rect x="8.5" y="3" width="0.5" height="4" fill="hsl(45 70% 55%)" transform="rotate(30 9.25 5)" />
                            <rect x="8" y="13" width="2.5" height="4" rx="0.3" fill="hsl(0 0% 40%)" transform="rotate(30 9.25 15)" />
                            <polygon points="7.5,19 9.25,24 11,19" fill="hsl(35 30% 35%)" transform="rotate(30 9.25 21.5)" />
                            <circle cx="9.25" cy="23" r="0.5" fill="hsl(0 0% 25%)" transform="rotate(30 9.25 23)" />
                            
                            {/* Hand - unified shape gripping pen */}
                            <path 
                              d="M16 30 
                                 L13 30 
                                 Q11 29 11 26 
                                 L11 22
                                 Q11 20 12 18
                                 L12 16
                                 Q11 15 10 14
                                 C8 12 8 10 10 9
                                 C11 8.5 12 9 13 11
                                 L14 14
                                 L14 12
                                 C14 9 14 6 16 6
                                 C18 6 17.5 9 17 12
                                 L16.5 15
                                 L17.5 14
                                 C18.5 11 19 8 21 8
                                 C23 8.5 22 11 21 14
                                 L19.5 17
                                 L20.5 16
                                 C21.5 13 22 11 24 11.5
                                 C25.5 12 24.5 15 23 18
                                 L21 21
                                 Q22 23 22 25
                                 Q22 28 20 29.5
                                 Q18 30 16 30
                                 Z" 
                              fill="url(#skinGrad)" 
                            />
                            
                            {/* Thumb wrapping around pen */}
                            <path 
                              d="M12 18 
                                 Q10 17 9 15
                                 C7.5 12 8 10 10 10
                                 C11 10 12 11 12.5 13
                                 L13 16
                                 Q12.5 17 12 18
                                 Z" 
                              fill="url(#skinGrad)" 
                            />
                            
                            {/* Finger joints/creases */}
                            <path d="M15 13 L15.5 11" stroke="hsl(25 40% 55%)" strokeWidth="0.4" fill="none" opacity="0.6" />
                            <path d="M18 13 L18.5 11" stroke="hsl(25 40% 55%)" strokeWidth="0.4" fill="none" opacity="0.6" />
                            <path d="M21 15 L21.5 13" stroke="hsl(25 40% 55%)" strokeWidth="0.4" fill="none" opacity="0.6" />
                            
                            {/* Palm shadow */}
                            <ellipse cx="17" cy="23" rx="3" ry="2" fill="hsl(25 35% 55%)" opacity="0.25" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Frame shadow on wall */}
            <div className="absolute inset-0 rounded-sm bg-black/25 translate-x-1.5 translate-y-1.5 -z-10 blur-md" />
          </div>
        </a>

        {/* GitHub Frame - Circle (now second/bottom, bigger) */}
        <a 
          href="https://github.com/z-anxprincex1" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group cursor-pointer transition-transform hover:scale-105 active:scale-95"
        >
          {/* Frame - ornate 90s gold style circle - BIGGER */}
          <div className="relative w-20 h-20 md:w-28 md:h-28 pointer-events-auto">
            {/* Decorative outer ring */}
            <div className="absolute inset-[-4px] rounded-full border border-[hsl(35_50%_40%/_0.5)]" />
            {/* Beaded edge detail */}
            <div className="absolute inset-[-2px] rounded-full border-2 border-dotted border-[hsl(35_55%_45%/_0.6)]" />
            {/* Outer ornate frame with beveled effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[hsl(35_55%_45%)] via-[hsl(35_50%_35%)] to-[hsl(35_40%_25%)] p-0.5 shadow-[3px_5px_10px_rgba(0,0,0,0.6),inset_2px_2px_3px_rgba(255,255,255,0.4),inset_-1px_-1px_2px_rgba(0,0,0,0.3)]">
              {/* Ridge detail */}
              <div className="w-full h-full rounded-full bg-gradient-to-br from-[hsl(35_45%_28%)] to-[hsl(35_40%_22%)] p-0.5 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.15)]">
                {/* Inner raised rim */}
                <div className="w-full h-full rounded-full bg-gradient-to-br from-[hsl(35_60%_48%)] via-[hsl(35_55%_42%)] to-[hsl(35_50%_35%)] p-1.5 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3)]">
                  {/* Inner groove */}
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-[hsl(35_40%_22%)] via-[hsl(35_45%_28%)] to-[hsl(35_35%_20%)] p-0.5 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.5)]">
                    {/* Inner gold rim */}
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-[hsl(35_58%_45%)] via-[hsl(35_52%_50%)] to-[hsl(35_48%_38%)] p-0.5">
                      {/* Picture area - dark background with GitHub logo and animated eyes */}
                      <div className="w-full h-full rounded-full bg-[hsl(0_0%_10%)] flex items-center justify-center group-hover:bg-[hsl(0_0%_16%)] transition-colors shadow-[inset_0_0_10px_rgba(0,0,0,0.5)] relative overflow-hidden">
                        {/* GitHub Octocat logo */}
                        <Github className="w-8 h-8 md:w-12 md:h-12 text-[hsl(0_0%_85%)] group-hover:text-white transition-colors" />
                        {/* Animated eyes overlay on top of the Octocat */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="relative -mt-1 md:-mt-2">
                            {/* Eyes container */}
                            <div className="flex gap-1 md:gap-2">
                              {/* Left eye */}
                              <div className={`w-1.5 h-1.5 md:w-2.5 md:h-2.5 bg-[hsl(0_0%_95%)] rounded-full relative overflow-hidden transition-all duration-100 ${githubBlinking ? 'scale-y-[0.15]' : 'scale-y-100'}`}>
                                {/* Pupil */}
                                <div 
                                  className="absolute w-0.5 h-0.5 md:w-1 md:h-1 bg-[hsl(0_0%_5%)] rounded-full transition-all duration-300"
                                  style={{
                                    top: '50%',
                                    left: '50%',
                                    transform: `translate(-50%, -50%) translateX(${githubEyeDirection === 'left' ? '-1px' : githubEyeDirection === 'right' ? '1px' : '0'})`,
                                  }}
                                />
                              </div>
                              {/* Right eye */}
                              <div className={`w-1.5 h-1.5 md:w-2.5 md:h-2.5 bg-[hsl(0_0%_95%)] rounded-full relative overflow-hidden transition-all duration-100 ${githubBlinking ? 'scale-y-[0.15]' : 'scale-y-100'}`}>
                                {/* Pupil */}
                                <div 
                                  className="absolute w-0.5 h-0.5 md:w-1 md:h-1 bg-[hsl(0_0%_5%)] rounded-full transition-all duration-300"
                                  style={{
                                    top: '50%',
                                    left: '50%',
                                    transform: `translate(-50%, -50%) translateX(${githubEyeDirection === 'left' ? '-1px' : githubEyeDirection === 'right' ? '1px' : '0'})`,
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Frame shadow on wall */}
            <div className="absolute inset-0 rounded-full bg-black/25 translate-x-2 translate-y-2 -z-10 blur-md" />
          </div>
        </a>
      </div>

      {/* Spider hanging from right cobweb */}
      <div className="fixed top-0 right-16 md:right-24 pointer-events-none z-30">
        {/* Spider thread - extends when descending or visiting coffee */}
        <div className={`w-px bg-[hsl(0_0%_50%)] origin-top transition-all duration-2000 ease-in-out ${!spiderDescending && !spiderAtCoffee ? 'animate-spider-swing' : ''}`} style={{
        height: spiderDescending ? 'calc(100vh - 120px)' : spiderAtCoffee ? 'calc(100vh - 180px)' : '200px'
      }}>
          {/* Spider body */}
          <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 ${!spiderDescending && !spiderAtCoffee ? 'animate-spider-bob' : ''}`}>
            {/* Speech bubble when at coffee - ellipse */}
            <div className={`absolute -left-32 md:-left-36 -top-4 bg-white px-4 py-2 rounded-[50%] shadow-lg border-2 border-black w-[110px] md:w-[120px] h-[40px] md:h-[44px] flex items-center justify-center transform transition-all duration-500 ${spiderAtCoffee ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
              <p className="text-[10px] md:text-[12px] font-bold text-center text-black" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                buy me coffee!
              </p>
            </div>
            
            {/* Legs left */}
            <svg className={`absolute -left-5 top-1 w-5 h-6 ${spiderDescending || spiderAtCoffee ? 'animate-spider-legs' : ''}`} viewBox="0 0 12 16">
              <path d="M12 2 Q6 4 0 0" stroke="hsl(0 0% 15%)" strokeWidth="1.2" fill="none" />
              <path d="M12 6 Q5 7 0 4" stroke="hsl(0 0% 15%)" strokeWidth="1.2" fill="none" />
              <path d="M12 10 Q4 10 0 8" stroke="hsl(0 0% 15%)" strokeWidth="1.2" fill="none" />
              <path d="M12 14 Q5 13 0 16" stroke="hsl(0 0% 15%)" strokeWidth="1.2" fill="none" />
            </svg>
            {/* Legs right */}
            <svg className={`absolute -right-5 top-1 w-5 h-6 ${spiderDescending || spiderAtCoffee ? 'animate-spider-legs' : ''}`} viewBox="0 0 12 16" style={{
            transform: 'scaleX(-1)'
          }}>
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
      <div className={`fixed inset-0 transition-opacity duration-700 pointer-events-none ${isPluggedIn ? "opacity-40" : "opacity-0"}`} style={{
      background: 'radial-gradient(ellipse 50% 40% at 50% 50%, hsl(60 80% 85% / 0.15) 0%, transparent 60%)'
    }} />

      {/* Main content - picture left, text right */}
      {/* About me tooltip - positioned above the main content */}
      <div className={`fixed top-[38%] md:top-[35%] left-1/2 -translate-x-1/2 -translate-y-full z-40 transition-all duration-300 ${isAboutOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
        <div className="relative bg-[hsl(50_90%_60%)] px-5 py-4 rounded-lg border-2 border-[hsl(0_0%_10%)] shadow-[4px_4px_0_hsl(0_0%_10%)] w-[90vw] max-w-xl md:max-w-2xl">
          {/* Close button */}
          <button onClick={() => setIsAboutOpen(false)} className="absolute -top-2 -right-2 w-6 h-6 bg-[hsl(0_0%_10%)] rounded-full flex items-center justify-center hover:scale-110 transition-transform">
            <X className="w-4 h-4 text-[hsl(50_90%_60%)]" />
          </button>
          
          <div className="text-[hsl(0_0%_10%)] text-sm md:text-base" style={{
          fontFamily: 'Comic Sans MS, cursive'
        }}>
            <span className="font-bold block mb-2 text-base md:text-lg">About Me</span>
            <p>Hey! I&apos;m a Software developer and AI enthusiast who enjoys building practical tools and systems that solve real-world problems. I work across cloud platforms, machine learning pipelines, and data-driven applications.</p>
          </div>
        </div>
      </div>

      {/* Whoosh text - appears when generator turns on */}
      {isGeneratorOn && <div className="fixed top-1/2 left-1/2 z-50 pointer-events-none animate-whoosh-text">
          <span className="text-[hsl(50_90%_60%)] text-4xl md:text-6xl font-extrabold whitespace-nowrap drop-shadow-[3px_3px_0_hsl(0_0%_10%)]" style={{
        fontFamily: 'Comic Sans MS, cursive'
      }}>
            whoosh!
          </span>
        </div>}

      {/* Phewnn text - appears when generator turns off */}
      {!isGeneratorOn && wasGeneratorOn && <div className="fixed top-1/2 left-1/2 z-50 pointer-events-none animate-phewnn-text">
          <span className="text-[hsl(180_70%_60%)] text-4xl md:text-6xl font-extrabold whitespace-nowrap drop-shadow-[3px_3px_0_hsl(0_0%_10%)]" style={{
        fontFamily: 'Comic Sans MS, cursive'
      }}>
            phewnn!
          </span>
        </div>}

      <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-6 md:px-12 lg:px-20 z-10 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 lg:gap-16 ${isGeneratorOn ? 'animate-whoosh-up pointer-events-none' : wasGeneratorOn ? 'animate-slide-down-in' : ''}`}>
        {/* Profile picture with about me */}
        <div className="flex-shrink-0 flex flex-col items-center relative">
          {/* Question mark icon with connected tooltip arrow */}
          <div className="absolute -top-2 left-0 md:left-4 lg:left-8 z-20">
            <button onClick={() => setIsAboutOpen(!isAboutOpen)} className="w-8 h-8 md:w-10 md:h-10 bg-[hsl(50_90%_60%)] rounded-full flex items-center justify-center border-2 border-[hsl(0_0%_10%)] shadow-[2px_2px_0_hsl(0_0%_10%)] hover:scale-110 transition-transform">
              <HelpCircle className="w-5 h-5 md:w-6 md:h-6 text-[hsl(0_0%_10%)]" />
            </button>
          </div>
          
          {/* Profile picture - maintains original size */}
          <div className="relative">
            {/* 90s ornate gold frame - slim version */}
            <div className="relative w-44 h-44 md:w-60 md:h-60 lg:w-76 lg:h-76">
              {/* Decorative outer ring */}
              <div className="absolute inset-[-2px] rounded-full border border-[hsl(35_50%_40%/_0.5)]" />
              {/* Outer ornate frame with beveled effect */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[hsl(35_55%_45%)] via-[hsl(35_50%_35%)] to-[hsl(35_40%_25%)] p-0.5 shadow-[2px_3px_8px_rgba(0,0,0,0.5),inset_1px_1px_2px_rgba(255,255,255,0.4),inset_-1px_-1px_1px_rgba(0,0,0,0.3)]">
                {/* Ridge detail */}
                <div className="w-full h-full rounded-full bg-gradient-to-br from-[hsl(35_45%_28%)] to-[hsl(35_40%_22%)] p-0.5 shadow-[inset_1px_1px_1px_rgba(255,255,255,0.15)]">
                  {/* Inner raised rim */}
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-[hsl(35_60%_48%)] via-[hsl(35_55%_42%)] to-[hsl(35_50%_35%)] p-0.5 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.3)]">
                    {/* Inner groove */}
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-[hsl(35_40%_22%)] via-[hsl(35_45%_28%)] to-[hsl(35_35%_20%)] p-0.5 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.5)]">
                      {/* Picture area */}
                      <div className={`w-full h-full rounded-full overflow-hidden shadow-[inset_0_0_10px_rgba(0,0,0,0.5)] transition-all duration-700 ${isPluggedIn ? '' : 'grayscale'}`}>
                        <img src={profileImage} alt="Anand Prince Purty" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Frame shadow on wall */}
              <div className="absolute inset-0 rounded-full bg-black/25 translate-x-2 translate-y-2 -z-10 blur-md" />
            </div>
            
            {/* Orbiting skills - absolutely positioned, doesn't affect layout */}
            <div className="absolute inset-0 pointer-events-none" style={{ transform: 'scale(1.5)', transformOrigin: 'center center' }}>
              {/* Outer ring - clockwise rotation */}
              <div className="absolute inset-0 animate-spin-slow opacity-[0.05]">
                {['Java', 'Python', 'TypeScript', 'React', 'Node.js', 'Docker', 'AWS', 'MongoDB', 'Kubernetes', 'TensorFlow'].map((skill, skillIndex) => {
                  const baseAngleDeg = skillIndex * 36;
                  const radius = 46;
                  const charSpacing = 2.5; // degrees between characters
                  const totalWidth = (skill.length - 1) * charSpacing;
                  const startAngle = baseAngleDeg - totalWidth / 2;
                  
                  return (
                    <span key={skill} className="absolute inset-0">
                      {skill.split('').map((char, charIndex) => {
                        const charAngleDeg = startAngle + charIndex * charSpacing;
                        const charAngle = charAngleDeg * (Math.PI / 180);
                        const x = 50 + radius * Math.cos(charAngle);
                        const y = 50 + radius * Math.sin(charAngle);
                        const tangentRotation = charAngleDeg + 90;
                        return (
                          <span
                            key={charIndex}
                            className="absolute text-[8px] md:text-[10px] lg:text-xs font-medium text-[hsl(50_90%_60%)]"
                            style={{
                              left: `${x}%`,
                              top: `${y}%`,
                              transform: `translate(-50%, -50%) rotate(${tangentRotation}deg)`
                            }}
                          >
                            {char}
                          </span>
                        );
                      })}
                    </span>
                  );
                })}
              </div>
              
              {/* Inner ring - counter-clockwise rotation */}
              <div className="absolute inset-0 animate-spin-slow-reverse opacity-[0.05]">
                {['Flask', 'Spring Boot', 'PostgreSQL', 'Firebase', 'PyTorch', 'Spark', 'Redis', 'GraphQL'].map((skill, skillIndex) => {
                  const baseAngleDeg = skillIndex * 45;
                  const radius = 40;
                  const charSpacing = 2.8; // degrees between characters
                  const totalWidth = (skill.length - 1) * charSpacing;
                  const startAngle = baseAngleDeg - totalWidth / 2;
                  
                  return (
                    <span key={skill} className="absolute inset-0">
                      {skill.split('').map((char, charIndex) => {
                        const charAngleDeg = startAngle + charIndex * charSpacing;
                        const charAngle = charAngleDeg * (Math.PI / 180);
                        const x = 50 + radius * Math.cos(charAngle);
                        const y = 50 + radius * Math.sin(charAngle);
                        const tangentRotation = charAngleDeg + 90;
                        return (
                          <span
                            key={charIndex}
                            className="absolute text-[8px] md:text-[10px] lg:text-xs font-medium text-[hsl(50_90%_75%)]"
                            style={{
                              left: `${x}%`,
                              top: `${y}%`,
                              transform: `translate(-50%, -50%) rotate(${tangentRotation}deg)`
                            }}
                          >
                            {char}
                          </span>
                        );
                      })}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Location */}
          <div className="flex items-center gap-2 mt-4">
            <MapPin className="w-6 h-6 md:w-8 md:h-8 text-[hsl(0_70%_50%)]" />
            <span className="text-[hsl(0_0%_60%)] text-sm md:text-base font-medium">New York</span>
          </div>
        </div>

        {/* Text */}
        <h1 className={`text-hero font-pixel transition-all duration-500 flex flex-col text-center md:text-center drop-shadow-[3px_3px_0_hsl(0_0%_10%)] ${isPluggedIn ? "cfl-tube cfl-glow" : "cfl-off"}`}>
          {/* First line: anand prince */}
          <span className="flex flex-wrap justify-center md:justify-center">
            {["anand", "prince"].map((word, i) => renderWord(word, i, false))}
          </span>

          {/* Second line: purty + cable */}
          <span className="flex items-start justify-center md:justify-center">
            <span className="flex items-center">
              {renderWord("purty", 2, true)}
              
              {/* Fixed cable anchor point - attached to end of text */}
              <span ref={anchorRef} className="relative inline-block w-0 h-0" style={{
              marginTop: '0.5em'
            }}>
                {/* SVG Cable - starts from anchor, extends to plug */}
                <svg className="absolute pointer-events-none" style={{
                left: 0,
                top: 0,
                width: Math.abs(plugPosition.x) + 50,
                height: Math.abs(plugPosition.y) + 50,
                overflow: 'visible'
              }}>
                  <path d={getCablePath()} stroke="hsl(0 0% 22%)" strokeWidth="5" strokeLinecap="round" className={`transition-all ${isDragging ? "duration-0" : "duration-500"} ease-out`} fill="none" />
                </svg>
              </span>
            </span>
          </span>
        </h1>
      </div>

      {/* Draggable Plug - fixed position, always on top */}
      <div ref={plugRef} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} className={`fixed cursor-grab active:cursor-grabbing z-[9999] touch-none ${isDragging ? "" : wasGeneratorOn ? "" : "transition-transform duration-500"} ${isGeneratorOn ? 'pointer-events-none opacity-0' : ''}`} style={{
      left: 0,
      top: 0,
      transform: `translate(-8px, -50%) ${!isPluggedIn && !isDragging ? "rotate(90deg)" : "rotate(0deg)"}`,
      transformOrigin: 'left center'
    }}>
        <div className="flex items-center">
          {/* Plug body */}
          <div className="w-5 h-5 md:w-6 md:h-6 bg-[hsl(0_0%_18%)] rounded-sm flex flex-col justify-center items-end pr-0.5 gap-1 shadow-md border border-[hsl(0_0%_25%)]">
            {/* Prongs */}
            <div className="w-3 h-1 bg-[hsl(45_60%_50%)] rounded-r-sm" />
            <div className="w-3 h-1 bg-[hsl(45_60%_50%)] rounded-r-sm" />
          </div>
        </div>
      </div>

      <div className={`fixed left-4 md:left-8 z-30 transition-all duration-500 pointer-events-none ${isPhoneOpen ? 'opacity-0 bottom-[520px] md:bottom-[580px]' : 'opacity-100 bottom-24 md:bottom-28'}`}>
        <div className="relative bg-[hsl(50_90%_60%)] px-3 py-2 rounded-lg border-2 border-[hsl(0_0%_10%)] shadow-[3px_3px_0_hsl(0_0%_10%)]">
          <span className="text-[hsl(0_0%_10%)] text-xs md:text-sm font-bold whitespace-nowrap" style={{
          fontFamily: 'Comic Sans MS, cursive'
        }}>
            got a question for me?
          </span>
          {/* Arrow pointing down */}
          <div className="absolute -bottom-3 left-6 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[12px] border-t-[hsl(0_0%_10%)]" />
          <div className="absolute -bottom-[9px] left-[26px] w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[10px] border-t-[hsl(50_90%_60%)]" />
        </div>
      </div>

      {/* Mobile phone - half visible at bottom left */}
      <div className={`fixed left-4 md:left-8 z-30 cursor-pointer transition-all duration-500 ease-out ${isPhoneOpen ? 'bottom-4 md:bottom-8' : '-bottom-20 md:-bottom-24 hover:-bottom-16 md:hover:-bottom-20'}`} onClick={() => setIsPhoneOpen(true)}>
        {/* iPhone-style phone */}
        <div className={`bg-[hsl(0_0%_10%)] rounded-[2rem] border-2 border-[hsl(0_0%_20%)] relative shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-all duration-500 ${isPhoneOpen ? 'w-72 h-[500px] md:w-80 md:h-[550px]' : 'w-20 h-40 md:w-24 md:h-48'}`}>
          {/* Screen */}
          <div className={`absolute bg-[hsl(0_0%_5%)] transition-all duration-500 ${isPhoneOpen ? 'inset-2 rounded-[1.5rem]' : 'inset-[3px] rounded-2xl'}`}>
            {isPhoneOpen ? (/* Chat interface */
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
                  {chatMessages.map((msg, i) => <div key={i} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${msg.isMe ? 'bg-[hsl(210_100%_50%)] text-white rounded-br-md' : 'bg-[hsl(0_0%_18%)] text-white rounded-bl-md'}`}>
                        {msg.text}
                      </div>
                    </div>)}
                </div>
                
                {/* Input */}
                <div className="flex gap-2 pt-2 border-t border-[hsl(0_0%_15%)]">
                  <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyDown={e => {
                if (e.key === 'Enter' && newMessage.trim()) {
                  setChatMessages(prev => [...prev, {
                    text: newMessage,
                    isMe: true
                  }]);
                  setNewMessage('');
                  // Auto reply after a short delay
                  setTimeout(() => {
                    setChatMessages(prev => [...prev, {
                      text: "Thanks for reaching out! Feel free to connect with me on LinkedIn.",
                      isMe: false
                    }]);
                  }, 1000);
                }
              }} placeholder="Type a message..." className="flex-1 bg-[hsl(0_0%_15%)] text-white text-sm px-4 py-2 rounded-full outline-none placeholder:text-[hsl(0_0%_40%)]" onClick={e => e.stopPropagation()} />
                  <button onClick={e => {
                e.stopPropagation();
                if (newMessage.trim()) {
                  setChatMessages(prev => [...prev, {
                    text: newMessage,
                    isMe: true
                  }]);
                  setNewMessage('');
                  setTimeout(() => {
                    setChatMessages(prev => [...prev, {
                      text: "Thanks for reaching out! Feel free to connect with me on LinkedIn.",
                      isMe: false
                    }]);
                  }, 1000);
                }
              }} className="w-9 h-9 bg-[hsl(210_100%_50%)] rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </div>) : (/* Minimized state - notification hint */
          <div className="h-full flex flex-col items-center justify-center">
                <div className="w-3 h-3 bg-[hsl(0_70%_50%)] rounded-full animate-pulse" />
                <div className="text-[8px] text-[hsl(0_0%_40%)] mt-2">1 message</div>
              </div>)}
          </div>
          
          {/* Dynamic Island */}
          <div className={`absolute left-1/2 -translate-x-1/2 bg-[hsl(0_0%_0%)] rounded-full transition-all duration-500 ${isPhoneOpen ? 'top-3 w-24 h-6' : 'top-1.5 w-6 h-2'}`} />
          
          {/* Home indicator */}
          <div className={`absolute bottom-2 left-1/2 -translate-x-1/2 bg-[hsl(0_0%_30%)] rounded-full transition-all duration-500 ${isPhoneOpen ? 'w-32 h-1' : 'w-8 h-0.5'}`} />
          
          {/* Close button when open */}
          {isPhoneOpen && <button onClick={e => {
          e.stopPropagation();
          setIsPhoneOpen(false);
        }} className="absolute -top-3 -right-3 w-8 h-8 bg-[hsl(0_0%_20%)] rounded-full flex items-center justify-center border border-[hsl(0_0%_30%)] hover:bg-[hsl(0_0%_25%)] transition-colors">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>}
        </div>
      </div>

      {/* Floor */}
      <div className="fixed bottom-0 left-0 right-0 h-8 md:h-12 bg-[hsl(0_0%_6%)] border-t border-[hsl(0_0%_15%)] z-10">
        {/* Floor texture lines */}
        <div className="absolute inset-0 opacity-30">
          <div className="h-full w-full" style={{
          backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 40px, hsl(0 0% 12%) 40px, hsl(0 0% 12%) 41px)'
        }} />
        </div>
        {/* Floor highlight */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[hsl(0_0%_20%)] to-transparent" />
      </div>

      {/* Tip above generator */}
      <div className={`fixed bottom-[8.5rem] md:bottom-[10.5rem] left-[calc(50%-1rem)] md:left-[calc(50%-1.5rem)] -translate-x-1/2 z-20 pointer-events-none transition-opacity duration-500 ${isGeneratorOn ? 'opacity-0' : 'opacity-100'}`}>
        <span className="text-[hsl(0_0%_100%)] text-sm md:text-base font-extrabold whitespace-nowrap drop-shadow-[2px_2px_0_hsl(0_0%_10%)] inline-block -rotate-6 animate-bounce" style={{
        fontFamily: 'Comic Sans MS, cursive'
      }}>
          click here to view my work!
        </span>
        {/* Funky arrow pointing down */}
        <svg className="w-12 h-16 md:w-16 md:h-20 mx-auto mt-1 animate-bounce" viewBox="0 0 60 80" style={{
        animationDelay: '0.1s'
      }}>
          {/* Squiggly arrow shaft */}
          <path d="M30 0 Q20 15, 35 25 Q50 35, 25 45 Q10 52, 30 60" stroke="hsl(50 90% 60%)" strokeWidth="4" fill="none" strokeLinecap="round" />
          {/* Arrow head */}
          <polygon points="30,80 20,60 30,65 40,60" fill="hsl(50 90% 60%)" />
        </svg>
      </div>

      {/* Sofa - behind everything */}
      <div className="fixed bottom-8 md:bottom-12 right-[5%] md:right-[15%] z-[5] pointer-events-none">
        <div className="relative w-72 md:w-96 h-40 md:h-52" style={{
        perspective: '500px'
      }}>
          
          {/* Sofa back rest - unified with center partition */}
          <div className="absolute top-0 left-8 md:left-10 right-8 md:right-10 h-20 md:h-24 bg-gradient-to-b from-[hsl(25_38%_45%)] via-[hsl(22_40%_38%)] to-[hsl(20_42%_32%)] rounded-t-[2rem] md:rounded-t-[2.5rem] shadow-[inset_0_6px_12px_rgba(255,255,255,0.2),inset_0_-8px_16px_rgba(0,0,0,0.25),0_-4px_12px_rgba(0,0,0,0.15)] overflow-hidden" style={{
          transform: 'rotateX(-5deg)',
          transformOrigin: 'bottom'
        }}>
            {/* Top edge dip at center - subtle smooth notch above partition */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 md:w-4 h-1 md:h-1.5 bg-[hsl(20_42%_32%)] rounded-b-[100%] shadow-[inset_0_-1px_2px_rgba(0,0,0,0.3)]" />
            {/* Center partition line - soft faded seam connecting dip to seat */}
            <div className="absolute top-1 md:top-1.5 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-gradient-to-b from-[hsl(20_30%_30%)/0.6] via-[hsl(20_28%_26%)/0.4] to-[hsl(20_25%_24%)/0.3] rounded-full" />
            {/* Left cushion puff */}
            <div className="absolute top-4 left-4 right-[52%] bottom-3 bg-gradient-to-br from-[hsl(24_36%_42%)] via-[hsl(22_38%_38%)] to-[hsl(20_40%_34%)] rounded-xl shadow-[inset_2px_2px_6px_rgba(255,255,255,0.15),inset_-2px_-2px_8px_rgba(0,0,0,0.2)]" />
            {/* Right cushion puff */}
            <div className="absolute top-4 left-[52%] right-4 bottom-3 bg-gradient-to-bl from-[hsl(24_36%_42%)] via-[hsl(22_38%_38%)] to-[hsl(20_40%_34%)] rounded-xl shadow-[inset_-2px_2px_6px_rgba(255,255,255,0.15),inset_2px_-2px_8px_rgba(0,0,0,0.2)]" />
          </div>
          
          {/* Sofa arms - left */}
          <div className="absolute left-0 top-0 w-10 md:w-12 h-32 md:h-40 bg-gradient-to-r from-[hsl(18_45%_30%)] via-[hsl(22_42%_36%)] to-[hsl(24_40%_40%)] rounded-l-[1.5rem] rounded-tr-[1.5rem] overflow-hidden shadow-[inset_3px_0_8px_rgba(255,255,255,0.15),inset_-2px_0_6px_rgba(0,0,0,0.2),-6px_4px_12px_rgba(0,0,0,0.3)]">
            {/* Arm top curve highlight */}
            <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-[hsl(25_40%_45%)] to-transparent opacity-60" />
          </div>
          {/* Sofa arms - right */}
          <div className="absolute right-0 top-0 w-10 md:w-12 h-32 md:h-40 bg-gradient-to-l from-[hsl(18_45%_30%)] via-[hsl(22_42%_36%)] to-[hsl(24_40%_40%)] rounded-r-[1.5rem] rounded-tl-[1.5rem] overflow-hidden shadow-[inset_-3px_0_8px_rgba(255,255,255,0.15),inset_2px_0_6px_rgba(0,0,0,0.2),6px_4px_12px_rgba(0,0,0,0.3)]">
            <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-[hsl(25_40%_45%)] to-transparent opacity-60" />
          </div>
          
          {/* Sofa seat - in front with 3D depth, no partition */}
          <div className="absolute bottom-6 md:bottom-8 left-8 md:left-10 right-8 md:right-10 h-16 md:h-20 bg-gradient-to-b from-[hsl(22_42%_40%)] via-[hsl(20_44%_35%)] to-[hsl(18_46%_30%)] rounded-xl shadow-[0_8px_20px_rgba(0,0,0,0.4),inset_0_3px_6px_rgba(255,255,255,0.12),inset_0_-4px_8px_rgba(0,0,0,0.15)]" style={{
          transform: 'rotateX(8deg)',
          transformOrigin: 'top'
        }}>
            {/* Single unified cushion indent */}
            <div className="absolute top-3 left-4 right-4 bottom-3 bg-gradient-to-b from-[rgba(0,0,0,0.1)] via-[rgba(0,0,0,0.05)] to-transparent rounded-lg" />
            {/* Front edge highlight */}
            <div className="absolute bottom-0 left-2 right-2 h-2 bg-gradient-to-t from-[hsl(20_40%_28%)] to-transparent rounded-b-lg" />
          </div>
          
          {/* Sofa base - connects seat to legs with no gap */}
          <div className="absolute bottom-2 md:bottom-3 left-8 md:left-10 right-8 md:right-10 h-5 md:h-6 bg-gradient-to-b from-[hsl(20_42%_28%)] to-[hsl(18_40%_22%)] rounded-b-lg shadow-[0_4px_8px_rgba(0,0,0,0.3)]" />
          
          {/* Throw pillows - positioned on seat, leaning against back */}
          {/* Left pillow - burgundy */}
          <div className="absolute bottom-[4.5rem] md:bottom-[6rem] left-12 md:left-16 w-10 md:w-14 h-10 md:h-14 z-10" style={{
          transform: 'rotate(-8deg) skewY(3deg)'
        }}>
            <div className="w-full h-full bg-gradient-to-br from-[hsl(350_50%_40%)] via-[hsl(345_45%_35%)] to-[hsl(340_40%_28%)] rounded-lg shadow-[2px_3px_6px_rgba(0,0,0,0.35),inset_0_2px_4px_rgba(255,255,255,0.15),inset_0_-2px_4px_rgba(0,0,0,0.2)]">
              {/* Pillow puff effect */}
              <div className="absolute inset-1 bg-gradient-to-br from-[hsl(350_52%_45%)] to-transparent rounded-lg opacity-50" />
              {/* Decorative pattern */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 border border-[hsl(350_60%_55%)] rounded-sm opacity-40 rotate-45" />
            </div>
          </div>
          
          {/* Right pillow - golden/mustard */}
          <div className="absolute bottom-[4.5rem] md:bottom-[6rem] right-12 md:right-16 w-11 md:w-16 h-9 md:h-12 z-10" style={{
          transform: 'rotate(6deg) skewY(-2deg)'
        }}>
            <div className="w-full h-full bg-gradient-to-bl from-[hsl(45_60%_45%)] via-[hsl(40_55%_38%)] to-[hsl(35_50%_30%)] rounded-lg shadow-[2px_3px_6px_rgba(0,0,0,0.35),inset_0_2px_4px_rgba(255,255,255,0.2),inset_0_-2px_4px_rgba(0,0,0,0.15)]">
              <div className="absolute inset-1 bg-gradient-to-bl from-[hsl(48_65%_52%)] to-transparent rounded-lg opacity-40" />
              {/* Decorative lines */}
              <div className="absolute top-2 left-2 right-2 h-px bg-[hsl(50_70%_60%)] opacity-30" />
              <div className="absolute bottom-2 left-2 right-2 h-px bg-[hsl(50_70%_60%)] opacity-30" />
            </div>
          </div>
          
          {/* Sofa legs - wooden, connected to base */}
          <div className="absolute bottom-0 left-10 md:left-14 w-4 md:w-5 h-3 md:h-4 bg-gradient-to-b from-[hsl(30_45%_30%)] via-[hsl(28_40%_22%)] to-[hsl(25_35%_15%)] rounded-b-md shadow-[2px_3px_6px_rgba(0,0,0,0.5)]" />
          <div className="absolute bottom-0 right-10 md:right-14 w-4 md:w-5 h-3 md:h-4 bg-gradient-to-b from-[hsl(30_45%_30%)] via-[hsl(28_40%_22%)] to-[hsl(25_35%_15%)] rounded-b-md shadow-[2px_3px_6px_rgba(0,0,0,0.5)]" />
          
          {/* Floor shadow - larger and softer */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-[95%] h-4 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.35)_0%,transparent_70%)]" />
        </div>
      </div>

      {/* Side Table with Coffee - side view, in front of socket */}
      <div className="fixed bottom-4 md:bottom-6 right-[2%] md:right-[5%] z-[25] pointer-events-none">
        <div className="relative w-20 md:w-32 h-28 md:h-40">
          
          {/* Table top - ellipse from side view - maroon red - wider */}
          <div className="absolute top-6 md:top-8 left-0 right-0 h-2.5 md:h-3.5 bg-gradient-to-b from-[hsl(350_45%_35%)] via-[hsl(345_42%_28%)] to-[hsl(340_40%_22%)] rounded-[50%] shadow-[0_2px_6px_rgba(0,0,0,0.4),inset_0_1px_2px_rgba(255,255,255,0.15)]">
            {/* Top surface shine */}
            <div className="absolute inset-x-2 top-0 h-1 bg-gradient-to-r from-transparent via-[hsl(350_40%_42%)] to-transparent rounded-full opacity-50" />
          </div>
          
          {/* Table stem - connected from top edge to base */}
          <div className="absolute top-[2.2rem] md:top-[3rem] bottom-1 md:bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 md:w-2 bg-gradient-to-r from-[hsl(340_38%_18%)] via-[hsl(345_42%_28%)] to-[hsl(340_38%_18%)] shadow-[1px_2px_4px_rgba(0,0,0,0.3)]">
            {/* Stem highlight */}
            <div className="absolute inset-y-0 left-1/2 w-px bg-gradient-to-b from-[hsl(350_42%_35%)] via-[hsl(345_40%_30%)] to-[hsl(350_42%_35%)] opacity-50" />
          </div>
          
          {/* Table base - sits on ground */}
          <div className="absolute bottom-0 left-3 md:left-6 right-3 md:right-6 h-1.5 md:h-2 bg-gradient-to-b from-[hsl(345_42%_28%)] to-[hsl(340_40%_18%)] rounded-[50%] shadow-[0_1px_4px_rgba(0,0,0,0.5)]">
            {/* Base top shine */}
            <div className="absolute inset-x-1 top-0 h-px bg-gradient-to-r from-transparent via-[hsl(350_40%_38%)] to-transparent rounded-full opacity-50" />
          </div>
          
          {/* Floor shadow directly under base */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 md:w-14 h-1.5 md:h-2 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.35)_0%,transparent_70%)]" />
          
          {/* Coffee cup - clickable, sitting on table top */}
          <a href="https://buymeacoffee.com/andydoes" target="_blank" rel="noopener noreferrer" className="absolute -top-1 md:-top-2 left-1/2 -translate-x-1/2 pointer-events-auto cursor-pointer group">
            {/* Steam/vapor animation - wavy steam lines */}
            <div className="absolute -top-7 md:-top-9 left-1/2 -translate-x-1/2 flex gap-1.5">
              <svg className="w-2 h-5 md:h-6 animate-steam opacity-70" viewBox="0 0 8 20" style={{
              animationDelay: '0s'
            }}>
                <path d="M4 20 Q2 15 4 12 Q6 9 4 6 Q2 3 4 0" stroke="hsl(25 30% 45%)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              </svg>
              <svg className="w-2 h-6 md:h-7 animate-steam opacity-60" viewBox="0 0 8 24" style={{
              animationDelay: '0.3s'
            }}>
                <path d="M4 24 Q6 19 4 15 Q2 11 4 7 Q6 3 4 0" stroke="hsl(25 30% 45%)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              </svg>
              <svg className="w-2 h-5 md:h-6 animate-steam opacity-70" viewBox="0 0 8 20" style={{
              animationDelay: '0.6s'
            }}>
                <path d="M4 20 Q2 15 4 12 Q6 9 4 6 Q2 3 4 0" stroke="hsl(25 30% 45%)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              </svg>
            </div>
            
            {/* Mug container with handle */}
            <div className="relative w-10 md:w-14 h-8 md:h-11">
              {/* Cup handle - curved handle on right, rendered first so mug overlaps */}
              <div className="absolute top-2 md:top-3 right-0 md:right-0.5 w-3 md:w-4 h-4 md:h-5 border-[3px] md:border-4 border-[hsl(220_12%_85%)] rounded-r-full bg-transparent shadow-[1px_2px_3px_rgba(0,0,0,0.3)]" />
              
              {/* Mug body container */}
              <div className="absolute left-0 top-0 w-7 md:w-10 h-8 md:h-11">
                {/* Cup rim - elliptical top opening */}
                <div className="absolute top-0 left-0 right-0 h-2 md:h-3 bg-gradient-to-b from-[hsl(220_15%_92%)] to-[hsl(220_12%_85%)] rounded-[50%] shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.1)] z-10" />
                
                {/* Coffee liquid inside - elliptical shape */}
                <div className="absolute top-0.5 md:top-1 left-0.5 right-0.5 h-1.5 md:h-2 bg-gradient-to-b from-[hsl(15_50%_25%)] to-[hsl(10_55%_20%)] rounded-[50%] shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)] z-10">
                  {/* Coffee shine bubbles */}
                  <div className="absolute top-0.5 left-1 w-0.5 h-0.5 md:w-1 md:h-1 bg-[hsl(30_40%_40%)] rounded-full opacity-60" />
                  <div className="absolute top-0.5 left-2 md:left-3 w-0.5 h-0.5 bg-[hsl(30_40%_45%)] rounded-full opacity-50" />
                </div>
                
                {/* Cup body - cylindrical ceramic mug */}
                <div className="absolute top-1 md:top-1.5 left-0 right-0 bottom-1 bg-gradient-to-r from-[hsl(220_15%_88%)] via-[hsl(220_12%_94%)] to-[hsl(220_10%_85%)] rounded-b-lg shadow-[2px_3px_6px_rgba(0,0,0,0.25),inset_2px_0_4px_rgba(255,255,255,0.5)] group-hover:shadow-[2px_3px_8px_rgba(0,0,0,0.35),0_0_12px_rgba(255,200,100,0.3)] transition-shadow z-10">
                  {/* Body highlight streak */}
                  <div className="absolute top-1 left-1 bottom-1 w-1 md:w-1.5 bg-gradient-to-b from-[hsl(220_20%_98%)] via-[hsl(220_15%_96%)] to-[hsl(220_12%_90%)] rounded-full opacity-70" />
                  {/* Body shadow on right */}
                  <div className="absolute top-1 right-0 bottom-1 w-1 bg-gradient-to-b from-[hsl(220_10%_80%)] to-[hsl(220_8%_75%)] rounded-r-lg opacity-40" />
                </div>
              </div>
            </div>
          </a>
        </div>
      </div>
      <div className="fixed bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 z-20 cursor-pointer" onClick={() => setIsGeneratorOn(!isGeneratorOn)}>
        <div className={`relative ${isGeneratorOn ? 'animate-[vibrate_0.1s_linear_infinite]' : ''}`}>
          {/* Generator body - main housing */}
          <div className="w-28 h-18 md:w-36 md:h-24 bg-gradient-to-b from-[hsl(35_25%_28%)] to-[hsl(35_30%_18%)] rounded border-2 border-[hsl(35_20%_22%)] shadow-[0_4px_8px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] relative" style={{
          height: '5rem'
        }}>
            
            {/* Flywheel viewing window on left side */}
            <div className="absolute left-1 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 bg-[hsl(0_0%_8%)] rounded-full border-2 border-[hsl(35_15%_20%)] overflow-hidden">
              {/* Visible flywheel inside */}
              <div className={`absolute inset-0 bg-gradient-to-br from-[hsl(0_0%_32%)] to-[hsl(0_0%_18%)] rounded-full ${isGeneratorOn ? 'animate-spin' : ''}`} style={{
              animationDuration: isGeneratorOn ? '0.3s' : undefined
            }}>
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
              <div className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full ml-auto transition-all duration-300 ${isGeneratorOn ? 'bg-[hsl(120_70%_50%)] shadow-[0_0_8px_3px_rgba(74,222,128,0.7)]' : 'bg-[hsl(0_0%_15%)] border border-[hsl(0_0%_25%)]'}`} />
            </div>
            
            {/* Engine block texture */}
            <div className="absolute top-7 left-1 right-1 bottom-1 bg-[hsl(35_20%_15%)] rounded-sm overflow-hidden">
              {/* Cooling fins */}
              <div className="flex gap-0.5 h-full p-0.5">
                {[...Array(10)].map((_, i) => <div key={i} className="flex-1 bg-gradient-to-b from-[hsl(35_25%_22%)] to-[hsl(35_20%_12%)] rounded-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]" />)}
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
              {isGeneratorOn && <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-0.5">
                  <div className="w-1.5 h-1.5 bg-[hsl(0_0%_50%)] rounded-full animate-ping opacity-40" />
                  <div className="w-2 h-2 bg-[hsl(0_0%_45%)] rounded-full animate-ping opacity-30" style={{
                animationDelay: '0.15s'
              }} />
                  <div className="w-2.5 h-2.5 bg-[hsl(0_0%_40%)] rounded-full animate-ping opacity-20" style={{
                animationDelay: '0.3s'
              }} />
                </div>}
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
      <div className="fixed bottom-6 md:bottom-9 pointer-events-none z-10" style={{
      left: 'calc(50% + 1rem)',
      width: 'calc(50% - 6rem)'
    }}>
        <svg className="w-full h-6" viewBox="0 0 200 20" preserveAspectRatio="none">
          <path d="M 0 10 C 20 5, 30 15, 50 10 C 70 5, 80 15, 100 10 C 120 5, 130 15, 150 10 C 170 5, 180 15, 200 10" stroke="hsl(0 0% 38%)" strokeWidth="4" fill="none" strokeLinecap="round" />
        </svg>
      </div>


      {/* Projector Screen - slides down from top when generator is on */}
      {isGeneratorOn && <div className="fixed top-0 left-0 right-0 flex justify-center z-20 pointer-events-none">
          <div className="animate-screen-down">
            {/* Screen mount bar */}
            <div className="w-[85vw] h-3 bg-gradient-to-b from-[hsl(0_0%_25%)] to-[hsl(0_0%_15%)] rounded-b border-x-2 border-b-2 border-[hsl(0_0%_20%)]" />
            {/* Screen */}
            <div className="w-[85vw] h-[calc(100vh-10rem)] md:h-[calc(100vh-12rem)] bg-gradient-to-b from-[hsl(0_0%_95%)] to-[hsl(0_0%_88%)] border-x-4 border-b-4 border-[hsl(0_0%_20%)] shadow-[0_10px_40px_rgba(0,0,0,0.5)] relative">
              {/* Folder tabs with back button */}
              <div className="absolute top-4 left-[2.5%] flex items-center pointer-events-auto">
                {/* Back button - always takes space, visibility controlled */}
                <button onClick={() => setSelectedProject(null)} className={`mr-2 px-3 py-2 text-sm md:text-base font-bold rounded-lg border-2 border-black bg-black text-white hover:bg-black/80 transition-all flex items-center gap-1 ${selectedProject !== null && activeFolder === 'projects' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} style={{
              fontFamily: 'Comic Sans MS, cursive'
            }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  back
                </button>
                {/* Projects tab */}
                <button onClick={() => {
              setActiveFolder('projects');
              setSelectedProject(null);
            }} className={`relative px-6 py-2 text-sm md:text-base font-bold rounded-t-lg border-2 border-b-0 transition-all ${activeFolder === 'projects' ? 'bg-white border-black text-black z-10 -mb-[2px]' : 'bg-white/50 border-black/30 text-black/50 hover:bg-white/80'}`} style={{
              fontFamily: 'Comic Sans MS, cursive'
            }}>
                  projects
                </button>
                {/* Experience tab */}
                <button onClick={() => {
              setActiveFolder('experience');
              setSelectedProject(null);
            }} className={`relative px-6 py-2 text-sm md:text-base font-bold rounded-t-lg border-2 border-b-0 transition-all -ml-1 ${activeFolder === 'experience' ? 'bg-white border-black text-black z-10 -mb-[2px]' : 'bg-white/50 border-black/30 text-black/50 hover:bg-white/80'}`} style={{
              fontFamily: 'Comic Sans MS, cursive'
            }}>
                  experience
                </button>
              </div>

              {/* Folder body */}
              <div className="absolute top-[3.5rem] left-[1.5%] right-[1.5%] bottom-4 rounded-lg border-2 border-black bg-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] overflow-hidden pointer-events-auto">
                {/* Folder content */}
                <div className="w-full h-full overflow-y-auto p-4 md:p-6">
                  {activeFolder === 'projects' ? <div className="text-black" style={{
                fontFamily: 'Comic Sans MS, cursive'
              }}>
                      {selectedProject !== null ? (/* Single project detail view */
                <div className="max-w-2xl mx-auto">
                          <h2 className="text-xl md:text-3xl font-bold mb-4">{projects[selectedProject].title}</h2>
                          <p className="text-sm md:text-base text-black/80 leading-relaxed">{projects[selectedProject].description}</p>
                        </div>) : (/* All projects grid view */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {projects.map((project, index) => <div key={index} onClick={() => setSelectedProject(index)} className="p-4 border-2 border-black rounded-lg hover:bg-black/5 transition-colors cursor-pointer">
                              <h3 className="font-bold text-sm md:text-base mb-2">{project.title}</h3>
                              <p className="text-xs md:text-sm text-black/70 line-clamp-3">{project.description}</p>
                            </div>)}
                        </div>)}
                    </div> : <div className="text-black text-center" style={{
                fontFamily: 'Comic Sans MS, cursive'
              }}>
                      <p className="text-2xl md:text-4xl font-bold mb-4">My Experience</p>
                      <p className="text-sm md:text-lg text-black/60">Experience coming soon...</p>
                    </div>}
                </div>
              </div>
            </div>
            {/* Screen bottom weight bar */}
            <div className="w-[85vw] h-2 bg-gradient-to-b from-[hsl(0_0%_20%)] to-[hsl(0_0%_10%)] rounded-b" />
          </div>
        </div>}

      {/* Projector Light Beam - small glow at lens (desktop only) */}
      {isGeneratorOn && <div className="hidden md:block fixed z-[21] pointer-events-none md:bottom-[calc(2.75rem+1.5rem)] md:right-[calc(8rem+5.5rem)]">
          <svg width="90" height="60" viewBox="0 0 90 60">
            <defs>
              <radialGradient id="lensGlow" cx="100%" cy="50%" r="100%">
                <stop offset="0%" stopColor="hsl(50 80% 90%)" stopOpacity="0.8" />
                <stop offset="50%" stopColor="hsl(50 70% 85%)" stopOpacity="0.4" />
                <stop offset="100%" stopColor="hsl(50 60% 80%)" stopOpacity="0" />
              </radialGradient>
            </defs>
            <ellipse cx="90" cy="30" rx="75" ry="28" fill="url(#lensGlow)" />
          </svg>
        </div>}

      {/* Projector - lying on floor left of socket */}
      <div className="fixed bottom-8 md:bottom-11 right-24 md:right-32 z-20">
        {/* Projector body */}
        <div className="w-16 h-10 md:w-24 md:h-14 bg-[hsl(0_0%_15%)] rounded relative">
          {/* Lens */}
          <div className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 w-5 h-5 md:w-7 md:h-7 bg-[hsl(0_0%_8%)] rounded-full border-2 border-[hsl(0_0%_25%)] transition-all duration-300 ${isGeneratorOn ? 'shadow-[0_0_15px_5px_rgba(255,220,100,0.6)]' : ''}`}>
            <div className={`absolute inset-1 rounded-full transition-all duration-300 ${isGeneratorOn ? 'bg-[hsl(50_80%_70%)]' : 'bg-[hsl(220_20%_15%)]'}`} />
          </div>
          {/* Top vent lines */}
          <div className="absolute top-1.5 right-3 flex gap-1">
            <div className="w-0.5 h-3 md:h-5 bg-[hsl(0_0%_10%)]" />
            <div className="w-0.5 h-3 md:h-5 bg-[hsl(0_0%_10%)]" />
            <div className="w-0.5 h-3 md:h-5 bg-[hsl(0_0%_10%)]" />
            <div className="w-0.5 h-3 md:h-5 bg-[hsl(0_0%_10%)]" />
          </div>
          {/* Power LED - off */}
          <div className={`absolute bottom-1.5 right-3 w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-all duration-300 ${isGeneratorOn ? 'bg-[hsl(120_70%_45%)] shadow-[0_0_4px_rgba(74,222,128,0.6)]' : 'bg-[hsl(0_0%_25%)]'}`} />
          {/* Feet */}
          <div className="absolute -bottom-1 left-3 w-2 h-1.5 bg-[hsl(0_0%_10%)] rounded-sm" />
          <div className="absolute -bottom-1 right-4 w-2 h-1.5 bg-[hsl(0_0%_10%)] rounded-sm" />
        </div>
      </div>

      {/* Socket - fixed at bottom right, sitting on floor */}
      <div ref={socketRef} className={`fixed bottom-8 md:bottom-12 right-8 md:right-12 w-12 h-16 md:w-16 md:h-24 bg-[hsl(0_0%_8%)] rounded-t border-2 border-b-0 transition-all duration-300 shadow-[inset_0_2px_8px_rgba(0,0,0,0.6)] z-20 ${isDragging ? "border-[hsl(120_40%_30%)] shadow-[inset_0_2px_8px_rgba(0,0,0,0.6),0_0_15px_rgba(74,222,128,0.3)]" : "border-[hsl(0_0%_18%)]"}`}>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <div className="flex gap-2 md:gap-3">
            <div className="w-2 h-4 md:w-2.5 md:h-5 bg-[hsl(0_0%_3%)] rounded-sm shadow-[inset_0_1px_3px_rgba(0,0,0,0.9)]" />
            <div className="w-2 h-4 md:w-2.5 md:h-5 bg-[hsl(0_0%_3%)] rounded-sm shadow-[inset_0_1px_3px_rgba(0,0,0,0.9)]" />
          </div>
          <div className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full transition-all duration-300 ${isPluggedIn ? "bg-green-400 shadow-[0_0_6px_2px_rgba(74,222,128,0.6)]" : "bg-[hsl(0_0%_20%)]"}`} />
      </div>

      {/* Cat */}
      <Cat onScratchSocket={() => {
        setIsPluggedIn(false);
        setPlugPosition({
          x: 30,
          y: 180
        });
      }} />
      </div>
    </main>;
};
export default Index;