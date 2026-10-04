// Transcribed from the supplied panel PDF, page 1, exercise-motivation survey.
// Multiple selection (up to 3), 2026-03-31 through 2026-04-05.
// The panel does not provide the sample size; do not infer one or generalize it.
export const exerciseMotives = [
  {label:'자기관리·건강',value:70,sourceLabel:'자기관리, 혹은 건강을 위해서'},
  {label:'달라지는 몸에 대한 만족감',value:57.5,sourceLabel:'달라지는 나의 몸을 보고 기쁨, 만족감을 느껴서'},
  {label:'운동의 재미·성취감',value:32.5,sourceLabel:'운동 자체에서 느끼는 재미와 쾌락, 신체적 성취감 때문에'},
  {label:'자신감·자존감',value:32.5,sourceLabel:'자신감, 자존감을 높이고 싶어서'},
  {label:'머리를 비우기 위해',value:20,sourceLabel:'머리를 비우고 싶어서'},
  {label:'입고 싶었던 옷',value:15,sourceLabel:'내가 그동안 입지 못했던 옷을 입고 싶어서'},
  {label:'이성 친구',value:2.5,sourceLabel:'이성친구를 사귀고 싶어서'},
];

export const remiSupportModes = [
  {id:'direction',name:'내 운동에 맞는 방향',image:'support',width:900,height:1080,
    alt:'손을 내밀며 운동을 도와주는 레미',title:'기록을 돌아보고, 다음 운동을 준비해요.',
    description:'운동 기록에 맞춘 루틴과 피드백. 혼자 고민하던 운동을 레미와 함께 풀어가요.',
    steps:['운동 기록','루틴과 피드백','다음 운동'],href:'/remi-ai/',link:'레미 AI 만나보기'},
  {id:'motivation',name:'다시 하고 싶은 이유',image:'reward',width:970,height:1080,
    alt:'메달을 들고 시상대에 선 레미',title:'오늘의 운동이, 작은 성취로 남도록.',
    description:'퀘스트를 달성하고 치즈를 모아 나만의 헬스장을 키워요. 운동의 즐거움을 하나씩 더해가요.',
    steps:['퀘스트 달성','치즈 획득','헬스장 성장'],href:'/features/#growth',link:'운동의 즐거움 살펴보기'},
];
