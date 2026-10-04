// Web derivatives of the exact delivered artwork; no crop or composition changes.
export const videoAssetVariants=[
 {source:'/assets/delivery-260925/4cf0f12a46b3fb5c3d1bd318badba66052ea75f700707a49dd4ffb0dcb0cd35a.jpg',web:'/assets/video-web/background-4cf0f12a46b3-2560.webp',width:2560,belowFold:false},
 {source:'/assets/delivery-260925/6577c33130d122ea997e6c3a82fde6f896ae2ed4cfae626614938277644283f9.png',web:'/assets/video-web/remi-6577c33130d1-1600.webp',width:1600,belowFold:true},
];
export function videoWebSource(src){return videoAssetVariants.find(item=>item.source===src)?.web||src;}
export function videoEntrySources(sources){return sources.filter(src=>!videoAssetVariants.some(item=>item.source===src&&item.belowFold)).map(videoWebSource);}
export function videoAssetNode(node){
 const asset=videoAssetVariants.find(item=>item.source===node.props?.src);
 if(node.tag!=='img'||!asset)return node;
 return {...node,props:{...node.props,src:asset.web,decoding:'async',loading:asset.belowFold?'lazy':'eager',fetchPriority:asset.belowFold?'low':'high'}};
}
