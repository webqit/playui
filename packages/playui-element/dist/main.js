(()=>{function f(r){return!Array.isArray(r)&&typeof r=="object"&&r}function a(r){return typeof r=="function"}function p(r){return Array.isArray(r)||typeof r=="object"&&r||a(r)}function m(r){return a(r)||r&&{}.toString.call(r)==="[object function]"}var O=(r,u,y)=>class extends r{static get contractFunctions(){return[]}static get contractFunctionsEnv(){return{}}constructor(){super();let e=this.constructor;Object.defineProperty(this,"contractFunctionsInternals",{value:new Map}),this._init=e.contractFunctions.map(t=>{if(!m(this[t]))throw new Error(`[PLAY_ELEMENT]: ${t} is not a method.`);if(t==="constructor")throw new Error("[PLAY_ELEMENT]: Class constructors cannot be subscript methods.");return c(e.contractCompile(this[t]),([o,n])=>{Object.defineProperty(this,t,{value:o}),this.contractFunctionsInternals.set(t,n)})}),(this._init=this._init.filter(t=>t instanceof Promise)).length&&(this._init=Promise.all(this._init))}connectedCallback(){super.connectedCallback&&super.connectedCallback();let e=this.constructor;c(this._init,()=>{e.contractFunctions.forEach(t=>{let o=this[t]();c(o,([,n])=>{e.contractBind(this.contractFunctionsInternals.get(t),n,this)})})})}disconnectedCallback(){super.disconnectedCallback&&super.disconnectedCallback();let e=this.constructor;c(this._init,()=>{e.contractFunctions.forEach(t=>{e.contractUnbind(this.contractFunctionsInternals.get(t))})})}static contractCompile(e){let t=e.toString();m(e)&&(!t.startsWith("function ")&&!t.startsWith("function(")&&(t=t.startsWith("async ")?t.replace("async ","async function "):`function ${t}`),t=`
return ${t.replace("function","function **")}`);let o=[];f(this.contractFunctionsEnv)&&(o=[`{ ${Object.keys(this.contractFunctionsEnv).join(", ")} }`]);let n=u(o,t,{compilerParams:this.compilerParams,runtimeParams:this.runtimeParams});return f(this.contractFunctionsEnv)?c(n(this.contractFunctionsEnv),([l])=>[l,u.inspect(l,"properties")]):[n,u.inspect(n,"properties")]}static contractBind(e,t,o=void 0){c(e,n=>{let l={...this.contractFunctionsEnv||{},this:o},d=(i,s)=>(Array.isArray(s)?s:[s]).map(g=>[...i,...g.path||[g.key]]);n.processes=n.dependencies.map(i=>p(l[i[0]])?y.deep(l[i[0]],i.slice(1),y.observe,s=>{t(...d([i[0]],s))}):y.deep(globalThis,i,y.observe,s=>{t(...d([],s))}))})}static contractUnbind(e){c(e,t=>{t?.processes.forEach(o=>o.abort())})}static get runtimeParams(){return{apiVersion:2}}static get compilerParams(){return{}}},c=(r,u)=>r instanceof Promise?r.then(u):u(r);function _(r){if(typeof self.wq!="object")throw new Error('No "wq" object in context.');if(typeof self.wq.SubscriptFunction!="function")throw new Error('No "wq.SubscriptFunction" function in context.');if(typeof self.wq.Observer!="object")throw new Error('No "wq.Observer" object in context.');return O(r,window.wq.SubscriptFunction,window.wq.Observer)}self.wq||(self.wq={});self.wq.PlayElement=_;})();
//# sourceMappingURL=main.js.map
