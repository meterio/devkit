import { expect } from 'chai';
import { Script } from 'vm';
import BigNumber from 'bignumber.js';
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
  it('toJSON', () => {
    const sbody = new ScriptEngine.StakingBody(
      ScriptEngine.StakingOpCode.Candidate,
      ScriptEngine.StakingOption.Empty,
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
    const abody = new ScriptEngine.AuctionBody(
      ScriptEngine.AuctionOpCode.Bid,
      ScriptEngine.StakingOption.Empty,
      ScriptEngine.EMPTY_BYTE32,
      holderAddr,
      amount,
      timestamp,
      nonce
    );
    console.log('Staking Body JSON:', ScriptEngine.jsonFromStakingBody(sbody));
    console.log('Auction Body JSON:', ScriptEngine.jsonFromAuctionBody(abody));
  });

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
    const decoded = ScriptEngine.decodeScriptData(scriptData);
    const body = ScriptEngine.decodeStakingBody(decoded.payload);
    expect(candidateAddr).equal('0x' + body.holderAddr.toString('hex'));
    expect(candidateAddr).equal('0x' + body.candidateAddr.toString('hex'));
  });

  it('uncandidate', () => {
    const scriptDataBuffer = ScriptEngine.getUncandidateData(candidateAddr, timestamp, nonce);
    const scriptData = '0x' + scriptDataBuffer.toString('hex');
    const decoded = ScriptEngine.decodeScriptData(scriptData);
    const body = ScriptEngine.decodeStakingBody(decoded.payload);
    expect(candidateAddr).equal('0x' + body.candidateAddr.toString('hex'));
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
    const decoded = ScriptEngine.decodeScriptData(scriptData);
    const body = ScriptEngine.decodeStakingBody(decoded.payload);
    expect(holderAddr).equal('0x' + body.holderAddr.toString('hex'));
    expect(candidateAddr).equal('0x' + body.candidateAddr.toString('hex'));
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
    const decoded = ScriptEngine.decodeScriptData(scriptData);
    const body = ScriptEngine.decodeStakingBody(decoded.payload);
    expect(holderAddr).equal('0x' + body.holderAddr.toString('hex'));
  });

  it('bound', () => {
    const scriptDataBuffer = ScriptEngine.getBoundData(
      ScriptEngine.StakingOption.OneWeekLock,
      holderAddr,
      candidateAddr,
      amount,
      timestamp,
      nonce
    );
    const scriptData = '0x' + scriptDataBuffer.toString('hex');
    const decoded = ScriptEngine.decodeScriptData(scriptData);
    const body = ScriptEngine.decodeStakingBody(decoded.payload);
    expect(holderAddr).equal('0x' + body.holderAddr.toString('hex'));
    expect(candidateAddr).equal('0x' + body.candidateAddr.toString('hex'));
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
    const decoded = ScriptEngine.decodeScriptData(scriptData);
    const body = ScriptEngine.decodeStakingBody(decoded.payload);
    expect(holderAddr).equal('0x' + body.holderAddr.toString('hex'));
  });

  it('bid', () => {
    const scriptDataBuffer = ScriptEngine.getBidData(holderAddr, amount, timestamp, nonce);
    const scriptData = '0x' + scriptDataBuffer.toString('hex');
    const decoded = ScriptEngine.decodeScriptData(scriptData);
    const body = ScriptEngine.decodeAuctionBody(decoded.payload);
    expect(holderAddr).equal('0x' + body.bidder.toString('hex'));
    expect(new BigNumber(amount).toFixed()).equal(new BigNumber(body.amount).toFixed());
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
    const decoded = ScriptEngine.decodeScriptData(scriptData);
    const body = ScriptEngine.decodeStakingBody(decoded.payload);
    expect(candidateAddr).equal('0x' + body.holderAddr.toString('hex'));
  });

  it('bailOut', () => {
    const scriptDataBuffer = ScriptEngine.getBailOutData(holderAddr, timestamp, nonce);
    const scriptData = '0x' + scriptDataBuffer.toString('hex');
    const decoded = ScriptEngine.decodeScriptData(scriptData);
    const body = ScriptEngine.decodeStakingBody(decoded.payload);
    expect(holderAddr).equal('0x' + body.holderAddr.toString('hex'));
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

  it('should decode staking extra data', () => {
    const extra =
      'f90156de9468ba0c4decd7ffdca9e78a0a649b97199ae2cf3d88bc0b65b36dd41a45de9434bd9720f4d83db2c8d7de87ec38b7832301ca67888bb63d0d10ebc837de9406423a48178615cf42f97b8e9b6f5351e351f652888bb638371a150dcfde94e558d8c1831a8e02e5a7a689881f98a238a7f91688bc074dec2cc71dbcde94105a26beb53c894d6de2b5929efbf4216b77c1a288bbf94f687bf5c9d0dd949e26622cf2e902e06a740fca6ea7f99f8d5f0b3b87a0934cf2b85c76de94d78534f06c64e07a1f3b6022c33f0787c4888e8f880643f12d5a726353df94be7acad0aa02ed06c7f3c27c6172b36e93d706628904c3bac89076616446de94a31964e0fc0acbbf1a883c4d62b48482c3dbf973880c8c64fad10370c4de942b1003d406d30888be8bc645e542dec79607bad5888bb639f8bd6575bedf94b18ce9f418efb94aab45d1d00938d04741a04f798902bd9c2d48ffaa7e47';
    const decodedExtra = ScriptEngine.decodeStakingGoverningExtra(extra);
    console.log(decodedExtra);
  });
});
