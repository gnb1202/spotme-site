import React from 'react';

// User-requested addition below the frozen ABOUT description (120:1011).
// Source: design-reference/assets/delivery-260925/03_오브젝트/@_캐릭터/01_레미/레미_홈B.png
// SHA256: af96b9c7bca7422413b785baf75b8e64a67e7ae4c7a61036884f91c6a0483bea
export default function HomeAboutRemi({descriptionStyle}){
 const width=parseFloat(descriptionStyle.width);
 return <img className="node art home-about-remi" data-anchor-node-id="120:1011"
  src="/motion-assets/delivery-260925/af96b9c7bca7422413b785baf75b8e64a67e7ae4c7a61036884f91c6a0483bea.png"
  alt="앞을 가리키는 파트너 레미" draggable={false} decoding="async"
  style={{left:descriptionStyle.left,top:parseFloat(descriptionStyle.top)+parseFloat(descriptionStyle.height)+40,
   width,height:width*1080/840,objectFit:'contain',pointerEvents:'none'}}/>;
}
