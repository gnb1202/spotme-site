// All screen artwork is from the delivered 260925 UI set.
// SHA-256 and exact source paths: v3/reports/home-phone/assets.json.
export const overviewAsset = id => `/home-overview/${id}.webp`;

export const overviewFeatures = [
  {id:'home', name:'오늘의 운동', title:['오늘 할 운동,','여기서 시작해요.'], description:'나에게 맞는 추천 루틴부터 자유 운동, 오늘의 퀘스트까지. 운동을 시작하는 데 필요한 것들을 한 화면에서 만나세요.', hint:'휴대폰의 Day 1 카드를 눌러보세요.'},
  {id:'ai', name:'레미 AI', title:['궁금한 순간엔,','레미에게.'], description:'운동 루틴을 준비할 때도, 운동 중 도움이 필요할 때도. 레미와 나누는 대화를 확인해 보세요.', hint:'화면 속 루틴 생성 대화를 살펴보세요.'},
  {id:'report', name:'운동 리포트', title:['쌓아온 운동을','한눈에.'], description:'주간 운동 기록과 부위별 운동 현황을 함께 살펴보세요. 오늘의 운동이 나의 기록으로 남아요.', hint:'하단 메뉴를 눌러 다른 화면으로 이동해 보세요.'},
  {id:'quest', name:'퀘스트', title:['한 번의 운동이','작은 달성으로.'], description:'오늘의 운동부터 주간 목표까지. 퀘스트를 달성하고 모은 치즈로 나의 헬스장을 가꿔요.', hint:'아래에서 헬스장으로 이어가 보세요.'},
  {id:'gym', name:'헬스장 키우기', title:['꾸준함으로 채우는','나만의 헬스장.'], description:'퀘스트로 모은 치즈가 새로운 공간으로 이어져요. 레미와 함께 가꿔갈 헬스장의 첫 모습을 만나보세요.', hint:'지금은 정비를 기다리는 헬스장이에요.'},
  {id:'ranking', name:'랭킹 · 프로필', title:['기록이 쌓일수록,','다음 단계로.'], description:'이번 달 운동 볼륨을 비교하고, 내 프로필에서 티어를 확인해요. 쌓아온 운동을 다른 모습으로 만나보세요.', hint:'휴대폰 하단의 프로필을 눌러보세요.'},
];

// Hotspots are percentages of the original full screen, including its status bar.
const nav = [
  ['운동 홈으로 이동','home',1,89,18,8],
  ['레미 AI 화면 보기','ai',21,89,18,8],
  ['운동 리포트 화면 보기','report',41,89,18,8],
  ['랭킹 화면 보기','ranking',61,89,18,8],
  ['프로필 화면 보기','profile',81,89,18,8],
];
const back = ['운동 홈으로 돌아가기','home',1,7,13,10];
export const overviewScreens = {
  home:{group:'home',name:'운동 홈',action:'AI 추천 운동 보기',next:'routine',hotspots:[
    ['헬스장 키우기 화면 보기','gym',66,6,14,8],
    ['Day 1 AI 추천 운동 보기','routine',5,25,90,19],
    ['퀘스트 확인','quest',9,67,82,8],...nav]},
  routine:{group:'home',name:'AI 추천 운동',hint:'추천 루틴을 확인하고 시작하기를 눌러보세요.',action:'운동 시작하기',next:'workout',hotspots:[back,['추천 루틴으로 운동 시작하기','workout',5,86,90,8]]},
  workout:{group:'home',name:'운동 진행',hint:'HELP!로 레미를 부르거나 운동 종료를 눌러보세요.',action:'레미의 중량 조정 제안 보기',next:'adjust',hotspots:[
    ['레미의 도움 받기','adjust',4,82,28,8],
    ['운동을 마치고 결과 보기','result',36,82,30,8],
    ['운동 수정 제안 보기','adjust',70,82,27,8],
    ['운동 중 레미에게 질문하기','adjust',6,90,90,8]]},
  adjust:{group:'home',name:'레미의 운동 조정',hint:'제안을 살펴보고 완료를 눌러 운동으로 돌아가세요.',action:'조정한 운동으로 돌아가기',next:'workout',hotspots:[
    ['중량 조정 취소하고 운동으로 돌아가기','workout',11,75,38,7],
    ['중량 조정 완료 예시 보기','workout',52,75,39,7]]},
  result:{group:'report',name:'운동 결과',hint:'다음을 눌러 쌓인 운동 기록도 살펴보세요.',action:'운동 리포트 보기',next:'report',hotspots:[['운동 리포트로 이동','report',5,86,90,9]]},
  ai:{group:'ai',name:'레미 AI',action:'추천 운동으로 이어가기',next:'routine',hotspots:[...nav]},
  report:{group:'report',name:'운동 리포트',action:'운동 결과도 살펴보기',next:'result',hotspots:[...nav]},
  quest:{group:'quest',name:'주간 퀘스트',action:'헬스장 키우기 보기',next:'gym',hotspots:[back]},
  gym:{group:'gym',name:'헬스장 키우기',action:'치즈를 모으는 퀘스트 보기',next:'quest',hotspots:[]},
  ranking:{group:'ranking',name:'이번 달 랭킹',action:'내 프로필 · 티어 보기',next:'profile',hotspots:[...nav]},
  profile:{group:'ranking',name:'내 프로필',hint:'티어와 기록을 확인하고, 하단 메뉴로 이동해 보세요.',action:'이번 달 랭킹 보기',next:'ranking',hotspots:[...nav]},
};

export const overviewTour = ['home','routine','workout','adjust','result','ai','report','quest','gym','ranking','profile'];
