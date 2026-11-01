/* Silent Prigorsk · Actions: travel, dialogs, court, click handling, startup. */
/* ================= ACTIONS ================= */
function startCase(id){RQ.length=0;drawRadio();NQ.length=0;drawNote();CS=CASES[id];S=fresh(CS);Object.assign(UI,{tab:'here',modal:'brief',inside:false,reveal:[],view:null,sel:[],phoneMsg:null,newClues:new Set(),title:false});render();window.scrollTo(0,0)}
function travel(a,b){if(a===b)return 0;if(a==='otdel'||b==='otdel')return 1;const A=CS.locs[a],B=CS.locs[b];if(A.far||B.far)return 1;return (Math.hypot(A.x-B.x,A.y-B.y)<=60||(Math.abs(A.y-B.y)<12&&Math.abs(A.x-B.x)<=120))?.25:.5}
const tlabel=h=>(h<=.25?'ехать · 15 мин':h<1?'ехать · 30 мин':'ехать · 1 ч');
function anim(kind,txt,h,dur,cb){const el=document.getElementById('trav');const t0=S.t,tm=document.querySelector('.bar .time');let done=false,start=performance.now();
 const lab=typeof txt==='function'?txt:()=>txt;el.innerHTML=`<div class="tv ${kind}"><div class="tvin"><b>${lab(0)}</b><div class="tvbar"><i></i></div><span class="tvt">${fmt(t0)}</span></div></div>`;
 const bar=el.querySelector('.tvbar i'),tt=el.querySelector('.tvt'),bb=el.querySelector('.tvin b');
 const fin=()=>{if(done)return;done=true;el.innerHTML='';cb()};el.querySelector('.tv').onclick=fin;
 const step=n=>{if(done)return;const k=Math.min(1,(n-start)/dur);bar.style.width=(k*100)+'%';const v=fmt(t0+h*k);tt.textContent=v;bb.textContent=lab(k,t0+h*k);if(tm)tm.textContent=v;if(k<1)requestAnimationFrame(step);else setTimeout(fin,120)};requestAnimationFrame(step)}
function go(id,now){if(S.loc===id){setTab('here');return}if(!now&&!S.over){const h=travel(S.loc,id);return anim('car','Едем: '+CS.locs[S.loc].short+' → '+CS.locs[id].short,h,h<=.25?450:700,()=>go(id,true))}advance(travel(S.loc,id));UI.inside=false;if(!S.over)S.loc=id;setTab('here')}
function say(k){const d=S.dlg,who=d.who,asked=S.asked[who],room=d.mode==='room';
 if(k==='bye'){setTimeout(flushPins,0);const qs=(S.qseen=S.qseen||{});qs[who]=[...new Set([...(qs[who]||[]),...(d.shown||[])])];if(room&&S.smeta[who])S.smeta[who].done=true;UI.modal=null;S.dlg=null;if(S.flags.late)rollover();render();return}
 if(k==='detain'){UI.reveal.unshift({det:who});render();return}
 if(k==='summon'){summon(who,(Math.floor(S.t/24)+1)*24+10,'повестка, вручена лично');d.log.push({q:'Вот повестка. Завтра в 10:00 явитесь в районный отдел, кабинет 14.',a:'<i>(берёт повестку)</i> Хорошо.'});toast('Повестка вручена');render();return}
 if(k==='sample'){advance(.5);if(S.over)return render();const due=S.t+1;S.prints[who]={st:'taken',due,at:S.t};d.log.push({q:'Дайте руку. Снимем отпечатки.',a:'<i>(прикладывает пальцы к дактилокарте)</i>'});d.log.push({a:'<i>Отпечатки сняты и отправлены в лабораторию. Дактилокарта будет готова к '+fmt(due)+', результат придёт на почту.</i>'});render();return}
 const [type,id]=k.split(':');
 if(type==='q'){const q=CS.dlg[who].q.find(x=>x.id===id);asked[(room?'r':'')+id]=true;advance(.25);if(S.over)return render();
  const a=room&&q.ra?q.ra:q.a;d.log.push({q:q.q,a});arr(room&&q.rclue?q.rclue:q.clue).forEach(addClue);arr(q.pin).forEach(pin);arr(q.found).forEach(found);if(q.deal){release(who,(fem(who)?'дала':'дал')+' показания в обмен на свободу, '+(fem(who)?'отпущена':'отпущен'));d.log.push({a:'<i>Вы подписываете постановление об освобождении. '+short(who)+' забирает вещи у дежурного и уходит. Слово есть слово.</i>'});d.done=true}render();return}
 if(type==='press'){const e=CS.press[who][id];S.presented[who+':'+id]=true;advance(.25);if(S.over)return render();d.log.push({q:e.l.replace('Предъявить: ','Вот: '),a:e.a});arr(e.give).forEach(addClue);arr(e.pin).forEach(pin);arr(e.found).forEach(found);
  const cf=CS.confess&&CS.confess[who];if(cf&&!has(cf.clue)&&cf.check(who)){d.log.push({a:cf.text});addClue(cf.clue);d.done=true}
  if(CS.lawyer&&CS.lawyer[who]===id){S.flags['law_'+who]=1;d.done=true;d.log.push({a:'<i>Скрещивает руки на груди и смотрит в стену. Дальше разговора не будет.</i>'})}render();return}}
function court(){const r=CS.charge(UI.sel.slice());UI.sel=[];
 if(r.res==='return'){S.t=(Math.floor(S.t/24)+1)*24+8;S.loc='otdel';S.arrived=S.arrived.filter(x=>JAIL().includes(x));events();mail('Районный суд','Дело возвращено',r.text);toast('Суд вернул дело на доследование');UI.modal=null;if(day()>CS.days){S.over='timeout';UI.modal='end'}render();return}
 S.over=r.res;S.result=r;UI.modal='end';render()}
function startMusic(on){const a=document.getElementById('bgm');UI.music=on;if(!a)return;if(on){a.volume=.45;a.play().catch(()=>{UI.music=false;render()})}else a.pause()}

document.addEventListener('click',e=>{const el=e.target.closest('[data-a]');if(!el)return;const a=el.dataset.a,id=el.dataset.id;
 if(a==='stop')return;
 if(a==='start'){startMusic(true);startCase(+id);return}
 if(!S)return;
 if(a==='mclose'){if(e.target!==el&&!el.classList.contains('x')&&!el.classList.contains('back'))return;if(UI.modal==='end'||UI.modal==='brief')return;UI.call=null;if(UI.modal==='talk'){setTimeout(flushPins,0);if(S.dlg){const qs=(S.qseen=S.qseen||{});qs[S.dlg.who]=[...new Set([...(qs[S.dlg.who]||[]),...(S.dlg.shown||[])])]}if(S.dlg&&S.dlg.mode==='room'&&S.smeta[S.dlg.who])S.smeta[S.dlg.who].done=true;S.dlg=null}UI.modal=null;if(S.flags.late)rollover();render();return}
 if(S.over&&!['restart','next','tab','mail','hintoff','rvok','rok','nok','hoff','hint','gohome','detgo','hang','rvclose','view','mus','mclose'].includes(a)){UI.modal='end';render();return}
 switch(a){
 case 'tab':setTab(id);break;
 case 'hintoff':UI.hintOff=true;render();break;
 case 'accept':UI.modal=null;mail('Майор Гаврилов, начальник отдела','Приказ: дело '+CS.no,CS.brief.join('\n'));S.mail[0].read=true;S.mail[0].ap=true;render();break;
 case 'rvok':UI.reveal.shift();render();break;
 case 'hist':UI.modal={hist:id};render();break;
 case 'pend':{const t=S.summons[id];if(t!==undefined){const mm=Math.max(0,Math.round((t-S.t)*60)),h=Math.floor(mm/60),r=mm%60;toast(short(id)+': ожидается '+DUE(t)+' в '+fmt(t)+(DUE(t)!=='сегодня'?'':mm?', через '+(h?h+' ч':'')+(h&&r?' ':'')+(r?r+' мин':''):', вот-вот'))}break}
 case 'detgo':{UI.reveal.shift();const ok=CS.detain&&CS.detain[id]&&CS.detain[id]();if(!ok){note('Прокурор Ветрова по телефону: «Курейко, на каком основании? Подозрения не доказательства. Задержание не санкционирую». Нужны улики против этого человека.');render();break}const m=S.smeta[id]=S.smeta[id]||{};m.det=S.t+24;m.done=true;if(S.dlg)S.dlg.log.push({a:'<i>'+(fem(id)?'Задержана':'Задержан')+' до '+WHEN(S.t+24)+', '+fmt(S.t+24)+'. Конвой уводит в камеру.</i>'});toast(short(id)+': задержан(а) на 24 часа');render();break}
 case 'hqask':UI.reveal.unshift({hq:1});render();break;
 case 'hqgo':UI.reveal.shift();go('otdel');break;
 case 'howcall':note('<b>Как вызвать человека на допрос</b><br><br>1. Найдите его: в показаниях, в базе (компьютер в кабинете) или на месте.<br>2. Вызовите одним из способов:<br>· повестка лично, у его двери: явка завтра в 10:00<br>· повестка через базу: явка завтра в 10:00<br>· звонок с рабочего телефона: придёт через 2 часа<br><br>Когда человек придёт, дежурный сообщит вам. Ждёт он 5 часов, не позже 22:00.');break;
 case 'nok':NQ.shift();drawNote();render();break;
 case 'hoff':NQ.shift();UI.hintOff=true;drawNote();render();break;
 case 'hint':UI.hintOff=false;S.flags.lastHint=null;render();break;
 case 'rok':RQ.shift();drawRadio();break;
 case 'rvclose':UI.view=null;render();break;
 case 'view':UI.view=id;render();break;
 case 'mus':startMusic(!UI.music);render();break;
 case 'pin':case 'go':go(id);break;
 case 'inside':UI.inside=!UI.inside;render();break;
 case 'spot':{const sc=curScene(),h=sc.hot[+el.dataset.i];if(h.clue&&!has(h.clue)){advance(h.t||.5);if(S.over)return render();addClue(h.clue);arr(h.also).forEach(addClue);if(h.toast)toast(h.toast)}else if(h.text)note(h.text,+el.dataset.i);else toast('Уже осмотрено.');render();break}
 case 'lact':{const i=+el.dataset.i,ac=CS.locs[S.loc].actions[i];if(S.done[S.loc+i]){if(ac.go)setTab(ac.go);return}advance(ac.t);if(S.over)return render();S.done[S.loc+i]=true;ac.run();render();break}
 case 'lab':if(S.lab[id])return;advance(.5);S.lab[id]={due:S.t+CS.items[id].lab,done:false};toast('Отправлено. Результат к '+fmt(S.lab[id].due));render();break;
 case 'labbox':UI.modal='labm';render();break;
 case 'door':UI.modal=null;setTab('calls');break;
 case 'phone':UI.phoneMsg=null;UI.call=null;UI.modal='phone';render();break;
 case 'dial':startCall(el.dataset.k);break;
 case 'csay':{const c=UI.call;if(!c)break;if(el.dataset.v==='wrong'){c.q='Извините, ошиблись номером.';c.a='<i>(гудки)</i>';c.st='end';render();break}if(el.dataset.v==='srch'||el.dataset.v==='arst'){c.mode=el.dataset.v;c.q=el.dataset.v==='arst'?'Мне нужна санкция на арест.':'Мне нужна санкция на обыск.';c.st='who';render();break}const r=dial(c.k);c.q=r.q;c.a=r.a;c.st='end';render();break}
 case 'cback':{const c=UI.call;if(c){c.st='pick';c.q=null}render();break}
 case 'cwho':{const c=UI.call;if(!c)break;const r=c.mode==='arst'?prosArrest(id):prosSearch(id);c.q=(c.mode==='arst'?'Прошу санкцию на арест: ':'Прошу санкцию на обыск: ')+P(id).fio+'.';c.a=r;c.st='end';render();break}
 case 'hang':UI.call=null;render();break;
 case 'base':UI.modal='base';render();setTimeout(()=>{const i=document.getElementById('bq');if(i&&!S.base.rec)i.focus()},50);break;
 case 'brec':S.base.rec=id;found(id);CS.onRec&&CS.onRec(id);render();break;
 case 'bback':S.base.rec=null;render();break;
 case 'bpin':pin(P(S.base.rec).loc);render();break;
 case 'bcmp':{const c=P(S.base.rec).cmp;if(!has(c)){addClue(c,true);UI.reveal.push(c)}render();break}
 case 'letter':summon(S.base.rec,(Math.floor(S.t/24)+1)*24+10,'повестка через горотдел');toast('Повестка отправлена. Явка завтра в 10:00');render();break;
 case 'call':{const id=S.base.rec;UI.modal='phone';UI.call=null;startCall('call:'+id);break}
 case 'knock':{const D=CS.dlg[id];S.dlg={who:id,mode:'door',log:[{a:D?D.greet:'Здравствуйте.'}]};(S.talks=S.talks||[]).push({id,mode:'door',t:S.t,loc:S.loc,log:S.dlg.log});found(id);UI.modal='talk';render();break}
 case 'room':if(S.smeta[id])S.smeta[id].talked=true;S.dlg={who:id,mode:'room',done:!!S.flags['law_'+id],log:[{a:'<i>'+(S.flags['law_'+id]?short(id)+' молчит и требует адвоката. ':'')+((S.smeta[id]||{}).det?'Конвой приводит '+short(id)+' из камеры.':short(id)+' садится напротив.')+'</i>'}]};(S.talks=S.talks||[]).push({id,mode:'room',t:S.t,loc:'otdel',log:S.dlg.log});UI.modal='talk';render();break;
 case 'say':say(el.dataset.k);break;
 case 'search':{const w=CS.warrant;advance(w.h);if(S.over)return render();S.searched=true;addClue(w.clue);toast(w.toast);render();break}
 case 'wait':anim('wait','Ждём…',1,550,()=>{advance(1);render()});break;
 case 'gomail':UI.modal=null;go('otdel');if(!S.over)setTab('mail');break;
 case 'endday':UI.reveal.unshift({leave:1});render();break;
 case 'gohome':{UI.reveal.shift();render();const h=22-hour(),full=h+10;anim('night',(k,t)=>{const x=t%24;return x<22&&x>=8&&k<.5?'Едем домой…':x>=22||x<5?'Ночь…':'Утро'},full,1200,()=>{advance(h);UI.reveal=UI.reveal.filter(r=>!(r.night&&!r.night.left.length));render()});break}
 case 'mail':{const m=S.mail[+el.dataset.i];const ex=m.exam&&!m.ap;readMail(m);UI.modal=ex?null:{doc:+el.dataset.i};render();break}
 case 'accuse':UI.sel=[];UI.modal='accuse';render();break;
 case 'pick':UI.sel=UI.sel.includes(id)?UI.sel.filter(x=>x!==id):UI.sel.concat(id);render();break;
 case 'court':if(UI.sel.length)court();break;
 case 'restart':startCase(CS.id);break;
 case 'next':startCase(CS.next);break;
 case 'lamp':UI.lampOff=!UI.lampOff;render();break;
 case 'tea':toast(['Чай давно остыл.','Подстаканник ещё с советских времён.','Сахар кончился.'][Math.floor(Math.random()*3)]);break;
 case 'clock':toast('На часах '+fmt(S.t)+'. Смена до 22:00.');break;
 case 'window':toast(S.t%24>=18?'За окном темно. Где-то лает собака.':['Моросит. Голые ветки качаются.','Серое небо. Ни одной машины.','Ворона на ветке смотрит прямо на вас.'][Math.floor(Math.random()*3)]);break;
 }});
document.addEventListener('submit',e=>{if(e.target.id!=='bform')return;e.preventDefault();const raw=document.getElementById('bq').value,q=raw.trim().toLowerCase();S.base.q=raw;
 if(q.length<2){S.base.res=null;render();return}
 if(!e.detail_done){const box=document.querySelector('#bform');const pr=document.createElement('div');pr.className='bprog';pr.innerHTML='<span>ПОИСК ПО БАЗЕ…</span><div><i></i></div><b>0%</b>';const old=document.querySelector('.crt .res, .crt #bform ~ div');if(old)old.remove();box.after(pr);const t0=performance.now(),D=800;
  const st=n=>{const k=Math.min(1,(n-t0)/D);pr.querySelector('i').style.width=(k*100)+'%';pr.querySelector('b').textContent=Math.round(k*100)+'%';if(k<1)requestAnimationFrame(st);else{const ev=new Event('submit',{cancelable:true,bubbles:true});ev.detail_done=1;document.getElementById('bform').dispatchEvent(ev)}};requestAnimationFrame(st);return}
 const nz=x=>x.toLowerCase().replace(/ё/g,'е').trim();S.base.res=Object.keys(CS.people).filter(id=>nz(CS.people[id].fio.split(' ')[0])===nz(q));
 CS.onQuery&&CS.onQuery(q,S.base.res);render();setTimeout(()=>{const i=document.getElementById('bq');if(i)i.focus()},30)});

window.__game={CASES,get S(){return S},startCase,has:c=>has(c)};
render();
