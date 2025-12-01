// Calculator behavior: click and keyboard handling, safe evaluation, theme toggle
(() => {
  const displayEl = document.getElementById('display');
  const btns = document.querySelectorAll('.btn');
  const themeSwitch = document.getElementById('themeSwitch');
  const historyToggle = document.getElementById('historyToggle');
  const historyPanel = document.getElementById('historyPanel');
  const historyList = document.getElementById('historyList');
  const clearHistoryBtn = document.getElementById('clearHistory');
  const closeHistoryBtn = document.getElementById('closeHistory');
  const memIndicator = document.getElementById('memIndicator');
  let buffer = '';
  let memory = 0; // simple memory register
  const history = [];
  const STORAGE_KEY = 'calc-history-v1';

  function render() {
    displayEl.textContent = buffer === '' ? '0' : buffer;
  }

  function append(value) {
    // Prevent two decimals in same number segment
    if (value === '.'){
      const parts = buffer.split(/[^0-9.]/);
      const last = parts[parts.length-1] || '';
      if (last.includes('.')) return;
      if (last === '') value = '0.';
    }
    buffer += value;
    render();
  }

  function doBackspace(){
    buffer = buffer.slice(0,-1);
    render();
  }

  function doClear(){
    buffer = '';
    render();
  }

  function doPercent(){
    // Convert last number to percentage
    const match = buffer.match(/(\d*\.?\d+)$/);
    if (match){
      const val = parseFloat(match[1]);
      buffer = buffer.slice(0, match.index) + (val/100).toString();
      render();
    }
  }

  // Use the safe Parser provided in lib/parser.js (shunting-yard + RPN)
  function safeEval(expr){
    if (!window.Parser || typeof window.Parser.evaluate !== 'function') throw new Error('Parser not loaded');
    // normalize unicode operators and spaces
    expr = expr.replace(/×/g,'*').replace(/÷/g,'/').replace(/\s+/g,'');
    return window.Parser.evaluate(expr);
  }

  function doEquals(){
    try{
      if (buffer.trim() === '') return;
      const expr = buffer;
      const result = safeEval(expr);
      buffer = String(result);
      // push to history (most recent first)
      history.unshift({expr: expr, result: buffer, ts: Date.now()});
      saveHistory();
      render();
      renderHistory();
    }catch(e){
      buffer = 'Error';
      render();
      setTimeout(()=>{ buffer=''; render(); }, 1200);
    }
  }

  // Memory functions
  function memAdd(){
    try{
      const val = buffer === '' ? 0 : safeEval(buffer);
      memory = Number((memory + Number(val)).toString());
      updateMemIndicator();
    }catch(e){/* ignore */}
  }
  function memSub(){
    try{
      const val = buffer === '' ? 0 : safeEval(buffer);
      memory = Number((memory - Number(val)).toString());
      updateMemIndicator();
    }catch(e){/* ignore */}
  }
  function memRecall(){
    buffer += String(memory);
    render();
  }
  function memClear(){
    memory = 0; updateMemIndicator();
  }
  function updateMemIndicator(){
    if (memory !== 0) memIndicator.classList.add('active');
    else memIndicator.classList.remove('active');
    memIndicator.textContent = memory !== 0 ? 'M' : '';
  }

  // History rendering
  function renderHistory(){
    historyList.innerHTML = '';
    if (history.length === 0){
      const li = document.createElement('li'); li.className='history-item'; li.textContent='(no history)'; historyList.appendChild(li); return;
    }
    history.slice(0,50).forEach(h=>{
      const li = document.createElement('li'); li.className='history-item';
      const left = document.createElement('div'); left.textContent = h.expr;
      const right = document.createElement('div'); right.innerHTML = '<small>'+h.result+'</small>';
      li.appendChild(left); li.appendChild(right);
      li.addEventListener('click', ()=>{ buffer = h.result; render(); });
      historyList.appendChild(li);
    });
  }

  btns.forEach(b=>{
    b.addEventListener('click', ()=>{
      // press animation
      b.classList.add('press');
      setTimeout(()=>b.classList.remove('press'), 140);
      const fn = b.dataset.fn;
      const v = b.dataset.value;
      const action = b.dataset.action;
      // functions (scientific) append appropriate tokens
      if (fn){
        if (fn === '^') append('^');
        else if (fn === 'sqrt') append('sqrt(');
        else append(fn + '(');
      }
      if (v) append(v);
      if (action){
        if (action === 'clear') doClear();
        if (action === 'back') doBackspace();
        if (action === 'percent') doPercent();
        if (action === 'equals') doEquals();
        if (action === 'mem-add') memAdd();
        if (action === 'mem-sub') memSub();
        if (action === 'mem-recall') memRecall();
        if (action === 'mem-clear') memClear();
      }
    });
  });

  // Keyboard handling
  window.addEventListener('keydown', (e)=>{
    if (e.key >= '0' && e.key <= '9') append(e.key);
    else if (['+','-','*','/','(',')','.'].includes(e.key)) append(e.key);
    else if (e.key === 'Enter' || e.key === '=') { e.preventDefault(); doEquals(); }
    else if (e.key === 'Backspace') doBackspace();
    else if (e.key === 'Escape') doClear();
    else if (e.key === '%') doPercent();
  });

  // keyboard animation: try to find matching button and flash it
  window.addEventListener('keydown', (e)=>{
    const keyMap = {'/':'/','*':'*','-':'-','+':'+','.':'.','Enter':'equals'};
    let selector = null;
    if (e.key >= '0' && e.key <= '9') selector = `[data-value="${e.key}"]`;
    else if (keyMap[e.key]) selector = `[data-value="${keyMap[e.key]}"]`;
    else if (e.key === 'Enter') selector = `[data-action="equals"]`;
    if (selector){
      const btn = document.querySelector(selector);
      if (btn){ btn.classList.add('press'); setTimeout(()=>btn.classList.remove('press'),140); }
    }
  });

  // Theme toggle persists in localStorage
  function setTheme(dark){
    if (dark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('calc-dark', dark ? '1' : '0');
  }
  themeSwitch.addEventListener('change', ()=> setTheme(themeSwitch.checked));
  const saved = localStorage.getItem('calc-dark');
  if (saved === '1') { themeSwitch.checked = true; setTheme(true); }
  else setTheme(false);

  // history toggle
  historyToggle.addEventListener('click', ()=>{
    const open = historyPanel.getAttribute('aria-hidden') === 'true';
    historyPanel.setAttribute('aria-hidden', String(!open));
    historyToggle.setAttribute('aria-pressed', String(open));
    if (open) renderHistory();
  });
  closeHistoryBtn.addEventListener('click', ()=>{ historyPanel.setAttribute('aria-hidden','true'); historyToggle.setAttribute('aria-pressed','false'); });
  clearHistoryBtn.addEventListener('click', ()=>{ history.length=0; saveHistory(); renderHistory(); });

  // export
  const exportBtn = document.getElementById('exportHistory');
  if (exportBtn) exportBtn.addEventListener('click', exportHistory);

  // Mode toggle (scientific)
  const modeToggle = document.getElementById('modeToggle');
  const scientificPanel = document.getElementById('scientificPanel');
  const calculatorEl = document.getElementById('calculator');
  if (modeToggle){
    modeToggle.addEventListener('click', ()=>{
      const open = scientificPanel.getAttribute('aria-hidden') === 'true';
      scientificPanel.setAttribute('aria-hidden', String(!open));
      modeToggle.textContent = open ? 'Cmp' : 'Sci';
      calculatorEl.classList.toggle('scientific-on', open);
    });
  }

  // save/load helpers
  function saveHistory(){
    try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(history)); }catch(e){/* ignore storage errors */}
  }
  function loadHistory(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw){
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)){
          history.splice(0, history.length, ...arr);
        }
      }
    }catch(e){ /* ignore */ }
  }

  // Export history as JSON file
  function exportHistory(){
    try{
      const blob = new Blob([JSON.stringify(history, null, 2)], {type:'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'calculator-history.json';
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    }catch(e){ console.error(e); }
  }

  // initial memory indicator + history render
  updateMemIndicator();
  loadHistory();
  renderHistory();

  // initial render
  render();

})();