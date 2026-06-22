"use client";
import{useEffect,useRef,useState}from"react";
export default function Home(){
const[scrollY,setScrollY]=useState(0);
const[mouseX,setMouseX]=useState(0);
const[mouseY,setMouseY]=useState(0);
const[cursorBig,setCursorBig]=useState(false);
const[counted,setCounted]=useState(false);
const[counts,setCounts]=useState([0,0,0,0]);
const statsRef=useRef<HTMLDivElement>(null);
useEffect(()=>{
const onScroll=()=>setScrollY(window.scrollY);
const onMouse=(e:MouseEvent)=>{setMouseX(e.clientX);setMouseY(e.clientY);};
window.addEventListener("scroll",onScroll);
window.addEventListener("mousemove",onMouse);
return()=>{window.removeEventListener("scroll",onScroll);window.removeEventListener("mousemove",onMouse);};
},[]);
useEffect(()=>{
if(!statsRef.current||counted)return;
const obs=new IntersectionObserver(([e])=>{
if(e.isIntersecting){
setCounted(true);
const targets=[2400,180,98,15];
const duration=2000;
const steps=60;
const interval=duration/steps;
let step=0;
const timer=setInterval(()=>{
step++;
const progress=step/steps;
const ease=1-Math.pow(1-progress,3);
setCounts(targets.map(t=>Math.round(t*ease)));
if(step>=steps)clearInterval(timer);
},interval);
}
},{threshold:0.5});
obs.observe(statsRef.current);
return()=>obs.disconnect();
},[counted]);
const products=[
{n:"Sac Cuir Milano",c:"Maroquinerie",p:"189 000 FCFA",a:"210 000 FCFA",e:"👜",hot:true},
{n:"Collier Or 18K",c:"Joaillerie",p:"245 000 FCFA",a:"",e:"💍",hot:false},
{n:"Robe Soiree Elegance",c:"Pret-a-porter",p:"95 000 FCFA",a:"120 000 FCFA",e:"👗",hot:true},
{n:"Foulard Soie",c:"Accessoires",p:"78 000 FCFA",a:"",e:"✨",hot:false},
{n:"Sac Tote Roma",c:"Maroquinerie",p:"145 000 FCFA",a:"",e:"👜",hot:false},
{n:"Bracelet Dore",c:"Joaillerie",p:"45 000 FCFA",a:"55 000 FCFA",e:"💎",hot:true},
];
const[hovProd,setHovProd]=useState<number|null>(null);
const[hovCol,setHovCol]=useState<number|null>(null);
const collections=[
{n:"Collection Signature",d:"Pieces iconiques intemporelles",nb:"48 pieces",e:"✦"},
{n:"Collection Elegance",d:"Raffinement absolu du quotidien",nb:"36 pieces",e:"◈"},
{n:"Collection Prestige",d:"L excellence africaine revisitee",nb:"24 pieces",e:"◆"},
{n:"Collection Premium",d:"Exclusivite et savoir-faire unique",nb:"18 pieces",e:"❖"},
];
const[toast,setToast]=useState("");
const showToast=(msg:string)=>{setToast(msg);setTimeout(()=>setToast(""),3000);};
const navY=scrollY>50;
return(
<div style={{background:"#0F0F0F",minHeight:"100vh",fontFamily:"Georgia,serif",color:"#F8F8F8",overflowX:"hidden"}}>
{/* CURSEUR */}
<div style={{position:"fixed",left:mouseX-6,top:mouseY-6,width:12,height:12,background:"#D4AF37",borderRadius:"50%",pointerEvents:"none",zIndex:9999,transform:cursorBig?"scale(3)":"scale(1)",transition:"transform 0.2s,opacity 0.2s",mixBlendMode:"difference"}}/>
{/* TOAST */}
{toast&&<div style={{position:"fixed",bottom:"6rem",left:"50%",transform:"translateX(-50%)",background:"rgba(212,175,55,0.95)",color:"#0F0F0F",padding:"0.75rem 2rem",fontSize:"0.75rem",letterSpacing:"0.15em",zIndex:9000,fontWeight:"bold",boxShadow:"0 8px 32px rgba(212,175,55,0.3)"}}>{toast}</div>}
{/* WHATSAPP FLOTTANT */}
<a href="https://wa.me/qr/VZI54KRHDMXRM1" target="_blank" style={{position:"fixed",bottom:"2rem",right:"2rem",zIndex:1000,display:"flex",alignItems:"center",gap:"0.6rem",background:"rgba(37,211,102,0.15)",border:"1.5px solid rgba(37,211,102,0.5)",padding:"0.75rem 1.25rem",textDecoration:"none",color:"rgba(46,204,113,0.95)",fontSize:"0.65rem",letterSpacing:"0.15em",backdropFilter:"blur(10px)",animation:"waPulse 3s ease-in-out infinite"}}
onMouseEnter={()=>setCursorBig(true)} onMouseLeave={()=>setCursorBig(false)}>
<span style={{fontSize:"1.2rem"}}>💬</span> WHATSAPP
</a>
{/* TIKTOK FLOTTANT */}
<a href="https://www.tiktok.com/@amie.de.dieu01" target="_blank" style={{position:"fixed",bottom:"5.5rem",right:"2rem",zIndex:1000,display:"flex",alignItems:"center",gap:"0.6rem",background:"rgba(255,255,255,0.05)",border:"1.5px solid rgba(255,255,255,0.15)",padding:"0.75rem 1.25rem",textDecoration:"none",color:"rgba(255,255,255,0.8)",fontSize:"0.65rem",letterSpacing:"0.15em",backdropFilter:"blur(10px)"}}>
<span style={{fontSize:"1.2rem"}}>🎵</span> TIKTOK
</a>
{/* NAV */}
<nav style={{position:"fixed",top:0,left:0,right:0,zIndex:100,padding:"1.25rem 2.5rem",display:"flex",justifyContent:"space-between",alignItems:"center",background:navY?"rgba(10,10,10,0.95)":"transparent",borderBottom:navY?"1px solid rgba(212,175,55,0.2)":"none",backdropFilter:navY?"blur(20px)":"none",transition:"all 0.5s cubic-bezier(0.4,0,0.2,1)"}}>
<div style={{display:"flex",alignItems:"center",gap:"0.85rem"}} onMouseEnter={()=>setCursorBig(true)} onMouseLeave={()=>setCursorBig(false)}>
<div style={{width:38,height:38,border:"1.5px solid #D4AF37",display:"flex",alignItems:"center",justifyContent:"center",color:"#D4AF37",fontSize:"0.8rem",fontWeight:"bold",background:"rgba(212,175,55,0.05)"}}>FP</div>
<span style={{fontSize:"0.95rem",letterSpacing:"0.25em",textTransform:"uppercase"}}>F-P Collection</span>
</div>
<div style={{display:"flex",gap:"2.5rem"}}>
{["Collections","Sacs","Bijoux","Vetements","Vendeurs"].map(l=>(
<a key={l} href="#" style={{fontSize:"0.62rem",letterSpacing:"0.2em",textTransform:"uppercase",color:"rgba(248,248,248,0.6)",textDecoration:"none",position:"relative",paddingBottom:"4px"}}
onMouseEnter={(e)=>{setCursorBig(true);(e.target as HTMLElement).style.color="#D4AF37";}}
onMouseLeave={(e)=>{setCursorBig(false);(e.target as HTMLElement).style.color="rgba(248,248,248,0.6)";}}>
{l}
</a>
))}
</div>
<a href="https://wa.me/qr/VZI54KRHDMXRM1" target="_blank" style={{background:"#D4AF37",color:"#0F0F0F",padding:"0.55rem 1.5rem",fontSize:"0.62rem",letterSpacing:"0.2em",textTransform:"uppercase",textDecoration:"none",fontWeight:"bold",transition:"all 0.3s"}}
onMouseEnter={(e)=>{setCursorBig(true);(e.currentTarget as HTMLElement).style.background="#F8F8F8";}}
onMouseLeave={(e)=>{setCursorBig(false);(e.currentTarget as HTMLElement).style.background="#D4AF37";}}>
WhatsApp
</a>
</nav>
{/* HERO */}
<section style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",textAlign:"center",padding:"8rem 2rem 4rem",position:"relative",overflow:"hidden"}}>
<div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 40% 50%,rgba(212,175,55,0.07) 0%,transparent 60%),radial-gradient(ellipse at 80% 20%,rgba(212,175,55,0.04) 0%,transparent 50%)"}}/>
{[...Array(12)].map((_,i)=>(
<div key={i} style={{position:"absolute",width:2,height:2,background:"#D4AF37",borderRadius:"50%",opacity:0.3,left:`${8+i*8}%`,top:`${20+Math.sin(i)*40}%`,animation:`float${i%3} ${3+i*0.4}s ease-in-out infinite`}}/>
))}
<div style={{position:"relative",zIndex:2,transform:`translateY(${scrollY*0.15}px)`}}>
<div style={{fontSize:"0.58rem",letterSpacing:"0.5em",textTransform:"uppercase",color:"#D4AF37",marginBottom:"1.5rem",opacity:scrollY>200?0:1,transition:"opacity 0.5s"}}>
✦ &nbsp; Nouvelle Collection 2025 &nbsp; ✦
</div>
<h1 style={{fontFamily:"Georgia,serif",fontSize:"clamp(3.5rem,9vw,8rem)",fontWeight:300,lineHeight:0.95,marginBottom:"2rem",letterSpacing:"-0.02em"}}>
<span style={{display:"block",color:"#F8F8F8"}}>L&apos;elegance</span>
<span style={{display:"block",fontStyle:"italic",color:"#D4AF37",marginTop:"0.15em"}}>a votre portee</span>
</h1>
<div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"1.5rem",marginBottom:"3rem"}}>
<div style={{width:60,height:"1px",background:"linear-gradient(to right,transparent,#D4AF37)"}}/>
<span style={{fontSize:"0.72rem",letterSpacing:"0.15em",color:"rgba(248,248,248,0.45)",textTransform:"uppercase"}}>Marketplace premium africaine</span>
<div style={{width:60,height:"1px",background:"linear-gradient(to left,transparent,#D4AF37)"}}/>
</div>
<div style={{display:"flex",gap:"1.25rem",justifyContent:"center",flexWrap:"wrap"}}>
<a href="#collections" style={{background:"#D4AF37",color:"#0F0F0F",padding:"1rem 3rem",fontSize:"0.68rem",letterSpacing:"0.25em",textTransform:"uppercase",textDecoration:"none",fontWeight:"bold",transition:"all 0.4s",display:"inline-block"}}
onMouseEnter={(e)=>{setCursorBig(true);(e.currentTarget as HTMLElement).style.transform="translateY(-3px)";(e.currentTarget as HTMLElement).style.boxShadow="0 16px 40px rgba(212,175,55,0.4)";}}
onMouseLeave={(e)=>{setCursorBig(false);(e.currentTarget as HTMLElement).style.transform="translateY(0)";(e.currentTarget as HTMLElement).style.boxShadow="none";}}>
Decouvrir les collections
</a>
<a href="https://wa.me/qr/VZI54KRHDMXRM1" target="_blank" style={{background:"transparent",color:"#F8F8F8",border:"1px solid rgba(248,248,248,0.25)",padding:"1rem 3rem",fontSize:"0.68rem",letterSpacing:"0.25em",textTransform:"uppercase",textDecoration:"none",transition:"all 0.4s"}}
onMouseEnter={(e)=>{setCursorBig(true);(e.currentTarget as HTMLElement).style.borderColor="#D4AF37";(e.currentTarget as HTMLElement).style.color="#D4AF37";}}
onMouseLeave={(e)=>{setCursorBig(false);(e.currentTarget as HTMLElement).style.borderColor="rgba(248,248,248,0.25)";(e.currentTarget as HTMLElement).style.color="#F8F8F8";}}>
Nous contacter
</a>
</div>
</div>
<div style={{position:"absolute",bottom:"2.5rem",left:"50%",transform:"translateX(-50%)",display:"flex",flexDirection:"column",alignItems:"center",gap:"0.5rem",opacity:scrollY>100?0:1,transition:"opacity 0.5s"}}>
<span style={{fontSize:"0.55rem",letterSpacing:"0.3em",color:"rgba(248,248,248,0.3)",textTransform:"uppercase"}}>Defiler</span>
<div style={{width:1,height:48,background:"linear-gradient(to bottom,#D4AF37,transparent)",animation:"scrollLine 2s ease-in-out infinite"}}/>
</div>
</section>
{/* STATS */}
<div ref={statsRef} style={{borderTop:"1px solid rgba(212,175,55,0.15)",borderBottom:"1px solid rgba(212,175,55,0.15)",padding:"3rem 2rem",display:"flex",justifyContent:"space-around",flexWrap:"wrap",gap:"2rem",background:"rgba(212,175,55,0.03)"}}>
{[
{val:counts[0],suffix:"+",label:"Produits exclusifs"},
{val:counts[1],suffix:"+",label:"Vendeurs certifies"},
{val:counts[2],suffix:"%",label:"Clients satisfaits"},
{val:counts[3],suffix:" pays",label:"Livraison disponible"},
].map((s,i)=>(
<div key={i} style={{textAlign:"center"}} onMouseEnter={()=>setCursorBig(true)} onMouseLeave={()=>setCursorBig(false)}>
<div style={{fontFamily:"Georgia,serif",fontSize:"3rem",fontWeight:300,color:"#D4AF37",lineHeight:1}}>{s.val}{s.suffix}</div>
<div style={{width:30,height:1,background:"#D4AF37",margin:"0.6rem auto"}}/>
<div style={{fontSize:"0.6rem",letterSpacing:"0.2em",textTransform:"uppercase",color:"rgba(248,248,248,0.35)"}}>{s.label}</div>
</div>
))}
</div>
{/* COLLECTIONS */}
<section id="collections" style={{padding:"6rem 2rem"}}>
<div style={{textAlign:"center",marginBottom:"4rem"}}>
<div style={{fontSize:"0.58rem",letterSpacing:"0.4em",textTransform:"uppercase",color:"#D4AF37",marginBottom:"1rem"}}>Nos Univers</div>
<h2 style={{fontFamily:"Georgia,serif",fontSize:"clamp(2rem,5vw,3.5rem)",fontWeight:300,marginBottom:"1rem"}}>Collections <em style={{color:"#D4AF37"}}>Signature</em></h2>
<div style={{width:60,height:1,background:"#D4AF37",margin:"0 auto"}}/>
</div>
<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))",gap:"2px",maxWidth:1200,margin:"0 auto"}}>
{collections.map((c,i)=>(
<div key={i} style={{background:hovCol===i?"rgba(212,175,55,0.08)":"#141414",padding:"3rem 2rem",textAlign:"center",cursor:"pointer",border:`1px solid ${hovCol===i?"rgba(212,175,55,0.4)":"rgba(212,175,55,0.08)"}`,transition:"all 0.4s cubic-bezier(0.4,0,0.2,1)",transform:hovCol===i?"translateY(-8px)":"translateY(0)",boxShadow:hovCol===i?"0 24px 60px rgba(212,175,55,0.15)":"none"}}
onMouseEnter={()=>{setHovCol(i);setCursorBig(true);}}
onMouseLeave={()=>{setHovCol(null);setCursorBig(false);}}>
<div style={{fontSize:"1.8rem",color:"#D4AF37",marginBottom:"1.25rem",transition:"transform 0.4s",transform:hovCol===i?"scale(1.2)":"scale(1)"}}>{c.e}</div>
<div style={{fontFamily:"Georgia,serif",fontSize:"1.15rem",fontWeight:300,marginBottom:"0.5rem",color:hovCol===i?"#D4AF37":"#F8F8F8",transition:"color 0.3s"}}>{c.n}</div>
<div style={{fontSize:"0.65rem",color:"rgba(248,248,248,0.4)",marginBottom:"0.75rem",lineHeight:1.6}}>{c.d}</div>
<div style={{fontSize:"0.6rem",letterSpacing:"0.15em",color:hovCol===i?"#D4AF37":"rgba(248,248,248,0.25)",textTransform:"uppercase",transition:"color 0.3s"}}>{c.nb}</div>
{hovCol===i&&<div style={{width:30,height:1,background:"#D4AF37",margin:"1rem auto 0"}}/>}
</div>
))}
</div>
</section>
{/* PRODUITS */}
<section style={{padding:"6rem 2rem",background:"rgba(10,10,10,0.8)"}}>
<div style={{textAlign:"center",marginBottom:"4rem"}}>
<div style={{fontSize:"0.58rem",letterSpacing:"0.4em",textTransform:"uppercase",color:"#D4AF37",marginBottom:"1rem"}}>Selection Exclusive</div>
<h2 style={{fontFamily:"Georgia,serif",fontSize:"clamp(2rem,5vw,3.5rem)",fontWeight:300}}>Pieces <em style={{color:"#D4AF37"}}>d Exception</em></h2>
<div style={{width:60,height:1,background:"#D4AF37",margin:"1rem auto 0"}}/>
</div>
<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:"2px",maxWidth:1200,margin:"0 auto"}}>
{products.map((p,i)=>(
<div key={i} style={{background:"#111",cursor:"pointer",position:"relative",transform:hovProd===i?"translateY(-6px)":"translateY(0)",boxShadow:hovProd===i?"0 20px 60px rgba(0,0,0,0.5)":"none",transition:"all 0.4s cubic-bezier(0.4,0,0.2,1)",border:`1px solid ${hovProd===i?"rgba(212,175,55,0.3)":"rgba(212,175,55,0.06)"}`}}
onMouseEnter={()=>{setHovProd(i);setCursorBig(true);}}
onMouseLeave={()=>{setHovProd(null);setCursorBig(false);}}>
{p.hot&&<div style={{position:"absolute",top:"0.75rem",left:"0.75rem",background:"#D4AF37",color:"#0F0F0F",fontSize:"0.5rem",padding:"3px 8px",letterSpacing:"0.15em",fontWeight:"bold",zIndex:2}}>POPULAIRE</div>}
<div style={{height:240,background:`linear-gradient(135deg,#1a1a1a,#222)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"4rem",position:"relative",overflow:"hidden"}}>
<div style={{position:"absolute",inset:0,background:hovProd===i?"rgba(212,175,55,0.04)":"transparent",transition:"background 0.4s"}}/>
<span style={{transform:hovProd===i?"scale(1.15)":"scale(1)",transition:"transform 0.5s cubic-bezier(0.4,0,0.2,1)",display:"block"}}>{p.e}</span>
</div>
<div style={{padding:"1.25rem"}}>
<div style={{fontSize:"0.52rem",letterSpacing:"0.2em",textTransform:"uppercase",color:"#D4AF37",marginBottom:"0.4rem"}}>{p.c}</div>
<div style={{fontFamily:"Georgia,serif",fontSize:"1.05rem",fontWeight:300,marginBottom:"0.6rem",color:"#F8F8F8"}}>{p.n}</div>
<div style={{display:"flex",alignItems:"baseline",gap:"0.6rem",marginBottom:"1rem"}}>
<span style={{fontSize:"0.9rem",fontWeight:500,color:"#F8F8F8"}}>{p.p}</span>
{p.a&&<span style={{fontSize:"0.72rem",color:"rgba(248,248,248,0.28)",textDecoration:"line-through"}}>{p.a}</span>}
</div>
<div style={{display:"flex",gap:"0.5rem"}}>
<button style={{flex:1,background:hovProd===i?"#D4AF37":"rgba(212,175,55,0.1)",border:`1px solid ${hovProd===i?"#D4AF37":"rgba(212,175,55,0.3)"}`,padding:"0.65rem",fontSize:"0.58rem",letterSpacing:"0.15em",textTransform:"uppercase",color:hovProd===i?"#0F0F0F":"#D4AF37",cursor:"pointer",fontWeight:"bold",transition:"all 0.3s"}}
onClick={()=>showToast("Article ajoute au panier !")}>
Acheter
</button>
<a href="https://wa.me/qr/VZI54KRHDMXRM1" target="_blank" style={{background:"rgba(37,211,102,0.08)",border:"1px solid rgba(37,211,102,0.3)",padding:"0.65rem 0.85rem",cursor:"pointer",fontSize:"0.85rem",color:"rgba(46,204,113,0.9)",textDecoration:"none",display:"flex",alignItems:"center",transition:"all 0.3s"}}
onMouseEnter={(e)=>(e.currentTarget as HTMLElement).style.background="rgba(37,211,102,0.2)"}
onMouseLeave={(e)=>(e.currentTarget as HTMLElement).style.background="rgba(37,211,102,0.08)"}>
💬
</a>
</div>
</div>
</div>
))}
</div>
</section>
{/* TIKTOK */}
<section style={{padding:"5rem 2rem",textAlign:"center",borderTop:"1px solid rgba(212,175,55,0.1)"}}>
<div style={{fontSize:"0.58rem",letterSpacing:"0.4em",textTransform:"uppercase",color:"#D4AF37",marginBottom:"1rem"}}>Notre Univers</div>
<h2 style={{fontFamily:"Georgia,serif",fontSize:"2rem",fontWeight:300,marginBottom:"0.75rem"}}>Suivez <em style={{color:"#D4AF37"}}>F-P Collection</em></h2>
<p style={{fontSize:"0.75rem",color:"rgba(248,248,248,0.4)",marginBottom:"2.5rem",letterSpacing:"0.05em"}}>Decouvrez nos coulisses, nouveautes et conseils style sur TikTok</p>
<a href="https://www.tiktok.com/@amie.de.dieu01" target="_blank" style={{display:"inline-flex",alignItems:"center",gap:"0.75rem",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.15)",padding:"1rem 2.5rem",color:"#F8F8F8",fontSize:"0.68rem",letterSpacing:"0.2em",textTransform:"uppercase",textDecoration:"none",transition:"all 0.3s"}}
onMouseEnter={(e)=>{setCursorBig(true);(e.currentTarget as HTMLElement).style.borderColor="#D4AF37";(e.currentTarget as HTMLElement).style.color="#D4AF37";}}
onMouseLeave={(e)=>{setCursorBig(false);(e.currentTarget as HTMLElement).style.borderColor="rgba(255,255,255,0.15)";(e.currentTarget as HTMLElement).style.color="#F8F8F8";}}>
<span style={{fontSize:"1.2rem"}}>🎵</span> @amie.de.dieu01
</a>
</section>
{/* TEMOIGNAGES */}
<section style={{padding:"5rem 2rem",background:"rgba(212,175,55,0.03)",borderTop:"1px solid rgba(212,175,55,0.1)"}}>
<div style={{textAlign:"center",marginBottom:"3.5rem"}}>
<div style={{fontSize:"0.58rem",letterSpacing:"0.4em",textTransform:"uppercase",color:"#D4AF37",marginBottom:"1rem"}}>Ils nous font confiance</div>
<h2 style={{fontFamily:"Georgia,serif",fontSize:"2rem",fontWeight:300}}>Paroles de <em style={{color:"#D4AF37"}}>Clientes</em></h2>
</div>
<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:"2px",maxWidth:1000,margin:"0 auto"}}>
{[
{t:"Experience incroyable !",d:"Le sac est magnifique, livraison rapide. Je recommande vivement F-P Collection !",a:"Aminata S.",v:"Lome, Togo"},
{t:"Qualite exceptionnelle",d:"J ai commande un collier pour mon anniversaire. Exactement comme sur les photos. Merci !",a:"Fatima K.",v:"Abidjan, CI"},
{t:"Service au top",d:"Le contact WhatsApp avec le vendeur etait parfait. Commande en 5 minutes. Bravo !",a:"Marie D.",v:"Dakar, SN"},
].map((t,i)=>(
<div key={i} style={{background:"#141414",padding:"2rem",border:"1px solid rgba(212,175,55,0.08)"}}>
<div style={{color:"#D4AF37",fontSize:"1.5rem",marginBottom:"0.75rem",letterSpacing:"0.1em"}}>&#34;&#34;</div>
<p style={{fontFamily:"Georgia,serif",fontStyle:"italic",fontSize:"0.88rem",color:"rgba(248,248,248,0.75)",lineHeight:1.8,marginBottom:"1.25rem"}}>{t.d}</p>
<div style={{width:30,height:1,background:"rgba(212,175,55,0.3)",marginBottom:"0.75rem"}}/>
<div style={{fontSize:"0.72rem",color:"#F8F8F8",fontWeight:500}}>{t.a}</div>
<div style={{fontSize:"0.6rem",color:"rgba(248,248,248,0.35)",letterSpacing:"0.08em"}}>{t.v}</div>
</div>
))}
</div>
</section>
{/* WHATSAPP SECTION */}
<section style={{padding:"5rem 2rem",textAlign:"center",borderTop:"1px solid rgba(37,211,102,0.15)",background:"rgba(37,211,102,0.03)"}}>
<div style={{fontSize:"0.58rem",letterSpacing:"0.4em",textTransform:"uppercase",color:"rgba(46,204,113,0.8)",marginBottom:"1rem"}}>Contact Direct</div>
<h2 style={{fontFamily:"Georgia,serif",fontSize:"2rem",fontWeight:300,marginBottom:"0.75rem"}}>Discutez avec nos vendeurs</h2>
<p style={{fontSize:"0.78rem",color:"rgba(248,248,248,0.4)",marginBottom:"2.5rem"}}>Posez vos questions, negociez, commandez directement sur WhatsApp</p>
<a href="https://wa.me/qr/VZI54KRHDMXRM1" target="_blank" style={{display:"inline-flex",alignItems:"center",gap:"0.75rem",background:"rgba(37,211,102,0.12)",border:"1.5px solid rgba(37,211,102,0.4)",padding:"1.1rem 3rem",color:"rgba(46,204,113,0.95)",fontSize:"0.7rem",letterSpacing:"0.2em",textTransform:"uppercase",textDecoration:"none",fontWeight:"bold",transition:"all 0.3s"}}
onMouseEnter={(e)=>{setCursorBig(true);(e.currentTarget as HTMLElement).style.background="rgba(37,211,102,0.25)";}}
onMouseLeave={(e)=>{setCursorBig(false);(e.currentTarget as HTMLElement).style.background="rgba(37,211,102,0.12)";}}>
<span style={{fontSize:"1.3rem"}}>💬</span> Ouvrir WhatsApp
</a>
</section>
{/* FOOTER */}
<footer style={{padding:"3.5rem 2.5rem",borderTop:"1px solid rgba(212,175,55,0.12)",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"1.5rem",background:"#080808"}}>
<div>
<div style={{fontFamily:"Georgia,serif",fontSize:"1.1rem",letterSpacing:"0.2em",marginBottom:"0.4rem"}}>F-P Collection</div>
<div style={{fontFamily:"Georgia,serif",fontStyle:"italic",color:"#D4AF37",fontSize:"0.82rem"}}>L elegance a votre portee</div>
</div>
<div style={{display:"flex",gap:"1.5rem"}}>
{["Collections","Sacs","Bijoux","Vendeurs"].map(l=>(
<a key={l} href="#" style={{fontSize:"0.6rem",letterSpacing:"0.15em",textTransform:"uppercase",color:"rgba(248,248,248,0.3)",textDecoration:"none"}}>{l}</a>
))}
</div>
<div style={{fontSize:"0.58rem",color:"rgba(248,248,248,0.2)",letterSpacing:"0.08em"}}>2025 F-P Collection</div>
</footer>
<style>{`
@keyframes waPulse{0%,100%{box-shadow:0 0 0 0 rgba(37,211,102,0.4);}50%{box-shadow:0 0 0 12px rgba(37,211,102,0);}}
@keyframes scrollLine{0%,100%{opacity:0.3;transform:scaleY(1);}50%{opacity:1;transform:scaleY(1.1);}}
@keyframes float0{0%,100%{transform:translateY(0);}50%{transform:translateY(-12px);}}
@keyframes float1{0%,100%{transform:translateY(0);}50%{transform:translateY(-18px);}}
@keyframes float2{0%,100%{transform:translateY(0);}50%{transform:translateY(-8px);}}
*{cursor:none !important;}
`}</style>
</div>
);
}
