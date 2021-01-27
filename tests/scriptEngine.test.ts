import { expect } from 'chai';
import { ScriptEngine, RLP } from '../src';
const holderAddr = '0x0205c2D862cA051010698b69b54278cbAf945C0b'.toLowerCase();
const candidateAddr = '0x8a88c59bf15451f9deb1d62f7734fece2002668e'.toLowerCase();
const candidatePubKey =
  'BKjr6wO34Vif9oJHK1/AbMCLHVpvJui3Nx3hLwuOfzwx1Th4H4G0I4liGEC3qKsf8KOd078gYFTK+41n+KhDTzk=:::uH2sc+WgsrxPs91LBy8pIBEjM5I7wNPtSwRSNa83wo4V9iX3RmUmkEPq1QRv4wwRbosNO1RFJ/r64bwdSKK1VwA=';
const candidateName = 'tester';
const candidateDesc = 'tester desc';
const candidateIP = '1.2.3.4';
const candidatePort = 8670;
const bucketID = '0xd75eb6c42a73533f961c38fe2b87bb3615db7ff8e19c0d808c046e7a25d9a413';
const amount = 5e18;
const timestamp = 1567898765;
const commission = 200; // 2%
const nonce = 123456;
const lockEpoch = 100;
const autobid = 100;
const releaseEpoch = 200;
const mtrAmount = 20 * 1e18;
const mtrgAmount = '100000';

describe('script engine', () => {
  it('candidate', () => {
    const scriptDataBuffer = ScriptEngine.getCandidateData(
      candidateAddr,
      candidateName,
      candidateDesc,
      candidatePubKey,
      candidateIP,
      candidatePort,
      amount,
      commission,
      timestamp,
      nonce,
      autobid
    );
    const scriptData = '0x' + scriptDataBuffer.toString('hex');
    expect(scriptData).equal(
      '0xffffffffdeadbeeff90138c4808203e8b90130f9012d03808401312d00948a88c59bf15451f9deb1d62f7734fece2002668e948a88c59bf15451f9deb1d62f7734fece2002668e86746573746572b8b3424b6a7236774f3334566966396f4a484b312f41624d434c485670764a7569334e7833684c77754f667a7778315468344834473049346c6947454333714b7366384b4f64303738675946544b2b34316e2b4b6844547a6b3d3a3a3a75483273632b5767737278507339314c427938704942456a4d354937774e5074537752534e613833776f345639695833526d556d6b4550713151527634777752626f734e4f3152464a2f723634627764534b4b315677413d87312e322e332e348221dea00000000000000000000000000000000000000000000000000000000000000000884563918244f4000001845d743c8d8301e24080'
    );
    const sd = ScriptEngine.decodeScriptData(scriptDataBuffer);
    const body = ScriptEngine.decodeStakingBody(sd.payload);
    console.log('STAKING BODY !!: ', body);
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
      candidateDesc,
      candidatePubKey,
      candidateIP,
      candidatePort,
      commission,
      timestamp,
      nonce
    );
    const scriptData = '0x' + scriptDataBuffer.toString('hex');
    expect(scriptData).equal(
      '0xffffffffdeadbeeff90130c4808203e8b90128f9012507808401312d00948a88c59bf15451f9deb1d62f7734fece2002668e948a88c59bf15451f9deb1d62f7734fece2002668e86746573746572b8b3424b6a7236774f3334566966396f4a484b312f41624d434c485670764a7569334e7833684c77754f667a7778315468344834473049346c6947454333714b7366384b4f64303738675946544b2b34316e2b4b6844547a6b3d3a3a3a75483273632b5767737278507339314c427938704942456a4d354937774e5074537752534e613833776f345639695833526d556d6b4550713151527634777752626f734e4f3152464a2f723634627764534b4b315677413d87312e322e332e348221dea000000000000000000000000000000000000000000000000000000000000000008001845d743c8d8301e24080'
    );
  });

  it('bailOut', () => {
    const scriptDataBuffer = ScriptEngine.getBailOutData(holderAddr, timestamp, nonce);
    const scriptData = '0x' + scriptDataBuffer.toString('hex');
    expect(scriptData).equal(
      '0xffffffffdeadbeeff867c4808203e8b860f85e668080940205c2d862ca051010698b69b54278cbaf945c0b940205c2d862ca051010698b69b54278cbaf945c0b80808080a000000000000000000000000000000000000000000000000000000000000000008001845d743c8d8301e24080'
    );
  });

  it('lockedTransfer', () => {
    const scriptDataBuffer = ScriptEngine.getLockedTransferData(
      lockEpoch,
      releaseEpoch,
      holderAddr,
      candidateAddr,
      mtrAmount,
      mtrgAmount,
      'memo'
    );
    const scriptData = '0x' + scriptDataBuffer.toString('hex');
    expect(scriptData).equal(
      '0xffffffffdeadbeeff84cc4808203eab845f8430380806481c8940205c2d862ca051010698b69b54278cbaf945c0b948a88c59bf15451f9deb1d62f7734fece2002668e8901158e460913d00000830186a0846d656d6f'
    );
  });

  it('should encode and decode staking body', () => {
    const body = new ScriptEngine.StakingBody(
      ScriptEngine.OpCode.StakingCandidate,
      ScriptEngine.Option.Empty,
      holderAddr,
      candidateAddr,
      candidateName,
      candidateDesc,
      candidatePubKey,
      candidateIP,
      candidatePort,
      ScriptEngine.EMPTY_BYTE32,
      amount,
      ScriptEngine.Token.MeterGov,
      timestamp,
      nonce
    );
    const data = new RLP(ScriptEngine.StakingBodyProfile).encode(body);
    console.log('Staking Candidate Payload: ', '0x' + data.toString('hex'));
    const body2 = new RLP(ScriptEngine.StakingBodyProfile).decode(data);
    console.log(body2);
    expect('0x' + body2.holderAddr.toString('hex')).equal(holderAddr);
    expect('0x' + body2.candidateAddr.toString('hex')).equal(candidateAddr);
    expect(body2.candidateName.toString()).equal(candidateName);
    expect(body2.candidatePubKey.toString()).equal(candidatePubKey);
    expect(body2.candidateIP.toString()).equal(candidateIP);
    expect(body2.candidatePort).equal(candidatePort);
    expect('0x' + body2.bucketID.toString('hex')).equal(ScriptEngine.EMPTY_BYTE32);
    expect(parseInt(body2.amount, 16)).equal(amount);
    expect(body2.token).equal(ScriptEngine.Token.MeterGov);
    expect(body2.nonce).equal(nonce);
    expect(body2.timestamp).equal(timestamp);
  });

  it('should encode and decode auction body', () => {
    const body = new ScriptEngine.AuctionBody(
      ScriptEngine.OpCode.AuctionBid,
      ScriptEngine.Option.Empty,
      ScriptEngine.EMPTY_BYTE32,
      holderAddr,
      amount,
      timestamp,
      nonce
    );
    const data = new RLP(ScriptEngine.AuctionBodyProfile).encode(body);
    console.log('Auction Bid Payload: ', data.toString('hex'));
    const body2 = new RLP(ScriptEngine.AuctionBodyProfile).decode(data);
    console.log(body2);
    expect(body2.opCode).equal(ScriptEngine.OpCode.AuctionBid);
    expect(body2.option).equal(ScriptEngine.Option.Empty);
    expect('0x' + body2.auctionID.toString('hex')).equal(ScriptEngine.EMPTY_BYTE32);
    expect('0x' + body2.bidder.toString('hex')).equal(holderAddr);
    expect(parseInt(body2.amount, 16)).equal(amount);
    expect(body2.timestamp).equal(timestamp);
    expect(body2.nonce).equal(nonce);
  });

  it('should decode script data by profile', () => {
    const dec = new RLP(ScriptEngine.ScriptDataProfile).decode(
      Buffer.from(
        'f90141c4808203e8b90139f901360380019440df6f787bf8bd3fba3b2ef5a742ae0c993f14189440df6f787bf8bd3fba3b2ef5a742ae0c993f1418887869616f68616e32b8b4424d7845445839506d6e61505a61523935517463516f654c7959586444562b54753375334a7a3973374c52316370466c484f566830414a473874784d36374a5678634a67453848782f41422b444546364c426d7a424a4d3d3a3a3a0a48516b63646d4c30756f754f6d2f4c4f6e7a4c396e68362b4e6a6c486434334e38733168534c5a6e5346494854324e7472797979323138694b454e374f48785339494d4844395846586d794c384643414d542b697851453d8c2035322e37342e3131332e348221dea00000000000000000000000000000000000000000000000000000000000000000891043561a882930000001845ed5899d870926ebe848f0f680',
        'hex'
      )
    );
    console.log('by profile', dec);
  });

  it('should decode script data by func', () => {
    const scriptData = ScriptEngine.decodeScriptData(
      Buffer.from(
        'deadbeeff90144c4808203e8b9013cf9013903808405f5e1009403aa4784c850265fdc4260412c80d2551f329e0c9403aa4784c850265fdc4260412c80d2551f329e0c856361726f6c856361726f6cb8b3424258596f6c584e5a394179784c4439472f4c715269382f633353566b6c4430436e474f5452324778314743544d4576493673742f4145336a666966336659447a4342632f504f654b57547632524d6153385433414a633d3a3a3a62764a3949513658424b395974534e4f7342395a776a5279375a2b58672f672f4d51426639444474727a3567546e7063634b4e4f47673857315471585a7268614476346e2f43594b62795a736669496a4f7869444d41413d8c31382e3137362e37302e35398221dea0000000000000000000000000000000000000000000000000000000000000000089878678326eac90000001806487057db54f84f86280',
        'hex'
      )
    );
    if (scriptData.header.modId === ScriptEngine.ModuleID.Staking) {
      const body = ScriptEngine.decodeStakingBody(scriptData.payload);
      console.log('STAKING BODY: ', body);
    }
  });
});
