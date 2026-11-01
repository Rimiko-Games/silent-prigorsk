/* Silent Prigorsk · Core helpers, shared characters and art. Loaded first. */
/* ================= CORE ================= */
const MON=['янв','фев','мар','апр','мая','июн','июл','авг','сен','окт','ноя','дек'];
const KN={lab:'экспертиза',wit:'показания',base:'база',find:'улика'};
const SHARED={gavrilov:{fio:'Гаврилов Николай',img:'p_gavrilov',job:'начальник районного отдела',summon:false},vetrova:{fio:'Ветрова Анна',img:'p_vetrova',job:'районный прокурор',summon:false},lapteva:{fio:'Лаптева Елена',img:'p_lapteva',job:'эксперт-криминалист',summon:false},duty:{fio:'Дежурный',img:'p_duty',job:'дежурная часть',summon:false}};
let CS,S,UI={tab:'here',modal:null,hintOff:false,newClues:new Set(),reveal:[],view:null,title:true,music:false,inside:false,sel:[],phoneMsg:null,lampOff:false};
const P=id=>(CS&&CS.people[id])||SHARED[id];
const has=c=>S.clues.includes(c);
const day=()=>Math.floor(S.t/24)+1;
const hour=()=>S.t%24;
const fmt=t=>{const h=Math.floor(t%24),m=Math.round((t%1)*60);return String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')};
const DATE=d=>{const x=new Date(2026,CS.month,CS.d0+d-1);return x.getDate()+' '+MON[x.getMonth()]};
const DUE=t=>{const d=Math.floor(t/24)+1;return d===day()?'сегодня':d===day()+1?'завтра':DATE(d)};
const WHEN=t=>{const d=Math.floor(t/24)+1,c=day();return d===c?'сегодня':d===c+1?'завтра':d===c-1?'вчера':DATE(d)};
const short=id=>{const f=P(id).fio.split(' ');return f[0]+' '+f[1][0]+'.'};
const val=v=>typeof v==='function'?v():v;
const hf=t=>t<1?Math.round(t*60)+' мин':String(t).replace('.',',')+' ч';
const talkable=id=>{const p=P(id);return p&&(p.img||p.face)&&!val(p.status)};
const arr=x=>x?(Array.isArray(x)?x:[x]):[];

/* ================= ART ================= */
function face(p){if(!p)return '';const w=p.age>=2?'<path d="M36 56q4 2 8 0M56 56q4 2 8 0M42 76q8 4 16 0" stroke="#8a6a52" stroke-width="1" fill="none" opacity=".6"/>':(p.age?'<path d="M40 74q10 4 20 0" stroke="#8a6a52" stroke-width="1" fill="none" opacity=".5"/>':'');
 let hair='';if(p.style==='short')hair=`<path d="M26 50q0-30 24-30t24 30q-4-14-24-16t-24 16z" fill="${p.hair}"/>`;
 if(p.style==='cap')hair=`<path d="M24 46q2-26 26-26t26 26z" fill="#33363a"/><path d="M50 44h32q-4 6-32 6z" fill="#26282b"/>`;
 if(p.style==='long')hair=`<path d="M22 64q-4-46 28-46t28 46v32q-8-8-8-34q-4-18-20-18t-20 18q0 26-8 34z" fill="${p.hair}"/>`;if(p.style==='kerchief')hair=`<path d="M20 60q-2-44 30-44t30 44q-6-28-30-28t-30 28z" fill="${p.hair}"/><path d="M28 80l-10 22h64l-10-22" fill="${p.hair}"/><circle cx="34" cy="30" r="2" fill="#e8ddc1" opacity=".5"/><circle cx="60" cy="24" r="2" fill="#e8ddc1" opacity=".5"/><circle cx="70" cy="40" r="2" fill="#e8ddc1" opacity=".5"/>`;
 const beard=p.beard?`<path d="M30 64q2 26 20 26t20-26q-6 10-20 10t-20-10z" fill="${p.hair}"/>`:'';
 const stub=p.stubble?`<path d="M32 66q4 22 18 22t18-22q-4 8-18 8t-18-8z" fill="#3a2e24" opacity=".25"/>`:'';
 const mus=p.mustache?`<path d="M40 72q10-6 20 0q-10 3-20 0z" fill="${p.hair}"/>`:'';
 return `<svg viewBox="0 0 100 110"><rect width="100" height="110" fill="#454b46"/><rect y="0" width="100" height="110" fill="url(#)" opacity="0"/>
 <path d="M8 110q4-24 42-26q38 2 42 26z" fill="${p.shirt}"/><rect x="42" y="74" width="16" height="16" fill="${p.skin}"/>
 <ellipse cx="50" cy="54" rx="24" ry="29" fill="${p.skin}"/>${stub}${w}
 <circle cx="41" cy="52" r="2.6" fill="#1d1a16"/><circle cx="59" cy="52" r="2.6" fill="#1d1a16"/>
 <path d="M35 45l11 1M54 46l11-1" stroke="${p.style==='kerchief'?'#6b5b4b':p.hair}" stroke-width="2.4" stroke-linecap="round"/>
 <path d="M50 54l-3 12h5" stroke="#9b7458" stroke-width="1.5" fill="none"/>${beard}${mus}<path d="M43 75q7 3 14 0" stroke="#7a4b3a" stroke-width="2" fill="none"/>${hair}</svg>`}

function house(o){o=o||{};const wall=o.wall||'#6b4e34',roof=o.roof||'#3d4a3f';
 return `<svg viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="dusk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b4a5c"/><stop offset="1" stop-color="#c58f62"/></linearGradient></defs>
 <rect width="400" height="220" fill="url(#dusk)"/><circle cx="330" cy="54" r="16" fill="#f1d9a8" opacity=".6"/>
 <path d="M0 150q60-16 120-6t140-4t140 6V220H0z" fill="#2c3a2f"/>
 <g fill="#1f2a22"><circle cx="30" cy="140" r="26"/><circle cx="60" cy="130" r="20"/><circle cx="370" cy="136" r="24"/></g>
 <path d="M110 92L190 46L270 92z" fill="${roof}"/><rect x="118" y="92" width="144" height="82" fill="${wall}"/>
 <g stroke="rgba(0,0,0,.18)" stroke-width="2">${[104,116,128,140,152,164].map(y=>`<path d="M118 ${y}H262"/>`).join('')}</g>
 <rect x="134" y="110" width="30" height="26" fill="${o.dark?'#1b1d22':'#e8b866'}"/><rect x="216" y="110" width="30" height="26" fill="${o.dark?'#1b1d22':'#e8b866'}" opacity=".85"/>
 <path d="M134 123h30M149 110v26M216 123h30M231 110v26" stroke="${wall}" stroke-width="3"/>
 <rect x="128" y="108" width="6" height="30" fill="#c9b48a"/><rect x="164" y="108" width="6" height="30" fill="#c9b48a"/><rect x="210" y="108" width="6" height="30" fill="#c9b48a"/><rect x="246" y="108" width="6" height="30" fill="#c9b48a"/>
 <rect x="178" y="134" width="24" height="40" fill="#3a2a1d"/><circle cx="197" cy="155" r="1.6" fill="#d6b45a"/>
 <g fill="#8c7350">${Array.from({length:22},(_,i)=>`<rect x="${6+i*18}" y="168" width="7" height="34" rx="2"/>`).join('')}</g><rect x="0" y="178" width="400" height="5" fill="#76603f"/>
 <path d="M0 202H400V220H0z" fill="#3b3326"/>
 ${o.tape?`<g transform="rotate(-8 190 150)"><rect x="150" y="146" width="90" height="9" fill="#e4c33d"/><text x="195" y="153.5" font-size="7" text-anchor="middle" font-family="PT Mono,monospace" fill="#1d1a12">НЕ ВХОДИТЬ · НЕ ВХОДИТЬ</text></g><g transform="rotate(9 190 160)"><rect x="150" y="156" width="90" height="8" fill="#e4c33d"/></g>`:''}
 ${o.niva?`<g transform="translate(286 166)"><rect x="0" y="0" width="86" height="22" rx="3" fill="#e9e6dc"/><path d="M10 0l8-16h44l8 16z" fill="#e9e6dc"/><path d="M20-2l6-11h14v11zM44-2v-11h14l6 11z" fill="#4c5b66"/><circle cx="18" cy="24" r="8" fill="#1b1b1b"/><circle cx="68" cy="24" r="8" fill="#1b1b1b"/><rect x="78" y="6" width="8" height="5" fill="#f2d27a"/></g>`:''}
 ${o.bar?`<rect x="150" y="76" width="80" height="18" fill="#2a1f16"/><text x="190" y="89" text-anchor="middle" font-family="Oswald,Impact,sans-serif" font-size="13" fill="#f2b84b" letter-spacing="3">КОЛОС</text><circle cx="190" cy="85" r="40" fill="#f2b84b" opacity=".08"/>`:''}
 </svg>`}

const pic=(n,alt)=>`<img src="img/${n}.webp" alt="${alt||''}">`;
const por=id=>{const p=P(id);if(!p)return '';return p.img?`<img src="img/${p.img}.webp" alt="${p.fio}">`:face(p.face)};
const locArt=id=>{const l=CS.locs[id];return (l.img?pic(l.img,l.name):(l.svg?l.svg():house(l.house||{})))+(l.overlay||'')};
const tint=()=>{const h=S.t%24;return h>=19?.45:h>=17?.28:h>=15?.12:0};
function fpSVG(match){return `<svg viewBox="0 0 120 140" width="120" height="140"><g fill="none" stroke="${match?'#b8362e':'#2a251b'}" stroke-width="2.2" stroke-linecap="round">${Array.from({length:9},(_,i)=>`<ellipse cx="60" cy="72" rx="${10+i*5.5}" ry="${14+i*7}" stroke-dasharray="${8+i*3} ${3+i%3*2}" transform="rotate(${i%2?4:-4} 60 72)"/>`).join('')}</g></svg>`}
const BAG='<svg viewBox="0 0 48 48" width="40" height="40"><path d="M10 10h28v32H10z" fill="#e6dcc2" stroke="#6b604a" stroke-width="2"/><path d="M10 16h28" stroke="#b8362e" stroke-width="3"/><path d="M16 24h16M16 30h12M16 36h14" stroke="#9a8e72" stroke-width="2"/></svg>';
const dusk=(id,a,b)=>`<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>`;
function townSVG(k){const W='<svg viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice">';
 if(k==='home')return W+dusk('gh','#3b4656','#8c7a6a')+`<rect width="400" height="220" fill="url(#gh)"/><rect x="60" y="30" width="280" height="160" fill="#8f8a80"/><g>${Array.from({length:5},(_,r)=>Array.from({length:8},(_,c)=>`<rect x="${74+c*33}" y="${40+r*29}" width="18" height="18" fill="${(r*3+c)%7===2||(r+c)%5===0?'#e6b45e':'#2c3038'}"/>`).join('')).join('')}</g><rect x="186" y="168" width="28" height="22" fill="#3a2d22"/><rect x="0" y="190" width="400" height="30" fill="#3a3a36"/><rect x="40" y="178" width="40" height="6" fill="#5b4a36"/><path d="M0 220V190H400V220" fill="#2e2e2b"/></svg>`;
 if(k==='zavod')return W+dusk('gz','#4a5260','#a08a70')+`<rect width="400" height="220" fill="url(#gz)"/><g fill="#5a5d60"><rect x="300" y="20" width="16" height="110"/><rect x="330" y="40" width="14" height="90"/></g><g fill="#cfd3d6" opacity=".35"><circle cx="308" cy="14" r="12"/><circle cx="320" cy="2" r="16"/><circle cx="338" cy="30" r="10"/></g><path d="M20 190V100l40-24v24l40-24v24l40-24v24l40-24v24l40-24v24l40-24v114z" fill="#6e6a63"/><g fill="#d9b35a" opacity=".8">${[40,90,140,190,240].map(x=>`<rect x="${x}" y="130" width="30" height="16"/>`).join('')}</g><rect x="140" y="160" width="60" height="30" fill="#2d2a26"/><rect x="100" y="66" width="120" height="16" fill="#2a251b"/><text x="160" y="78" text-anchor="middle" font-family="Oswald,Impact,sans-serif" font-size="11" fill="#e8ddc1" letter-spacing="2">ПРИГОРСКМАШ</text><rect y="190" width="400" height="30" fill="#34332f"/></svg>`;
 if(k==='garage')return W+dusk('gg','#2f3846','#6a5a4e')+`<rect width="400" height="220" fill="url(#gg)"/><rect x="0" y="80" width="400" height="110" fill="#6a665e"/>${Array.from({length:6},(_,i)=>{const x=10+i*66,open=i===3;return `<rect x="${x}" y="100" width="56" height="90" fill="${open?'#e0a64e':'#4f5256'}"/>${open?`<rect x="${x+6}" y="140" width="44" height="50" fill="#2b231b"/><rect x="${x+12}" y="150" width="30" height="18" fill="#7a6a52"/>`:`<path d="M${x} ${110}h56M${x} 122h56M${x} 134h56M${x} 146h56M${x} 158h56M${x} 170h56" stroke="#3d4044" stroke-width="2"/>`}<text x="${x+28}" y="96" text-anchor="middle" font-family="PT Mono,monospace" font-size="9" fill="#e8ddc1">${14+i}</text>`}).join('')}<rect y="190" width="400" height="30" fill="#3b3a35"/><path d="M0 200q200 10 400 0" stroke="#55534c" stroke-width="3" fill="none"/></svg>`;
 if(k==='tire')return W+dusk('gt','#2e3644','#7a5e46')+`<rect width="400" height="220" fill="url(#gt)"/><rect x="40" y="60" width="220" height="130" fill="#7b7468"/><rect x="60" y="40" width="180" height="24" fill="#1d1d1f"/><text x="150" y="57" text-anchor="middle" font-family="Oswald,Impact,sans-serif" font-size="13" fill="#e6b84a" letter-spacing="2">ШИНОМОНТАЖ «КОЛЕСО»</text><rect x="70" y="100" width="90" height="90" fill="#e0a64e"/><rect x="78" y="110" width="74" height="80" fill="#2b241d"/><g fill="#1c1c1c" stroke="#3a3a3a" stroke-width="3">${[0,1,2,3].map(i=>`<ellipse cx="200" cy="${180-i*16}" rx="26" ry="8"/>`).join('')}${[0,1,2].map(i=>`<ellipse cx="236" cy="${182-i*16}" rx="22" ry="7"/>`).join('')}</g><g transform="translate(272 132)"><rect x="0" y="12" width="110" height="34" rx="4" fill="#141518"/><path d="M14 12l10-22h56l12 22z" fill="#141518"/><path d="M28 10l6-14h18v14zM58 10v-14h18l8 14z" fill="#3c4650"/><circle cx="24" cy="48" r="11" fill="#090909"/><circle cx="88" cy="48" r="11" fill="#090909"/><rect x="100" y="20" width="10" height="6" fill="#f2d27a"/></g><rect y="190" width="400" height="30" fill="#36342f"/></svg>`;
 return W+`<rect width="400" height="220" fill="#222"/></svg>`}
function forestSVG(){return `<svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice">${dusk('gf','#3a433e','#121713')}<rect width="400" height="260" fill="url(#gf)"/>
 <g fill="#151b17">${Array.from({length:16},(_,i)=>{const x=i*27+((i*37)%13),h=110+((i*53)%40);return `<rect x="${x}" y="0" width="${7+(i%3)*3}" height="${h+40}"/><path d="M${x-22} ${h}l${26+(i%3)} -${60+(i%4)*10}l${26+(i%3)} ${60+(i%4)*10}z"/>`}).join('')}</g>
 <rect width="400" height="260" fill="#cfd8d4" opacity=".07"/>
 <path d="M0 150q100-14 200-4t200 0V260H0z" fill="#232b22"/><path d="M0 190q120 30 260 10t140 10V260H0z" fill="#1a2019"/>
 <polygon points="70,182 110,118 152,182" fill="#56664a"/><polygon points="102,182 110,140 120,182" fill="#1a1f18"/><path d="M110 118L60 186M110 118l52 68" stroke="#3c4834" stroke-width="2"/>
 <g transform="translate(160 168)"><rect width="34" height="38" rx="8" fill="#4d3c2a"/><rect x="6" y="6" width="22" height="12" rx="3" fill="#3a2d20"/><path d="M8 0v-6h18v6" stroke="#2f241a" stroke-width="3" fill="none"/></g>
 <g transform="translate(206 180)"><rect width="13" height="30" rx="3" fill="#8b918b"/><rect x="-1" y="-5" width="15" height="7" rx="2" fill="#5e635e"/></g>
 <g transform="translate(240 190)"><g fill="#4a4d48">${[0,10,20,30,6,26].map((x,i)=>`<circle cx="${x+4}" cy="${i>3?2:12}" r="5"/>`).join('')}</g><path d="M6 8l26 2M10 2l20 10" stroke="#0e0e0c" stroke-width="3"/><rect x="34" y="12" width="7" height="2.5" fill="#efe6cf" transform="rotate(-18 34 12)"/></g>
 <g stroke="#0f130f" stroke-width="5" fill="none" stroke-dasharray="6 5"><path d="M300 258q40-26 100-34"/><path d="M318 260q40-24 82-28"/></g>
 <path d="M8 236q26-26 56 0z" fill="#3a2f22"/><path d="M4 230h68" stroke="#e4c33d" stroke-width="3" stroke-dasharray="8 6"/></svg>`}

/* ================= CASES ================= */
const CASES={};
