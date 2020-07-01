import { expect } from 'chai';
import { calcChainTag } from '../src';

describe('chain', () => {
  it('calc chainTag', () => {
    expect(
      calcChainTag('0x00000000ed77a5a4cc2cb585ed7fba4200b89751142cd6fe124aecc3d3350e58')
    ).equal(88);
    expect(
      calcChainTag('0x000000006fc6a7f3571f22424ffc395e40db2a46dd7e18059eeef4f05bf08063')
    ).equal(99);
  });
});
