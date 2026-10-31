import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const C = {
  bg:"#0d0810", blush:"#f4a7c3", blushDeep:"#e8607a",
  blushLight:"#fce8f1", lavender:"#c8a8e9", cream:"#fdf6e3",
  rose:"#e8607a", gold:"#f7c873", white:"#fff8fc",
  muted:"rgba(255,210,230,0.6)", faint:"rgba(255,180,210,0.22)",
  pink50:"rgba(244,167,195,0.08)", pink100:"rgba(244,167,195,0.15)",
};

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Dancing+Script:wght@500;700&family=Inter:wght@300;400;500&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  html{font-size:16px;-webkit-text-size-adjust:100%;touch-action:manipulation}
  body{background:#0d0810;overflow-x:hidden}
  ::-webkit-scrollbar{width:3px}
  ::-webkit-scrollbar-thumb{background:rgba(244,167,195,0.3);border-radius:2px}
  input,button{-webkit-appearance:none;outline:none;font-family:inherit}
  button{border:none;background:transparent;cursor:pointer}
  @keyframes petalFall{0%{transform:translateY(-20px) translateX(0) rotate(var(--r));opacity:.9}100%{transform:translateY(110vh) translateX(var(--dx)) rotate(calc(var(--r)+380deg));opacity:0}}
  @keyframes floatUp{0%{transform:translateY(0) rotate(var(--r));opacity:1}100%{transform:translateY(-120vh) translateX(var(--dx)) rotate(calc(var(--r)+60deg));opacity:0}}
  @keyframes confettiFall{0%{transform:translateY(-10px) rotate(var(--r));opacity:1}100%{transform:translateY(110vh) translateX(var(--dx)) rotate(calc(var(--r)+720deg));opacity:0}}
  @keyframes heartbeat{0%,100%{transform:scale(1)} 14%{transform:scale(1.22)} 28%{transform:scale(1)} 42%{transform:scale(1.15)}}
  @keyframes shimmer{0%{background-position:200% center}100%{background-position:-200% center}}
  @keyframes glowPulse{0%,100%{filter:drop-shadow(0 0 6px rgba(244,167,195,.4))} 50%{filter:drop-shadow(0 0 20px rgba(244,167,195,.9))}}
  @keyframes breathe{0%,100%{transform:scale(1)} 50%{transform:scale(1.05)}}
  @keyframes petalSway{0%,100%{transform:rotate(-10deg) translateX(-4px)} 50%{transform:rotate(10deg) translateX(4px)}}
  @keyframes float{0%,100%{transform:translateY(0px)} 50%{transform:translateY(-12px)}}
  .shimmer-text{background:linear-gradient(90deg,#f4a7c3,#c8a8e9,#f7c873,#f4a7c3);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:shimmer 3s linear infinite}
  .breathe{animation:breathe 4s ease-in-out infinite}
  .heartbeat-anim{animation:heartbeat 1.4s ease-in-out infinite}
  .float-anim{animation:float 3s ease-in-out infinite}
`;

// ── PETAL RAIN ─────────────────────────────────────────────────────────────
function PetalRain() {
  const petals = Array.from({length:32},(_,i)=>({
    id:i,left:`${Math.random()*100}%`,delay:`${Math.random()*10}s`,
    duration:`${7+Math.random()*8}s`,r:`${Math.random()*360}deg`,
    dx:`${(Math.random()-.5)*100}px`,size:`${9+Math.random()*13}px`,
    color:[C.blush,C.lavender,"#ffb6c1","#dda0dd",C.rose+"99","#f9c6d0"][i%6],
    shape:i%3===0?"50%":i%3===1?"50% 0 50% 50%":"30%",
  }));
  return (
    <div style={{position:"fixed",inset:0,zIndex:2,pointerEvents:"none",overflow:"hidden"}}>
      {petals.map(p=>(
        <div key={p.id} style={{position:"absolute",top:"-20px",left:p.left,
          width:p.size,height:p.size,background:p.color,borderRadius:p.shape,
          "--r":p.r,"--dx":p.dx,
          animation:`petalFall ${p.duration} ${p.delay} ease-in infinite`,opacity:.85}}/>
      ))}
    </div>
  );
}

// ── HEARTS CANVAS ─────────────────────────────────────────────────────────
function HeartsCanvas() {
  const ref = useRef();
  useEffect(()=>{
    const canvas=ref.current; if(!canvas) return;
    const ctx=canvas.getContext("2d");
    let W=canvas.width=window.innerWidth,H=canvas.height=window.innerHeight;
    const items=Array.from({length:45},()=>({
      x:Math.random()*W,y:Math.random()*H+H,
      size:Math.random()*13+4,speed:Math.random()*.45+.1,
      drift:(Math.random()-.5)*.3,alpha:Math.random()*.25+.06,
      color:[C.blush,C.lavender,C.rose,"#ffb6c1","#dda0dd"][Math.floor(Math.random()*5)],
      pulse:Math.random()*Math.PI*2,
    }));
    const drawHeart=(x,y,s,a,col)=>{
      ctx.save();ctx.globalAlpha=a;ctx.fillStyle=col;ctx.beginPath();
      ctx.moveTo(x,y);ctx.bezierCurveTo(x,y-s*.3,x-s*.5,y-s*.65,x-s*.5,y-s*.35);
      ctx.bezierCurveTo(x-s*.5,y-s*.85,x,y-s*.95,x,y-s*.65);
      ctx.bezierCurveTo(x,y-s*.95,x+s*.5,y-s*.85,x+s*.5,y-s*.35);
      ctx.bezierCurveTo(x+s*.5,y-s*.65,x,y-s*.3,x,y);
      ctx.fill();ctx.restore();
    };
    let raf;
    const tick=()=>{
      ctx.clearRect(0,0,W,H);
      items.forEach(p=>{
        p.y-=p.speed;p.x+=p.drift;p.pulse+=.015;
        const a=p.alpha*(0.7+0.3*Math.sin(p.pulse));
        if(p.y<-30){p.y=H+20;p.x=Math.random()*W;}
        drawHeart(p.x,p.y,p.size,a,p.color);
      });
      raf=requestAnimationFrame(tick);
    };
    tick();
    const resize=()=>{W=canvas.width=window.innerWidth;H=canvas.height=window.innerHeight;};
    window.addEventListener("resize",resize);
    return()=>{cancelAnimationFrame(raf);window.removeEventListener("resize",resize);};
  },[]);
  return <canvas ref={ref} style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none"}}/>;
}

// ── TAP SPARKS ────────────────────────────────────────────────────────────
function TapSparks() {
  const [sparks,setSparks]=useState([]);
  const idRef=useRef(0);
  useEffect(()=>{
    const fire=e=>{
      const clientX=e.touches?e.touches[0].clientX:e.clientX;
      const clientY=e.touches?e.touches[0].clientY:e.clientY;
      const batch=Array.from({length:8},(_,i)=>({
        id:idRef.current++,x:clientX,y:clientY,angle:(i/8)*360,
        color:[C.blush,C.lavender,C.gold,C.rose,"#ffb6c1"][i%5],
      }));
      setSparks(s=>[...s.slice(-40),...batch]);
      batch.forEach(b=>setTimeout(()=>setSparks(s=>s.filter(p=>p.id!==b.id)),700));
    };
    window.addEventListener("click",fire);
    window.addEventListener("touchstart",fire,{passive:true});
    return()=>{window.removeEventListener("click",fire);window.removeEventListener("touchstart",fire);};
  },[]);
  return (
    <div style={{position:"fixed",inset:0,zIndex:3,pointerEvents:"none"}}>
      {sparks.map(s=>{
        const rad=(s.angle*Math.PI)/180,dist=40+Math.random()*30;
        return (
          <motion.div key={s.id}
            initial={{x:s.x,y:s.y,scale:0,opacity:1}}
            animate={{x:s.x+Math.cos(rad)*dist,y:s.y+Math.sin(rad)*dist,scale:[0,1.2,0],opacity:[1,.8,0]}}
            transition={{duration:.65,ease:"easeOut"}}
            style={{position:"fixed",top:0,left:0,width:8,height:8,borderRadius:"50%",
              background:s.color,boxShadow:`0 0 6px ${s.color}`}}/>
        );
      })}
    </div>
  );
}

// ── CURSOR TRAIL ──────────────────────────────────────────────────────────
function CursorTrail() {
  const [trails,setTrails]=useState([]);
  const id=useRef(0);
  useEffect(()=>{
    if(window.matchMedia("(pointer:coarse)").matches) return;
    const h=e=>{
      const i=id.current++;
      setTrails(t=>[...t.slice(-20),{id:i,x:e.clientX,y:e.clientY}]);
      setTimeout(()=>setTrails(t=>t.filter(p=>p.id!==i)),900);
    };
    window.addEventListener("mousemove",h);
    return()=>window.removeEventListener("mousemove",h);
  },[]);
  return (
    <div style={{position:"fixed",inset:0,zIndex:1,pointerEvents:"none"}}>
      {trails.map(p=>(
        <motion.div key={p.id} initial={{opacity:.9,scale:1}} animate={{opacity:0,scale:.1}}
          transition={{duration:.9}}
          style={{position:"fixed",left:p.x-5,top:p.y-5,width:10,height:10,borderRadius:"50%",
            background:`radial-gradient(circle,${C.blush},${C.lavender})`}}/>
      ))}
    </div>
  );
}

// ── AUDIO ─────────────────────────────────────────────────────────────────
function useAudio() {
  const [playing,setPlaying]=useState(false);
  const audioRef=useRef(null);
  const init=useCallback(()=>{
    if(audioRef.current) return audioRef.current;
    const a=new Audio("/love.mp3");
    a.loop=true;a.volume=0.35;audioRef.current=a;return a;
  },[]);
  const autoPlay=useCallback(()=>{
    const a=init();
    const p=a.play();
    if(p!==undefined){
      p.then(()=>setPlaying(true)).catch(()=>{
        const retry=()=>{
          a.play().then(()=>{setPlaying(true);document.removeEventListener("click",retry);document.removeEventListener("touchstart",retry);}).catch(()=>{});
        };
        document.addEventListener("click",retry,{once:true});
        document.addEventListener("touchstart",retry,{once:true,passive:true});
      });
    }
  },[init]);
  const pause=useCallback(()=>{
    if(audioRef.current){audioRef.current.pause();setPlaying(false);}
  },[]);
  const toggle=useCallback(()=>{
    const a=init();
    if(playing){a.pause();setPlaying(false);}
    else{a.play().then(()=>setPlaying(true)).catch(()=>{});}
  },[playing,init]);
  return{playing,toggle,autoPlay,pause};
}

function MusicBtn({playing,toggle}) {
  return (
    <motion.button onClick={toggle} whileHover={{scale:1.15}} whileTap={{scale:.88}}
      style={{position:"fixed",bottom:20,right:20,zIndex:400,width:46,height:46,
        borderRadius:"50%",background:"rgba(13,8,16,.92)",backdropFilter:"blur(20px)",
        border:`1.5px solid ${C.blush}88`,display:"flex",alignItems:"center",justifyContent:"center",
        boxShadow:`0 4px 20px rgba(244,167,195,.25)`}}>
      {playing?(
        <div style={{display:"flex",gap:2,alignItems:"flex-end",height:16}}>
          {[1,1.7,.8,1.5,1].map((h,i)=>(
            <motion.div key={i} animate={{scaleY:[1,h*2,.3,h,1]}}
              transition={{repeat:Infinity,duration:.65+i*.1,delay:i*.07}}
              style={{width:3,height:12,background:C.blush,borderRadius:2,transformOrigin:"bottom"}}/>
          ))}
        </div>
      ):<span style={{fontSize:19,color:C.blush}}>♪</span>}
    </motion.button>
  );
}

// ── CONFETTI ──────────────────────────────────────────────────────────────
function Confetti({active}) {
  if(!active) return null;
  const pieces=Array.from({length:90},(_,i)=>({
    id:i,color:[C.blush,C.lavender,C.gold,C.rose,"#ffb6c1","#dda0dd","#fff"][i%7],
    left:`${Math.random()*100}%`,delay:`${Math.random()*.9}s`,
    duration:`${2+Math.random()*1.5}s`,r:`${Math.random()*360}deg`,
    dx:`${(Math.random()-.5)*80}px`,size:`${6+Math.random()*8}px`,
    shape:i%3===0?"50%":i%3===1?"50% 0 50% 50%":"0",
  }));
  return (
    <div style={{position:"fixed",inset:0,zIndex:500,pointerEvents:"none",overflow:"hidden"}}>
      {pieces.map(p=>(
        <div key={p.id} style={{position:"absolute",top:"-10px",left:p.left,
          width:p.size,height:p.size,background:p.color,borderRadius:p.shape,
          "--r":p.r,"--dx":p.dx,
          animation:`confettiFall ${p.duration} ${p.delay} ease-in forwards`}}/>
      ))}
    </div>
  );
}

// ── WINGED HEARTS ─────────────────────────────────────────────────────────
function WingedHearts({active}) {
  const [hearts,setHearts]=useState([]);
  useEffect(()=>{
    if(!active) return;
    const spawn=()=>setHearts(h=>[...h.slice(-16),{
      id:Date.now()+Math.random(),x:Math.random()*90+5,delay:Math.random()*.4,
    }]);
    spawn();const t=setInterval(spawn,550);return()=>clearInterval(t);
  },[active]);
  if(!active) return null;
  return (
    <div style={{position:"fixed",inset:0,zIndex:10,pointerEvents:"none",overflow:"hidden"}}>
      {hearts.map(h=>(
        <div key={h.id} style={{position:"absolute",bottom:"-30px",left:`${h.x}%`,
          fontSize:"22px","--r":`${(Math.random()-.5)*25}deg`,"--dx":`${(Math.random()-.5)*60}px`,
          animation:`floatUp 4s ${h.delay}s ease-out forwards`}}>💕</div>
      ))}
    </div>
  );
}

// ── SECTION SHELL ─────────────────────────────────────────────────────────
function Section({children,onBack,color=C.blush}) {
  return (
    <motion.div initial={{opacity:0,y:44,filter:"blur(18px)"}}
      animate={{opacity:1,y:0,filter:"blur(0px)"}}
      exit={{opacity:0,y:-24,filter:"blur(12px)"}}
      transition={{duration:.7,ease:[.22,1,.36,1]}}
      style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",
        padding:"76px 20px 100px",position:"relative",zIndex:10}}>
      <motion.button onClick={onBack} whileTap={{scale:.93}}
        style={{position:"fixed",top:14,left:16,zIndex:300,background:"rgba(13,8,16,.9)",
          backdropFilter:"blur(16px)",border:`1px solid ${color}55`,color,borderRadius:20,
          padding:"8px 18px",fontSize:12,fontFamily:"'Inter',sans-serif",fontWeight:300,letterSpacing:1}}>
        back
      </motion.button>
      {children}
    </motion.div>
  );
}

// ── ENTRANCE ──────────────────────────────────────────────────────────────
function Entrance({onUnlock,onAutoPlay}) {
  const [val,setVal]=useState("");
  const [error,setError]=useState(false);
  const [shake,setShake]=useState(false);
  const [success,setSuccess]=useState(false);
  const inputRef=useRef();
  const attempt=()=>{
    if(val.toLowerCase().trim()==="chimbubu"){
      onAutoPlay();setSuccess(true);setTimeout(()=>onUnlock(),2400);
    } else {
      setError(true);setShake(true);
      setTimeout(()=>{setShake(false);setError(false);setVal("");inputRef.current?.focus();},2200);
    }
  };
  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}}
      exit={{opacity:0,scale:1.06,filter:"blur(22px)"}} transition={{duration:.9}}
      style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",
        justifyContent:"center",textAlign:"center",padding:"0 24px",position:"relative",zIndex:10}}>
      <div style={{position:"absolute",inset:0,
        background:`radial-gradient(ellipse 80% 55% at 50% 35%, rgba(244,167,195,.2) 0%, transparent 70%)`,
        pointerEvents:"none"}}/>
      <AnimatePresence>
        {success&&(
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            style={{position:"fixed",inset:0,zIndex:600,display:"flex",flexDirection:"column",
              alignItems:"center",justifyContent:"center",background:"rgba(13,8,16,.97)"}}>
            <motion.div animate={{scale:[1,1.3,1]}} transition={{repeat:4,duration:.5}}
              style={{fontSize:64,marginBottom:20}}>🤍</motion.div>
            <motion.h2 initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:.5}}
              style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(28px,7vw,52px)",
                color:C.white,fontWeight:300,marginBottom:12}}>Welcome my love</motion.h2>
            <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1.1}}
              style={{fontFamily:"'Dancing Script',cursive",fontSize:"clamp(18px,4.5vw,26px)",color:C.blush}}>
              enjoy your stay
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div animate={{y:[0,-10,0]}} transition={{repeat:Infinity,duration:3.5,ease:"easeInOut"}}
        style={{marginBottom:28}}>
        <motion.span animate={{scale:[1,1.22,1]}} transition={{repeat:Infinity,duration:1.9}}
          style={{fontSize:54,display:"block"}}>🌸</motion.span>
      </motion.div>
      <motion.p initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:.3}}
        style={{fontSize:"clamp(9px,2.5vw,11px)",letterSpacing:6,color:C.blush,
          fontFamily:"'Inter',sans-serif",fontWeight:300,marginBottom:16,textTransform:"uppercase"}}>
        for my one and only
      </motion.p>
      <motion.h1 initial={{opacity:0,y:22}} animate={{opacity:1,y:0}} transition={{delay:.5}}
        style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(52px,13vw,100px)",
          fontWeight:300,color:C.white,lineHeight:.95,marginBottom:10,
          textShadow:`0 0 80px ${C.blush}88, 0 0 160px ${C.lavender}44`}}>Chioma</motion.h1>
      <motion.div initial={{scaleX:0}} animate={{scaleX:1}} transition={{delay:.9,duration:.8}}
        style={{width:100,height:1,background:`linear-gradient(90deg,transparent,${C.blush},transparent)`,
          margin:"14px auto 24px"}}/>
      <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1.1}}
        style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",
          fontSize:"clamp(15px,4vw,20px)",color:C.muted,marginBottom:40}}>
        what do you call your man?
      </motion.p>
      <motion.div animate={shake?{x:[-10,10,-8,8,-4,4,0]}:{}} transition={{duration:.5}}
        style={{width:"100%",maxWidth:320}}>
        <input ref={inputRef} value={val} onChange={e=>setVal(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&attempt()}
          placeholder="type his nickname..." type="text"
          autoComplete="off" autoCorrect="off" autoCapitalize="off"
          style={{width:"100%",padding:"16px 20px",borderRadius:60,marginBottom:12,
            background:"rgba(255,255,255,.06)",backdropFilter:"blur(12px)",
            border:`1.5px solid ${error?C.rose:C.blush}55`,color:C.white,fontSize:16,
            fontFamily:"'Inter',sans-serif",fontWeight:300,textAlign:"center",letterSpacing:2,
            boxShadow:error?`0 0 24px ${C.rose}44`:`0 0 20px ${C.blush}22`,
            transition:"all .3s ease",display:"block"}}/>
        <AnimatePresence>
          {error&&(
            <motion.div initial={{opacity:0,y:-8,scale:.9}} animate={{opacity:1,y:0,scale:1}}
              exit={{opacity:0,scale:.9}}
              style={{background:`rgba(232,96,122,.15)`,border:`1px solid ${C.rose}44`,
                borderRadius:16,padding:"12px 20px",marginBottom:14,backdropFilter:"blur(12px)"}}>
              <p style={{fontFamily:"'Dancing Script',cursive",fontSize:18,color:C.rose,margin:0}}>
                thats wrong princess, try again
              </p>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.button onClick={attempt} whileHover={{scale:1.05}} whileTap={{scale:.93}}
          style={{width:"100%",padding:"15px 0",borderRadius:60,background:"transparent",
            border:`1.5px solid ${C.blush}`,color:C.blush,
            fontFamily:"'Cormorant Garamond',serif",fontSize:19,letterSpacing:4,
            boxShadow:`0 0 24px ${C.blush}33`}}>Enter</motion.button>
      </motion.div>
      <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:2.2}}
        style={{marginTop:28,fontSize:11,color:C.faint,fontStyle:"italic",fontFamily:"'Inter',sans-serif"}}>
        hint: its what I call you
      </motion.p>
    </motion.div>
  );
}

// ── SPOTIFY PLAYER ────────────────────────────────────────────────────────
function SpotifyPlayer({onOpen,onClose,audioPlaying,pauseAudio}) {
  const [open,setOpen]=useState(false);
  const toggle=()=>{
    if(!open){
      if(audioPlaying) pauseAudio();
      setOpen(true);onOpen&&onOpen();
    } else {
      setOpen(false);onClose&&onClose();
    }
  };
  return (
    <>
      <motion.button onClick={toggle} whileHover={{scale:1.12}} whileTap={{scale:.9}}
        title="Lana Del Rey playlist"
        style={{position:"fixed",bottom:74,right:20,zIndex:400,width:46,height:46,
          borderRadius:"50%",background:"rgba(13,8,16,.92)",backdropFilter:"blur(20px)",
          border:`1.5px solid #1DB954`,display:"flex",alignItems:"center",justifyContent:"center",
          boxShadow:`0 4px 20px rgba(29,185,84,.3)`}}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="#1DB954">
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
        </svg>
      </motion.button>
      <AnimatePresence>
        {open&&(
          <motion.div initial={{opacity:0,y:20,scale:.95}} animate={{opacity:1,y:0,scale:1}}
            exit={{opacity:0,y:20,scale:.95}} transition={{duration:.4,type:"spring"}}
            style={{position:"fixed",bottom:130,right:16,zIndex:500,width:"min(340px,90vw)",
              borderRadius:20,overflow:"hidden",
              border:`1px solid rgba(29,185,84,.3)`,
              boxShadow:`0 8px 40px rgba(0,0,0,.6), 0 0 20px rgba(29,185,84,.2)`}}>
            <div style={{background:"rgba(13,8,16,.95)",padding:"12px 16px 8px",
              display:"flex",justifyContent:"space-between",alignItems:"center",
              borderBottom:"1px solid rgba(29,185,84,.2)"}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#1DB954">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
                <span style={{fontFamily:"'Inter',sans-serif",fontSize:12,color:"#1DB954",fontWeight:500}}>
                  Lana Del Rey
                </span>
              </div>
              <motion.button onClick={toggle} whileTap={{scale:.9}}
                style={{color:C.muted,fontSize:18,lineHeight:1,padding:"0 4px"}}>×</motion.button>
            </div>
            <iframe
              src="https://open.spotify.com/embed/playlist/4OHlLEj27Q23cAK92IpYVZ?utm_source=generator&theme=0"
              width="100%" height="352" frameBorder="0" allowFullScreen=""
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              style={{display:"block",border:"none"}}/>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ── HOME ──────────────────────────────────────────────────────────────────
const START_DATE=new Date("2026-03-07");

function Countdown() {
  const [days,setDays]=useState(0);
  useEffect(()=>{
    const calc=()=>{const diff=Math.floor((Date.now()-START_DATE.getTime())/(1000*60*60*24));setDays(Math.max(0,diff));};
    calc();const t=setInterval(calc,60000);return()=>clearInterval(t);
  },[]);
  return (
    <motion.div initial={{opacity:0,scale:.9}} animate={{opacity:1,scale:1}} transition={{delay:.6}}
      style={{textAlign:"center",padding:"18px 28px",
        background:`linear-gradient(135deg,rgba(244,167,195,.1),rgba(200,168,233,.08))`,
        border:`1px solid ${C.blush}33`,borderRadius:20,marginBottom:18}}>
      <p style={{fontSize:10,letterSpacing:4,color:C.blush,fontFamily:"'Inter',sans-serif",
        marginBottom:8,textTransform:"uppercase"}}>us, since</p>
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:12}}>
        <motion.span animate={{scale:[1,1.2,1]}} transition={{repeat:Infinity,duration:1.6}} style={{fontSize:22}}>♡</motion.span>
        <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(32px,8vw,52px)",
          color:C.white,fontWeight:300,lineHeight:1}}>{days}</span>
        <motion.span animate={{scale:[1,1.2,1]}} transition={{repeat:Infinity,duration:1.6,delay:.8}} style={{fontSize:22}}>♡</motion.span>
      </div>
      <p style={{fontFamily:"'Dancing Script',cursive",fontSize:"clamp(13px,3.5vw,16px)",color:C.muted,marginTop:4}}>days of us</p>
    </motion.div>
  );
}

const COMPLIMENTS=[
  "you are the most beautiful thing that has ever happened to me",
  "those legs have no business being that perfect",
  "your brain is genuinely one of the most attractive things about you",
  "the way you carry yourself makes people stop and stare",
  "you are so clean and put together it does things to me",
  "your smile rewrites whatever sentence I was in the middle of",
  "I am so lucky and I know it every single day",
  "you are the kind of woman people write songs about",
  "your laugh is my favourite sound in the entire world",
  "you are not just beautiful, you are breathtaking",
];

function SurpriseBtn() {
  const [shown,setShown]=useState(null);
  const [visible,setVisible]=useState(false);
  const fire=()=>{
    const c=COMPLIMENTS[Math.floor(Math.random()*COMPLIMENTS.length)];
    setShown(c);setVisible(true);setTimeout(()=>setVisible(false),3500);
  };
  return (
    <>
      <motion.button onClick={fire} whileHover={{scale:1.06}} whileTap={{scale:.92}}
        style={{width:"100%",padding:"16px 0",borderRadius:60,background:"transparent",
          border:`1.5px solid ${C.gold}`,color:C.gold,
          fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(16px,4vw,19px)",letterSpacing:3,
          boxShadow:`0 0 20px ${C.gold}33`,marginBottom:12}}>
        surprise me
      </motion.button>
      <AnimatePresence>
        {visible&&shown&&(
          <motion.div initial={{opacity:0,scale:.8,y:20}} animate={{opacity:1,scale:1,y:0}}
            exit={{opacity:0,scale:.9,y:-10}} transition={{duration:.5,type:"spring"}}
            style={{position:"fixed",inset:0,zIndex:600,display:"flex",alignItems:"center",
              justifyContent:"center",background:"rgba(13,8,16,.92)",padding:32,textAlign:"center"}}
            onClick={()=>setVisible(false)}>
            <div>
              <motion.div animate={{scale:[1,1.15,1]}} transition={{repeat:Infinity,duration:1.5}}
                style={{fontSize:44,marginBottom:20}}>✨</motion.div>
              <motion.p initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:.2}}
                style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",
                  fontSize:"clamp(22px,6vw,40px)",color:C.white,lineHeight:1.3,maxWidth:480,
                  textShadow:`0 0 40px ${C.blush}88`}}>{shown}</motion.p>
              <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.8}}
                style={{fontFamily:"'Dancing Script',cursive",fontSize:16,color:C.blush,marginTop:20}}>
                tap anywhere to close
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

const MOODS=[
  {emoji:"😊",label:"happy",response:"That smile of yours is already the best thing about today. Keep glowing baby girl, you deserve every bit of joy you feel right now."},
  {emoji:"😔",label:"sad",response:"Hey. Come here. Whatever it is, it will pass. You are stronger than you know and I am right here. Talk to me okay? I am not going anywhere."},
  {emoji:"😍",label:"in love",response:"Good. Because I am completely, embarrassingly, obviously in love with you too. You have no idea what you do to me."},
  {emoji:"😤",label:"annoyed",response:"Okay take a breath. You are a gangster, remember? Handle it. And if you need to vent, I am listening. All of it."},
  {emoji:"😴",label:"tired",response:"Rest then. You work hard and you deserve to rest. But before you sleep, know that someone is thinking about you right now."},
  {emoji:"🥰",label:"loved",response:"Good. You should feel loved. Because you are. Completely. Every single day, by me."},
  {emoji:"🤒",label:"sick",response:"Oh no baby. Go lie down right now. Drink water, eat something warm, rest. I wish I was there to take care of you properly. Feel better soon please, I need you well."},
];

function MoodCheckin() {
  const [picked,setPicked]=useState(null);
  const [show,setShow]=useState(false);
  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.8}}
      style={{width:"100%",marginBottom:18,background:C.pink50,
        border:`1px solid ${C.blush}22`,borderRadius:20,padding:"20px 16px",textAlign:"center"}}>
      <p style={{fontFamily:"'Dancing Script',cursive",fontSize:"clamp(16px,4vw,20px)",
        color:C.blush,marginBottom:16}}>how are you feeling today baby?</p>
      <div style={{display:"flex",justifyContent:"center",flexWrap:"wrap",gap:10,marginBottom:12}}>
        {MOODS.map(m=>(
          <motion.button key={m.emoji} onClick={()=>{setPicked(m);setShow(true);}}
            whileHover={{scale:1.2}} whileTap={{scale:.9}}
            style={{fontSize:"clamp(22px,5vw,28px)",background:"transparent",border:"none",
              cursor:"pointer",filter:picked?.emoji===m.emoji?"none":"grayscale(.3)"}}>
            {m.emoji}
          </motion.button>
        ))}
      </div>
      <AnimatePresence>
        {show&&picked&&(
          <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}}
            exit={{opacity:0,height:0}} transition={{duration:.4}}>
            <p style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",
              fontSize:"clamp(13px,3.5vw,16px)",color:C.white,lineHeight:1.7,
              borderTop:`1px solid ${C.blush}22`,paddingTop:14,marginTop:8}}>
              {picked.response}
            </p>
            <p style={{fontFamily:"'Dancing Script',cursive",fontSize:14,color:C.blush,marginTop:8}}>Chimbubu</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const NAV_ITEMS=[
  {id:"letter",label:"Love Letter",icon:"💌",color:C.blush,sub:"open and read"},
  {id:"notes",label:"Notes to You",icon:"📝",color:C.lavender,sub:"from Chimbubu"},
  {id:"gallery",label:"Our Gallery",icon:"🌸",color:C.rose,sub:"flowers and us"},
  {id:"love",label:"Why I Love You",icon:"♡",color:C.gold,sub:"every single reason"},
  {id:"physical",label:"What You Do to Me",icon:"✨",color:C.lavender,sub:"honest and real"},
  {id:"hours24",label:"24 Hours With You",icon:"☽",color:C.cream,sub:"a perfect day"},
  {id:"game",label:"Love Game",icon:"💗",color:C.blushDeep,sub:"how much do you love me?"},
  {id:"herlikes",label:"Things She Loves",icon:"🍇",color:C.lavender,sub:"all her favourite things"},
  {id:"quiz",label:"How Well Do You Know Me?",icon:"💭",color:C.gold,sub:"take the quiz"},
];

function Home({onNav}) {
  const words=["beautiful","magnetic","my favourite person","everything","my heart"];
  const [wIdx,setWIdx]=useState(0);
  useEffect(()=>{const t=setInterval(()=>setWIdx(i=>(i+1)%words.length),2400);return()=>clearInterval(t);},[]);
  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",
        padding:"80px 20px 110px",position:"relative",zIndex:10}}>
      <div style={{position:"absolute",inset:0,
        background:`radial-gradient(ellipse 90% 50% at 50% 20%, rgba(244,167,195,.14) 0%, transparent 70%)`,
        pointerEvents:"none"}}/>
      <motion.div initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}} transition={{delay:.2}}
        style={{textAlign:"center",marginBottom:28}}>
        <motion.span animate={{scale:[1,1.22,1]}} transition={{repeat:Infinity,duration:1.8}}
          style={{fontSize:42,display:"block",marginBottom:14}}>♡</motion.span>
        <p style={{fontSize:"clamp(9px,2.2vw,11px)",letterSpacing:6,color:C.blush,
          fontFamily:"'Inter',sans-serif",fontWeight:300,marginBottom:10,textTransform:"uppercase"}}>
          made just for
        </p>
        <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(42px,11vw,80px)",
          fontWeight:300,color:C.white,lineHeight:.95,textShadow:`0 0 60px ${C.blush}77`}}>Chioma</h1>
        <div style={{width:80,height:1,background:`linear-gradient(90deg,transparent,${C.blush},transparent)`,margin:"12px auto 14px"}}/>
        <div style={{height:28,overflow:"hidden"}}>
          <AnimatePresence mode="wait">
            <motion.p key={wIdx} initial={{y:22,opacity:0}} animate={{y:0,opacity:1}}
              exit={{y:-22,opacity:0}} transition={{duration:.4}}
              style={{fontFamily:"'Dancing Script',cursive",fontSize:"clamp(16px,4vw,21px)",color:C.lavender,margin:0}}>
              you are {words[wIdx]}
            </motion.p>
          </AnimatePresence>
        </div>
      </motion.div>
      <div style={{width:"100%",maxWidth:440}}>
        <Countdown/><MoodCheckin/><SurpriseBtn/>
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12,marginTop:4}}>
          {NAV_ITEMS.map((item,i)=>(
            <motion.button key={item.id}
              initial={{opacity:0,y:22}} animate={{opacity:1,y:0}} transition={{delay:.4+i*.08}}
              onClick={()=>onNav(item.id)} whileTap={{scale:.94}}
              style={{borderRadius:20,padding:"20px 14px",
                background:`linear-gradient(135deg,${item.color}12,${item.color}05)`,
                border:`1px solid ${item.color}33`,
                display:"flex",flexDirection:"column",alignItems:"center",gap:7,
                cursor:"pointer",boxShadow:`0 4px 20px ${item.color}15`}}>
              <motion.span animate={{scale:[1,1.1,1]}}
                transition={{repeat:Infinity,duration:2.5+i*.3,delay:i*.35}}
                style={{fontSize:"clamp(24px,6vw,30px)"}}>{item.icon}</motion.span>
              <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(13px,3.5vw,16px)",
                color:C.white,margin:0,fontWeight:400,lineHeight:1.2,textAlign:"center"}}>{item.label}</p>
              <p style={{fontSize:"clamp(8px,2vw,10px)",color:item.color,fontFamily:"'Inter',sans-serif",
                fontWeight:300,letterSpacing:1.5,textTransform:"uppercase",margin:0}}>{item.sub}</p>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ── LOVE LETTER ───────────────────────────────────────────────────────────
const LETTER=[
  {type:"greeting",text:"My Chioma,"},
  {type:"space"},
  {type:"p",text:"Okay so I am just going to say it. Hi."},
  {type:"space"},
  {type:"p",text:"I did not plan this. I was doing quite fine before I decided to try again with you, despite the whole other time it did not work out and everything, and I am really glad we are together."},
  {type:"space"},
  {type:"p",text:"You are so intellectual it is honestly unfair. We can sit and have a real conversation, the kind that goes places, the kind where I forget time exists. That does not happen with everyone. It does not even happen with most people. It happens with you."},
  {type:"space"},
  {type:"p",text:"And then on top of all of that, you look the way you look. Which is something I am still not fully over. Your shape. The way you carry yourself. The way your legs exist. You are genuinely so beautiful that I sometimes lose track of my thoughts around you and have to restart."},
  {type:"space"},
  {type:"p",text:"I love how clean you are. I love how you take care of yourself. I love that your energy is warm and your behavior is kind and your confidence is quiet but so present. All of it. Every single part."},
  {type:"space"},
  {type:"p",text:"We are getting better every day. I feel it. More real, more open, more us. I want to keep getting better with you. I want to still be choosing you when this has been going on so long we have lost count."},
  {type:"space"},
  {type:"p",text:"Please do not hurt me. I am trusting you with something real here. And please stay. Not because you have to. Because you want to. Because this is worth it. Because I am worth it and you are worth it and we are worth it."},
  {type:"space"},
  {type:"p",text:"I love you, Chioma. Not the idea of you. You. All of you. Every single day."},
  {type:"space"},
  {type:"sign",text:"Yours always,\nChimbubu"},
];

function LoveLetter({onBack}) {
  const [open,setOpen]=useState(false);
  const [revealed,setRevealed]=useState(0);
  const [showHearts,setShowHearts]=useState(false);
  useEffect(()=>{
    if(!open) return;
    setShowHearts(true);
    const t=setInterval(()=>setRevealed(r=>{if(r>=LETTER.length-1){clearInterval(t);return r;}return r+1;}),380);
    return()=>clearInterval(t);
  },[open]);
  return (
    <Section onBack={onBack} color={C.blush}>
      <WingedHearts active={showHearts}/>
      <div style={{width:"100%",maxWidth:520}}>
        <p style={{textAlign:"center",fontSize:"clamp(9px,2.2vw,11px)",letterSpacing:5,color:C.blush,
          fontFamily:"'Inter',sans-serif",marginBottom:8,textTransform:"uppercase"}}>a letter for you</p>
        <h2 style={{textAlign:"center",fontFamily:"'Cormorant Garamond',serif",
          fontSize:"clamp(26px,6vw,42px)",color:C.white,fontWeight:300,marginBottom:30}}>Open My Heart</h2>
        <AnimatePresence mode="wait">
          {!open?(
            <motion.div key="closed" initial={{opacity:0}} animate={{opacity:1}} style={{textAlign:"center"}}>
              <motion.div animate={{y:[0,-10,0],rotate:[-3,3,-3]}} transition={{repeat:Infinity,duration:3,ease:"easeInOut"}}
                style={{fontSize:80,marginBottom:20,cursor:"pointer",display:"inline-block"}} onClick={()=>setOpen(true)}>📜</motion.div>
              <p style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",
                fontSize:"clamp(14px,3.5vw,18px)",color:C.muted,marginBottom:28}}>tap the scroll to open your letter</p>
              <motion.button onClick={()=>setOpen(true)} whileHover={{scale:1.06}} whileTap={{scale:.93}}
                style={{padding:"14px 44px",borderRadius:60,background:"transparent",
                  border:`1.5px solid ${C.blush}`,color:C.blush,
                  fontFamily:"'Cormorant Garamond',serif",fontSize:18,letterSpacing:3,
                  boxShadow:`0 0 24px ${C.blush}33`}}>Open</motion.button>
            </motion.div>
          ):(
            <motion.div key="open" initial={{opacity:0,scaleY:.4}} animate={{opacity:1,scaleY:1}} transition={{duration:.6}}
              style={{background:"linear-gradient(160deg,rgba(253,246,227,.09),rgba(244,167,195,.07))",
                border:`1px solid ${C.blush}33`,borderRadius:24,padding:"32px 26px",position:"relative",overflow:"hidden",
                backgroundImage:"repeating-linear-gradient(0deg,transparent,transparent 27px,rgba(244,167,195,.12) 27px,rgba(244,167,195,.12) 28px)"}}>
              <div style={{position:"absolute",left:44,top:0,bottom:0,width:1,background:"rgba(232,96,122,.15)",pointerEvents:"none"}}/>
              {LETTER.slice(0,revealed+1).map((line,i)=>(
                <motion.div key={i} initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} transition={{duration:.5}}>
                  {line.type==="space"?<div style={{height:14}}/>:
                   line.type==="greeting"?<p style={{fontSize:"clamp(20px,5vw,26px)",color:C.blush,fontFamily:"'Dancing Script',cursive",marginBottom:6}}>{line.text}</p>:
                   line.type==="sign"?<p style={{fontSize:"clamp(18px,4.5vw,22px)",color:C.blush,fontFamily:"'Dancing Script',cursive",whiteSpace:"pre-line",marginTop:8}}>{line.text}</p>:
                   <p style={{fontSize:"clamp(13px,3.5vw,15px)",color:C.white,lineHeight:1.85,fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic"}}>{line.text}</p>}
                </motion.div>
              ))}
              {revealed<LETTER.length-1&&(
                <motion.span animate={{opacity:[1,0]}} transition={{repeat:Infinity,duration:.7}}
                  style={{color:C.blush,fontFamily:"'Dancing Script',cursive",fontSize:22}}>|</motion.span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Section>
  );
}

// ── NOTES ─────────────────────────────────────────────────────────────────
const NOTES=[
  {icon:"🌸",text:"You are genuinely the most beautiful woman I have ever been close to. Not in a way that is easy to say. In a way that I notice every single time you exist near me. Your shape, your face, the way you carry all of it. You are something else.",color:C.blush},
  {icon:"✨",text:"Your mind does things to me that your body has competition for. The way you think, the way you hold a conversation, the way you say something that stops me completely. You are brilliant and I am obsessed with it.",color:C.lavender},
  {icon:"🔥",text:"The way you look in anything. The way those legs go on forever. The way your figure is shaped like someone designed it specifically to ruin my focus. You walk into a room and I forget what I was doing. Every time.",color:C.rose},
  {icon:"💫",text:"You are so clean, so put together, so deliberate in how you present yourself. It is one of the most attractive things about you and it tells me everything about who you are on the inside too.",color:C.gold},
  {icon:"🤍",text:"I am so drawn to you it is almost inconvenient. I think about you at the wrong times, in the middle of things that have nothing to do with you, and there you are. Your smile. Your voice. The way you look when you laugh. I cannot get rid of you and I do not want to.",color:C.blush},
  {icon:"💌",text:"You deserve to be loved loudly, completely, and without conditions. That is exactly what you have. You are adored, Chioma. Deeply, embarrassingly, completely adored.",color:C.lavender,special:true},
];

function Notes({onBack}) {
  return (
    <Section onBack={onBack} color={C.lavender}>
      <div style={{width:"100%",maxWidth:500}}>
        <p style={{textAlign:"center",fontSize:"clamp(9px,2.2vw,11px)",letterSpacing:5,color:C.lavender,
          fontFamily:"'Inter',sans-serif",marginBottom:8,textTransform:"uppercase"}}>notes for you</p>
        <h2 style={{textAlign:"center",fontFamily:"'Cormorant Garamond',serif",
          fontSize:"clamp(26px,6vw,42px)",color:C.white,fontWeight:300,marginBottom:8}}>From Chimbubu</h2>
        <p style={{textAlign:"center",fontFamily:"'Dancing Script',cursive",
          fontSize:"clamp(14px,3.5vw,17px)",color:C.muted,marginBottom:32,fontStyle:"italic"}}>
          things I need you to know and do
        </p>
        <div style={{display:"flex",flexDirection:"column",gap:11}}>
          {NOTES.map((note,i)=>(
            <motion.div key={i} initial={{opacity:0,x:-22}} animate={{opacity:1,x:0}} transition={{delay:i*.1}}
              style={{borderRadius:18,
                background:note.special?`linear-gradient(135deg,rgba(244,167,195,.18),rgba(200,168,233,.14))`:`rgba(255,255,255,.03)`,
                border:`1px solid ${note.color}33`,padding:"16px 20px",
                boxShadow:note.special?`0 4px 24px ${C.blush}22`:"none"}}>
              <div style={{display:"flex",gap:14,alignItems:"flex-start"}}>
                <span style={{fontSize:22,flexShrink:0,marginTop:2}}>{note.icon}</span>
                <p style={{fontFamily:note.special?"'Dancing Script',cursive":"'Cormorant Garamond',serif",
                  fontSize:note.special?"clamp(15px,4vw,19px)":"clamp(14px,3.5vw,17px)",
                  color:note.special?C.blush:C.white,margin:0,lineHeight:1.55,
                  fontStyle:note.special?"normal":"italic"}}>{note.text}</p>
              </div>
            </motion.div>
          ))}
        </div>
        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.9}}
          style={{marginTop:26,textAlign:"center",padding:"20px 24px",
            background:C.pink50,border:`1px solid ${C.lavender}22`,borderRadius:20}}>
          <p style={{fontSize:"clamp(9px,2vw,10px)",letterSpacing:4,color:C.lavender,
            fontFamily:"'Inter',sans-serif",marginBottom:12,textTransform:"uppercase"}}>daily affirmations</p>
          {["you are loved","you are enough","you are mine"].map((a,i)=>(
            <motion.p key={i} animate={{opacity:[.5,1,.5]}} transition={{repeat:Infinity,duration:3,delay:i*1}}
              style={{fontFamily:"'Dancing Script',cursive",fontSize:"clamp(16px,4vw,19px)",color:C.white,margin:"4px 0"}}>{a}</motion.p>
          ))}
        </motion.div>
      </div>
    </Section>
  );
}

// ── GALLERY ───────────────────────────────────────────────────────────────
function AnimatedFlower({x,y,size,color,delay,rotation}) {
  return (
    <div style={{position:"absolute",left:`${x}%`,top:`${y}%`,width:size,height:size,
      transform:`rotate(${rotation}deg)`,animation:`breathe ${3+Math.random()*2}s ${delay}s ease-in-out infinite`}}>
      {Array.from({length:6},(_,i)=>(
        <div key={i} style={{position:"absolute",width:"40%",height:"55%",left:"30%",top:"5%",
          background:`radial-gradient(ellipse at bottom, ${color}ee, ${color}55)`,
          borderRadius:"50% 50% 50% 50% / 60% 60% 40% 40%",transformOrigin:"50% 100%",
          transform:`rotate(${(i/6)*360}deg)`,
          animation:`petalSway ${2+i*.3}s ${delay+i*.2}s ease-in-out infinite`,
          filter:`drop-shadow(0 0 4px ${color}66)`}}/>
      ))}
      <div style={{position:"absolute",left:"35%",top:"35%",width:"30%",height:"30%",borderRadius:"50%",
        background:`radial-gradient(circle,${C.gold},${C.gold}88)`,
        animation:`glowPulse 2s ${delay}s ease-in-out infinite`,zIndex:2}}/>
    </div>
  );
}
const FLOWERS_DATA=[
  {x:10,y:15,size:90,color:"#f4a7c3",delay:0,rotation:15},
  {x:55,y:8,size:70,color:"#c8a8e9",delay:.5,rotation:-10},
  {x:80,y:20,size:80,color:"#ffb6c1",delay:.3,rotation:25},
  {x:25,y:55,size:65,color:"#dda0dd",delay:.8,rotation:-20},
  {x:65,y:50,size:85,color:"#f4a7c3",delay:.2,rotation:5},
  {x:5,y:70,size:75,color:"#c8a8e9",delay:.6,rotation:30},
  {x:45,y:72,size:60,color:"#ffb6c1",delay:.4,rotation:-15},
  {x:85,y:68,size:70,color:"#dda0dd",delay:.9,rotation:20},
];
const US_PHOTOS=[
  {url:"/us1.jpg",label:"us"},
  {url:"/us2.jpg",label:"our moment"},
  {url:"/us3.jpg",label:"my favourite"},
  {url:"/us4.jpg",label:"us always"},
];

function Gallery({onBack}) {
  const [confetti,setConfetti]=useState(false);
  const [showHeart,setShowHeart]=useState(false);
  const [heartDone,setHeartDone]=useState(false);
  const [tab,setTab]=useState("flowers");
  const [selected,setSelected]=useState(null);
  useEffect(()=>{
    setConfetti(true);setTimeout(()=>setShowHeart(true),500);
    setTimeout(()=>{setHeartDone(true);setConfetti(false);},4200);
  },[]);
  return (
    <Section onBack={onBack} color={C.rose}>
      <Confetti active={confetti}/>
      <AnimatePresence>
        {showHeart&&!heartDone&&(
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0,scale:1.3,filter:"blur(20px)"}}
            style={{position:"fixed",inset:0,zIndex:700,display:"flex",flexDirection:"column",
              alignItems:"center",justifyContent:"center",background:"rgba(13,8,16,.96)",textAlign:"center",padding:24}}>
            <motion.div animate={{scale:[1,1.22,1]}} transition={{repeat:Infinity,duration:1.1}}
              style={{fontSize:"clamp(70px,18vw,120px)",marginBottom:18,lineHeight:1,color:C.blush}}>♡</motion.div>
            <motion.h2 initial={{opacity:0,y:22}} animate={{opacity:1,y:0}} transition={{delay:.4}}
              style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(26px,7vw,52px)",
                color:C.white,fontWeight:300,textShadow:`0 0 60px ${C.blush}`}}>i love you so muchhhh</motion.h2>
            <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1}}
              style={{fontFamily:"'Dancing Script',cursive",fontSize:"clamp(16px,4vw,22px)",color:C.blush,marginTop:10}}>Chimbubu</motion.p>
            <motion.button initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1.8}}
              onClick={()=>setHeartDone(true)} whileTap={{scale:.94}}
              style={{marginTop:30,padding:"12px 36px",borderRadius:60,background:"transparent",
                border:`1.5px solid ${C.blush}`,color:C.blush,
                fontFamily:"'Cormorant Garamond',serif",fontSize:17,letterSpacing:3,cursor:"pointer"}}>
              see your flowers
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {selected&&(
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            onClick={()=>setSelected(null)}
            style={{position:"fixed",inset:0,zIndex:800,background:"rgba(10,5,14,.97)",
              display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
            <motion.div initial={{scale:.8}} animate={{scale:1}} exit={{scale:.8}}
              onClick={e=>e.stopPropagation()}
              style={{maxWidth:480,width:"100%",borderRadius:24,overflow:"hidden",border:`1px solid ${C.blush}33`}}>
              <img src={selected.url} alt={selected.label}
                style={{width:"100%",display:"block",maxHeight:"70vh",objectFit:"cover"}}/>
              <div style={{padding:"14px 20px",background:"rgba(20,10,24,.95)",textAlign:"center"}}>
                <p style={{fontFamily:"'Dancing Script',cursive",fontSize:22,color:C.blush,margin:0}}>{selected.label}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div style={{width:"100%",maxWidth:520}}>
        <p style={{textAlign:"center",fontSize:"clamp(9px,2.2vw,11px)",letterSpacing:5,color:C.rose,
          fontFamily:"'Inter',sans-serif",marginBottom:8,textTransform:"uppercase"}}>our gallery</p>
        <h2 style={{textAlign:"center",fontFamily:"'Cormorant Garamond',serif",
          fontSize:"clamp(26px,6vw,42px)",color:C.white,fontWeight:300,marginBottom:24}}>Beautiful Things</h2>
        <div style={{display:"flex",gap:10,marginBottom:24,justifyContent:"center"}}>
          {["flowers","us"].map(t=>(
            <motion.button key={t} onClick={()=>setTab(t)} whileTap={{scale:.94}}
              style={{padding:"10px 26px",borderRadius:30,cursor:"pointer",
                background:tab===t?`rgba(244,167,195,.18)`:"transparent",
                border:`1px solid ${tab===t?C.blush:C.blush+"33"}`,color:tab===t?C.blush:C.muted,
                fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(14px,3.5vw,16px)",letterSpacing:2,transition:"all .3s"}}>
              {t==="flowers"?"🌸 Flowers":"🤍 Us"}
            </motion.button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          {tab==="flowers"?(
            <motion.div key="flowers" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
              <div style={{position:"relative",height:"clamp(380px,85vw,520px)",
                background:`rgba(244,167,195,.04)`,borderRadius:24,border:`1px solid ${C.blush}22`,overflow:"hidden"}}>
                {FLOWERS_DATA.map((f,i)=><AnimatedFlower key={i} {...f}/>)}
                <div style={{position:"absolute",inset:0,
                  background:`radial-gradient(ellipse 60% 60% at 50% 50%, rgba(244,167,195,.12) 0%, transparent 70%)`,
                  pointerEvents:"none"}}/>
              </div>
              <p style={{textAlign:"center",fontFamily:"'Dancing Script',cursive",
                fontSize:"clamp(14px,3.5vw,17px)",color:C.muted,marginTop:14,fontStyle:"italic"}}>
                these flowers are always in bloom, just like us
              </p>
            </motion.div>
          ):(
            <motion.div key="us" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
              <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12}}>
                {US_PHOTOS.map((p,i)=>(
                  <motion.div key={i} initial={{opacity:0,scale:.9}} animate={{opacity:1,scale:1}}
                    transition={{delay:i*.1}} whileTap={{scale:.96}} onClick={()=>p.url&&setSelected(p)}
                    style={{borderRadius:16,overflow:"hidden",border:`1px solid ${C.blush}33`,
                      position:"relative",aspectRatio:"1",cursor:"pointer",background:`rgba(244,167,195,.04)`}}>
                    <img src={p.url} alt={p.label}
                      style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}
                      onError={e=>{e.target.style.display="none";}}/>
                    <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",
                      alignItems:"center",justifyContent:"center",gap:6}}>
                      <span style={{fontSize:28,opacity:.35}}>🤍</span>
                      <p style={{fontFamily:"'Dancing Script',cursive",fontSize:14,color:C.blush,opacity:.5,margin:0}}>{p.label}</p>
                    </div>
                    <div style={{position:"absolute",bottom:0,left:0,right:0,
                      background:"linear-gradient(to top,rgba(13,8,16,.8),transparent)",padding:"14px 12px 10px",textAlign:"center"}}>
                      <p style={{fontFamily:"'Dancing Script',cursive",fontSize:"clamp(13px,3.5vw,15px)",color:C.blushLight,margin:0}}>{p.label}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Section>
  );
}

// ── WHY I LOVE YOU ────────────────────────────────────────────────────────
const LOVE_CARDS=[
  {f:"Your Mind",b:"You think in ways that stop me mid sentence. The depth in you is genuinely one of the most attractive things I have ever encountered."},
  {f:"Your Body",b:"The way you are shaped. Your figure. Those legs. You are breathtakingly beautiful and I find it very hard to pretend I do not notice constantly."},
  {f:"How Clean You Are",b:"You carry yourself with a refinement that tells me everything about your character. It shows in how you present yourself, your energy, everything."},
  {f:"Your Behavior",b:"The way you handle situations. The way you treat people. The quiet class in everything you do. That is not taught. That is just you."},
  {f:"That We Talk",b:"Real conversations with actual depth. The kind you do not get everywhere. I could talk to you forever and still want more."},
  {f:"How You Carry Yourself",b:"There is a grace to you. A presence. You walk into a room and the whole energy shifts. You do not try. You just are."},
  {f:"Your Laugh",b:"I do ridiculous things just to hear it. It is my favourite sound in the entire world."},
  {f:"That We Keep Growing",b:"Every day something between us deepens. We are becoming more. I want to keep becoming more with you."},
];
function FlipCard({card,delay}) {
  const [flipped,setFlipped]=useState(false);
  return (
    <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay}}
      onClick={()=>setFlipped(f=>!f)} style={{perspective:900,cursor:"pointer",height:"clamp(120px,28vw,148px)"}}>
      <motion.div animate={{rotateY:flipped?180:0}} transition={{duration:.65,ease:[.22,1,.36,1]}}
        style={{width:"100%",height:"100%",position:"relative",transformStyle:"preserve-3d"}}>
        <div style={{position:"absolute",inset:0,backfaceVisibility:"hidden",borderRadius:16,
          background:"rgba(200,168,233,.08)",border:`1px solid ${C.lavender}33`,
          display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8,padding:"0 12px"}}>
          <motion.span animate={{scale:[1,1.15,1]}} transition={{repeat:Infinity,duration:2.5}}
            style={{fontSize:22,color:C.lavender}}>♡</motion.span>
          <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(12px,3vw,14px)",
            color:C.white,margin:0,textAlign:"center",lineHeight:1.3}}>{card.f}</p>
          <p style={{fontSize:9,color:C.faint,fontFamily:"'Inter',sans-serif",letterSpacing:2}}>TAP</p>
        </div>
        <div style={{position:"absolute",inset:0,backfaceVisibility:"hidden",transform:"rotateY(180deg)",
          borderRadius:16,background:"rgba(244,167,195,.1)",border:`1px solid ${C.blush}44`,
          display:"flex",alignItems:"center",justifyContent:"center",padding:14}}>
          <p style={{fontSize:"clamp(11px,2.8vw,13px)",color:C.white,fontFamily:"'Cormorant Garamond',serif",
            fontStyle:"italic",lineHeight:1.6,textAlign:"center",margin:0}}>{card.b}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
function LovePage({onBack}) {
  const [bflies,setBflies]=useState([]);
  const clicks=useRef(0);
  return (
    <Section onBack={onBack} color={C.gold}>
      <div style={{width:"100%",maxWidth:540}}
        onClick={()=>{clicks.current++;if(clicks.current>=5){clicks.current=0;setBflies(Array.from({length:22},(_,i)=>({id:Date.now()+i})));setTimeout(()=>setBflies([]),3200);}}}>
        <p style={{textAlign:"center",fontSize:"clamp(9px,2.2vw,11px)",letterSpacing:5,color:C.gold,
          fontFamily:"'Inter',sans-serif",marginBottom:8,textTransform:"uppercase"}}>why i love you</p>
        <h2 style={{textAlign:"center",fontFamily:"'Cormorant Garamond',serif",
          fontSize:"clamp(26px,6vw,42px)",color:C.white,fontWeight:300,marginBottom:8}}>Let me count the ways</h2>
        <p style={{textAlign:"center",fontSize:"clamp(12px,3vw,13px)",color:C.muted,
          fontStyle:"italic",marginBottom:26}}>flip each card and tap the background 5 times for a surprise</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:11}}>
          {LOVE_CARDS.map((c,i)=><FlipCard key={i} card={c} delay={i*.07}/>)}
        </div>
      </div>
      {bflies.map(b=>(
        <motion.div key={b.id}
          initial={{opacity:0,x:"46vw",y:"50vh",scale:0}}
          animate={{opacity:[0,1,1,0],x:`${20+Math.random()*60}vw`,y:`${5+Math.random()*65}vh`,scale:[0,1.5,1.2,0]}}
          transition={{duration:2.8}}
          style={{position:"fixed",fontSize:26,zIndex:200,pointerEvents:"none"}}>🦋</motion.div>
      ))}
    </Section>
  );
}

// ── PHYSICAL ──────────────────────────────────────────────────────────────
const PHYSICAL_ITEMS=[
  {icon:"✦",title:"The way you are shaped",text:"I notice everything. Your figure, the curve of you, the way everything about your body is exactly what it should be. You are shaped like something someone dreamed up. And you walk around in it like it is nothing."},
  {icon:"♡",title:"Those legs",text:"I am going to be honest with you. Your legs have no business being that long and that perfect. I notice them every single time. I cannot help it and I stopped trying."},
  {icon:"◈",title:"How you carry yourself",text:"The confidence in the way you move. The way you walk into a space and your body just knows it belongs there. That ease, that grace, that quiet authority you have over a room without even trying."},
  {icon:"✧",title:"How clean and put together you are",text:"Everything about how you present yourself is deliberate and beautiful. You take care of yourself and it shows. Your energy is clean and your presence is warm and it draws people to you without you doing a single thing."},
  {icon:"☽",title:"The whole of you together",text:"Your face. Your eyes. Your smile. Your shape. All of it together is a combination that makes it genuinely difficult to think clearly when you are around. You are beautiful in a way that stays."},
];
function PhysicalPage({onBack}) {
  const [active,setActive]=useState(null);
  return (
    <Section onBack={onBack} color={C.lavender}>
      <div style={{width:"100%",maxWidth:520}}>
        <p style={{textAlign:"center",fontSize:"clamp(9px,2.2vw,11px)",letterSpacing:5,color:C.lavender,
          fontFamily:"'Inter',sans-serif",marginBottom:8,textTransform:"uppercase"}}>what you do to me</p>
        <h2 style={{textAlign:"center",fontFamily:"'Cormorant Garamond',serif",
          fontSize:"clamp(26px,6vw,42px)",color:C.white,fontWeight:300,marginBottom:8}}>Your Beauty, Chioma</h2>
        <p style={{textAlign:"center",fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",
          fontSize:"clamp(13px,3.5vw,16px)",color:C.muted,marginBottom:32}}>honest, real, and completely true</p>
        {PHYSICAL_ITEMS.map((item,i)=>(
          <motion.div key={i} initial={{opacity:0,y:18}} animate={{opacity:1,y:0}}
            transition={{delay:i*.1}} onClick={()=>setActive(active===i?null:i)}
            style={{marginBottom:11,borderRadius:14,cursor:"pointer",
              border:`1px solid ${C.lavender}${active===i?"66":"22"}`,
              background:active===i?"rgba(200,168,233,.09)":"rgba(255,255,255,.02)",
              padding:"16px 20px",boxShadow:active===i?`0 0 22px ${C.lavender}22`:"none"}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <motion.span animate={{scale:active===i?[1,1.2,1]:1}} transition={{duration:.4}}
                style={{color:C.lavender,fontSize:18,flexShrink:0}}>{item.icon}</motion.span>
              <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(15px,3.8vw,17px)",
                color:C.white,margin:0,flex:1}}>{item.title}</p>
              <motion.span animate={{rotate:active===i?180:0}}
                style={{color:C.lavender,fontSize:12,flexShrink:0}}>▾</motion.span>
            </div>
            <AnimatePresence>
              {active===i&&(
                <motion.p initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}}
                  exit={{opacity:0,height:0}} transition={{duration:.4}}
                  style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",
                    fontSize:"clamp(13px,3.2vw,15px)",color:C.muted,lineHeight:1.75,
                    margin:"12px 0 0",paddingTop:12,borderTop:`1px solid ${C.lavender}22`}}>
                  {item.text}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

// ── 24 HOURS ──────────────────────────────────────────────────────────────
const HOURS=[
  {time:"7:00 AM",scene:"Morning",emoji:"🌅",text:"I wake up and you are the first thought. Not a conscious choice. You just appear. Your face, your voice, the warmth of you. I lie there for a few minutes just thinking about you before the day starts. This happens every morning."},
  {time:"9:00 AM",scene:"Breakfast",emoji:"☕",text:"We make something to eat and the kitchen is warm and you are standing there in whatever you are wearing and I keep losing track of what I was doing. You reach past me for something and I catch your scent and I have to remember how to act normal. You probably notice. You say nothing. That smile though."},
  {time:"11:00 AM",scene:"Just Us",emoji:"💬",text:"We talk for hours. Real conversation. The kind where I forget time is a thing that exists. You say something smart and I look at you and think about how unfair it is that you are this beautiful AND this intelligent. You did not have to do all of that. And yet."},
  {time:"1:00 PM",scene:"Afternoon Walk",emoji:"🌸",text:"We walk somewhere with no plan and your hand is in mine and every few steps I glance at you. The way you move. The way your body exists in space. The way the light lands on you. I am supposed to be looking at where we are going but honestly I am mostly looking at you and I have zero regrets about it."},
  {time:"3:00 PM",scene:"Close",emoji:"🌡",text:"We are sitting together, close, the way you get when there is nowhere else you would rather be. Your leg against mine. The air between us has a temperature. Everything feels deliberate and slow and I am very aware of every inch of you."},
  {time:"5:30 PM",scene:"Golden Hour",emoji:"🌇",text:"The light is doing something to your skin that I will think about for days. You are talking and I am watching your mouth move and catching maybe half the words because the other half of my attention is occupied with how beautiful you are right now specifically. In this light. In this moment."},
  {time:"8:00 PM",scene:"Dinner",emoji:"🍽",text:"We eat and talk and somewhere in the middle of it you laugh at something and throw your head back and I stop eating completely. Just watch. Your throat. Your smile. The way joy lives on your face. I am so gone for you it should be embarrassing. It is not."},
  {time:"11:00 PM",scene:"End of Day",emoji:"🌙",text:"The day is winding down and we are close and I look at you and feel something I do not have the right word for. Bigger than lucky. Bigger than grateful. You are here. You chose this. You chose me. I will spend a very long time making sure you never regret that. I love you Chioma. Every version of you. Every day."},
];
function Hours24({onBack}) {
  const [active,setActive]=useState(null);
  return (
    <Section onBack={onBack} color={C.cream}>
      <div style={{width:"100%",maxWidth:520}}>
        <p style={{textAlign:"center",fontSize:"clamp(9px,2.2vw,11px)",letterSpacing:5,color:C.gold,
          fontFamily:"'Inter',sans-serif",marginBottom:8,textTransform:"uppercase"}}>a perfect day</p>
        <h2 style={{textAlign:"center",fontFamily:"'Cormorant Garamond',serif",
          fontSize:"clamp(26px,6vw,42px)",color:C.white,fontWeight:300,marginBottom:8}}>24 Hours With You</h2>
        <p style={{textAlign:"center",fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",
          fontSize:"clamp(13px,3.5vw,16px)",color:C.muted,marginBottom:36}}>morning to night, exactly how I picture it</p>
        <div style={{position:"relative"}}>
          <div style={{position:"absolute",left:28,top:0,bottom:0,width:1,
            background:`linear-gradient(to bottom, transparent, ${C.gold}44, transparent)`,pointerEvents:"none"}}/>
          {HOURS.map((h,i)=>(
            <motion.div key={i} initial={{opacity:0,x:-24}} animate={{opacity:1,x:0}}
              transition={{delay:i*.1}} onClick={()=>setActive(active===i?null:i)}
              style={{display:"flex",gap:16,marginBottom:16,cursor:"pointer"}}>
              <div style={{flexShrink:0,width:56,height:56,borderRadius:"50%",
                background:active===i?`rgba(247,200,115,.18)`:`rgba(247,200,115,.06)`,
                border:`1px solid ${C.gold}${active===i?"77":"33"}`,
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,
                boxShadow:active===i?`0 0 18px ${C.gold}44`:"none",transition:"all .3s",zIndex:1}}>
                {h.emoji}
              </div>
              <motion.div style={{flex:1,background:active===i?"rgba(247,200,115,.06)":"rgba(255,255,255,.02)",
                border:`1px solid ${C.gold}${active===i?"44":"18"}`,borderRadius:16,padding:"14px 18px",transition:"all .3s"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                  <p style={{fontSize:10,letterSpacing:3,color:C.gold,fontFamily:"'Inter',sans-serif",margin:0,textTransform:"uppercase"}}>{h.time}</p>
                  <p style={{fontFamily:"'Dancing Script',cursive",fontSize:15,color:C.blush,margin:0}}>{h.scene}</p>
                </div>
                <AnimatePresence>
                  {active===i&&(
                    <motion.p initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}}
                      exit={{opacity:0,height:0}} transition={{duration:.4}}
                      style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",
                        fontSize:"clamp(13px,3.2vw,15px)",color:C.white,lineHeight:1.75,margin:0,paddingTop:8}}>
                      {h.text}
                    </motion.p>
                  )}
                </AnimatePresence>
                {active!==i&&(
                  <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(12px,3vw,14px)",
                    color:C.muted,margin:0,fontStyle:"italic"}}>{h.text.slice(0,60)}...</p>
                )}
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}

// ── LOVE GAME ─────────────────────────────────────────────────────────────
const FACE_BY_PROGRESS=(p)=>{
  if(p===0) return {face:"😢",label:"tap me gently",color:"#888"};
  if(p<50) return {face:"😴",label:"keep going...",color:C.muted};
  if(p<100) return {face:"🙂",label:"I can feel it",color:C.blush};
  if(p<150) return {face:"😊",label:"yes yes yes",color:C.lavender};
  if(p<180) return {face:"🥰",label:"almost there baby",color:C.gold};
  return {face:"😍",label:"YOU LOVE ME SO MUCH",color:C.rose};
};
function LoveGame({onBack}) {
  const [progress,setProgress]=useState(0);
  const [lives,setLives]=useState(3);
  const [dead,setDead]=useState(false);
  const [won,setWon]=useState(false);
  const [warning,setWarning]=useState(false);
  const [confetti,setConfetti]=useState(false);
  const [cracking,setCracking]=useState(false);
  const windowRef=useRef([]);
  const MAX=200;
  const {face,label,color}=FACE_BY_PROGRESS(progress);
  const barColor=()=>{
    if(progress<50) return "#888";if(progress<100) return C.blush;
    if(progress<150) return C.rose;if(progress<180) return C.gold;
    return `linear-gradient(90deg,${C.blush},${C.lavender},${C.gold},${C.rose},${C.blush})`;
  };
  const fullReset=()=>{setProgress(0);setLives(3);setDead(false);setWon(false);setCracking(false);setWarning(false);setConfetti(false);};
  const tap=()=>{
    if(dead||won) return;
    const now=Date.now();
    windowRef.current=[...windowRef.current.filter(t=>now-t<1000),now];
    const tps=windowRef.current.length;
    if(tps>6){
      setWarning(true);setTimeout(()=>setWarning(false),800);
      if(tps>9){setCracking(true);setTimeout(()=>{const nl=lives-1;setLives(nl);setProgress(0);setCracking(false);if(nl<=0)setDead(true);},600);return;}
      return;
    }
    const next=progress+1;setProgress(next);
    if(next>=MAX){setWon(true);setConfetti(true);setTimeout(()=>setConfetti(false),4000);}
  };
  const pct=Math.min((progress/MAX)*100,100);
  return (
    <Section onBack={onBack} color={C.blushDeep}>
      <Confetti active={confetti}/>
      <div style={{width:"100%",maxWidth:400,textAlign:"center"}}>
        <p style={{fontSize:"clamp(9px,2.2vw,11px)",letterSpacing:5,color:C.blushDeep,
          fontFamily:"'Inter',sans-serif",marginBottom:8,textTransform:"uppercase"}}>love game</p>
        <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(24px,6vw,38px)",
          color:C.white,fontWeight:300,marginBottom:6}}>How much do you love me?</h2>
        <p style={{fontFamily:"'Dancing Script',cursive",fontSize:"clamp(13px,3.5vw,16px)",
          color:C.muted,marginBottom:24}}>tap the heart gently to fill the bar</p>
        <div style={{display:"flex",justifyContent:"center",gap:8,marginBottom:24}}>
          {Array.from({length:3},(_,i)=>(
            <motion.span key={i} animate={{scale:i<lives?[1,1.15,1]:1}}
              transition={{repeat:i<lives?Infinity:0,duration:1.4,delay:i*.3}}
              style={{fontSize:22,filter:i<lives?"none":"grayscale(1) opacity(.3)"}}>💗</motion.span>
          ))}
        </div>
        <AnimatePresence mode="wait">
          {won?(
            <motion.div key="won" initial={{scale:0}} animate={{scale:1}} transition={{type:"spring"}}>
              <div style={{fontSize:"clamp(80px,20vw,120px)",marginBottom:16,animation:"heartbeat 1s ease-in-out infinite"}}>💋</div>
              <motion.h3 initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:.4}}
                style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(22px,5.5vw,34px)",
                  color:C.white,fontWeight:300,marginBottom:8}}>I love you too baby girl</motion.h3>
              <p style={{fontFamily:"'Dancing Script',cursive",fontSize:"clamp(16px,4vw,20px)",color:C.blush,marginBottom:24}}>Chimbubu</p>
              <motion.button onClick={fullReset} whileTap={{scale:.93}}
                style={{padding:"12px 32px",borderRadius:60,background:"transparent",
                  border:`1.5px solid ${C.blush}`,color:C.blush,
                  fontFamily:"'Cormorant Garamond',serif",fontSize:16,letterSpacing:3,cursor:"pointer"}}>play again</motion.button>
            </motion.div>
          ):dead?(
            <motion.div key="dead" initial={{opacity:0}} animate={{opacity:1}}>
              <div style={{fontSize:80,marginBottom:16}}>💔</div>
              <p style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",
                fontSize:"clamp(16px,4vw,20px)",color:C.muted,marginBottom:8}}>you are being too aggressive baby</p>
              <p style={{fontFamily:"'Dancing Script',cursive",fontSize:"clamp(14px,3.5vw,17px)",
                color:C.blush,marginBottom:24}}>try again gently this time</p>
              <motion.button onClick={fullReset} whileTap={{scale:.93}}
                style={{padding:"12px 32px",borderRadius:60,background:"transparent",
                  border:`1.5px solid ${C.blush}`,color:C.blush,
                  fontFamily:"'Cormorant Garamond',serif",fontSize:16,letterSpacing:3,cursor:"pointer"}}>try again</motion.button>
            </motion.div>
          ):(
            <motion.div key="playing">
              <motion.button onClick={tap}
                animate={cracking?{x:[-8,8,-6,6,-3,3,0]}:warning?{scale:[1,1.08,1]}:{}}
                transition={{duration:.5}}
                style={{background:"transparent",border:"none",cursor:"pointer",display:"block",margin:"0 auto 20px",
                  fontSize:`clamp(${70+Math.floor(progress/4)}px,${16+Math.floor(progress/8)}vw,${110+Math.floor(progress/3)}px)`,
                  filter:warning?`drop-shadow(0 0 20px ${C.rose})`:`drop-shadow(0 0 ${8+progress/10}px ${C.blush}44)`,
                  transition:"font-size .3s,filter .3s",lineHeight:1,userSelect:"none",WebkitUserSelect:"none"}}>
                {cracking?"💔":face}
              </motion.button>
              <motion.p animate={{color}} transition={{duration:.5}}
                style={{fontFamily:"'Dancing Script',cursive",fontSize:"clamp(15px,4vw,19px)",marginBottom:20}}>{label}</motion.p>
              {warning&&(
                <motion.p initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}}
                  style={{fontFamily:"'Dancing Script',cursive",fontSize:15,color:C.rose,marginBottom:12}}>
                  too fast! slow down
                </motion.p>
              )}
              <div style={{width:"100%",height:14,background:"rgba(255,255,255,.08)",borderRadius:10,overflow:"hidden",marginBottom:10,border:`1px solid rgba(255,255,255,.08)`}}>
                <motion.div animate={{width:`${pct}%`}} transition={{duration:.2}}
                  style={{height:"100%",borderRadius:10,
                    background:progress>=180?`linear-gradient(90deg,${C.blush},${C.lavender},${C.gold},${C.rose})`:barColor(),
                    boxShadow:`0 0 12px ${C.blush}88`}}/>
              </div>
              <p style={{fontSize:12,color:C.muted,fontFamily:"'Inter',sans-serif",letterSpacing:2}}>{progress} / {MAX}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Section>
  );
}

// ── HER LIKES ─────────────────────────────────────────────────────────────
const HER_LIKES=[
  {icon:"💗",label:"Chimbubu",desc:"Obviously first. Always first. She loves her man and he loves her right back.",color:C.blush,float:true},
  {icon:"🍇",label:"Grapes",desc:"Cold, sweet, perfect. She picks them one by one and somehow makes it look elegant.",color:C.lavender,float:false},
  {icon:"😴",label:"Sleeping",desc:"She sleeps like she has absolutely no regrets and honestly that is a character trait I respect deeply.",color:C.lavender,float:true},
  {icon:"✈",label:"Traveling",desc:"New places, new energy. She was built to explore and every city is lucky to have her walk through it.",color:C.gold,float:false},
  {icon:"🪙",label:"Silver Jewellery",desc:"Silver sits on her like it was made specifically for her. Which honestly it might have been.",color:"#c0c0c0",float:true},
  {icon:"🍬",label:"Sweet Things",desc:"Candy, desserts, anything that tastes like a good mood. She has a whole sweet tooth and it is adorable.",color:C.blushDeep,float:false},
  {icon:"🎵",label:"Lana Del Rey",desc:"Cinematic, emotional, beautiful and a little melancholy. Makes sense that she loves her. They have the same energy.",color:C.lavender,float:true},
];
function HerLikes({onBack}) {
  return (
    <Section onBack={onBack} color={C.lavender}>
      <div style={{width:"100%",maxWidth:520}}>
        <p style={{textAlign:"center",fontSize:"clamp(9px,2.2vw,11px)",letterSpacing:5,color:C.lavender,
          fontFamily:"'Inter',sans-serif",marginBottom:8,textTransform:"uppercase"}}>things she loves</p>
        <h2 style={{textAlign:"center",fontFamily:"'Cormorant Garamond',serif",
          fontSize:"clamp(26px,6vw,42px)",color:C.white,fontWeight:300,marginBottom:8}}>A Page About Chioma</h2>
        <p style={{textAlign:"center",fontFamily:"'Dancing Script',cursive",
          fontSize:"clamp(14px,3.5vw,17px)",color:C.muted,marginBottom:36,fontStyle:"italic"}}>the things that make her, her</p>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {HER_LIKES.map((item,i)=>(
            <motion.div key={i}
              initial={{opacity:0,x:i%2===0?-30:30}} animate={{opacity:1,x:0}}
              transition={{delay:i*.12,type:"spring",stiffness:120}}
              style={{borderRadius:20,padding:"18px 22px",
                background:`linear-gradient(135deg,${item.color}12,${item.color}06)`,
                border:`1px solid ${item.color}33`,boxShadow:`0 4px 20px ${item.color}15`,
                animation:item.float?`float ${3+i*.4}s ${i*.3}s ease-in-out infinite`:"none"}}>
              <div style={{display:"flex",gap:16,alignItems:"center"}}>
                <motion.span animate={{scale:[1,1.15,1],rotate:item.float?[0,5,-5,0]:0}}
                  transition={{repeat:Infinity,duration:2+i*.3,delay:i*.2}}
                  style={{fontSize:"clamp(28px,7vw,36px)",flexShrink:0}}>{item.icon}</motion.span>
                <div>
                  <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(16px,4vw,19px)",
                    color:C.white,margin:"0 0 4px",fontWeight:400}}>{item.label}</p>
                  <p style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",
                    fontSize:"clamp(12px,3vw,14px)",color:C.muted,margin:0,lineHeight:1.5}}>{item.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1.2}}
          style={{textAlign:"center",marginTop:28,padding:"20px 24px",
            background:C.pink50,border:`1px solid ${C.blush}22`,borderRadius:20}}>
          <motion.span animate={{scale:[1,1.2,1]}} transition={{repeat:Infinity,duration:1.8}}
            style={{fontSize:32,display:"block",marginBottom:10}}>♡</motion.span>
          <p style={{fontFamily:"'Dancing Script',cursive",fontSize:"clamp(15px,4vw,18px)",color:C.blush,margin:0}}>
            I know you because I pay attention. Every little thing.
          </p>
        </motion.div>
      </div>
    </Section>
  );
}

// ── QUIZ — 20 QUESTIONS ───────────────────────────────────────────────────
const QUIZ_QUESTIONS=[
  {q:"What is my favourite colour?",options:["Red","Green","Blue","Purple"],answer:"Blue",wrong:"Not that one baby, pay more attention to me",right:"Yes! You actually know me"},
  {q:"What do I always say when something goes wrong?",options:["It is what it is","Everywhere good","We move","No worries"],answer:"Everywhere good",wrong:"Hmm not quite, listen to me more carefully",right:"Exactly, you hear me"},
  {q:"What is my love language?",options:["Words of affirmation","Physical touch","Quality time","Acts of service"],answer:"Physical touch",wrong:"Close but not it, we need to talk more",right:"Yes, come here then"},
  {q:"What food could I eat every single day?",options:["Pounded yam","Shawarma","Bread","You"],answer:"You",wrong:"Think harder, it is not food food",right:"Correct and I mean it"},
  {q:"What is my biggest pet peeve?",options:["Lateness","Dry responses or not communicating","Noise","Rudeness"],answer:"Dry responses or not communicating",wrong:"That is not it, but noted",right:"So now you know, do better"},
  {q:"What is my favourite time of day?",options:["Early morning","Afternoon hustle","Chill night talking with you","Sunrise"],answer:"Chill night talking with you",wrong:"Not quite, think about what we do together",right:"Because those nights are everything"},
  {q:"What do I do when I am stressed?",options:["Goon","Talk to you","Play music (Juice WRLD)","Go quiet"],answer:"Talk to you",wrong:"I come to you first, remember that",right:"Always you first"},
  {q:"What kind of music do I like?",options:["Afrobeats only","Any song with good flow and strong bass","Classical vibes","Sad songs"],answer:"Any song with good flow and strong bass",wrong:"Not exactly, feel the energy",right:"You feel me"},
  {q:"What was the first thing I said to you?",options:["Hey","I love you","You are beautiful","What are you doing"],answer:"I love you",wrong:"It was more direct than that",right:"Bold move and I meant it"},
  {q:"What can I absolutely not tolerate in a relationship?",options:["Lies, cheating, not communicating","Loud arguments","Being ignored","Spending too much"],answer:"Lies, cheating, not communicating",wrong:"Those are bad too but not my top one",right:"Keep that in mind always"},
  {q:"What do I do on weekends when I have nothing planned?",options:["Sleep all day","Go out with friends","Work","Watch movies"],answer:"Work",wrong:"I am always building something",right:"The grind does not stop"},
  {q:"What is my go-to drink?",options:["Water","Juice","Energy drinks","Tea"],answer:"Energy drinks",wrong:"I need fuel to keep up with everything",right:"You know how I move"},
  {q:"Where would I take you on our first trip together?",options:["Dubai","Paris","Maldives","London"],answer:"Maldives",wrong:"Think more romantic and tropical",right:"Just us and the ocean"},
  {q:"What do I do when I miss you?",options:["Go quiet","Tell you","Post sad things","Call random people"],answer:"Tell you",wrong:"I come straight to you",right:"Always telling you"},
  {q:"What is my most used phrase with you?",options:["You good?","I miss you","I love you","Be careful"],answer:"I love you",wrong:"I say it more than you probably realise",right:"Because I mean it every time"},
  {q:"What makes me laugh the most?",options:["Memes","Jokes","Awkward situations","Sarcasm"],answer:"Jokes",wrong:"I am easy to make laugh with the right ones",right:"Make me laugh more then"},
  {q:"What is something I do every single morning?",options:["Pray","Work out","Tell you good morning and that I love you","Check my phone"],answer:"Tell you good morning and that I love you",wrong:"Think about what hits your phone first thing",right:"Because you are the first thing on my mind"},
  {q:"What do I think is your best physical feature?",options:["Your smile","Your legs, eyes and shape","Your hair","Your hands"],answer:"Your legs, eyes and shape",wrong:"I notice more than one thing",right:"All of it honestly"},
  {q:"What is my biggest goal right now?",options:["Travel the world","Find peace","To be rich","Start a business"],answer:"To be rich",wrong:"Think bigger and more honest",right:"We are getting there"},
  {q:"How do I show love most naturally?",options:["Cooking for you","Buying gifts","Being there and checking in","Writing letters"],answer:"Being there and checking in",wrong:"I show up in the small things",right:"I am always here even when I do not say it"},
];

function Quiz({onBack}) {
  const [current,setCurrent]=useState(0);
  const [selected,setSelected]=useState(null);
  const [score,setScore]=useState(0);
  const [done,setDone]=useState(false);
  const [feedback,setFeedback]=useState(null);
  const q=QUIZ_QUESTIONS[current];
  const pick=(opt)=>{
    if(selected) return;
    setSelected(opt);
    const correct=opt===q.answer;
    if(correct) setScore(s=>s+1);
    setFeedback({correct,msg:correct?q.right:q.wrong});
    setTimeout(()=>{
      setFeedback(null);setSelected(null);
      if(current<QUIZ_QUESTIONS.length-1) setCurrent(c=>c+1);
      else setDone(true);
    },2200);
  };
  const restart=()=>{setCurrent(0);setSelected(null);setScore(0);setDone(false);setFeedback(null);};
  const scoreMsg=()=>{
    if(score===20) return "Perfect score. You know me completely and I love you for that.";
    if(score>=15) return "You know me really well. A few gaps but we are getting there.";
    if(score>=10) return "You know some things. Study me more baby, I am worth the attention.";
    if(score>=5) return "We clearly need to spend more time talking. Take notes.";
    return "You barely know me at all. We need to fix that immediately.";
  };
  return (
    <Section onBack={onBack} color={C.gold}>
      <div style={{width:"100%",maxWidth:480}}>
        <p style={{textAlign:"center",fontSize:"clamp(9px,2.2vw,11px)",letterSpacing:5,color:C.gold,
          fontFamily:"'Inter',sans-serif",marginBottom:8,textTransform:"uppercase"}}>how well do you know me?</p>
        <h2 style={{textAlign:"center",fontFamily:"'Cormorant Garamond',serif",
          fontSize:"clamp(24px,6vw,40px)",color:C.white,fontWeight:300,marginBottom:8}}>The Quiz</h2>
        <p style={{textAlign:"center",fontFamily:"'Dancing Script',cursive",
          fontSize:"clamp(13px,3.5vw,16px)",color:C.muted,marginBottom:32}}>answer honestly</p>
        <AnimatePresence mode="wait">
          {!done?(
            <motion.div key={current} initial={{opacity:0,x:40}} animate={{opacity:1,x:0}}
              exit={{opacity:0,x:-40}} transition={{duration:.4}}>
              <div style={{marginBottom:20,textAlign:"center"}}>
                <p style={{fontSize:11,color:C.gold,fontFamily:"'Inter',sans-serif",letterSpacing:3,marginBottom:12}}>
                  {current+1} of {QUIZ_QUESTIONS.length}
                </p>
                <div style={{width:"100%",height:4,background:"rgba(255,255,255,.08)",borderRadius:4,overflow:"hidden",marginBottom:24}}>
                  <motion.div animate={{width:`${((current+1)/QUIZ_QUESTIONS.length)*100}%`}}
                    style={{height:"100%",background:C.gold,borderRadius:4}}/>
                </div>
                <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(17px,4.5vw,22px)",
                  color:C.white,lineHeight:1.4,marginBottom:28,fontStyle:"italic"}}>{q.q}</p>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {q.options.map((opt,i)=>(
                  <motion.button key={i} onClick={()=>pick(opt)}
                    whileHover={{scale:selected?1:1.02}} whileTap={{scale:.97}}
                    style={{padding:"14px 20px",borderRadius:14,textAlign:"left",cursor:"pointer",
                      fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(14px,3.5vw,17px)",
                      background:selected===opt?(opt===q.answer?"rgba(144,238,144,.15)":"rgba(232,96,122,.15)"):"rgba(255,255,255,.04)",
                      border:`1px solid ${selected===opt?(opt===q.answer?"#90ee90":"#e8607a"):C.gold+"33"}`,
                      color:C.white,transition:"all .3s"}}>
                    {opt}
                  </motion.button>
                ))}
              </div>
              <AnimatePresence>
                {feedback&&(
                  <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0}}
                    style={{marginTop:20,padding:"14px 20px",borderRadius:16,textAlign:"center",
                      background:feedback.correct?"rgba(144,238,144,.12)":"rgba(232,96,122,.12)",
                      border:`1px solid ${feedback.correct?"#90ee9066":C.rose+"44"}`}}>
                    <p style={{fontFamily:"'Dancing Script',cursive",fontSize:"clamp(15px,4vw,18px)",
                      color:feedback.correct?"#90ee90":C.rose,margin:0}}>{feedback.msg}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ):(
            <motion.div key="done" initial={{opacity:0,scale:.9}} animate={{opacity:1,scale:1}} style={{textAlign:"center"}}>
              <motion.div animate={{scale:[1,1.2,1]}} transition={{repeat:Infinity,duration:1.6}}
                style={{fontSize:56,marginBottom:16}}>
                {score===20?"🏆":score>=15?"💕":score>=10?"💭":"📖"}
              </motion.div>
              <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(22px,5.5vw,34px)",
                color:C.white,fontWeight:300,marginBottom:8}}>{score} out of 20</h3>
              <p style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",
                fontSize:"clamp(14px,3.5vw,17px)",color:C.muted,lineHeight:1.7,marginBottom:28}}>{scoreMsg()}</p>
              <p style={{fontFamily:"'Dancing Script',cursive",fontSize:18,color:C.blush,marginBottom:24}}>Chimbubu</p>
              <motion.button onClick={restart} whileTap={{scale:.93}}
                style={{padding:"12px 32px",borderRadius:60,background:"transparent",
                  border:`1.5px solid ${C.gold}`,color:C.gold,
                  fontFamily:"'Cormorant Garamond',serif",fontSize:16,letterSpacing:3,cursor:"pointer"}}>
                try again
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Section>
  );
}

// ── APP ────────────────────────────────────────────────────────────────────
export default function App() {
  const [scene,setScene]=useState("entrance");
  const {playing,toggle:toggleMusic,autoPlay,pause:pauseMusic}=useAudio();
  const unlock=useCallback(()=>{setScene("home");},[]);
  const PAGES={
    home:     <Home onNav={setScene}/>,
    letter:   <LoveLetter onBack={()=>setScene("home")}/>,
    notes:    <Notes onBack={()=>setScene("home")}/>,
    gallery:  <Gallery onBack={()=>setScene("home")}/>,
    love:     <LovePage onBack={()=>setScene("home")}/>,
    physical: <PhysicalPage onBack={()=>setScene("home")}/>,
    hours24:  <Hours24 onBack={()=>setScene("home")}/>,
    game:     <LoveGame onBack={()=>setScene("home")}/>,
    herlikes: <HerLikes onBack={()=>setScene("home")}/>,
    quiz:     <Quiz onBack={()=>setScene("home")}/>,
  };
  return (
    <div style={{minHeight:"100vh",background:C.bg,overflowX:"hidden",position:"relative"}}>
      <style>{GLOBAL_CSS}</style>
      <HeartsCanvas/>
      <PetalRain/>
      <TapSparks/>
      <CursorTrail/>
      <MusicBtn playing={playing} toggle={toggleMusic}/>
      <SpotifyPlayer audioPlaying={playing} pauseAudio={pauseMusic}/>
      <AnimatePresence mode="wait">
        {scene==="entrance"&&<Entrance key="entrance" onUnlock={unlock} onAutoPlay={autoPlay}/>}
        {PAGES[scene]&&<div key={scene}>{PAGES[scene]}</div>}
      </AnimatePresence>
    </div>
  );
}
