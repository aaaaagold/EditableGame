"use strict";

{ let p=Graphics,r,k;
k='_createGameFontLoader';
r=p[k]; (p[k]=function(){}).ori=r;
}

{ let a=Bitmap,p=a.prototype,r,k;
a.fontFace="Consolas,'Courier New',Courier,微軟正黑體,標楷體,monospace";
k='initialize';
r=p[k]; (p[k]=function f(){
	const rtv=f.ori.apply(this,arguments);
	this.fontFace=Bitmap.fontFace;
	return rtv;
}).ori=r;
}

{ let p=Scene_Boot.prototype,r,k;
k='isGameFontLoaded';
r=p[k]; (p[k]=function f(){
	if(Graphics.isFontLoaded( Bitmap.fontFace ) || Graphics.canUseCssFontLoading()) return true;
	else if(Date.now()-this._startDate>=20000){
		setTimeout(()=>alert("ERROR: Font not loaded."),1);
		throw new Error('Failed to load font');
	}
}).ori=r;
}

{ let p=Window_Base.prototype,r,k;
k='standardFontFace';
r=p[k]; (p[k]=function f(){
	if($gameSystem.isKorean()) return Bitmap.fontFace+',Dotum, AppleGothic, sans-serif';
	else return Bitmap.fontFace;
}).ori=r;
}
