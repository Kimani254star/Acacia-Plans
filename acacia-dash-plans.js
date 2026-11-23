/* Acacia Plans — Plan Hub dashboard rebuilt to the suite design. Wraps renderPlans(m); the plans table stays below it. */
(function(){
  var D = window.AcxDash, E = D.esc;
  var KEY = 'acx_dash_plans_range', custom = null;
  function pr(){ var k = D.getPeriod('plans','quarter'); return k; }
  function rangeFor(k){
    if(k==='custom' && custom) return custom;
    if(k==='lastyear') return D.range('year',1);
    return D.range(k==='year'?'year':'quarter',0);
  }
  function sum(a,f){ return a.reduce(function(s,x){ return s+(Number(f(x))||0); },0); }
  function overlaps(p, r){ return (!p.startDate || p.startDate<=r.to) && (!p.endDate || p.endDate>=r.from); }
  var EMO = {'Increase Sales / Revenue':'📈','Strategic':'🧭','Operational':'⚙️','Performance':'🎯','Development':'🛠️','Cost Reduction':'💰'};
  var STC = {'Completed':'g','In Progress':'b','Delayed':'r','On Hold':'o','Not Started':'m'};
  function pctOf(p){ return Math.max(0,Math.min(100,parseFloat(p.progress)||0)); }

  window.acxPlansRange = function(k){
    if(k==='custom'){
      var a = prompt('From date (YYYY-MM-DD):', D.range('year',0).from); if(!a) return;
      var b = prompt('To date (YYYY-MM-DD):', D.iso(new Date())); if(!b) return;
      custom = {from:a, to:b};
    }
    D.setPeriod('plans', k);
  };

  function build(){
    var k = pr(), r = rangeFor(k), today = D.iso(new Date());
    var all = (store.plans||[]).filter(Boolean), ps = all.filter(function(p){ return overlaps(p,r); });
    var done = ps.filter(function(p){return p.status==='Completed';}), run = ps.filter(function(p){return p.status==='In Progress';});
    var late = ps.filter(function(p){return p.status==='Delayed';}), hold = ps.filter(function(p){return p.status==='On Hold';});
    var onTrackPct = ps.length ? Math.round((ps.length-late.length-hold.length)/ps.length*100) : 0;
    var owners = store.planOwnerships||[];

    var chips = [['quarter','This Quarter'],['year','This Year'],['lastyear','Last Year'],['custom','Custom']].map(function(c){
      return '<button class="ad-chip '+(k===c[0]?'on':'')+'" onclick="acxPlansRange(\''+c[0]+'\')">'+(c[0]==='quarter'?D.icon('calendar'):'')+c[1]+'</button>'; }).join('');

    var kp = [
      D.kpi({icon:'layers',color:'green',label:'Total Plans',value:D.num(ps.length)}),
      D.kpi({icon:'folder',color:'blue',label:'In Progress',value:D.num(run.length)}),
      D.kpi({icon:'check',color:'orange',label:'Completed Plans',value:D.num(done.length)}),
      D.kpi({icon:'clock',color:'purple',label:'On Track',value:onTrackPct+'%'})
    ].join('');

    var cards = ps.slice().sort(function(a,b){ return String(a.endDate||'9999').localeCompare(String(b.endDate||'9999')); }).slice(0,6).map(function(p,i){
      var pc = pctOf(p), ow = owners.filter(function(o){return o.planTitle===p.title;});
      return '<div class="ad-pc"><div class="img">'+(EMO[p.goalType]||'🗂️')+'</div><div class="bd"><h4>'+E(p.title)+'</h4><div class="meta">'+E(p.goalType||p.department||'Plan')+'</div>'
        + '<div class="ad-prow"><div class="ad-prog"><i style="width:'+pc+'%"></i></div><b>'+pc+'%</b></div>'
        + '<div class="meta">'+D.icon('calendar','style="width:12px;height:12px;display:inline;vertical-align:-2px"')+' Due: '+E(p.endDate?D.dstr(p.endDate):'—')+'</div>'
        + '<div class="meta">'+D.icon('users','style="width:12px;height:12px;display:inline;vertical-align:-2px"')+' '+(ow.length?E(ow.map(function(o){return o.owner;}).filter(Boolean).join(', ')||'Assigned'):'No owner yet')+'</div>'
        + '<button class="view" onclick="selPlan=\''+E(String(p.title).replace(/\\/g,'\\\\').replace(/'/g,"\\'"))+'\';go(\'ownership\')">View Plan</button></div></div>'; }).join('')
      || '<div class="ad-empty" style="grid-column:1/-1">No plans in this period. Use + New Plan below, or create one in Acacia Books.</div>';

    var donut = ps.length ? D.donut([{l:'In Progress',v:run.length,c:'#1b7a2f'},{l:'Completed',v:done.length,c:'#3b82f6'},{l:'Delayed',v:late.length,c:'#f59e0b'},{l:'On Hold',v:hold.length,c:'#ec4899'},
        {l:'Not Started',v:ps.length-run.length-done.length-late.length-hold.length,c:'#9ca3af'}].filter(function(x){return x.v>0;}),{center:ps.length,sub:'Plans'}) : '<div class="ad-empty">Nothing to chart yet.</div>';

    // average progress per month: each plan's latest progress record up to that month's end
    var recs = (store.planProgress||[]).filter(function(x){return x && x.date;}), labels=[], vals=[], n=new Date();
    for(var m=5;m>=0;m--){ var d=new Date(n.getFullYear(),n.getMonth()-m+1,0), end=D.iso(d), latest={};
      recs.forEach(function(x){ if(String(x.date).slice(0,10)<=end){ var t=x.title; if(!latest[t] || String(x.date)>=String(latest[t].date)) latest[t]=x; } });
      var ks=Object.keys(latest); labels.push(d.toLocaleDateString('en-GB',{month:'short'})); vals.push(ks.length?Math.round(sum(ks.map(function(t){return latest[t];}),function(x){return x.progress;})/ks.length):0); }
    var prog = recs.length ? D.line(labels,vals,{axisFmt:function(v){return v+'%';},tipFmt:function(v){return v+'%';},pad:44}) : '<div class="ad-empty">Record progress on a plan to see the trend.</div>';

    var up = ps.filter(function(p){return p.endDate && p.endDate>=today && p.status!=='Completed';}).sort(function(a,b){return a.endDate.localeCompare(b.endDate);}).slice(0,3);
    var upH = up.length ? '<div class="ad-list">'+up.map(function(p){ var d=new Date(p.endDate+'T00:00:00'), days=Math.round((d-new Date(today+'T00:00:00'))/86400000), risk = p.status==='Delayed' || (days<=14 && pctOf(p)<70);
      return '<div class="ad-li"><div class="ad-date"><small>'+E(d.toLocaleDateString('en-GB',{month:'short'}).toUpperCase())+'</small>'+d.getDate()+'</div><span class="n">'+E(p.title)+'<span class="s">'+E(p.goalType||p.department||'Plan')+'</span></span><span class="m">'+(risk?D.pill('At Risk','o'):days<=30?D.pill('On Track','g'):D.pill('Upcoming','b'))+'</span></div>'; }).join('')+'</div>' : '<div class="ad-empty">No plan deadlines coming up.</div>';

    var act = [];
    (store.planProgress||[]).forEach(function(x){ if(x&&x.date) act.push({t:x.date,w:x.title,s:'Progress updated: '+x.title+(x.progress!=null&&x.progress!==''?' ('+x.progress+'%)':'')}); });
    (store.planRevisions||[]).forEach(function(x){ if(x&&x.date) act.push({t:x.date,w:x.title,s:'Plan revised: '+x.title}); });
    (store.planRevenue||[]).forEach(function(x){ if(x&&x.date) act.push({t:x.date,w:x.planTitle,s:'Revenue recorded: '+D.money(x.amount)+' — '+x.planTitle}); });
    (store.planActionItems||[]).forEach(function(x){ if(x&&x.date) act.push({t:x.date,w:x.title,s:'Action item: '+(x.action||x.item||x.title)}); });
    act.sort(function(a,b){return String(b.t).localeCompare(String(a.t));});
    var actH = act.length ? '<div class="ad-list">'+act.slice(0,4).map(function(a){ return '<div class="ad-li"><span class="ad-av">'+E(D.initials(a.w))+'</span><span class="n">'+E(a.s)+'</span><span class="m">'+E(D.dstr(a.t,{day:'numeric',month:'short'}))+'</span></div>'; }).join('')+'</div>' : '<div class="ad-empty">No activity recorded yet.</div>';

    var load = {}; owners.forEach(function(o){ var names=[o.owner].concat(o.team||[]).filter(Boolean); names.forEach(function(nm){ (load[nm]=load[nm]||{})[o.planTitle]=1; }); });
    var lk = Object.keys(load).map(function(nm){return {n:nm,c:Object.keys(load[nm]).length};}).sort(function(a,b){return b.c-a.c;}).slice(0,4), mx = lk.length?lk[0].c:1;
    var resH = lk.length ? lk.map(function(x){ return D.hbar(x.n,x.c,mx,x.c+(x.c===1?' plan':' plans')); }).join('') : '<div class="ad-empty">Assign owners to plans to see who is carrying what.</div>';

    return '<div class="ad">'
      + D.head({icon:'grid',title:'Plan Hub',sub:'Manage your plans, projects and resources in one place',right:chips})
      + '<div class="ad-kpis">'+kp+'</div>'
      + '<div class="ad-row ad-r-32"><div class="ad-card"><div class="ad-bandhead"><span>Your Plans</span><button class="ad-link" onclick="document.getElementById(\'plansBody\')&&document.getElementById(\'plansBody\').scrollIntoView({behavior:\'smooth\'})">View All Plans</button></div><div class="ad-plans">'+cards+'</div></div>'
        + '<div style="display:grid;gap:12px;align-content:start">'+D.card('Project Portfolio',donut,{icon:'layers'})+D.card('Plan Progress',prog,{icon:'trend'})+'</div></div>'
      + '<div class="ad-row ad-r-3">'+D.card('Upcoming Milestones',upH,{icon:'calendar'})+D.card('Recent Activities',actH,{icon:'bolt'})+D.card('Resource Allocation',resHtml(resH),{icon:'users'})+'</div>'
      + '</div>';
  }
  function resHtml(x){ return x; }

  var orig = window.renderPlans;
  window.renderPlans = function(m){
    orig(m);
    try{
      var v = document.getElementById('view'); if(!v) return;
      var cards = v.children[1]; if(cards && cards.className.indexOf('grid')>=0) cards.remove();
      v.insertAdjacentHTML('afterbegin', build());
      var hdr = v.children[1]; if(hdr) hdr.style.marginTop = '8px';
    }catch(e){ console.warn('plan dashboard', e); }
  };
  D.onPeriod('plans', function(){ if(typeof active!=='undefined' && active==='plans') renderView(); });
  function tag(){ D.polishTopbar('Plan. Execute. Deliver.', 'header.flex'); }
  tag(); document.addEventListener('DOMContentLoaded', tag);
})();
