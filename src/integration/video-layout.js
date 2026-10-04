// User-approved departure from Figma: show the playable video before the artwork.
// Keep the frozen source and all original sizes intact.
const positions={'254:38':'350px','256:615':'1500px'};
import {videoAssetNode} from './video-assets.js';
import {routePalette} from './palette.js';
export function videoLayoutNode(node){
  node=videoAssetNode(node);
  // The background artwork starts slightly inset; match its exposed backing to the video gray.
  if(node.props?.['data-source-node-id']==='145:216')
    return {...node,props:{...node.props,style:{...node.props.style,backgroundImage:'none',backgroundColor:routePalette['/video/'].background}}};
  // Replacement artwork has new export dimensions. Preserve the layout boxes,
  // but do not stretch the new Remi or retain the old low-resolution registration.
  if(node.tag==='img'&&node.props?.['data-image-ref']==='bd95542aa09a7ea0e278ce44b61e9cae52671b57')
    return {...node,props:{...node.props,style:{...node.props.style,objectFit:'contain'}}};
  if(node.tag==='img'&&node.props?.['data-image-ref']==='49cc1d340dc21af332f432ffe5b194e69bbdca50')
    return {...node,props:{...node.props,style:{...node.props.style,objectFit:'cover',transform:'none'}}};
  const top=positions[node.props?.['data-source-node-id']];
  return top?{...node,props:{...node.props,style:{...node.props.style,top}}}:node;
}
