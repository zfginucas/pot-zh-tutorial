// Small, deterministic teaching solvers. Production experiments use POT in Python.
export const sum = a => a.reduce((s,x)=>s+x,0);
export const uniform = n => Array(n).fill(1/n);
export const costMatrix = (x,y,p=2) => x.map(a=>y.map(b=>Math.abs(a-b)**p));
export const cost = (P,M) => sum(P.map((r,i)=>sum(r.map((v,j)=>v*M[i][j]))));
export function residual(P,a,b){return Math.max(...a.map((v,i)=>Math.abs(sum(P[i])-v)),...b.map((v,j)=>Math.abs(sum(P.map(r=>r[j]))-v)));}
export function entropy(P){return -sum(P.flat().map(v=>v>0?v*Math.log(v):0));}
export function exact1D(x,y,a,b){
  // Monotone quantile coupling: exact for |x-y|^p, p >= 1 on the real line.
  const si=x.map((_,i)=>i).sort((i,j)=>x[i]-x[j]),sj=y.map((_,i)=>i).sort((i,j)=>y[i]-y[j]);
  const aa=[...a],bb=[...b],P=a.map(()=>b.map(()=>0));let i=0,j=0;
  while(i<x.length&&j<y.length){const v=Math.min(aa[si[i]],bb[sj[j]]);P[si[i]][sj[j]]+=v;aa[si[i]]-=v;bb[sj[j]]-=v;if(aa[si[i]]<1e-14)i++;if(bb[sj[j]]<1e-14)j++;}return P;
}
const logsumexp = v => {const m=Math.max(...v);return m+Math.log(sum(v.map(x=>Math.exp(x-m))));};
export function sinkhorn(a,b,M,epsilon=.1,maxIter=4000,tol=1e-9){
  let f=a.map(()=>0),g=b.map(()=>0),P,err=Infinity,k=0;
  for(;k<maxIter;k++){
    f=a.map((v,i)=>epsilon*(Math.log(v)-logsumexp(b.map((_,j)=>(g[j]-M[i][j])/epsilon))));
    g=b.map((v,j)=>epsilon*(Math.log(v)-logsumexp(a.map((_,i)=>(f[i]-M[i][j])/epsilon))));
    if(k%10===0||k===maxIter-1){P=a.map((_,i)=>b.map((_,j)=>Math.exp((f[i]+g[j]-M[i][j])/epsilon)));err=residual(P,a,b);if(err<tol)break;}
  }return {P,err,iterations:Math.min(k+1,maxIter),converged:err<tol};
}
export function sliced(X,Y,angles){
  const values=angles.map(theta=>{const proj=Z=>Z.map(p=>p[0]*Math.cos(theta)+p[1]*Math.sin(theta)).sort((a,b)=>a-b);const x=proj(X),y=proj(Y);return sum(x.map((v,i)=>(v-y[i])**2))/x.length;});
  return {values,value:Math.sqrt(sum(values)/values.length)};
}
export function permutations(a){if(a.length===0)return [[]];return a.flatMap((x,i)=>permutations(a.filter((_,j)=>i!==j)).map(p=>[x,...p]));}
export function structureMatch(X,Y){
  const distances=Z=>Z.map(a=>Z.map(b=>Math.hypot(a[0]-b[0],a[1]-b[1]))),A=distances(X),B=distances(Y);
  const candidates=permutations(X.map((_,i)=>i)).map(p=>({p,value:sum(A.map((r,i)=>sum(r.map((v,k)=>(v-B[p[i]][p[k]])**2))))/X.length**2}));
  return candidates.sort((a,b)=>a.value-b.value)[0];
}
