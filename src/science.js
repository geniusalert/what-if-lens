export const defaults={circuit:{v:9,r:6,closed:true},math:{a:1,b:-4,c:3,t:2,lo:1,hi:3,derivative:false,integral:false,increase:false},projectile:{speed:20,angle:30,g:9.81}};
export const limits={circuit:{v:[.1,48],r:[.1,100]},math:{a:[-10,10],b:[-20,20],c:[-20,20],t:[-8,8],lo:[-8,8],hi:[-8,8]},projectile:{speed:[1,60],angle:[1,89],g:[.5,25]}};
export function validate(domain,p){
 if(!defaults[domain]||!p||typeof p!=='object')throw Error('Choose a supported experiment.');
 for(const [k,[min,max]] of Object.entries(limits[domain]))if(typeof p[k]!=='number'||!Number.isFinite(p[k])||p[k]<min||p[k]>max)throw Error(`${k} must be between ${min} and ${max}.`);
 for(const k of Object.keys(defaults[domain]))if(typeof defaults[domain][k]==='boolean'&&typeof p[k]!=='boolean')throw Error(`Invalid ${k}.`);
 if(domain==='math'&&p.lo>p.hi)throw Error('The lower bound must be less than the upper bound.');
 return p;
}
export const value=(p,x)=>p.a*x*x+p.b*x+p.c;
export function roots(p){if(Math.abs(p.a)<1e-12)return Math.abs(p.b)<1e-12?[]:[-p.c/p.b];const d=p.b*p.b-4*p.a*p.c;if(d<0)return [];if(d===0)return [-p.b/(2*p.a)];return [(-p.b-Math.sqrt(d))/(2*p.a),(-p.b+Math.sqrt(d))/(2*p.a)].sort((a,b)=>a-b);}
export function solve(domain,p){validate(domain,p);
 if(domain==='circuit'){const i=p.closed?p.v/p.r:0;return {current:i,power:p.v*i,resistance:p.r,voltage:p.v};}
 if(domain==='projectile'){const rad=p.angle*Math.PI/180,vx=p.speed*Math.cos(rad),vy=p.speed*Math.sin(rad),time=2*vy/p.g;return {vx,vy,time,range:vx*time,height:vy*vy/(2*p.g)};}
 const primitive=x=>p.a*x*x*x/3+p.b*x*x/2+p.c*x;
 const rs=roots(p),points=[p.lo,...rs.filter(x=>x>p.lo&&x<p.hi),p.hi];
 return {roots:rs,vertex:p.a===0?null:{x:-p.b/(2*p.a),y:value(p,-p.b/(2*p.a))},slope:2*p.a*p.t+p.b,signed:primitive(p.hi)-primitive(p.lo),area:points.slice(1).reduce((s,x,i)=>s+Math.abs(primitive(x)-primitive(points[i])),0),derivative:[2*p.a,p.b]};
}
export function parseQuadratic(raw){
 let s=raw.toLowerCase().replace(/\s/g,'').replace(/−/g,'-').replace(/²/g,'^2').replace(/\*\*/g,'^').replace(/\*/g,'').replace(/^(y=|f\(x\)=)/,'');
 if(!s||s.length>120||!/^[0-9x^.+-]+$/.test(s))throw Error('Enter a quadratic such as x² − 4x + 3. Only numeric coefficients and x are supported.');
 const terms=s.match(/[+-]?[^+-]+/g)||[];const p={...defaults.math,a:0,b:0,c:0};
 for(const t of terms){let m;if((m=t.match(/^([+-]?(?:\d+(?:\.\d*)?|\.\d+)?)x\^2$/)))p.a+=coef(m[1]);else if((m=t.match(/^([+-]?(?:\d+(?:\.\d*)?|\.\d+)?)x$/)))p.b+=coef(m[1]);else if(/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(t))p.c+=Number(t);else throw Error('This lab supports polynomials up to degree 2.');}
 return validate('math',p);
}
function coef(s){return s===''||s==='+'?1:s==='-'?-1:Number(s);}
export const fmt=(n,d=2)=>Number.isFinite(n)?Number(n.toFixed(d)).toString():'—';
export function polynomial(p){return `${fmt(p.a)}x² ${p.b<0?'−':'+'} ${fmt(Math.abs(p.b))}x ${p.c<0?'−':'+'} ${fmt(Math.abs(p.c))}`;}
export function command(domain,p,text){
 const s=text.toLowerCase().trim();const next={...p};
 if(/^(reset|compare|pause|play|explain|show each step|undo)$/.test(s))return {action:s};
 if(domain==='circuit'){
  if(/^(double|halve) (the )?(resistance|voltage)$/.test(s)){const key=s.includes('resistance')?'r':'v';next[key]*=s.startsWith('double')?2:.5;}
  else if(/^(open|close) (the )?switch$/.test(s))next.closed=s.startsWith('close');
  else {const m=s.match(/^set (resistance|voltage) (?:to )?(\d+(?:\.\d+)?)(?:\s*(?:v|volts?|ohms?|ω))?$/);if(!m)throw Error('Try “double resistance”, “open switch”, or “set voltage to 12”.');next[m[1]==='voltage'?'v':'r']=Number(m[2]);}
 }else if(domain==='math'){
  if(/^(show|hide) (the )?derivative$/.test(s))next.derivative=s.startsWith('show');
  else if(/^(where does (the )?function increase\??|show increasing region)$/.test(s))next.increase=true;
  else if(/^(double|halve) (a|coefficient a)$/.test(s))next.a*=s.startsWith('double')?2:.5;
  else if(s.startsWith('integrate')){const m=s.match(/^integrate(?: from)? (-?\d+(?:\.\d+)?) to (-?\d+(?:\.\d+)?)$/);if(!m)throw Error('Try “integrate from 1 to 3”.');next.lo=Number(m[1]);next.hi=Number(m[2]);next.integral=true;}
  else {const m=s.match(/^set (a|b|c|t) (?:to )?(-?\d+(?:\.\d+)?)$/);if(!m)throw Error('Try “show derivative”, “double a”, “set b to -2”, or “integrate from 1 to 3”.');next[m[1]]=Number(m[2]);}
 }else{
  const m=s.match(/^set (angle|speed|gravity) (?:to )?(\d+(?:\.\d+)?)(?:\s*(?:degrees?|m\/s))?$/);if(!m)throw Error('Try “set angle to 45”, “set speed to 30”, or “set gravity to 1.62”.');next[m[1]==='gravity'?'g':m[1]]=Number(m[2]);
 }
 validate(domain,next);return {params:next};
}
