"use strict";

{

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


let qsv=location.search.slice(1).split("&").map(x=>{ let kv=x.split('='); if(kv[1]===undefined) kv[1]=true; return kv; });
let tbl={}; qsv.forEach(kv=>tbl[kv[0]]=kv[1]);

let jsonv=[],putJs=url=>{
	let script = document.createElement('script');
	script.type = 'text/javascript';
	script.src = url;
	script.async = false;
	//script.onerror = this.onError.bind(this);
	script._url = url;
	document.body.appendChild(script);
},addJson=(ori,url)=>{
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
		jsonv.push(j);
		if(j.from) addJson(url,j.from);
		else{
			while(jsonv.length){
				let j=jsonv.pop();
				if(j.js) putJs(j.js);
			}
		}
	});
};
if(tbl.url && tbl.url!==true) addJson(0,decodeURIComponent(tbl.url));

}
