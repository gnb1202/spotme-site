import '../src/generated/site.css';
import 'lenis/dist/lenis.css';
import {SiteShell} from '../src/SiteShell';
import '../src/integration/integration.css';
import SiteNavigation from '../src/integration/SiteNavigation';
import BackToTop from '../src/integration/BackToTop';
import RouteTransition from '../src/integration/RouteTransition';
import '../src/integration/typography.css';
import '../src/integration/mint-palette.css';
import '../src/integration/figma-layout.css';

export const metadata={title:'SPOT ME',description:'SPOT ME — AI 운동 파트너'};
export default function RootLayout({children}){
  return <html lang="ko" data-scroll-behavior="smooth"><body><RouteTransition navigation={<><SiteNavigation/><BackToTop/></>}><SiteShell>{children}</SiteShell></RouteTransition></body></html>;
}
