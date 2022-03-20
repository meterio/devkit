import { expect } from 'chai';
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
    const scriptData = ScriptEngine.getCandidateData(
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
    const decoded = ScriptEngine.decodeScriptData(scriptData);
    const body = ScriptEngine.decodeStakingBody(decoded.payload);
    expect(candidateAddr).equal(body.holderAddr);
    expect(candidateAddr).equal(body.candidateAddr);
  });

  it('uncandidate', () => {
    const scriptData = ScriptEngine.getUncandidateData(candidateAddr, timestamp, nonce);
    const decoded = ScriptEngine.decodeScriptData(scriptData);
    const body = ScriptEngine.decodeStakingBody(decoded.payload);
    expect(candidateAddr).equal(body.candidateAddr);
  });

  it('delegate', () => {
    const scriptData = ScriptEngine.getDelegateData(
      holderAddr,
      candidateAddr,
      bucketID,
      amount,
      timestamp,
      nonce
    );
    const decoded = ScriptEngine.decodeScriptData(scriptData);
    const body = ScriptEngine.decodeStakingBody(decoded.payload);
    expect(holderAddr).equal(body.holderAddr);
    expect(candidateAddr).equal(body.candidateAddr);
  });

  it('undelegate', () => {
    const scriptData = ScriptEngine.getUndelegateData(
      holderAddr,
      bucketID,
      amount,
      timestamp,
      nonce
    );
    const decoded = ScriptEngine.decodeScriptData(scriptData);
    const body = ScriptEngine.decodeStakingBody(decoded.payload);
    expect(holderAddr).equal(body.holderAddr);
  });

  it('bound', () => {
    const scriptData = ScriptEngine.getBoundData(
      ScriptEngine.StakingOption.OneWeekLock,
      holderAddr,
      candidateAddr,
      amount,
      timestamp,
      nonce
    );
    const decoded = ScriptEngine.decodeScriptData(scriptData);
    const body = ScriptEngine.decodeStakingBody(decoded.payload);
    expect(holderAddr).equal(body.holderAddr);
    expect(candidateAddr).equal(body.candidateAddr);
  });

  it('unbound', () => {
    const scriptData = ScriptEngine.getUnboundData(holderAddr, bucketID, amount, timestamp, nonce);
    const decoded = ScriptEngine.decodeScriptData(scriptData);
    const body = ScriptEngine.decodeStakingBody(decoded.payload);
    expect(holderAddr).equal(body.holderAddr);
  });

  it('bid', () => {
    const scriptData = ScriptEngine.getBidData(holderAddr, amount, timestamp, nonce);
    const decoded = ScriptEngine.decodeScriptData(scriptData);
    const body = ScriptEngine.decodeAuctionBody(decoded.payload);
    expect(holderAddr).equal(body.bidder);
    expect(new BigNumber(amount).toFixed()).equal(new BigNumber(body.amount).toFixed());
  });

  it('candidateUpdate', () => {
    const scriptData = ScriptEngine.getCandidateUpdateData(
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
    const decoded = ScriptEngine.decodeScriptData(scriptData);
    const body = ScriptEngine.decodeStakingBody(decoded.payload);
    expect(candidateAddr).equal(body.holderAddr);
  });

  it('bailOut', () => {
    const scriptData = ScriptEngine.getBailOutData(holderAddr, timestamp, nonce);
    const decoded = ScriptEngine.decodeScriptData(scriptData);
    const body = ScriptEngine.decodeStakingBody(decoded.payload);
    expect(holderAddr).equal(body.holderAddr);
  });

  it('lockedTransfer', () => {
    const scriptData = ScriptEngine.getLockedTransferData(
      lockEpoch,
      releaseEpoch,
      holderAddr,
      candidateAddr,
      mtrAmount,
      mtrgAmount,
      'memo'
    );
    expect(scriptData).equal(
      '0xffffffffdeadbeeff84cc4808203eab845f8430380806481c8940205c2d862ca051010698b69b54278cbaf945c0b948a88c59bf15451f9deb1d62f7734fece2002668e8901158e460913d00000830186a0846d656d6f'
    );
  });

  it('should decode staking extra data', () => {
    const extra = Buffer.from(
      'f90156de9468ba0c4decd7ffdca9e78a0a649b97199ae2cf3d88bc0b65b36dd41a45de9434bd9720f4d83db2c8d7de87ec38b7832301ca67888bb63d0d10ebc837de9406423a48178615cf42f97b8e9b6f5351e351f652888bb638371a150dcfde94e558d8c1831a8e02e5a7a689881f98a238a7f91688bc074dec2cc71dbcde94105a26beb53c894d6de2b5929efbf4216b77c1a288bbf94f687bf5c9d0dd949e26622cf2e902e06a740fca6ea7f99f8d5f0b3b87a0934cf2b85c76de94d78534f06c64e07a1f3b6022c33f0787c4888e8f880643f12d5a726353df94be7acad0aa02ed06c7f3c27c6172b36e93d706628904c3bac89076616446de94a31964e0fc0acbbf1a883c4d62b48482c3dbf973880c8c64fad10370c4de942b1003d406d30888be8bc645e542dec79607bad5888bb639f8bd6575bedf94b18ce9f418efb94aab45d1d00938d04741a04f798902bd9c2d48ffaa7e47',
      'hex'
    );
    const decodedExtra = ScriptEngine.decodeStakingGoverningExtra(extra);
    console.log(decodedExtra);
  });

  it('should decode script data', () => {
    const data =
      '0xffffffffdeadbeeff860c4808203e9b859f8570380018080808080a000000000000000000000000000000000000000000000000000000000000000009436c0bf41fbb28444a1f2f89d9da2b684ccea34508888d29c465a6eebff80808460423a6988dd2728cd0c498657';
    const decode = ScriptEngine.decodeScriptData(data);
    console.log(decode);
  });

  it('should generate auctionTx id', () => {
    const address = '0x5e8126458b3f13d488d482adc00a8c4b9df5d3b6';
    const amount = '16318600351042023020';
    const type = 1;
    const timestamp = 1615015651;
    const nonce = '1952715685383062548';

    const auctionTx = new ScriptEngine.AuctionTx(address, amount, type, timestamp, nonce);
    const id = auctionTx.ID();
    expect(id).equal('0x00396ef508fad3ac9ab8cc90536da1fbdf82ad4a9c2a51d1e4c9baf5932d424d');
  });

  it('should generate auctionTx id', () => {
    const address = '0xf943a5fc2f2db7c1ca5218f7ba24472463d42239';
    const amount = '14902984027677164012';
    const type = 1;
    const timestamp = 1615015651;
    const nonce = '9913717879540574890';

    const auctionTx = new ScriptEngine.AuctionTx(address, amount, type, timestamp, nonce);
    const id = auctionTx.ID();
    expect(id).equal('0x0072bd9859d9babc41ddb0e223fd9a6ef2feed120301c4869a11a78bc2216abb');
  });

  it('should generate auction cb id', () => {
    const startHeight = 254729;
    const startEpoch = 145;
    const endHeight = 282574;
    const endEpoch = 168;
    const rlsdMTRG = '5483957256648424329397';
    const rsvdMTRG = '0';
    const rsvdPrice = '500000000000000000';
    const createTime = 1614924384;
    const auctionCB = new ScriptEngine.AuctionControlBlock(
      startHeight,
      startEpoch,
      endHeight,
      endEpoch,
      rlsdMTRG,
      rsvdMTRG,
      rsvdPrice,
      createTime
    );
    const id = auctionCB.ID();
    console.log('AuctionCB ID: ', id);
    expect(id).equal('0xd42eb79bae42f1d76d18d8138224b93bd366e345bbb73c3a317878e805dadfef');
  });

  it('should generate bucket id', () => {
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
    const buf = sbody.encode();
    const body = ScriptEngine.decodeStakingBody(buf) as ScriptEngine.StakingBody;
    console.log(
      'BUCKET ID: ',
      ScriptEngine.getBucketID(body.holderAddr, body.nonce, body.timestamp)
    );
  });

  it('should decode ', () => {
    const data =
      '0xdeadbeeff903d7c4808203e8b903cff903cc822711823680809400000000000000000000000000000000000000009400000000000000000000000000000000000000008080808080a00000000000000000000000000000000000000000000000000000000000000000883c0e4a3aebc937908080846231453b88d120415cac18562cb90359f90356de94a930066c355bd4de0cbe0715c1d47419ef8ba16888017f21601f450174de94927495f329ab083e6cff350d6e9d8652d76f90f788148329e8544595a1de94b93fef49ec53dc8e1a8b1fae6571cb82e91250578801e723659496f8eade9448f450d5f51b5340f8d7ebd9a8417625ea5df531880411e71f0426b589de9447e6a9a2f46db41b5a49149e71ff4a1ab500dad58801f9a64db9e91120dd94f2c1edc8a90a8c989773306a7e04cab0ab24b47d8785ce1ded986b19dd94a503d0931da0e831970d2592658c69f7ee94767f87048f5b74d69711de94be790a97479831b5dfc7132e52f9810990417e37880466ab849028efcfdd9494b1e28661d7cbbb834103f386f200efe81aa907870757e49e420663dd9477caa77ddedf1d5cabca2c60ea60b46afa6f32c387048f5b74d69711dd94c95320a56b4a2f2674b3fa77caf2780ee2f1d21f87193c2c05974ec6de94ad2b2f10edeac77525323a914e584aa4bb56be9588038256506fdb468ede943a87eae486c641820b13a476e67005a455ae7c3488048cd0c1c7b32b5ede94f3c69175cb24ff525024e55587f20268b0523fb58801818874fd739a8ddd94fa289a0f68f21b363574a8b4543e4b6237118a2a87263b5338e60445dd94b9acf5bbbbcb0804f5cc5a4e41e34e4532a0d460870487d49bc0bdbbde94870d06641d73f39196b1efb3bc4abcc4a6650797880147296c15539a71de94b2b9e6de39058896190798fa0354b7cee6c23a0e8801e7236ec95d4b91dd942c2b5dfbf282c2550a7eb872a980df31a9227b57870774db56803ee8de947db6ac6fa3c8aa2c6fb9bdcd4800e8baacdd2ee8880497c830de1f7dc2dd94cb0326a4abc6911bbb4e665e1e37ef44f4ab9b4c870757df6dd87e22dd94d6a6d3ea931a6d0788b8a4d637c64a7ae03d2bea870757ac0e908605de94f6959e47b94c82b93867fc876b4c99f37e49689788017b5f09c9db5d1fdd94be7acad0aa02ed06c7f3c27c6172b36e93d706628707d43093193d59dd94ebb86150862250654e8ff50401e30503d9ae272e87084307b63c81cedd94243182372d45e5b6986fa4f6586e0eb17da651c587173d2902356889de94d7c2edb33b8509e1e7cbab03e43e38835cf269ee8805c16a34b7310f07dd94c3d8ec89f38d81f3df56d3e6be30081af0410a04870757f4b455f993';
    const decoded = ScriptEngine.decodeScriptData(data);
    console.log('Body: ', decoded.body);
  });
});
