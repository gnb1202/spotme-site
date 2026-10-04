import React from 'react';
import Link from 'next/link';
import refinements from './generated/refinements.json';
import {FigmaOutline} from './FigmaOutline';
import {SmoothNavigation} from './components/smoothui/SmoothNavigation';
import DemoVideo from './integration/DemoVideo';
import {videoLayoutNode} from './integration/video-layout';
import HomeAboutRemi from './integration/HomeAboutRemi';

// Figma-exported geometry stays data; actual elements are created and owned by React.
export function DesignNode({node,calibrationEpoch=0,enhanceNav=false}) {
  if(typeof node==='string')return node;
  node=videoLayoutNode(node);
  if(node.props?.id==='restart')return <button {...node.props} type="button">오프닝 다시보기</button>;
  // One responsive four-tab header replaces the source's five-tab navigation.
  if(node.tag==='nav'&&node.props?.['aria-label']==='주요 메뉴')return null;
  if(node.props?.['data-source-node-id']==='145:332')return null;
  if(enhanceNav&&node.tag==='nav'&&node.props?.['aria-label']==='주요 메뉴')return <SmoothNavigation node={node} renderNode={child=><DesignNode node={child} calibrationEpoch={calibrationEpoch}/>}/>;
  const refinement=refinements[node.props?.['data-source-node-id']];
  const props=refinement?.kind==='asset-size'&&calibrationEpoch?{...node.props,style:{...node.props.style,width:refinement.width,height:refinement.height}}:node.props;
  const children=node.children.map((child,i)=><DesignNode key={child.props?.['data-node-id']??i} node={child} calibrationEpoch={calibrationEpoch} enhanceNav={enhanceNav}/>);
  if(node.props?.['data-source-node-id']==='254:38')return <DemoVideo node={node}>{children}</DemoVideo>;
  if(node.props?.['data-source-node-id']==='145:225')return React.createElement(node.tag,props,<span className="ink">시연 영상</span>);
  if(node.props?.['data-source-node-id']==='120:1011')return <>{React.createElement(node.tag,props,...children)}<HomeAboutRemi descriptionStyle={props.style}/></>;
  // MotionExperience deliberately keeps the original frozen A/B rendering.
  if(refinement?.kind==='outline'&&calibrationEpoch)children.push(<FigmaOutline key="figma-outline" spec={refinement} epoch={calibrationEpoch}/>);
  if(node.tag==='a'&&props?.href?.startsWith('/'))return <Link {...props} scroll={!('data-keep-scroll' in props)}>{children}</Link>;
  return React.createElement(node.tag,props,...children);
}
