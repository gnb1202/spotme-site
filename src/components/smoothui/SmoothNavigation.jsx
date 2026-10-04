// Adapted from SmoothUI Animated Tabs (Eduardo Calvo, MIT).
// https://smoothui.dev/r/animated-tabs.json — source and modifications in THIRD_PARTY_NOTICES.md.
import React,{useState} from 'react';
import Link from 'next/link';
import {AnimatePresence,motion,useReducedMotion} from 'motion/react';
import './navigation.css';

const SPRING={type:'spring',bounce:.05,duration:.25};
export function SmoothNavigation({node,renderNode}){
  const reduced=useReducedMotion(),[hover,setHover]=useState(null),[focus,setFocus]=useState(null);
  const transition=reduced?{duration:0}:SPRING;
  const links=node.children.filter(child=>child.tag==='a'&&child.props?.className?.split(' ').includes('text'));
  const preview=hover??focus;
  function keyboard(event,index){
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    event.preventDefault();
    const position=event.key==='Home'?0:event.key==='End'?links.length-1:(index+(event.key==='ArrowRight'?1:-1)+links.length)%links.length;
    event.currentTarget.closest('nav').querySelectorAll('a.smooth-nav-link')[position]?.focus();
  }
  return <nav {...node.props} data-smoothui="animated-tabs" onPointerLeave={()=>setHover(null)}>
    {node.children.map((child,index)=>{
      const tabIndex=links.indexOf(child);
      if(tabIndex<0)return <React.Fragment key={child.props?.['data-node-id']??index}>{renderNode(child)}</React.Fragment>;
      const active=child.props['aria-current']==='page',id=child.props.href;
      return <Link key={id} {...child.props} className={`${child.props.className} smooth-nav-link`}
        onPointerEnter={event=>{if(event.pointerType!=='touch')setHover(id);}} onFocus={()=>setFocus(id)} onBlur={()=>setFocus(null)}
        onKeyDown={event=>keyboard(event,tabIndex)}>
        <AnimatePresence initial={false}>
          {preview===id&&<motion.span aria-hidden="true" className="smooth-nav-hover" layoutId="spotme-nav-hover" initial={{opacity:0}} animate={{opacity:.1}} exit={{opacity:0}} transition={transition}/>}
        </AnimatePresence>
        {child.children.map((entry,i)=><React.Fragment key={i}>{renderNode(entry)}</React.Fragment>)}
        {active&&<motion.span aria-hidden="true" data-nav-indicator className="smooth-nav-indicator" layout layoutId="spotme-nav-active" style={{originY:'0px'}} transition={transition}/>}
      </Link>;
    })}
  </nav>;
}
