import {notFound} from 'next/navigation';
import pages from '../../src/generated/pages.json';
import {SitePage} from '../../src/SitePage';

const toRoute=slug=>slug?.length?`/${slug.join('/')}/`:'/';
export function generateStaticParams(){return Object.keys(pages).map(route=>({slug:route.split('/').filter(Boolean)}));}
export async function generateMetadata({params}){
  const route=toRoute((await params).slug);
  if(route==='/')return {title:'SPOT ME | 혼자 막혔던 운동, 레미와 함께.',description:'레미 AI, 성장하는 헬스장, 운동 리포트를 체험하는 SPOT ME 소개.'};
  if(route==='/video/')return {title:'시연 영상 | SPOT ME'};
  const page=pages[route];
  return {title:page?.title??'SPOT ME'};
}
export default async function Page({params}){
  const route=toRoute((await params).slug);
  const page=pages[route];
  if(!page)notFound();
  return <SitePage page={page}/>;
}
