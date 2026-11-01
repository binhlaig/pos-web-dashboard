import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
function load(relative, imports = {}, globals = {}) {
  const source = fs.readFileSync(new URL(relative, import.meta.url), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const exports = {};
  vm.runInNewContext(code, { exports, require: name => name === '@/components/loading-screen' ? { LoadingScreen: 'LoadingScreen' } : imports[name], URL, Response, AbortSignal, process: {env:{}}, ...globals });
  return exports;
}
const routing = load('../lib/business-routing.ts');
const access = load('../lib/business-access.ts', {'./business-routing':routing});
test('factory and all current shop types choose their own home; missing types never guess', () => {
  assert.equal(routing.destinationForBusinessType('FACTORY'), '/factory');
  for (const type of routing.SHOP_TYPES) assert.equal(routing.destinationForBusinessType(type), '/dashboard');
  for (const value of [undefined,null,'','UNKNOWN',{},'factory']) assert.equal(routing.destinationForBusinessType(value),null);
});

function elements(tree) {
  if (!tree || typeof tree !== 'object') return [];
  return [tree, ...[tree.props?.children].flat(Infinity).flatMap(elements)];
}

test('gate hides factory children while loading, on shop/unknown/error states and retries', () => {
  const session = {user:{id:'1'},accessToken:'token'};
  const identity = JSON.stringify([session.user,session.accessToken]);
  let states, changes;
  const { BusinessAccessGate } = load('../components/factory/BusinessAccessGate.tsx', {
    'react/jsx-runtime':require('react/jsx-runtime'),
    react:{useEffect:()=>{},useState:()=>[states.shift(),value=>changes.push(value)]},
    'next/navigation':{useRouter:()=>({}),useSearchParams:()=>new URLSearchParams()},
    'next-auth/react':{useSession:()=>({status:'authenticated',data:session})},
    '@/lib/business-routing':routing,
  });
  const render = access => {states=[0,access,identity];changes=[];return BusinessAccessGate({children:'PRIVATE_FACTORY'});};
  for (const access of [null,{kind:'ready',businessType:'FASHION'},{kind:'unknown'},{kind:'error'},{kind:'denied'}]) {
    assert.ok(!JSON.stringify(render(access)).includes('PRIVATE_FACTORY'));
  }
  const error = render({kind:'error'});
  const retry = elements(error).find(node=>node.type==='button' && node.props.children==='Retry');
  assert.ok(retry); retry.props.onClick(); assert.equal(changes[0],null);
  assert.ok(JSON.stringify(render({kind:'ready',businessType:'FACTORY'})).includes('PRIVATE_FACTORY'));
});

test('drawer opens modally, closes from backdrop/navigation, restores scroll and focus', () => {
  let opened=0,closed=0,focused=0;
  const refs=[{current:{showModal:()=>opened++,close:()=>closed++}},{current:{focus:()=>focused++}},{current:''}];
  const icon=()=>null;
  const {FactoryShell}=load('../components/factory/FactoryShell.tsx',{
    'react/jsx-runtime':require('react/jsx-runtime'),
    react:{useEffect:()=>{},useState:value=>[value,()=>{}],useRef:()=>refs.shift()},
    'next/link':{default:'a'},'next/navigation':{usePathname:()=>'/factory/production/batch'},
    'next-themes':{useTheme:()=>({resolvedTheme:'light',setTheme:()=>{}})},
    'lucide-react':new Proxy({},{get:()=>icon}), '@/lib/business-routing':routing,
  },{document:{body:{style:{overflow:''}}}});
  const nodes=elements(FactoryShell({children:'CONTENT'}));
  nodes.find(node=>node.props?.['aria-label']==='Open factory navigation').props.onClick();
  assert.equal(opened,1);
  const drawer=nodes.find(node=>node.type==='dialog');
  const backdrop={};drawer.props.onClick({target:backdrop,currentTarget:backdrop});
  assert.equal(closed,1);
  drawer.props.onClose();assert.equal(focused,1);
  const selected=nodes.filter(node=>node.props?.['aria-current']==='page');
  assert.equal(selected.length,2); // One active link in each desktop/drawer navigation.
  assert.ok(selected.every(node=>node.props.href==='/factory/production'));
  selected[0].props.onClick();assert.equal(closed,2);
  // Native showModal supplies the browser's Escape handling, inert background and focus trap.
});
test('callback cannot switch business area, escape origin, or loop through entry/sign-in/root', () => {
  for (const bad of ['//evil.test','https://evil.test','/\\evil.test','/%2f%2fevil.test','/%252f%252fevil.test','/factory/../../Sign_in','/Sign_in','/sign-in','/entry','/','/api/auth/signout','/factory-other','/factory%2fproduction','/factory\n/production']) {
    assert.equal(routing.destinationForBusinessType('FACTORY',bad),'/factory',bad);
  }
  assert.equal(routing.destinationForBusinessType('FACTORY','/dashboard'),'/factory');
  assert.equal(routing.destinationForBusinessType('FASHION','/factory/production'),'/dashboard');
  assert.equal(routing.destinationForBusinessType('FACTORY','/factory/receiving?tab=today#list'),'/factory/receiving?tab=today#list');
  assert.equal(routing.destinationForBusinessType('RESTAURANT','/dashboard/products'),'/dashboard/products');
  assert.equal(routing.businessEntryPath('//evil.test'),'/entry');
});
test('exactly one closest menu item matches nested routes', () => {
  assert.equal(routing.activeFactoryRoute('/factory').title,'Overview');
  assert.equal(routing.activeFactoryRoute('/factory/production/batches/1').title,'Production');
  assert.equal(routing.activeFactoryRoute('/factory/orders/').title,'Shop Orders');
  assert.equal(routing.activeFactoryRoute('/factory/warehouse-other').title,'Overview');
  assert.equal(routing.activeFactoryRoute('/factory-other'),undefined);
});
test('authenticated response controls access; API errors, unknown and denied remain distinct; retry recovers', async () => {
  const request = async (status,body) => access.loadBusinessAccess(async()=>Response.json(body,{status}));
  assert.equal((await request(200,{businessType:'FACTORY'})).kind,'ready');
  assert.equal((await request(200,{businessType:'RESTAURANT'})).businessType,'RESTAURANT');
  assert.equal((await request(200,{})).kind,'unknown');
  assert.equal((await request(200,{businessType:'OTHER'})).kind,'unknown');
  assert.equal((await request(401,{})).kind,'unauthenticated');
  assert.equal((await request(403,{})).kind,'denied');
  assert.equal((await request(502,{})).kind,'error');
  assert.equal((await access.loadBusinessAccess(async()=>{throw Error('offline')})).kind,'error');
  assert.equal((await request(200,{businessType:'FACTORY'})).businessType,'FACTORY');
});
test('server validates NextAuth session and authenticated shop field without exposing bearer token', async () => {
  let session = null, calls = 0, upstream = Response.json({businessType:'FACTORY',username:'private'});
  const route = load('../app/api/auth/business-type/route.ts', {
    'next-auth':{getServerSession:async()=>session}, '@/lib/next-auth':{authOptions:{}},
  }, {fetch:async(url,init)=>{calls++; assert.equal(url,'http://localhost:8080/api/me/shop'); assert.equal(init.headers.Authorization,'Bearer secret');assert.equal(init.cache,'no-store');return upstream;}});
  assert.equal((await route.GET()).status,401);assert.equal(calls,0);
  session={accessToken:'secret',businessType:'FASHION'};
  let response = await route.GET();
  assert.deepEqual(await response.json(),{businessType:'FACTORY'});
  assert.match(response.headers.get('cache-control'),/no-store/);
  upstream=Response.json({},{status:403});assert.equal((await route.GET()).status,403);
  upstream=Response.json({},{status:500});assert.equal((await route.GET()).status,502);
});
test('middleware protects factory/entry and resolves authenticated callbacks through entry', async () => {
  let token = null;
  const { middleware } = load('../middleware.ts',{
    '@/lib/business-routing':routing,
    'next/server':{NextResponse:{next:()=>({kind:'next'}),redirect:url=>({kind:'redirect',url:String(url)})}},
    'next-auth/jwt':{getToken:async()=>token},
  });
  const req = value => {const url=new URL(value,'https://pos.test');url.clone=()=>new URL(url);return {nextUrl:url,url:String(url)};};
  let response=await middleware(req('/factory/production'));assert.match(response.url,/\/Sign_in\?next=/);
  token={accessToken:'valid'};
  response=await middleware(req('/Sign_in?next=%2Ffactory%2Freceiving'));assert.match(response.url,/\/entry\?next=/);
  response=await middleware(req('/'));assert.equal(new URL(response.url).pathname,'/entry');
  response=await middleware(req('/entry'));assert.equal(response.kind,'next');
  response=await middleware(req('/factory'));assert.equal(response.kind,'next');
});
