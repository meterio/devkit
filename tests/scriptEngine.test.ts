import { expect } from 'chai';
import { ScriptEngine, RLP } from '../src';
const holderAddr = '0x0205c2D862cA051010698b69b54278cbAf945C0b';
const candidateAddr = '0x8a88c59bf15451f9deb1d62f7734fece2002668e';
const candidatePubKey =
  'BKjr6wO34Vif9oJHK1/AbMCLHVpvJui3Nx3hLwuOfzwx1Th4H4G0I4liGEC3qKsf8KOd078gYFTK+41n+KhDTzk=:::uH2sc+WgsrxPs91LBy8pIBEjM5I7wNPtSwRSNa83wo4V9iX3RmUmkEPq1QRv4wwRbosNO1RFJ/r64bwdSKK1VwA=';
const candidateName = 'tester';
const candidateIP = '1.2.3.4';
const candidatePort = 8670;
const bucketID = '0xd75eb6c42a73533f961c38fe2b87bb3615db7ff8e19c0d808c046e7a25d9a413';
const amount = 5e18;
const timestamp = 1567898765;
const nonce = 123456;

describe('script engine', () => {
  it('candidate', () => {
    const scriptDataBuffer = ScriptEngine.getCandidateData(
      ScriptEngine.Option.OneWeekLock,
      candidateAddr,
      candidateName,
      candidatePubKey,
      candidateIP,
      candidatePort,
      amount,
      timestamp,
      nonce
    );
    const scriptData = '0x' + scriptDataBuffer.toString('hex');
    expect(scriptData).equal(
      '0xffffffffdeadbeeff90134c4808203e8b9012cf90129038001948a88c59bf15451f9deb1d62f7734fece2002668e948a88c59bf15451f9deb1d62f7734fece2002668e86746573746572b8b3424b6a7236774f3334566966396f4a484b312f41624d434c485670764a7569334e7833684c77754f667a7778315468344834473049346c6947454333714b7366384b4f64303738675946544b2b34316e2b4b6844547a6b3d3a3a3a75483273632b5767737278507339314c427938704942456a4d354937774e5074537752534e613833776f345639695833526d556d6b4550713151527634777752626f734e4f3152464a2f723634627764534b4b315677413d87312e322e332e348221dea00000000000000000000000000000000000000000000000000000000000000000884563918244f4000001845d743c8d8301e24080'
    );
  });

  it('uncandidate', () => {
    const scriptDataBuffer = ScriptEngine.getUncandidateData(candidateAddr, timestamp, nonce);
    const scriptData = '0x' + scriptDataBuffer.toString('hex');
    expect(scriptData).equal(
      '0xffffffffdeadbeeff867c4808203e8b860f85e048080940000000000000000000000000000000000000000948a88c59bf15451f9deb1d62f7734fece2002668e80808080a000000000000000000000000000000000000000000000000000000000000000008001845d743c8d8301e24080'
    );
  });

  it('delegate', () => {
    const scriptDataBuffer = ScriptEngine.getDelegateData(
      holderAddr,
      candidateAddr,
      bucketID,
      amount,
      timestamp,
      nonce
    );
    const scriptData = '0x' + scriptDataBuffer.toString('hex');
    expect(scriptData).equal(
      '0xffffffffdeadbeeff86fc4808203e8b868f866058080940205c2d862ca051010698b69b54278cbaf945c0b948a88c59bf15451f9deb1d62f7734fece2002668e80808080a0d75eb6c42a73533f961c38fe2b87bb3615db7ff8e19c0d808c046e7a25d9a413884563918244f4000001845d743c8d8301e24080'
    );
  });

  it('undelegate', () => {
    const scriptDataBuffer = ScriptEngine.getUndelegateData(
      holderAddr,
      bucketID,
      amount,
      timestamp,
      nonce
    );
    const scriptData = '0x' + scriptDataBuffer.toString('hex');
    expect(scriptData).equal(
      '0xffffffffdeadbeeff86fc4808203e8b868f866068080940205c2d862ca051010698b69b54278cbaf945c0b94000000000000000000000000000000000000000080808080a0d75eb6c42a73533f961c38fe2b87bb3615db7ff8e19c0d808c046e7a25d9a413884563918244f4000001845d743c8d8301e24080'
    );
  });

  it('bound', () => {
    const scriptDataBuffer = ScriptEngine.getBoundData(
      ScriptEngine.Option.OneWeekLock,
      holderAddr,
      candidateAddr,
      amount,
      timestamp,
      nonce
    );
    const scriptData = '0x' + scriptDataBuffer.toString('hex');
    expect(scriptData).equal(
      '0xffffffffdeadbeeff86fc4808203e8b868f866018001940205c2d862ca051010698b69b54278cbaf945c0b948a88c59bf15451f9deb1d62f7734fece2002668e80808080a00000000000000000000000000000000000000000000000000000000000000000884563918244f4000001845d743c8d8301e24080'
    );
  });

  it('unbound', () => {
    const scriptDataBuffer = ScriptEngine.getUnboundData(
      holderAddr,
      bucketID,
      amount,
      timestamp,
      nonce
    );
    const scriptData = '0x' + scriptDataBuffer.toString('hex');
    expect(scriptData).equal(
      '0xffffffffdeadbeeff86fc4808203e8b868f866028080940205c2d862ca051010698b69b54278cbaf945c0b94000000000000000000000000000000000000000080808080a0d75eb6c42a73533f961c38fe2b87bb3615db7ff8e19c0d808c046e7a25d9a413884563918244f4000001845d743c8d8301e24080'
    );
  });

  it('bid', () => {
    const scriptDataBuffer = ScriptEngine.getBidData(holderAddr, amount, timestamp, nonce);
    const scriptData = '0x' + scriptDataBuffer.toString('hex');
    expect(scriptData).equal(
      '0xffffffffdeadbeeff859c4808203e9b852f85003808080808080a00000000000000000000000000000000000000000000000000000000000000000940205c2d862ca051010698b69b54278cbaf945c0b884563918244f4000080845d743c8d8301e240'
    );
  });

  it('candidateUpdate', () => {
    const scriptDataBuffer = ScriptEngine.getCandidateUpdateData(
      candidateAddr,
      candidateName,
      candidatePubKey,
      candidateIP,
      candidatePort,
      timestamp,
      nonce
    );
    const scriptData = '0x' + scriptDataBuffer.toString('hex');
    expect(scriptData).equal(
      '0xffffffffdeadbeeff9012cc4808203e8b90124f90121078001948a88c59bf15451f9deb1d62f7734fece2002668e948a88c59bf15451f9deb1d62f7734fece2002668e86746573746572b8b3424b6a7236774f3334566966396f4a484b312f41624d434c485670764a7569334e7833684c77754f667a7778315468344834473049346c6947454333714b7366384b4f64303738675946544b2b34316e2b4b6844547a6b3d3a3a3a75483273632b5767737278507339314c427938704942456a4d354937774e5074537752534e613833776f345639695833526d556d6b4550713151527634777752626f734e4f3152464a2f723634627764534b4b315677413d87312e322e332e348221dea000000000000000000000000000000000000000000000000000000000000000008001845d743c8d8301e24080'
    );
  });

  it('bailOut', () => {
    const scriptDataBuffer = ScriptEngine.getBailOutData(holderAddr, timestamp, nonce);
    const scriptData = '0x' + scriptDataBuffer.toString('hex');
    expect(scriptData).equal(
      '0xffffffffdeadbeeff867c4808203e8b860f85e668080940205c2d862ca051010698b69b54278cbaf945c0b940205c2d862ca051010698b69b54278cbaf945c0b80808080a000000000000000000000000000000000000000000000000000000000000000008001845d743c8d8301e24080'
    );
  });

  it('xx', () => {
    const body = new ScriptEngine.StakingBody(
      ScriptEngine.OpCode.StakingUnbound,
      ScriptEngine.Option.Empty,
      holderAddr,
      '',
      '',
      '',
      '',
      0,
      '0x0000000000000000000000000000000000000000000000000000000000000000',
      amount,
      ScriptEngine.Token.MeterGov,
      timestamp,
      nonce
    );
    const data = new RLP(ScriptEngine.StakingBody.profile).encode(body);
    console.log('DATA: ', data.toString('hex'));
    const body2 = new RLP(ScriptEngine.StakingBody.profile).decode(data);
    console.log(body2);
    // const scriptData =
    // '0xffffffffdeadbeeff86ec4808203e8b867f865028080940205c2d862ca051010698b69b54278cbaf945c0b94000000000000000000000000000000000000000080808080a0d75eb6c42a73533f961c38fe2b87bb3615db7ff8e19c0d808c046e7a25d9a413884563918244f4000001845d743c8d8301e240';
    // ScriptEngine.parseStakingData(scriptData);
  });

  it('yy', () => {
    const body = new ScriptEngine.AuctionBody(
      ScriptEngine.OpCode.AuctionBid,
      ScriptEngine.Option.Empty,
      ScriptEngine.EMPTY_BYTE32,
      holderAddr,
      amount,
      timestamp,
      nonce
    );
    const data = new RLP(ScriptEngine.AuctionBody.profile).encode(body);
    console.log('DATA: ', data.toString('hex'));
    const body2 = new RLP(ScriptEngine.AuctionBody.profile).decode(data);
    console.log(body2);
  });
});
