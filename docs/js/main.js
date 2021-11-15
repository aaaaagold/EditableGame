"use strict";

//=============================================================================
// main.js
//=============================================================================

PluginManager.setup($plugins);

// window.onload = function() { SceneManager.run(Scene_Boot); };

/*
 ext json
*/

"use strict";

{ let p,r,k;

let jurl=(url, method, header, data, resType, callback, callback_all_h, timeout_ms) => {
	resType=resType||'';
	let xhttp=new XMLHttpRequest();
	if(0<timeout_ms) xhttp.timeout=timeout_ms;
	xhttp.onreadystatechange=function(){
		if(typeof (callback_all_h)==="function"){
			callback_all_h(this);
		}
		if(this.readyState===4){
			if(typeof (callback)==="function"){
				let s=this.status.toString();
				if (s.length===3 && s.slice(0, 1)==='2'){
					callback(this.responseText);
				}
			}
		}
	}
	;
	xhttp.open(method, url, true);
	xhttp.responseType=resType;
	if(header) for(let i in header) xhttp.setRequestHeader(i,header[i]);
	xhttp.send(method === "GET" ? undefined : data);
	return xhttp;
};

// parse qs

let qsv=location.search.slice(1).split("&").map(x=>{ let kv=x.split('='); if(kv[1]===undefined) kv[1]=true; return kv; });
let tbl={}; qsv.forEach(kv=>tbl[kv[0]]=kv[1]);

// load ext jsons

let booted=0,booting=()=>{
	if(!booted) booted=1;
	const log=console.log;
	console.log=()=>{};
	SceneManager.run(Scene_Boot);
	console.log=log;
},mapping={
	databases:{},
	resources:{},
},jsonv=[],putJs=(url,onloaded)=>{
	let script = document.createElement('script');
	script.type = 'text/javascript';
	script.onload=onloaded;
	script.src = url;
	script.async = false;
	//script.onerror = this.onError.bind(this);
	script._url = url;
	document.body.appendChild(script);
},urlv=[],urls=new Set(),addJson=(ori,url)=>{
	if(urls.has(url)){
		let s="cyclic 'from' detected. abort.";
		setTimeout(()=>alert(s),1);
		throw new Error(s);
	}
	urls.add(url);
	urlv.push([url]);
	jurl(url,"GET",0,0,0,txt=>{
		let j;
		try{
			j=JSON.parse(txt);
		}catch(e){
			let pre=ori||"(no previous json)";
			let s="provided url: "+url+"\n did not respond a json format text.\n And the url of previous loaded json is: "+pre;
			setTimeout(()=>alert(s),1);
			throw new Error(s);
		}
		urlv[jsonv.length].push(j.contact,j);
		jsonv.push(j);
		if(j.from) addJson(url,j.from);
		else{
			let needLoad=jsonv.filter(j=>j.js).length,onloaded=()=>{
				if(--needLoad) return;
				booting();
			};
			for(let x=jsonv.length,j;x--;){
				j=jsonv[x];
				for(let i=0,arr=j.resources;i!==arr.length;++i) mapping.resources[arr[i]]=j.base;
				for(let i=0,arr=j.databases,obj=mapping.databases;i!==arr.length;++i){
					if(!obj[arr[i].name]) obj[arr[i].name]=[];
					obj[arr[i].name].push([j.base,arr[i]]);
				}
			}
			for(let x=jsonv.length,j;x--;){
				j=jsonv[x];
				if(j.js) putJs(j.js,onloaded);
			}
			urlv.reverse();
			console.log("Thanks for following external jsons. You can use 'window.urlv' to get the list.");
			console.log(window.urlv=urlv);
		}
	});
};

// inject mapping

DataManager.loadDataFile = function(name, src, callback1,callback2){
	let xhr = new XMLHttpRequest() , url = 'data/' + src , j , arr , onloadParts;
	if(name==='$dataMap'){
		let b=mapping.resources[url];
		if(b) url=b+url;
	}else if(arr=mapping.databases[url]){
		let cnt=arr.length,tbl=[];
		onloadParts=(base)=>{
			if((cnt-=!base) || !j) return;
			for(let i=0,bi,rs,r;i!==arr.length;++i){
				bi=arr[i];
				rs=bi[1].replaceKeys;
				if(rs){
					for(let ri=0;ri!==rs.length;++ri){
						r=rs[ri];
						if(r && r.constructor===Array){
							for(let x=r[0];x<r[1];++x) j[x]=tbl[i][x];
						}else j[r]=tbl[i][r];
					}
				}else j=tbl[i];
			}
			if(callback1 && callback1.constructor===Function){
				callback1(name,src,j,url);
			}
			DataManager.onLoad(window[name]=j);
			if(callback2 && callback2.constructor===Function){
				callback2(name,src,j,url);
			}
		};
		arr.forEach((bi,i)=>jurl(bi[0]+bi[1].name,"GET",0,0,0,txt=>{
			tbl[i]=JSON.parse(txt);
			onloadParts();
		}));
	}
	xhr.open('GET', url);
	xhr.overrideMimeType('application/json');
	xhr.onload = function() {
		if (xhr.status < 400) {
			j = JSON.parse(xhr.responseText);
			if(onloadParts) onloadParts(1);
			else DataManager.onLoad(window[name]=j);
		}
	};
	xhr.onerror = this._mapLoader || function() {
		DataManager._errorUrl = DataManager._errorUrl || url;
	};
	window[name] = null;
	xhr.send();
};

p=Bitmap;
k='load';
r=p[k]; (p[k]=function f(){
	let arr=arguments,b=mapping.resources[arr[0]];
	if(b) arr[0]=b+arr[0];
	return f.ori.apply(this,arr);
}).ori=r;

p=WebAudio.prototype;
k='_load';
r=p[k]; (p[k]=function f(){
	let arr=arguments,b=mapping.resources[arr[0]];
	if(b) arr[0]=b+arr[0];
	return f.ori.apply(this,arr);
}).ori=r;

// start

if(tbl.url && tbl.url!==true) addJson(0,decodeURIComponent(tbl.url));
else window.onload=booting;

}

// useful funcs

window.copyToClipboard=s=>{
	const txtin=document.createElement("input")
	txtin.setAttribute("style","opacity:0;");
	document.body.appendChild(txtin);
	txtin.value=""+s;
	txtin.select();
	txtin.setSelectionRange(0,txtin.value.length);
	document.execCommand("copy");
	txtin.parentNode.removeChild(txtin);
	// if($gameMessage) $gameMessage.popup("已複製: "+s.replace(/\\/g,"\\\\"),1);
};

