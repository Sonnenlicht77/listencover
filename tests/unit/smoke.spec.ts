import { describe, it, expect } from 'vitest';

describe('环境冒烟测试', () => {
  it('基础断言正常工作', () => {
    expect(1 + 1).toBe(2);
  });

  it('jsdom 环境可用', () => {
    const div = document.createElement('div');
    div.textContent = 'hello';
    expect(div.textContent).toBe('hello');
  });
});
