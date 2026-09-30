import React from 'react';
import refinements from './generated/refinements.json';
import {FigmaOutline} from './FigmaOutline';
import {SmoothNavigation} from './components/smoothui/SmoothNavigation';

// Figma-exported geometry stays data; actual elements are created and owned by React.
export function DesignNode({node,calibrationEpoch=0,enhanceNav=false}) {
  if(typeof node==='string')return node;
  if(enhanceNav&&node.tag==='nav'&&node.props?.['aria-label']==='주요 메뉴')return <SmoothNavigation node={node} renderNode={child=><DesignNode node={child} calibrationEpoch={calibrationEpoch}/>}/>;
  const refinement=refinements[node.props?.['data-source-node-id']];
  const props=refinement?.kind==='asset-size'&&calibrationEpoch?{...node.props,style:{...node.props.style,width:refinement.width,height:refinement.height}}:node.props;
  const children=node.children.map((child,i)=><DesignNode key={child.props?.['data-node-id']??i} node={child} calibrationEpoch={calibrationEpoch} enhanceNav={enhanceNav}/>);
  // MotionExperience deliberately keeps the original frozen A/B rendering.
  if(refinement?.kind==='outline'&&calibrationEpoch)children.push(<FigmaOutline key="figma-outline" spec={refinement} epoch={calibrationEpoch}/>);
  return React.createElement(node.tag,props,...children);
}
