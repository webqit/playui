!function(t){var e={};function n(r){if(e[r])return e[r].exports;var i=e[r]={i:r,l:!1,exports:{}};return t[r].call(i.exports,i,i.exports,n),i.l=!0,i.exports}n.m=t,n.c=e,n.d=function(t,e,r){n.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:r})},n.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},n.t=function(t,e){if(1&e&&(t=n(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var i in t)n.d(r,i,function(e){return t[e]}.bind(null,i));return r},n.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return n.d(e,"a",e),e},n.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},n.p="",n(n.s=0)}([function(t,e,n){"use strict";n.r(e);var r=function(t){return"function"==typeof t},i=function(t){return Array.isArray(t)||"object"==typeof t&&t||r(t)},a=function(t){return t instanceof Number||"number"==typeof t},o=function(t){return a(t)||!0!==t&&!1!==t&&null!==t&&""!==t&&!isNaN(1*t)},s=function(t,e){var n=void 0;return i(t)&&Object.keys(t).forEach((r,i)=>{!1!==n&&(n=e(o(r)?parseFloat(r):r,t[r],i))}),n},l=function(t,...e){return e.forEach(e=>{t.indexOf(e)<0&&t.push(e)}),t},c=function(t){return t instanceof String||"string"==typeof t&&null!==t},u=function(t){return Array.isArray(t)},h=function(t){return!Array.isArray(t)&&"object"==typeof t&&t},f=function(t){return r(t)||t&&"[object function]"==={}.toString.call(t)},d=function(t){return arguments.length&&(void 0===t||void 0===t)},p=function(t){return function(t){return null===t||""===t}(t)||d(t)||!1===t||0===t||i(t)&&!Object.keys(t).length},g=function(t,e=!0){return u(t)?t:!e&&h(t)?[t]:!1!==t&&0!==t&&p(t)?[]:function(t){return!c(t)&&!d(t.length)}(t)?Array.prototype.slice.call(t):h(t)?Object.values(t):[t]},m=function(t,e){return void 0===t?"":t.split(/(?=[A-Z])/).join(e||" ")},b=function(t){var e,n,r=(n=!0,e=function(t,e){return"string"!=typeof t?t:t.replace(/\w\S*/g,(function(t){return t.charAt(0).toUpperCase()+(void 0!==typeof e&&e?t.substr(1).toLowerCase():t.substr(1))}))}((e=t).replace(/-/g," ")).replace(/ /g,""),n?e:e[0].toLowerCase()+e.substr(1));if(this.prefix.api+r in this.window.document.body.style)return this.prefix.css+m(t,"-")},y=function(t,e,n){var r={},i=g(t),a=(t,a)=>{var o=m(a,"-").toLowerCase();if("auto"===n)r[o]=e(b.call(this,o)||o,i[t]);else{if(n){var s=b.call(this,o);s&&(r[s]=e(s,i[t]))}r[o]=e(o,i[t])}};return s(i,(t,e)=>{a(t,e)}),u(t)||n||"size"===t||"offsets"===t?r:r[t]};const w=class{constructor(t){s(t,(t,e)=>{["rotate","scale","skew","translate"].includes(t)&&(this[t]=u(e)?new w[t](...e):new w[t](e))})}toString(){return["rotate","scale","skew","translate"].reduce((t,e)=>t+(this[e]&&this[e].length?" "+this[e]:""),"").trim()}static parse(t,e){var n=function(t){return Math.round(100*t)/100},r=function(t){var e=180*t/Math.PI;return n(e)},i=function(e){var n=[];if(t.window.WebKitCSSMatrix)return[(n=new t.window.WebKitCSSMatrix(e)).a,n.b,n.c,n.d,n.e,n.f];for(var r,i=/[\d\.\-]+/g;r=i.exec(e);)n.push(+r);return n}(e),a=i[0],o=i[1],s=i[2],l=i[3];if(a*l==o*s)throw new Error("Dramatic.parseTransform: matrix is singular");var c=Math.sqrt(a*a+o*o),u=(a/=c)*s+(o/=c)*l;s-=a*u,l-=o*u;var h=Math.sqrt(s*s+l*l);return u/=h,a*(l/=h)<o*(s/=h)&&(a=-a,o=-o,u=-u,c=-c),new w({translate:[i[4],i[5]],scale:[n(c),n(h)],rotate:r(Math.atan2(o,a)),skew:r(Math.atan(u))})}};w.rotate=class extends Array{toString(){return"rotate("+this.map(t=>o(t)?t+"deg":t).join(", ")+")"}},w.scale=class extends Array{toString(){return"scale("+this.join(", ")+")"}},w.skew=class extends Array{toString(){return"skew("+this.map(t=>o(t)?t+"deg":t).join(", ")+")"}},w.translate=class extends Array{toString(){return"translate("+this.map(t=>o(t)?t+"px":t).join(", ")+")"}};var v=w,x=function(t,e,n=null){var r=this.window.getComputedStyle(t,n);return y.call(this,e,(t,e)=>{var n=r.getPropertyValue(b.call(this,t)||t);return"width"!==t&&"height"!==t||""!==n||(n="0px"),"transform"===t&&(n=v.parse(this,n)),n},!1)},O=["width","height","top","left","right","bottom","padding","padding-top","padding-left","padding-right","padding-bottom","margin","margin-top","margin-left","margin-right","margin-bottom","border-width","border-top-width","border-left-width","border-right-width","border-bottom-width","outline-width","outline-top-width","outline-left-width","outline-right-width","outline-bottom-width"],j=function(t,e,n=null){e=c(e)?function(t,e=null){var n={};return 2===arguments.length&&(u(t)&&u(e)?t.forEach((t,r)=>n[t]=e[r]):n[t]=e),n}(e,n):e;var r={inset:["top","right","bottom","left"],margin:["top","right","bottom","left"],padding:["top","right","bottom","left"]};return y.call(this,Object.keys(e),(n,i)=>{var a=e[i];s(r,(t,e)=>{n===t&&(h(a)&&(a=e.map(t=>a[t]).filter(t=>!d(t))),u(a)&&(a=a.join(" ")))}),"transform"!==n||!h(a)||a instanceof v||(a=new v(a).toString()),t.style[n]=O.includes(n)&&o(a)?a+"px":a},"auto"),t},k=function(t,e,n="auto"){var r=t.getAttribute("style");return"all"===e&&(e=r.split(";").map(t=>t.split(":")[0])),y.call(this,e,t=>(new RegExp(";[ ]*?"+t+":([^;]+);?","g").exec(";"+r)||["",""])[1].trim(),n)},C=function(t,e,n=null){return this.Reflow.onread((r,i)=>{try{r(f(e)?e(t):x.call(this,t,e,n))}catch(t){i(t)}},!0)},E=function(t,e,n=null){return this.Reflow.onwrite((r,i)=>{try{r(f(e)?e(t):j.call(this,t,e,n))}catch(t){i(t)}},!0)},S=function(t,e,n=null,r=null){var i=h(e)?Object.keys(e):e;r=h(e)?n:r;var a=k.call(this,t,i);return E.call(this,t,e,n).then(()=>C.call(this,t,r||i).then(e=>E.call(this,t,a).then(()=>e)))},M=function(t,e){var n=[];return function(t,e){e=(e=e||Object.prototype)&&!u(e)?[e]:e;var n=[];for(t=t;t&&(!e||e.indexOf(t)<0)&&"default"!==t.name;)n.push(t),t=t?Object.getPrototypeOf(t):null;return n}(t,e).forEach(t=>{l(n,...Object.getOwnPropertyNames(t))}),n};var $=function(t,e=[]){return function t(e,n,r=!1,a=!1,s=!1){var l=0,c=e.shift();if((o(c)||!0===c||!1===c)&&(l=c,c=e.shift()),!e.length)throw new Error("_merge() requires two or more array/objects.");return e.forEach((e,d)=>{(i(e)||f(e))&&(r?M(e):Object.getOwnPropertyNames(e)).forEach(i=>{if(n(i,c,e,d)){var f=c[i],p=e[i];if((u(f)&&u(p)||h(f)&&h(p))&&(!0===l||l>0))c[i]=u(f)&&u(p)?[]:{},t([o(l)?l-1:l,c[i],f,p],n,r,a,s);else if(u(c)&&u(e))a?c[i]=p:c.push(p);else try{s?Object.defineProperty(c,i,Object.getOwnPropertyDescriptor(e,i)):c[i]=e[i]}catch(t){}}})}),c}([{},t],(t,n,r)=>{if(!f(r[t]))return f(e)?e(t):!u(e)||!e.length||e.indexOf(t)>-1},!1,!1,!1)},A=function(t,e=!1){var n=document.styleSheets,r=function(e){try{for(var n=0;n<e.cssRules.length;n++){var r=e.cssRules[n];if(!0===t(r))return!0}}catch(t){}};if(e){for(var i=n.length-1;i>=0;i--)if(!0===r(n[i]))return!0}else for(i=0;i<n.length;i++)if(!0===r(n[i]))return!0},R=function(t){var e={};return t.split(";").filter(t=>t).forEach(t=>{t=t.split(":"),e[t[0].trim()]=t[1].trim()}),e},P=function(t,e,n=!0){var r=u(t)?t.join("|"):t;if(!e&&F[r])return F[r];var i=[];return A.call(this,e=>{if((e.type===this.window.CSSRule.KEYFRAMES_RULE||e.type===this.window.CSSRule[this.prefix.api.toUpperCase()+"_KEYFRAMES_RULE"])&&(u(t)?t:[t]).indexOf(e.name)>-1)return i=i.concat(i,function(t){for(var e=[],r=0;r<t.cssRules.length;r++){var i=t.cssRules[r],a=R(i.cssText.replace(i.keyText,"").replace("{","").replace("}","").trim()),o=(i.keyText||" ").split(",").map(t=>"from"===t?0:"to"===t?1:parseInt(t)/100);if(n)for(D(a,["animation-","transition-"]);o.length;){var s=$(a);s.offset=o.shift(),e.push(s)}else a.offset=o.length>1?o:o[0],e.push(a)}return e.sort((t,e)=>t.offset===e.offset?0:t.offset>e.offset?1:-1)}(e)),!0},!0),F[r]=i,i};const D=function(t,e,n=""){u(n)?n.forEach(e=>D(t,e)):(t[n+"timing-function"]&&(t.easing=t[n+"timing-function"],delete t[n+"timing-function"]),t[n+"fill-mode"]&&(t.fill=t[n+"fill-mode"],delete t[n+"fill-mode"]),t[n+"iteration-count"]&&(t.iterations=t[n+"iteration-count"],delete t[n+"iteration-count"],"infinite"===t.iterations&&(t.iterations=1/0)))},F={};var T=function(t){t=t.indexOf("-")?t:m(t,"-");return this.window.getComputedStyle(this.window.document.body).getPropertyValue("--"+t)};class _{constructor(t,e,n={}){this.el=t,this.$={readyCallbacks:[],finishCallbacks:[],cancelCallbacks:[],params:n},n.fill=n.fill||"both","duration"in n||(n.duration=400),n.easing&&-1===["ease-in","ease-out","ease-in-out"].indexOf(n.easing)&&-1===n.easing.indexOf("(")&&(n.easing=T.call(WQ.DOM,n.easing)||n.easing);var r={inset:["top","right","bottom","left"],margin:["top","right","bottom","left"],padding:["top","right","bottom","left"]};const i=t=>{t=t.slice();var e={},i={};s(t,(t,n)=>{s(r,(t,e)=>{n[t]&&(h(n[t])&&(n[t]=e.map(e=>n[t][e]).filter(t=>!d(t))),u(n[t])&&(n[t]=n[t].join(" ")))}),!n.transform||!h(n.transform)||n.transform instanceof v||(n.transform=new v(n.transform).toString()),function(t,...e){return e.forEach(e=>function(t,e,n=!1){for(var r=t.indexOf(e);r>-1&&(n||!1===n);)t.splice(r,1),n>0&&n--,r=t.indexOf(e);return t}(t,e)),t}(Object.keys(n),"offset","easing").forEach(t=>{O.includes(t)&&o(n[t])&&(n[t]+="px"),e[t]=void 0===e[t]?n[t]:e[t],i[t]=n[t]})});try{var a=this.el.animate(t,n)}catch(t){return void(this.$.error=t)}n.reverse&&a.reverse(),a.effect||(a.effect={}),a.effect.duration||(a.effect.duration=n.duration),a.onfinish=()=>{n.cancelForCss&&(a.cancel(),"forwards"!==n.fill&&"both"!==n.fill||j.call(WQ.DOM,this.el,i)),this.$.finishCallbacks.forEach(t=>{t(this.el)})},a.oncancel=()=>{this.$.cancelCallbacks.forEach(t=>{t(this.el)})},this.$.anim=a,this.$.firstFrame=e,this.$.lastFrame=i,this.$.params=n,this.$.readyCallbacks.length&&this.$.readyCallbacks.forEach(t=>t(a,n,e,i))};f(e)?e(t,i):_.createCallback(t,e,i,t=>{this.$.error=t})}get anim(){return this.$.anim}ready(t,e){this.$.error?e&&e(this.$.error):this.$.anim?t(this.$.anim,this.$.params,this.$.firstFrame,this.$.lastFrame):this.$.readyCallbacks.push(t)}onfinish(t){if(!f(t))throw new Error("Onfinish() accepts only a function.");return this.$.finishCallbacks.push(t),this}oncancel(t){if(!f(t))throw new Error("Oncancel() accepts only a function.");return this.$.cancelCallbacks.push(t),this}progress(){return this.$.anim?this.$.anim.currentTime/this.$.anim.effect.duration:0}seek(t){if(!a(t))throw new Error("Seek() accepts only a numeric value.");return this.ready((e,n)=>{var r=n.duration+(n.delay||0)+(n.endDelay||0);e.currentTime=Math.max(0,Math.min(t*r,r))}),this}reverse(){return this.ready(t=>t.reverse()),this}play(){return new Promise((t,e)=>{this.ready(n=>{n.play(),this.onfinish(()=>t(this)),this.oncancel(()=>e(this))},e)})}pause(){return this.ready(t=>t.pause()),this}finish(){return this.ready(t=>t.finish()),this}cancel(){return this.ready(t=>t.cancel()),this}static createCallback(t,e,n,r){var i=h(e)&&!Object.values(e).filter(t=>u(t)).length,a=u(e)&&e.length>1&&p(e[0]);if(i||a)WQ.DOM.Reflow.onread(()=>{a?(e.shift(),_.createCallback(t,[x.call(WQ.DOM,t,Object.keys(e[0])),...e],n,r)):_.createCallback(t,[x.call(WQ.DOM,t,Object.keys(e)),e],n,r)});else{if(c(e)){var o=e;!(e=P.call(WQ.DOM,o)).length&&r&&r('Animation name "'+o+'" not found in any stylesheet!')}if(u(e)){var f=[];if(s(e,(t,e)=>{"auto"===e.height&&l(f,t),"auto"===e.width&&l(f,t)}),f.length)return void S.call(WQ.DOM,t,{width:"auto",height:"auto"},t=>t.getBoundingClientRect()).then(t=>{f.forEach(n=>{"auto"===e[n].width&&(e[n].width=t.width+"px"),"auto"===e[n].height&&(e[n].height=t.height+"px")}),n(e)})}n(e)}}}function L(t,e,n={}){return"cancelForCss"in n||(n.cancelForCss=!0),new _(t,e,n).play().then(()=>t)}!function(t){const{ul:e,li:n}=function(t){return{ul:class extends t.HTMLUListElement{async expand(){this.bindings.state="expanding","horizontal"===this.bindings.orientation?await L(this,{width:"100%",opacity:1},this.bindings.timing||{}):await L(this,{height:"auto",opacity:1},this.bindings.timing||{duration:400}),this.bindings.state="expanded"}async collapse(){this.bindings.state="collapsing","horizontal"===this.bindings.orientation?await L(this,{width:0,opacity:0},this.bindings.timing||{}):await L(this,{height:0,opacity:0},this.bindings.timing||{duration:400}),this.bindings.state="collapsed"}toggle(){return"expanded"!==this.bindings.state?this.expand():"collapsed"!==this.bindings.state?this.collapse():void 0}},li:class extends t.HTMLLIElement{connectedCallback(){this.parentNode.collapsibleAdd&&this.parentNode.collapsibleAdd(this)}}}}(t);t.customElements.define("wn-collapsible-ul",e,{extends:"ul"}),t.customElements.define("wn-collapsible-li",n,{extends:"li"})}(window)}]);
//# sourceMappingURL=main.js.map