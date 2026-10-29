import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const id='00000000-0000-0000-0000-000000000001';
function setup({token='token',status=200,payload={id,deleted:true,version:1},network=false}={}){
 const calls=[],exports={};
 const source=fs.readFileSync(new URL('../app/api/factory/packing-gateway/[...path]/route.ts',import.meta.url),'utf8');
 vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{
  exports,require:name=>({'next/server':{NextResponse:{json:Response.json}},'next-auth':{getServerSession:async()=>({accessToken:token})},'@/lib/next-auth':{authOptions:{}}})[name],
  Headers,URL,AbortSignal,Uint8Array,TextDecoder,encodeURIComponent,process:{env:{REMOTE_API_BASE_URL:'https://backend.test'}},
  fetch:async(...args)=>{calls.push(args);if(network)throw new Error('timeout');return Response.json(payload,{status});}
 });
 return {calls,run:async({path=['orders',id],origin='https://frontend.test',body='{"version":0}',type='application/json'}={})=>{
  const req=new Request('https://frontend.test/api/factory/packing-gateway/'+path.join('/'),{method:'DELETE',body,headers:{origin,'content-type':type}});req.nextUrl=new URL(req.url);
  return exports.DELETE(req,{params:Promise.resolve({path})});
 }};
}
test('DELETE forwards exact version and authenticated request with proxy protections',async()=>{
 const s=setup();const r=await s.run();assert.equal(r.status,200);assert.deepEqual(await r.json(),{id,deleted:true,version:1});
 assert.equal(s.calls[0][0].href,'https://backend.test/api/factory/orders/'+id);const opts=s.calls[0][1];assert.equal(opts.method,'DELETE');assert.equal(opts.body,'{"version":0}');assert.equal(opts.headers.get('authorization'),'Bearer token');assert.equal(opts.redirect,'error');assert.equal(r.headers.get('cache-control'),'no-store');
});
test('DELETE rejects invalid UUID, action routes, cross-origin, missing session, invalid JSON and oversized streams',async()=>{
 for(const [config,request,status] of [[{}, {path:['orders','bad']},404],[{}, {path:['orders',id,'confirm']},404],[{}, {origin:'https://evil.test'},403],[{token:null},{},401],[{}, {body:'invalid'},400],[{}, {body:'x'.repeat(262145)},413],[{}, {type:'text/plain'},415]]){
  const s=setup(config);assert.equal((await s.run(request)).status,status);assert.equal(s.calls.length,0);
 }
});
test('DELETE preserves backend errors and marks transport failure as 502',async()=>{
 for(const status of [401,403,404,409,500]){const s=setup({status,payload:{code:'STALE_VERSION'}});const r=await s.run();assert.equal(r.status,status);assert.equal((await r.json()).code,'STALE_VERSION');}
 assert.equal((await setup({network:true}).run()).status,502);
});
const pageSource=fs.readFileSync(new URL('../app/factory/packing/page.tsx',import.meta.url),'utf8');
function hookHarness(write){
 const ast=ts.createSourceFile('packing.tsx',pageSource,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 const declarations=ast.statements.filter(n=>['PackingError','pendingPackingCommand','usePackingOrder'].includes(n.name?.text)).map(n=>n.getText(ast)).join('\n');
 const slots=[],effects=[],storage=new Map();let cursor=0,effectCursor=0,callbackCursor=0;const callbacks=[],effectDeps=[];let writes=0;
 const react={useState(initial){const i=cursor++;if(!(i in slots))slots[i]=initial;return [slots[i],v=>{slots[i]=typeof v==='function'?v(slots[i]):v;}];},useRef(initial){const i=cursor++;return slots[i]??(slots[i]={current:initial});},useCallback(fn,deps){const i=callbackCursor++;if(!callbacks[i])callbacks[i]=fn;return callbacks[i];},useEffect(fn,deps){const i=effectCursor++;if(!effectDeps[i]){effectDeps[i]=deps;effects.push(fn);}}};
 const context={React:react,Map,Set,JSON,Object,Number,Error,crypto:{randomUUID:()=> 'retry-delete-key'},window:{dispatchEvent(){}},Event:class{},
  localStorage:{getItem:k=>storage.get(k)??null,setItem(k,v){storage.set(k,v);this[k]=v;},removeItem(k){storage.delete(k);delete this[k];}},
  newBrowserOrder:scope=>({storageScope:scope,localId:'new',lines:[]}),orderFingerprint:d=>JSON.stringify(d),validateBrowserOrder:()=>[],fromServerOrder:(o,scope)=>({...o,storageScope:scope,serverId:o.id,serverStatus:o.status,serverVersion:o.version}),
  packingPages:async()=>[],packingRequest:async(path,opts)=>{if(opts?.method==='DELETE'){writes++;return write(path,opts,context);}return {id,status:'DRAFT',version:0,orderNumber:'FO-TEST',lines:[]};},
 };
 vm.createContext(context);vm.runInContext(ts.transpileModule(declarations+'\nglobalThis.hook=usePackingOrder;globalThis.PackingError=PackingError;',{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText,context);
 const render=()=>{cursor=0;effectCursor=0;callbackCursor=0;return context.hook('shop:user',[],true);};
 return {render,storage,get writes(){return writes;},async ready(){render();effects.splice(0).forEach(f=>f());await Promise.resolve();await render().open({serverId:id});return render();}};
}
test('deletion prevents double submission, shows loading, then clears active server selection and retry state',async()=>{
 let finish;const h=hookHarness(()=>new Promise(resolve=>{finish=resolve;}));const order=await h.ready();
 const request=order.deleteDraft();await order.deleteDraft();assert.equal(h.writes,1);assert.equal(h.render().saving,true);assert.equal(h.storage.size,1);
 finish({id,deleted:true,version:1});await request;assert.equal(h.render().saving,false);assert.equal(h.render().draft.serverId,undefined);assert.equal(h.storage.size,0);
});
test('uncertain deletion retains draft and exact retry bytes until server verifies success',async()=>{
 let attempt=0;const bodies=[];const h=hookHarness((path,opts,c)=>{bodies.push(opts.body);if(attempt++===0)throw new c.PackingError(502,'timeout',null,true);return {id,deleted:true,version:1};});
 await (await h.ready()).deleteDraft();assert.equal(h.render().draft.serverId,id);assert.equal(h.storage.size,1);assert.match(h.render().message,/uncertain/);
 await h.render().retry();assert.deepEqual(bodies,['{"version":0}','{"version":0}']);assert.equal(h.storage.size,0);assert.equal(h.render().draft.serverId,undefined);
});
test('definitive errors preserve active draft, settle retries and stale versions block another delete',async()=>{
 for(const status of [401,403,404,409]){
  const h=hookHarness((path,opts,c)=>{throw new c.PackingError(status,status===409?'STALE_VERSION':'DENIED',null);});
  await (await h.ready()).deleteDraft();assert.equal(h.render().draft.serverId,id);assert.equal(h.storage.size,0);assert.ok(h.render().message.length);
  if(status===409){assert.equal(h.render().conflict,true);await h.render().deleteDraft();assert.equal(h.writes,1);}
 }
});

test('delete dialog names the order, explains irreversibility, and disables actions during loading',()=>{
 const ast=ts.createSourceFile('packing.tsx',pageSource,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 const source=ast.statements.find(n=>n.name?.text==='PackingOrderDrawer').getText(ast);
 let pending=null,cursor=0;const jsx=(type,props)=>({type,props});
 const context={exports:{},require:()=>({jsx,jsxs:jsx,Fragment:'Fragment'}),React:{useState(initial){const i=cursor++;return [i===3?pending:initial,v=>{if(i===3)pending=v;}];},useEffect(){}},orderTotal:()=>0,orderMoney:()=> '0',readBrowserOrders:()=>({orders:[]})};
 const names=['Package','Badge','Drawer','DrawerContent','DrawerHeader','DrawerTitle','DrawerDescription','DrawerClose','DrawerBody','DrawerFooter','Button','Plus','Save','Check','Store','UserRound','ShoppingCart','Dialog','DialogContent','DialogHeader','DialogTitle','DialogDescription'];for(const n of names)context[n]=n;for(const m of source.matchAll(/<([A-Z][A-Za-z0-9]*)/g))context[m[1]]=m[1];
 vm.createContext(context);vm.runInContext(ts.transpileModule(source+'\nglobalThis.renderDrawer=PackingOrderDrawer;',{compilerOptions:{jsx:ts.JsxEmit.ReactJSX}}).outputText,context);
 const order={draft:{serverId:id,serverStatus:'DRAFT',orderNumber:'FO-TEST',lines:[]},saved:[],errors:[],deleteDraft:async()=>{}};
 const render=()=>{cursor=0;return context.renderDrawer({order,products:[],catalogReady:true,buyerReady:true,onClose(){}});};
 const nodes=tree=>Array.isArray(tree)?tree.flatMap(nodes):tree&&typeof tree==='object'?[tree,...nodes(tree.props?.children)]:[];
 const text=tree=>Array.isArray(tree)?tree.map(text).join(''):tree&&typeof tree==='object'?text(tree.props?.children):typeof tree==='string'?tree:'';
 const button=nodes(render()).find(n=>n.type==='Button'&&text(n)==='Delete draft');assert.ok(button);button.props.onClick();
 let tree=render();assert.match(text(tree),/Delete FO-TEST\?/);assert.match(text(tree),/cannot be undone through the UI/);
 order.saving=true;tree=render();assert.match(text(tree),/Deleting/);const dialog=nodes(tree).find(n=>n.type==='Dialog');for(const b of nodes(dialog).filter(n=>n.type==='Button'))assert.equal(b.props.disabled,true);
 order.saving=false;order.draft.serverStatus='CONFIRMED';pending=null;assert.equal(nodes(render()).some(n=>n.type==='Button'&&text(n)==='Delete draft'),false);
});
