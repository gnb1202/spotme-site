// Shared page palette. Video keeps its original design as a user-approved exception.
export const routePalette={
 '/':{name:'home',background:'#5eefd3'},
 '/features/':{name:'features',background:'#ddf7ee'},
 '/remi-ai/':{name:'remi',background:'#91e8d2'},
 '/video/':{name:'video',background:'#494949'},
};
export const paletteFor=pathname=>routePalette[pathname]||(pathname.startsWith('/concept')?routePalette['/features/']:routePalette['/']);
