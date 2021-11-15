"use strict";

{ let p=Scene_Boot.prototype,r,k;
k='start';
r=p[k]; (p[k]=function f(){
	{
		let g=Graphics,gw=g.widrg,gh=g.height,t=window,w=t.innerWidth,h=t.innerHeight;
		g.hideFps();
		g._switchFPSMeter();
		g._switchFPSMeter();
		if(!g._stretchEnabled && ( gw>w || gh>h || (gw+(gw>>1)<w&&gh+(gh>>1)<h) ) ) Graphics._switchStretchMode();
	}
	return f.ori.apply(this,arguments);
}).ori=r;
}
