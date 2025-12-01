const Parser = require('../lib/parser.js');

describe('Parser.evaluate', ()=>{
  test('basic arithmetic', ()=>{
    expect(Parser.evaluate('1+2*3')).toBe(7);
    expect(Parser.evaluate('(1+2)*3')).toBe(9);
    expect(Parser.evaluate('2^3')).toBe(8);
    expect(Parser.evaluate('10/4')).toBeCloseTo(2.5);
  });

  test('functions and unary minus', ()=>{
    expect(Parser.evaluate('sin(0)')).toBeCloseTo(0);
    expect(Parser.evaluate('cos(0)')).toBeCloseTo(1);
    expect(Parser.evaluate('-5 + 2')).toBe(-3);
    expect(Parser.evaluate('sqrt(9)')).toBe(3);
  });
});
