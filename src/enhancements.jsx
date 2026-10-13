import React from 'react';
import {createRoot} from 'react-dom/client';
import {MotionConfig} from 'motion/react';
import {animate as motionAnimate,stagger as motionStagger} from 'motion';
import {animate as animeAnimate,stagger as animeStagger} from 'animejs';
import {ArrowUpRight,Check,Bookmark,BookOpen,Sparkles} from 'lucide-react';
import ActionSearchBar from './components/action-search-bar';
import ParticleButton from './components/particle-button';
import {ShineBorder} from './components/shine-border';

const roots=new Map(),animations=new Map();
const preference=matchMedia('(prefers-reduced-motion: reduce)');
let frame=0;
function reduced(){return preference.matches}
function mount(node,element){const root=createRoot(node);roots.set(node,root);root.render(<MotionConfig reducedMotion="user">{element}</MotionConfig>)}
function track(node,control){if(!animations.has(node))animations.set(node,[]);animations.get(node).push(control);return control}
function release(){for(const [node,root] of roots)if(!node.isConnected){root.unmount();roots.delete(node)}for(const [node,list] of animations)if(!node.isConnected){list.forEach(a=>a.cancel?.()||a.stop?.());animations.delete(node)}}
function schedule(){cancelAnimationFrame(frame);frame=requestAnimationFrame(enhance)}
function animateNew(selector,keyframes,options){const nodes=[...document.querySelectorAll(selector)].filter(n=>!n.dataset.motionReady);nodes.forEach(n=>n.dataset.motionReady='1');if(!nodes.length||reduced())return;nodes.forEach((n,i)=>track(n,motionAnimate(n,keyframes,{...options,delay:i*.035})));}
function enrichSearch(){const original=document.querySelector('.catalog-top > .search');if(!original)return;const input=original.querySelector('input'),handler=input.oninput,host=document.createElement('div');host.className='search-island';const value=input.value;original.replaceWith(host);mount(host,<ActionSearchBar initialQuery={value} actions={window.kitapBridge.searchBooks()} onQuery={q=>{handler({target:{value:q}});schedule()}}/>)}
function particleButton(node,onClick,label,icon){const host=document.createElement('span');host.className='particle-island';node.replaceWith(host);mount(host,<ParticleButton className="btn primary" icon={icon} onClick={onClick}>{label}</ParticleButton>)}
function enrichHero(){const hero=document.querySelector('.hero');if(!hero||hero.dataset.enhanced)return;hero.dataset.enhanced='1';const h1=hero.querySelector('h1');h1.innerHTML='<span class="hero-line">Читать.</span><span class="hero-line">Понимать. <em>Открывать.</em></span>';
 const action=document.createElement('div');action.className='hero-actions';hero.firstElementChild.insertBefore(action,hero.querySelector('.hero-meta'));
 mount(action,<><ParticleButton className="btn primary hero-start" icon={<ArrowUpRight size={16}/>} onClick={()=>{const shelf=document.querySelector('.catalog-top');shelf?.scrollIntoView({behavior:reduced()?'instant':'smooth',block:'start'});document.querySelector('#search')?.focus({preventScroll:true})}}>Выбрать книгу</ParticleButton><span className="hero-action-note">Новая история начинается здесь</span></>);
 const art=hero.querySelector('.hero-art');art.insertAdjacentHTML('afterbegin','<svg class="hero-orbit" viewBox="0 0 460 310" aria-hidden="true"><ellipse cx="233" cy="160" rx="207" ry="103" transform="rotate(-19 233 160)"/><circle cx="394" cy="66" r="4"/></svg><span class="hero-spark spark-one" aria-hidden="true">✧</span><span class="hero-spark spark-two" aria-hidden="true">✦</span>');
 const label=art.querySelector('.floating-label');label.innerHTML='<span class="translation-dot"></span><span><small>ОТКРЫВАЙТЕ НОВЫЕ СЛОВА</small>путешествие <b>→ саяхат</b></span>';
 const border=document.createElement('div');border.className='shine-island';label.append(border);mount(border,<ShineBorder shineColor={['#91aa79','#c9a76a','#315b46']} duration={12}/>);
 if(!reduced()){
  track(hero,animeAnimate(hero.querySelectorAll('.eyebrow,.hero-line,.hero p,.hero-actions,.hero-meta'),{opacity:[0,1],translateY:[16,0],delay:animeStagger(85),duration:680,ease:'out(3)'}));
  track(art,animeAnimate(art.querySelectorAll('.hero-book'),{translateY:[30,0],opacity:[0,1],delay:animeStagger(110,{start:120}),duration:1000,ease:'out(4)'}));
  track(art,animeAnimate(art.querySelector('.hero-orbit ellipse'),{strokeDashoffset:[1000,0],duration:1600,delay:200,ease:'out(2)'}));
  track(label,animeAnimate(label,{translateY:[13,0],opacity:[0,1],duration:750,delay:420,ease:'out(3)'}));
 }
}
function enrichActions(){const tryRead=document.querySelector('#try-read');if(tryRead)particleButton(tryRead,tryRead.onclick,'Попробовать',<ArrowUpRight size={15}/>);
 const detailActions=document.querySelector('.detail .actions');if(detailActions&&!detailActions.dataset.enhanced){detailActions.dataset.enhanced='1';const save=detailActions.querySelector('[data-save]');if(save){const saved=save.textContent.includes('✓');particleButton(save,save.onclick,saved?'В моих книгах':'Сохранить книгу',saved?<Check size={16}/>:<Bookmark size={16}/>);}}
 const banner=document.querySelector('.bottom-banner');if(banner&&!banner.dataset.enhanced){banner.dataset.enhanced='1';const border=document.createElement('div');border.className='shine-island';banner.append(border);mount(border,<ShineBorder shineColor={['#7c9c67','#d2b37d','#648b72']} duration={16}/>)}
}
function cardInteractions(){document.querySelectorAll('.card .cover-shell').forEach(shell=>{if(shell.dataset.tiltReady)return;shell.dataset.tiltReady='1';const cover=shell.querySelector('.cover');if(!cover)return;let control;
 function move(e){if(reduced()||e.pointerType==='touch')return;const rect=shell.getBoundingClientRect(),x=(e.clientX-rect.left)/rect.width-.5,y=(e.clientY-rect.top)/rect.height-.5;shell.style.setProperty('--light-x',((x+.5)*100)+'%');shell.style.setProperty('--light-y',((y+.5)*100)+'%');control?.stop();control=motionAnimate(cover,{rotateY:x*12,rotateX:-y*9,y:-7},{duration:.23});}
 shell.addEventListener('pointermove',move);shell.addEventListener('pointerleave',()=>{control?.stop();control=motionAnimate(cover,{rotateY:0,rotateX:0,y:0},{duration:reduced()?0:.35});});
 });}
function readerProgress(){const toolbar=document.querySelector('.reader-toolbar'),label=document.querySelector('#page-label');if(!toolbar||!label)return;let line=toolbar.querySelector('.reading-progress');if(!line){line=document.createElement('div');line.className='reading-progress';line.setAttribute('role','progressbar');line.setAttribute('aria-label','Прогресс чтения');line.setAttribute('aria-valuemin','0');line.setAttribute('aria-valuemax','100');line.innerHTML='<span></span>';toolbar.append(line)}const [a,b]=label.textContent.split('/').map(Number),percent=b?a/b*100:0;line.setAttribute('aria-valuenow',Math.round(percent));motionAnimate(line.firstChild,{width:percent+'%'},{duration:reduced()?0:.45,ease:'easeOut'});}
function enhance(){release();enrichSearch();enrichHero();enrichActions();cardInteractions();readerProgress();animateNew('.card',{opacity:[0,1],y:[14,0]},{duration:.36,ease:'easeOut'});animateNew('.detail,.quiz,.admin-head,.panel',{opacity:[0,1],y:[8,0]},{duration:.26,ease:'easeOut'});animateNew('.reader-page',{opacity:[.65,1]},{duration:.2});}
// Small islands preserve the original static app and its localStorage data model.
for(const name of ['catalog','detail','reader','drawPage','quiz','showResult','admin','openModal','wireSaves']){const original=window[name];if(typeof original==='function')window[name]=function(...args){const result=original.apply(this,args);schedule();return result}}
const gridObserver=new MutationObserver(schedule);gridObserver.observe(document.querySelector('#app'),{childList:true});
const popover=document.querySelector('#translation');new MutationObserver(()=>{if(!popover.hidden&&!reduced())motionAnimate(popover,{opacity:[0,1],scale:[.96,1],y:[5,0]},{duration:.18})}).observe(popover,{attributes:true,attributeFilter:['hidden']});
const modal=document.querySelector('#modal');new MutationObserver(()=>{if(modal.open&&!reduced())motionAnimate(modal,{opacity:[0,1],scale:[.98,1],y:[10,0]},{duration:.2})}).observe(modal,{attributes:true,attributeFilter:['open']});
preference.addEventListener('change',()=>{if(reduced()){for(const [,list] of animations)list.forEach(a=>{if(a.complete)a.complete();else a.finish?.()});animations.clear()}});
document.documentElement.classList.add('enhanced-ui');schedule();
window.kitapEnhancements={versions:{animejs:'4.2.2',motion:'12.23.24'},components:['Kokonut UI ActionSearchBar','Kokonut UI ParticleButton','Magic UI ShineBorder via 21st.dev'],refresh:schedule};
