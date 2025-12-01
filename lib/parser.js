/*
  Small safe expression parser and evaluator using Shunting-Yard + RPN.
  Supports: + - * / ^, parentheses, unary -, functions: sin, cos, tan, sqrt, ln, log, exp, abs
  Exposes evaluate(expr) and tokenize for testing.
  Works in Node (module.exports) and attaches window.Parser in browser.
*/
(function(root){
  'use strict';

  const FUNCTIONS = {
    'sin': Math.sin,
    'cos': Math.cos,
    'tan': Math.tan,
    'sqrt': Math.sqrt,
    'ln': (v)=>Math.log(v),
    'log': (v)=>Math.log10 ? Math.log10(v) : Math.log(v)/Math.LN10,
    'exp': Math.exp,
    'abs': Math.abs
  };

  const OPERATORS = {
    '+': {prec:2, assoc:'L', fn:(a,b)=>a+b},
    '-': {prec:2, assoc:'L', fn:(a,b)=>a-b},
    '*': {prec:3, assoc:'L', fn:(a,b)=>a*b},
    '/': {prec:3, assoc:'L', fn:(a,b)=>a/b},
    '^': {prec:4, assoc:'R', fn:(a,b)=>Math.pow(a,b)}
  };

  function isNumeric(ch){ return /^\d+(\.\d+)?$/.test(ch); }

  function tokenize(input){
    input = (input||'').replace(/×/g,'*').replace(/÷/g,'/').replace(/\s+/g,'');
    const tokens = [];
    let i=0;
    while(i<input.length){
      const ch = input[i];
      if (/[0-9.]/.test(ch)){
        let num = ch; i++;
        while(i<input.length && /[0-9.]/.test(input[i])){ num += input[i++]; }
        tokens.push({type:'number', value: parseFloat(num)});
        continue;
      }
      if (/[a-zA-Z]/.test(ch)){
        let name = ch; i++;
        while(i<input.length && /[a-zA-Z]/.test(input[i])) name += input[i++];
        tokens.push({type:'name', value: name});
        continue;
      }
      if (ch === ','){ tokens.push({type:'argsep'}); i++; continue; }
      if (ch === '(' || ch === ')'){ tokens.push({type:'paren', value: ch}); i++; continue; }
      if (OPERATORS[ch]){ tokens.push({type:'op', value: ch}); i++; continue; }
      // support unary minus detection
      if (ch === '+' || ch === '-'){
        tokens.push({type:'op', value: ch}); i++; continue;
      }
      // unknown char -> throw
      throw new Error('Invalid character: '+ch);
    }
    return tokens;
  }

  function toRPN(tokens){
    const out = [];
    const stack = [];
    for(let i=0;i<tokens.length;i++){
      const t = tokens[i];
      if (t.type === 'number') out.push(t);
      else if (t.type === 'name') stack.push(t);
      else if (t.type === 'op'){
        const o1 = t.value;
        // handle unary minus: if it's at start or after another operator or '('
        if ((o1 === '+' || o1 === '-') && (i===0 || (tokens[i-1].type === 'op' || (tokens[i-1].type==='paren' && tokens[i-1].value==='(')))){
          // convert unary minus to function '_neg'
          if (o1 === '-') stack.push({type:'name', value:'_neg'});
          continue;
        }
        while(stack.length){
          const top = stack[stack.length-1];
          if (top.type === 'op'){
            const o2 = top.value;
            if ((OPERATORS[o2].prec > OPERATORS[o1].prec) || (OPERATORS[o2].prec === OPERATORS[o1].prec && OPERATORS[o1].assoc === 'L')){
              out.push(stack.pop()); continue;
            }
          }
          break;
        }
        stack.push(t);
      }
      else if (t.type === 'paren'){
        if (t.value === '(') stack.push(t);
        else{
          // pop until (
          while(stack.length && !(stack[stack.length-1].type==='paren' && stack[stack.length-1].value==='(')) { out.push(stack.pop()); }
          if (!stack.length) throw new Error('Mismatched parentheses');
          stack.pop(); // remove (
          // if function on top, pop to output
          if (stack.length && stack[stack.length-1].type === 'name'){ out.push(stack.pop()); }
        }
      }
      else if (t.type === 'argsep'){
        while(stack.length && !(stack[stack.length-1].type==='paren' && stack[stack.length-1].value==='(')) out.push(stack.pop());
        if (!stack.length) throw new Error('Misplaced function argument separator');
      }
    }
    while(stack.length){
      const s = stack.pop();
      if (s.type === 'paren') throw new Error('Mismatched parentheses');
      out.push(s);
    }
    return out;
  }

  function evalRPN(rpn){
    const st = [];
    for(const t of rpn){
      if (t.type === 'number') st.push(t.value);
      else if (t.type === 'op'){
        const b = st.pop(); const a = st.pop();
        if (a === undefined || b === undefined) throw new Error('Syntax error');
        const res = OPERATORS[t.value].fn(a,b);
        st.push(res);
      } else if (t.type === 'name'){
        if (t.value === '_neg'){ const v = st.pop(); st.push(-v); }
        else if (FUNCTIONS[t.value]){ const v = st.pop(); st.push(FUNCTIONS[t.value](v)); }
        else throw new Error('Unknown function '+t.value);
      }
    }
    if (st.length !== 1) throw new Error('Syntax error');
    return st[0];
  }

  function evaluate(expr){
    const tokens = tokenize(expr);
    const rpn = toRPN(tokens);
    return evalRPN(rpn);
  }

  const API = { tokenize, toRPN, evalRPN, evaluate };

  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  if (typeof window !== 'undefined') window.Parser = API;

  return API;
})(this);
