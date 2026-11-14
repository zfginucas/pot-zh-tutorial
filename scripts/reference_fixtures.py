"""Regenerate small independent POT fixtures used by browser-algorithm tests."""
import json
import numpy as np
import ot
from pathlib import Path

x=np.array([.12,.6]);y=np.array([.22,.65,.9]);b=np.array([.25,.35,.4])
fixtures=[]
for p in [1,2]:
    C=np.abs(x[:,None]-y[None,:])**p
    for av in [.1,.55,.9]:
        a=np.array([av,1-av])
        for epsilon in [10**-2.7,.05,1]:
            P=ot.sinkhorn(a,b,C,epsilon,method='sinkhorn_log',numItermax=20000,stopThr=1e-12)
            fixtures.append({'p':p,'a':a.tolist(),'b':b.tolist(),'epsilon':epsilon,'M':C.tolist(),'P':P.tolist(),'emd_cost':float(ot.emd2(a,b,C))})
path=Path(__file__).parent/'pot-reference.json'
path.write_text(json.dumps({'pot_version':ot.__version__,'fixtures':fixtures},indent=2),encoding='utf-8')
print('Generated',len(fixtures),'POT reference cases')
