import React, { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Soup } from "lucide-react";
import { login } from "./api";

interface LoginProps {
  onSuccess: () => void;
}

interface PupilProps {
  size?: number;
  maxDistance?: number;
  pupilColor?: string;
  forceLookX?: number;
  forceLookY?: number;
}

const Pupil = ({ 
  size = 12, 
  maxDistance = 5,
  pupilColor = "black",
  forceLookX,
  forceLookY
}: PupilProps) => {
  const [mouseX, setMouseX] = useState<number>(0);
  const [mouseY, setMouseY] = useState<number>(0);
  const pupilRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const calculatePupilPosition = () => {
    if (!pupilRef.current) return { x: 0, y: 0 };

    if (forceLookX !== undefined && forceLookY !== undefined) {
      return { x: forceLookX, y: forceLookY };
    }

    const pupil = pupilRef.current.getBoundingClientRect();
    const pupilCenterX = pupil.left + pupil.width / 2;
    const pupilCenterY = pupil.top + pupil.height / 2;

    const deltaX = mouseX - pupilCenterX;
    const deltaY = mouseY - pupilCenterY;
    const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance);

    const angle = Math.atan2(deltaY, deltaX);
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    return { x, y };
  };

  const pupilPosition = calculatePupilPosition();

  return (
    <div
      ref={pupilRef}
      className="rounded-full"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: pupilColor,
        transform: `translate(${pupilPosition.x}px, ${pupilPosition.y}px)`,
        transition: 'transform 0.1s ease-out',
      }}
    />
  );
};

interface EyeBallProps {
  size?: number;
  pupilSize?: number;
  maxDistance?: number;
  eyeColor?: string;
  pupilColor?: string;
  isBlinking?: boolean;
  forceLookX?: number;
  forceLookY?: number;
}

const EyeBall = ({ 
  size = 48, 
  pupilSize = 16, 
  maxDistance = 10,
  eyeColor = "white",
  pupilColor = "black",
  isBlinking = false,
  forceLookX,
  forceLookY
}: EyeBallProps) => {
  const [mouseX, setMouseX] = useState<number>(0);
  const [mouseY, setMouseY] = useState<number>(0);
  const eyeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const calculatePupilPosition = () => {
    if (!eyeRef.current) return { x: 0, y: 0 };

    if (forceLookX !== undefined && forceLookY !== undefined) {
      return { x: forceLookX, y: forceLookY };
    }

    const eye = eyeRef.current.getBoundingClientRect();
    const eyeCenterX = eye.left + eye.width / 2;
    const eyeCenterY = eye.top + eye.height / 2;

    const deltaX = mouseX - eyeCenterX;
    const deltaY = mouseY - eyeCenterY;
    const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance);

    const angle = Math.atan2(deltaY, deltaX);
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    return { x, y };
  };

  const pupilPosition = calculatePupilPosition();

  return (
    <div
      ref={eyeRef}
      className="rounded-full flex items-center justify-center transition-all duration-150"
      style={{
        width: `${size}px`,
        height: isBlinking ? '2px' : `${size}px`,
        backgroundColor: eyeColor,
        overflow: 'hidden',
      }}
    >
      {!isBlinking && (
        <div
          className="rounded-full"
          style={{
            width: `${pupilSize}px`,
            height: `${pupilSize}px`,
            backgroundColor: pupilColor,
            transform: `translate(${pupilPosition.x}px, ${pupilPosition.y}px)`,
            transition: 'transform 0.1s ease-out',
          }}
        />
      )}
    </div>
  );
};

const PASSWORD_PLACEHOLDERS = [
  "Falguni, sip water.",
  "Healthy bites, happy Falguni.",
  "Drink water, glow daily.",
  "Nourish yourself, Falguni.",
  "Water first, always.",
  "Eat fresh, shine.",
  "Hydrate more, thrive.",
  "Healthy choices, Falguni.",
  "Care starts within.",
  "Water, wellness, happiness."
];

export default function Login({ onSuccess }: LoginProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  
  const randomPlaceholder = useMemo(() => {
    const idx = Math.floor(Math.random() * PASSWORD_PLACEHOLDERS.length);
    return PASSWORD_PLACEHOLDERS[idx];
  }, []);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [remember, setRemember] = useState(true);
  const [shake, setShake] = useState(false);
  
  const [mouseX, setMouseX] = useState<number>(0);
  const [mouseY, setMouseY] = useState<number>(0);
  const [isSteelBlinking, setIsSteelBlinking] = useState(false);
  const [isMaroonBlinking, setIsMaroonBlinking] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isLookingAtEachOther, setIsLookingAtEachOther] = useState(false);
  const [isSteelPeeking, setIsSteelPeeking] = useState(false);
  
  // Bunny + Carrot Mobile Interaction
  const [isMobile, setIsMobile] = useState(false);
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  
  const [homePos, setHomePos] = useState({ x: 0, y: 0 });
  const [bunnyPos, setBunnyPos] = useState({ x: 0, y: 0 });
  const [pose, setPose] = useState<'idle' | 'hop' | 'chew'>('idle');
  const [facingLeft, setFacingLeft] = useState(false);
  const [activeCarrot, setActiveCarrot] = useState<{x: number, y: number} | null>(null);
  const [carrotQueue, setCarrotQueue] = useState<{x: number, y: number}[]>([]);
  const [eatProgress, setEatProgress] = useState<number>(0);
  const [cloudMessage, setCloudMessage] = useState<string | null>(null);

  const HEALTH_MESSAGES = [
    "Eat healthy food",
    "Darren loves you ❤️",
    "Drink water",
    "Avoid Tea/Coffee",
    "Eat Nuts",
    "Eat Fruits"
  ];

  const stateRef = useRef<'idle' | 'hopping_to_carrot' | 'eating' | 'post_eating_wait' | 'hopping_home'>('idle');
  const bunnyXRef = useRef(0);
  const bunnyYRef = useRef(0);
  const hopCycleRef = useRef(0);
  const eatTimerRef = useRef<number | null>(null);
  const messageCountRef = useRef<number>(0);
  const lastMessageRef = useRef<string>("");

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleLoad = () => setAssetsLoaded(true);
    if (document.readyState === 'complete') {
      setAssetsLoaded(true);
    } else {
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (!isMobile) return;
    
    const updateHome = () => {
      const x = window.innerWidth / 2 - 45;
      const y = window.innerHeight - 110;
      setHomePos({ x, y });
      
      if (stateRef.current === 'idle') {
        bunnyXRef.current = x;
        bunnyYRef.current = y;
        setBunnyPos({ x, y });
      }
    };
    
    updateHome();
    window.addEventListener('resize', updateHome);
    return () => window.removeEventListener('resize', updateHome);
  }, [isMobile]);

  useEffect(() => {
    if (!isMobile || reducedMotion || homePos.x === 0) return;

    let animId: number;
    
    const tick = () => {
      const state = stateRef.current;
      const speed = 4;
      
      if (state === 'idle') {
        if (activeCarrot) {
          stateRef.current = 'hopping_to_carrot';
          setPose('hop');
        } else {
          bunnyXRef.current = homePos.x;
          bunnyYRef.current = homePos.y;
          setBunnyPos({ x: homePos.x, y: homePos.y });
          setPose('idle');
        }
      } 
      else if (state === 'hopping_to_carrot' && activeCarrot) {
        const targetX = activeCarrot.x - 45;
        const targetY = activeCarrot.y - 80;
        
        const dx = targetX - bunnyXRef.current;
        const dy = targetY - bunnyYRef.current;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        setFacingLeft(dx < 0);
        
        if (dist < speed) {
          bunnyXRef.current = targetX;
          bunnyYRef.current = targetY;
          setBunnyPos({ x: targetX, y: targetY });
          
          stateRef.current = 'eating';
          setPose('chew');
          
          eatTimerRef.current = Date.now();
        } else {
          const angle = Math.atan2(dy, dx);
          bunnyXRef.current += Math.cos(angle) * speed;
          bunnyYRef.current += Math.sin(angle) * speed;
          
          hopCycleRef.current += 0.25;
          const bounce = Math.abs(Math.sin(hopCycleRef.current)) * -18;
          
          setBunnyPos({ 
            x: bunnyXRef.current, 
            y: bunnyYRef.current + bounce 
          });
        }
      } 
      else if (state === 'eating') {
        const elapsed = eatTimerRef.current ? Date.now() - eatTimerRef.current : 0;
        if (elapsed > 1200) {
          eatTimerRef.current = Date.now();
          setActiveCarrot(null);
          setEatProgress(0);
          stateRef.current = 'post_eating_wait';
          setPose('idle');
          
          // Trigger thought cloud message selection rules:
          // 1. The first message must always be "Darren loves you ❤️"
          // 2. Every 3rd message must be "Darren loves you ❤️"
          // 3. Do not repeat the same message consecutively
          const nextCount = messageCountRef.current + 1;
          messageCountRef.current = nextCount;
          
          let randomMsg = "";
          if (nextCount === 1 || nextCount % 3 === 0) {
            randomMsg = "Darren loves you ❤️";
          } else {
            const candidates = HEALTH_MESSAGES.filter(msg => 
              msg !== "Darren loves you ❤️" && msg !== lastMessageRef.current
            );
            if (candidates.length > 0) {
              randomMsg = candidates[Math.floor(Math.random() * candidates.length)];
            } else {
              randomMsg = HEALTH_MESSAGES.find(msg => msg !== "Darren loves you ❤️") || "";
            }
          }
          lastMessageRef.current = randomMsg;
          setCloudMessage(randomMsg);
        } else {
          const progress = Math.min(3, Math.floor(elapsed / 300));
          setEatProgress(progress);
        }
      }
      else if (state === 'post_eating_wait') {
        const elapsed = eatTimerRef.current ? Date.now() - eatTimerRef.current : 0;
        if (elapsed > 2500) {
          eatTimerRef.current = null;
          setCloudMessage(null);
          stateRef.current = 'hopping_home';
          setPose('hop');
        }
      } 
      else if (state === 'hopping_home') {
        const targetX = homePos.x;
        const targetY = homePos.y;
        
        const dx = targetX - bunnyXRef.current;
        const dy = targetY - bunnyYRef.current;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        setFacingLeft(dx < 0);
        
        if (dist < speed) {
          bunnyXRef.current = targetX;
          bunnyYRef.current = targetY;
          setBunnyPos({ x: targetX, y: targetY });
          
          stateRef.current = 'idle';
          setPose('idle');
          hopCycleRef.current = 0;
        } else {
          const angle = Math.atan2(dy, dx);
          bunnyXRef.current += Math.cos(angle) * speed;
          bunnyYRef.current += Math.sin(angle) * speed;
          
          hopCycleRef.current += 0.25;
          const bounce = Math.abs(Math.sin(hopCycleRef.current)) * -18;
          
          setBunnyPos({ 
            x: bunnyXRef.current, 
            y: bunnyYRef.current + bounce 
          });
        }
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isMobile, reducedMotion, activeCarrot, homePos]);

  useEffect(() => {
    if (!isMobile || reducedMotion) return;
    
    if (!activeCarrot && carrotQueue.length > 0 && stateRef.current === 'idle') {
      const [nextCarrot, ...remainingQueue] = carrotQueue;
      setActiveCarrot(nextCarrot);
      setCarrotQueue(remainingQueue);
    }
  }, [isMobile, reducedMotion, activeCarrot, carrotQueue]);

  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (!isMobile || reducedMotion) return;

    const target = e.target as HTMLElement;
    if (
      target.closest("input") || 
      target.closest("button") || 
      target.closest("label") || 
      target.closest("[role='checkbox']")
    ) {
      return;
    }

    const x = e.clientX;
    const y = e.clientY;

    setCarrotQueue(prev => [...prev, { x, y }]);
  };

  const steelRef = useRef<HTMLDivElement>(null);
  const maroonRef = useRef<HTMLDivElement>(null);
  const curryRef = useRef<HTMLDivElement>(null);
  const turmericRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Blinking effect for steel-tin character
  useEffect(() => {
    const getRandomBlinkInterval = () => Math.random() * 4000 + 3000;

    const scheduleBlink = () => {
      const blinkTimeout = setTimeout(() => {
        setIsSteelBlinking(true);
        setTimeout(() => {
          setIsSteelBlinking(false);
          scheduleBlink();
        }, 150);
      }, getRandomBlinkInterval());

      return blinkTimeout;
    };

    const timeout = scheduleBlink();
    return () => clearTimeout(timeout);
  }, []);

  // Blinking effect for maroon-tin character
  useEffect(() => {
    const getRandomBlinkInterval = () => Math.random() * 4000 + 3000;

    const scheduleBlink = () => {
      const blinkTimeout = setTimeout(() => {
        setIsMaroonBlinking(true);
        setTimeout(() => {
          setIsMaroonBlinking(false);
          scheduleBlink();
        }, 150);
      }, getRandomBlinkInterval());

      return blinkTimeout;
    };

    const timeout = scheduleBlink();
    return () => clearTimeout(timeout);
  }, []);

  // Looking at each other animation when typing starts
  useEffect(() => {
    if (isTyping) {
      setIsLookingAtEachOther(true);
      const timer = setTimeout(() => {
        setIsLookingAtEachOther(false);
      }, 800);
      return () => clearTimeout(timer);
    } else {
      setIsLookingAtEachOther(false);
    }
  }, [isTyping]);

  // Steel-tin sneaky peeking animation when typing password and it's visible
  useEffect(() => {
    if (password.length > 0 && showPassword) {
      const schedulePeek = () => {
        const peekInterval = setTimeout(() => {
          setIsSteelPeeking(true);
          setTimeout(() => {
            setIsSteelPeeking(false);
          }, 800);
        }, Math.random() * 3000 + 2000);
        return peekInterval;
      };

      const firstPeek = schedulePeek();
      return () => clearTimeout(firstPeek);
    } else {
      setIsSteelPeeking(false);
    }
  }, [password, showPassword, isSteelPeeking]);

  const calculatePosition = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (!ref.current) return { faceX: 0, faceY: 0, bodySkew: 0 };

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 3;

    const deltaX = mouseX - centerX;
    const deltaY = mouseY - centerY;

    const faceX = Math.max(-15, Math.min(15, deltaX / 20));
    const faceY = Math.max(-10, Math.min(10, deltaY / 30));
    const bodySkew = Math.max(-6, Math.min(6, -deltaX / 120));

    return { faceX, faceY, bodySkew };
  };

  const steelPos = calculatePosition(steelRef);
  const maroonPos = calculatePosition(maroonRef);
  const curryPos = calculatePosition(curryRef);
  const turmericPos = calculatePosition(turmericRef);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const result = await login(password);
    setIsLoading(false);

    if (result.success) {
      if (remember) {
        localStorage.setItem('tiffin:auth', 'true');
      } else {
        sessionStorage.setItem('tiffin:auth', 'true');
        const token = localStorage.getItem('tiffin:auth_token') || '';
        sessionStorage.setItem('tiffin:auth_token', token);
        localStorage.removeItem('tiffin:auth_token');
        localStorage.removeItem('tiffin:auth');
      }
      onSuccess();
    } else {
      setError(result.error || 'Incorrect password. Please try again.');
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div onClick={handleBackgroundClick} className="h-screen overflow-y-auto lg:overflow-hidden grid lg:grid-cols-2 bg-slate-950 text-slate-100 font-sans">
      {/* Left Content Section */}
      <div className="relative hidden lg:flex flex-col justify-between bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 p-12 pb-0 text-white border-r border-slate-900 overflow-hidden h-full">
        <div className="relative z-20">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <div className="size-8 rounded-lg bg-emerald-500/10 backdrop-blur-sm flex items-center justify-center border border-emerald-500/20">
              <Soup className="size-4 text-emerald-400" />
            </div>
            <span className="text-white">Tiffin Tracker</span>
          </div>
        </div>

        <div className="relative z-20 flex items-end justify-center h-[500px]">
          {/* Stacked Tiffin-Tin Characters */}
          <div className="relative" style={{ width: '550px', height: '400px' }}>
            {/* Steel-tin tall rectangle character - Back layer */}
            <div 
              ref={steelRef}
              className="absolute bottom-0 transition-all duration-700 ease-in-out"
              style={{
                left: '70px',
                width: '180px',
                height: (isTyping || (password.length > 0 && !showPassword)) ? '440px' : '400px',
                backgroundColor: '#8A98A8',
                borderRadius: '10px 10px 0 0',
                zIndex: 1,
                transform: (password.length > 0 && showPassword)
                  ? `skewX(0deg)`
                  : (isTyping || (password.length > 0 && !showPassword))
                    ? `skewX(${(steelPos.bodySkew || 0) - 12}deg) translateX(40px)` 
                    : `skewX(${steelPos.bodySkew || 0}deg)`,
                transformOrigin: 'bottom center',
              }}
            >
              {/* Eyes */}
              <div 
                className="absolute flex gap-8 transition-all duration-700 ease-in-out"
                style={{
                  left: (password.length > 0 && showPassword) ? `${20}px` : isLookingAtEachOther ? `${55}px` : `${45 + steelPos.faceX}px`,
                  top: (password.length > 0 && showPassword) ? `${35}px` : isLookingAtEachOther ? `${65}px` : `${40 + steelPos.faceY}px`,
                }}
              >
                <EyeBall 
                  size={18} 
                  pupilSize={7} 
                  maxDistance={5} 
                  eyeColor="white" 
                  pupilColor="#2D2D2D" 
                  isBlinking={isSteelBlinking}
                  forceLookX={(password.length > 0 && showPassword) ? (isSteelPeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined}
                  forceLookY={(password.length > 0 && showPassword) ? (isSteelPeeking ? 5 : -4) : isLookingAtEachOther ? 4 : undefined}
                />
                <EyeBall 
                  size={18} 
                  pupilSize={7} 
                  maxDistance={5} 
                  eyeColor="white" 
                  pupilColor="#2D2D2D" 
                  isBlinking={isSteelBlinking}
                  forceLookX={(password.length > 0 && showPassword) ? (isSteelPeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined}
                  forceLookY={(password.length > 0 && showPassword) ? (isSteelPeeking ? 5 : -4) : isLookingAtEachOther ? 4 : undefined}
                />
              </div>
            </div>

            {/* Maroon tall rectangle character - Middle layer */}
            <div 
              ref={maroonRef}
              className="absolute bottom-0 transition-all duration-700 ease-in-out"
              style={{
                left: '240px',
                width: '120px',
                height: '310px',
                backgroundColor: '#7A2E2E',
                borderRadius: '8px 8px 0 0',
                zIndex: 2,
                transform: (password.length > 0 && showPassword)
                  ? `skewX(0deg)`
                  : isLookingAtEachOther
                    ? `skewX(${(maroonPos.bodySkew || 0) * 1.5 + 10}deg) translateX(20px)`
                    : (isTyping || (password.length > 0 && !showPassword))
                      ? `skewX(${(maroonPos.bodySkew || 0) * 1.5}deg)` 
                      : `skewX(${maroonPos.bodySkew || 0}deg)`,
                transformOrigin: 'bottom center',
              }}
            >
              {/* Eyes */}
              <div 
                className="absolute flex gap-6 transition-all duration-700 ease-in-out"
                style={{
                  left: (password.length > 0 && showPassword) ? `${10}px` : isLookingAtEachOther ? `${32}px` : `${26 + maroonPos.faceX}px`,
                  top: (password.length > 0 && showPassword) ? `${28}px` : isLookingAtEachOther ? `${12}px` : `${32 + maroonPos.faceY}px`,
                }}
              >
                <EyeBall 
                  size={16} 
                  pupilSize={6} 
                  maxDistance={4} 
                  eyeColor="white" 
                  pupilColor="#2D2D2D" 
                  isBlinking={isMaroonBlinking}
                  forceLookX={(password.length > 0 && showPassword) ? -4 : isLookingAtEachOther ? 0 : undefined}
                  forceLookY={(password.length > 0 && showPassword) ? -4 : isLookingAtEachOther ? -4 : undefined}
                />
                <EyeBall 
                  size={16} 
                  pupilSize={6} 
                  maxDistance={4} 
                  eyeColor="white" 
                  pupilColor="#2D2D2D" 
                  isBlinking={isMaroonBlinking}
                  forceLookX={(password.length > 0 && showPassword) ? -4 : isLookingAtEachOther ? 0 : undefined}
                  forceLookY={(password.length > 0 && showPassword) ? -4 : isLookingAtEachOther ? -4 : undefined}
                />
              </div>
            </div>

            {/* Turmeric semi-circle character - Front left */}
            <div 
              ref={turmericRef}
              className="absolute bottom-0 transition-all duration-700 ease-in-out"
              style={{
                left: '0px',
                width: '240px',
                height: '200px',
                zIndex: 3,
                backgroundColor: '#FF9F45',
                borderRadius: '120px 120px 0 0',
                transform: (password.length > 0 && showPassword) ? `skewX(0deg)` : `skewX(${turmericPos.bodySkew || 0}deg)`,
                transformOrigin: 'bottom center',
              }}
            >
              {/* Eyes - just pupils, no white */}
              <div 
                className="absolute flex gap-8 transition-all duration-200 ease-out"
                style={{
                  left: (password.length > 0 && showPassword) ? `${50}px` : `${82 + (turmericPos.faceX || 0)}px`,
                  top: (password.length > 0 && showPassword) ? `${85}px` : `${90 + (turmericPos.faceY || 0)}px`,
                }}
              >
                <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D" forceLookX={(password.length > 0 && showPassword) ? -5 : undefined} forceLookY={(password.length > 0 && showPassword) ? -4 : undefined} />
                <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D" forceLookX={(password.length > 0 && showPassword) ? -5 : undefined} forceLookY={(password.length > 0 && showPassword) ? -4 : undefined} />
              </div>
            </div>

            {/* Curry-leaf tall rectangle character - Front right */}
            <div 
              ref={curryRef}
              className="absolute bottom-0 transition-all duration-700 ease-in-out"
              style={{
                left: '310px',
                width: '140px',
                height: '230px',
                backgroundColor: '#7C9C4C',
                borderRadius: '70px 70px 0 0',
                zIndex: 4,
                transform: (password.length > 0 && showPassword) ? `skewX(0deg)` : `skewX(${curryPos.bodySkew || 0}deg)`,
                transformOrigin: 'bottom center',
              }}
            >
              {/* Eyes - just pupils, no white */}
              <div 
                className="absolute flex gap-6 transition-all duration-200 ease-out"
                style={{
                  left: (password.length > 0 && showPassword) ? `${20}px` : `${52 + (curryPos.faceX || 0)}px`,
                  top: (password.length > 0 && showPassword) ? `${35}px` : `${40 + (curryPos.faceY || 0)}px`,
                }}
              >
                <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D" forceLookX={(password.length > 0 && showPassword) ? -5 : undefined} forceLookY={(password.length > 0 && showPassword) ? -4 : undefined} />
                <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D" forceLookX={(password.length > 0 && showPassword) ? -5 : undefined} forceLookY={(password.length > 0 && showPassword) ? -4 : undefined} />
              </div>
              {/* Horizontal line for mouth */}
              <div 
                className="absolute w-20 h-[4px] bg-[#2D2D2D] rounded-full transition-all duration-200 ease-out"
                style={{
                  left: (password.length > 0 && showPassword) ? `${10}px` : `${40 + (curryPos.faceX || 0)}px`,
                  top: (password.length > 0 && showPassword) ? `${88}px` : `${88 + (curryPos.faceY || 0)}px`,
                }}
              />
            </div>
          </div>
        </div>



        {/* Decorative elements */}
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:30px_30px]" />
        <div className="absolute top-1/4 right-1/4 size-64 bg-emerald-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 left-1/4 size-96 bg-orange-500/5 rounded-full blur-[100px]" />
      </div>

      {/* Right Login Section */}
      <div className="flex items-center justify-center p-8 bg-slate-950">
        <div className={`w-full max-w-[420px] transition-all ${shake ? 'animate-shake' : ''}`}>
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 text-lg font-semibold mb-12">
            <div className="size-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <Soup className="size-4 text-emerald-400" />
            </div>
            <span>Tiffin Tracker</span>
          </div>

          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold tracking-tight mb-2 text-white" style={{ fontFamily: 'var(--font-display)' }}>Welcome back!</h1>
            <p className="text-slate-400 text-sm">Sign in to track today's tiffin</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2 text-left">
              <Label htmlFor="password" className="text-sm font-medium text-slate-350">Enter Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={randomPlaceholder}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  onFocus={() => setIsTyping(true)}
                  onBlur={() => setIsTyping(false)}
                  required
                  className="h-12 pr-12 bg-slate-900 border-slate-800 text-white placeholder-slate-500 rounded-2xl focus:border-emerald-500 focus-visible:ring-emerald-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-450 hover:text-slate-200 transition-colors p-1 rounded cursor-pointer border-none bg-transparent"
                >
                  {showPassword ? (
                    <EyeOff className="size-5" />
                  ) : (
                    <Eye className="size-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center text-left">
              <div className="flex items-center space-x-2.5">
                <Checkbox 
                  id="remember" 
                  checked={remember} 
                  onCheckedChange={(checked) => setRemember(checked === true)}
                  className="border-slate-700 data-[state=checked]:bg-emerald-500 data-[state=checked]:text-white rounded-md"
                />
                <Label
                  htmlFor="remember"
                  className="text-sm font-normal cursor-pointer text-slate-400 select-none"
                >
                  Remember for 30 days
                </Label>
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-xs font-semibold text-left pl-1 flex items-center gap-1.5 animate-fadeIn">
                <span className="text-sm">⚠️</span> {error}
              </p>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white rounded-2xl py-3.5 shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all cursor-pointer border-none flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? "Accessing..." : "Access Tracker"}
            </Button>
          </form>
        </div>
      </div>

      {/* Bunny & Carrot Mobile Layer */}
      {isMobile && assetsLoaded && (
        <>
          <style>{`
            @keyframes bunny-breath {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.05, 0.95); }
            }
            .animate-bunny-breath {
              animation: bunny-breath 2s ease-in-out infinite;
            }
            @keyframes bounce-in {
              0% { transform: scale(0); opacity: 0; }
              65% { transform: scale(1.2); opacity: 1; }
              100% { transform: scale(1); }
            }
            .animate-bounce-in {
              animation: bounce-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
            }
            @keyframes fade-in-up {
              0% { transform: translateY(10px) scale(0.9); opacity: 0; }
              100% { transform: translateY(0) scale(1); opacity: 1; }
            }
            .animate-fade-in-up {
              animation: fade-in-up 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
            }
          `}</style>

          {activeCarrot && (
            <div
              style={{
                position: 'fixed',
                left: `${activeCarrot.x - 20}px`,
                top: `${activeCarrot.y - 20}px`,
                width: '40px',
                height: '40px',
                mixBlendMode: 'screen',
                pointerEvents: 'none',
                zIndex: 4,
                clipPath: 
                  stateRef.current === 'eating' 
                    ? facingLeft
                      ? `inset(0% ${eatProgress * 25}% 0% 0%)`
                      : `inset(0% 0% 0% ${eatProgress * 25}%)`
                    : 'inset(0% 0% 0% 0%)'
              }}
              className={stateRef.current !== 'eating' ? "animate-bounce-in" : ""}
            >
              <img 
                src="/carrot.png" 
                alt="Carrot" 
                className="w-full h-full object-contain"
                loading="lazy"
              />
            </div>
          )}
          
          <div
            style={{
              position: 'fixed',
              left: `${bunnyPos.x}px`,
              top: `${bunnyPos.y}px`,
              width: '90px',
              height: '90px',
              transform: `scaleX(${facingLeft ? -1 : 1})`,
              mixBlendMode: 'screen',
              pointerEvents: 'none',
              zIndex: 5,
            }}
          >
            <img
              src={
                pose === 'chew' 
                  ? '/bunny_chew.png' 
                  : pose === 'hop' 
                    ? '/bunny_hop.png' 
                    : '/bunny_idle.png'
              }
              alt="Bunny"
              className={`w-full h-full object-contain ${
                pose === 'idle' && !reducedMotion ? 'animate-bunny-breath' : ''
              }`}
              loading="lazy"
            />
          </div>

          {cloudMessage && (() => {
            const isCloudOnTop = bunnyPos.y - 45 > 15;
            const cloudY = isCloudOnTop ? bunnyPos.y - 45 : bunnyPos.y + 75;
            return (
              <div
                style={{
                  position: 'fixed',
                  left: `${bunnyPos.x - 5}px`,
                  top: `${cloudY}px`,
                  zIndex: 6,
                }}
                className="animate-fade-in-up"
              >
                <div className="relative bg-white text-slate-900 text-[10px] px-3 py-1.5 rounded-2xl border border-slate-300 shadow-lg font-medium whitespace-nowrap flex items-center justify-center">
                  {cloudMessage}
                  {/* Thought cloud bubbly indicators */}
                  {isCloudOnTop ? (
                    <>
                      <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-white border border-slate-300" />
                      <div className="absolute -bottom-3 left-[calc(50%-3px)] w-1.5 h-1.5 rounded-full bg-white border border-slate-300" />
                      <div className="absolute -bottom-4 left-[calc(50%-4px)] w-1 h-1 rounded-full bg-white" />
                    </>
                  ) : (
                    <>
                      <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-white border border-slate-300" />
                      <div className="absolute -top-3 left-[calc(50%-3px)] w-1.5 h-1.5 rounded-full bg-white border border-slate-300" />
                      <div className="absolute -top-4 left-[calc(50%-4px)] w-1 h-1 rounded-full bg-white" />
                    </>
                  )}
                </div>
              </div>
            );
          })()}
        </>
      )}
    </div>
  );
}
