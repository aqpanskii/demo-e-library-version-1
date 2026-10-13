/** Adapted from Kokonut UI Action Search Bar, @kokonutui, MIT.
 * Source: https://kokonutui.com/r/action-search-bar.json
 * Changes: library data, compact CSS, functional navigation, keyboard and reduced-motion support.
 */
import React, {useState, useMemo, useEffect, useRef} from 'react';
import {AnimatePresence, motion, useReducedMotion} from 'motion/react';
import {Search, BookOpen, ArrowUpRight, X} from 'lucide-react';
function useDebounce(value, delay=150){const [debounced,setDebounced]=useState(value);useEffect(()=>{const timer=setTimeout(()=>setDebounced(value),delay);return()=>clearTimeout(timer)},[value,delay]);return debounced}
export default function ActionSearchBar({actions,initialQuery='',onQuery}){
 const [query,setQuery]=useState(initialQuery),[focused,setFocused]=useState(false),[active,setActive]=useState(-1);
 const input=useRef(null),reduced=useReducedMotion(),debounced=useDebounce(query);
 const result=useMemo(()=>actions.filter(a=>(a.title+' '+a.author).toLowerCase().includes(debounced.toLowerCase().trim())).slice(0,5),[actions,debounced]);
 useEffect(()=>{onQuery(debounced);setActive(-1)},[debounced]);
 useEffect(()=>{const handler=e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();input.current?.focus()}};document.addEventListener('keydown',handler);return()=>document.removeEventListener('keydown',handler)},[]);
 function choose(b){setFocused(false);location.hash='book/'+b.id}
 function keys(e){if(e.key==='Escape'){setFocused(false);setActive(-1);return}if(!result.length)return;if(e.key==='ArrowDown'){e.preventDefault();setFocused(true);setActive(i=>(i+1)%result.length)}else if(e.key==='ArrowUp'){e.preventDefault();setActive(i=>(i-1+result.length)%result.length)}else if(e.key==='Enter'&&focused&&active>=0){e.preventDefault();choose(result[active])}}
 const duration=reduced?0:.2;
 return <div className="kokonut-search" onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))setFocused(false)}}>
  <div className={'search-field '+(focused?'is-focused':'')}><Search size={17} aria-hidden="true"/><input id="search" ref={input} type="search" value={query} placeholder="Найти свою следующую историю" aria-label="Поиск по названию или автору" role="combobox" aria-expanded={focused} aria-controls="search-suggestions" aria-autocomplete="list" aria-activedescendant={focused&&active>=0?'suggestion-'+result[active]?.id:undefined} onFocus={()=>setFocused(true)} onChange={e=>{setQuery(e.target.value);setActive(-1);setFocused(true)}} onKeyDown={keys}/>{query?<button type="button" className="clear-search" aria-label="Очистить поиск" onClick={()=>{setQuery('');input.current?.focus()}}><X size={14}/></button>:<kbd>Ctrl K</kbd>}</div>
  <AnimatePresence>{focused&&<motion.div key="suggestions" className="search-dropdown" initial={{opacity:0,y:reduced?0:7}} animate={{opacity:1,y:0}} exit={{opacity:0,y:reduced?0:4}} transition={{duration}}><div className="search-dropdown-label">{query?'НАЙДЕННЫЕ ИСТОРИИ':'ВЫБЕРИТЕ КНИГУ'}</div><ul id="search-suggestions" role="listbox" aria-label="Книги">{result.map((b,i)=><motion.li key={b.id} id={'suggestion-'+b.id} role="option" aria-selected={active===i} className={active===i?'is-active':''} initial={{opacity:0,x:reduced?0:-5}} animate={{opacity:1,x:0}} transition={{duration,delay:reduced?0:i*.025}} onMouseDown={e=>e.preventDefault()} onMouseEnter={()=>setActive(i)} onClick={()=>choose(b)}><span className="search-book-icon" style={{background:b.color}}><BookOpen size={17}/></span><span className="search-book-info"><b>{b.title}</b><small>{b.author}</small></span><ArrowUpRight size={16}/></motion.li>)}</ul>{!result.length&&<p className="search-no-results">Книга не найдена. Попробуйте другое название.</p>}<div className="search-help"><span>↑ ↓ выбрать · Enter открыть</span><span>Esc закрыть</span></div></motion.div>}</AnimatePresence>
 </div>
}
