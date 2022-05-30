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
    const data = ScriptEngine.getCandidateData(
      '0xac4acda6d9e4471da5b1f3815c7e6952cd34cb1b', // address
      'shoal-11', // name
      'shoal-11 desc', // desc
      'BL5Mlj7G3sprNERzdrVJnsf73W1vBlWXFam7ZL7fCJWFJHdRN+SAApRuMG9HDVGOV/9WNugsd2vQWlR1jYf8R3o=:::ZkhnePEX4ghmJFC0bRjJ38xDpznR1szI834AGXBoHpfpR4QhanLlgVztQ+Edig9ZuiN94EvIghZzdNW8NP01MgE=', // pubkey
      '44.236.203.192', // ip
      8670, // port
      '0x6c6b935b8bbd400000', // amount
      1000, // commission
      1617007471, // timestamp
      8612573464126398, // nonce
      0 // autobid
    );
    const decoded = ScriptEngine.decodeScriptData(data);
    const body = ScriptEngine.decodeStakingBody(decoded.payload);
    console.log(body);
    const target =
      '0xffffffffdeadbeeff90155c4808203e8b9014df9014a03808405f5e10094ac4acda6d9e4471da5b1f3815c7e6952cd34cb1b94ac4acda6d9e4471da5b1f3815c7e6952cd34cb1b8873686f616c2d31318d73686f616c2d31312064657363b8b3424c354d6c6a3747337370724e45527a6472564a6e73663733573176426c575846616d375a4c3766434a57464a4864524e2b5341417052754d4739484456474f562f39574e75677364327651576c52316a59663852336f3d3a3a3a5a6b686e655045583467686d4a46433062526a4a33387844707a6e5231737a49383334414758426f4870667052345168616e4c6c67567a74512b45646967395a75694e393445764967685a7a644e57384e5030314d67453d8e34342e3233362e3230332e3139328221dea00000000000000000000000000000000000000000000000000000000000000000896c6b935b8bbd4000000180846061936f871e991705ee63be80';
    expect(data).equal(target);
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
    const scriptData = ScriptEngine.getBailOutData(
      '0xac4acda6d9e4471da5b1f3815c7e6952cd34cb1b',
      1653928116,
      6158451306430886
    );
    const decoded = ScriptEngine.decodeScriptData(scriptData);
    const body = ScriptEngine.decodeStakingBody(decoded.payload);
    const target =
      '0xffffffffdeadbeeff86dc4808203e8b866f86466808094ac4acda6d9e4471da5b1f3815c7e6952cd34cb1b94ac4acda6d9e4471da5b1f3815c7e6952cd34cb1b8080808080a00000000000000000000000000000000000000000000000000000000000000000800180846294f0b48715e1142e7c81a680';
    expect(scriptData).equal(target);
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
    const body = ScriptEngine.decodeStakingBody(buf);
    console.log(
      'BUCKET ID: ',
      ScriptEngine.getBucketID(body.holderAddr, body.nonce, body.timestamp)
    );
  });

  it('should decode delegate statistics', () => {
    const data =
      'deadbeeff90187c4808203e8b9017ff9017c658082368894000000000000000000000000000000000000000094ab950438cf0dc5c2f98039731b9630358cc0deb9886a65746c6966653280b8b3424f5565327974614670307979696573716b57714974704f303644366e512f5659495448437135494b62537052746b457a4568574b4373783156726861594978354c3635536c68443961556b36345030702b47724466343d3a3a3a4b42735034506671372f6e7a516d6f6b387546784942444949694a31396f463858525565712f376f644a4f7758567a5a74584b663865717a6742697750426d32683656785a554f6a744541797a6e6a59414632666751453d8080a00000000000000000000000000000000000000000000000000000000000000000808080846231b9b388f2cac874983a5566b858f856c280c0f84b08f848c882368884014f37f6c882368884014f388cc882368884014f3922c882368884014f39b7c882368884014f3a4dc882368884014f3ae3c882368884014f3b79c882368884014f3c0fc280c0c280c0';
    const decoded = ScriptEngine.decodeScriptData(data);

    console.log('Body: ', decoded.body);
  });

  it('should decode infraction', () => {
    const data =
      'f856c280c0f84b08f848c882368884014f37f6c882368884014f388cc882368884014f3922c882368884014f39b7c882368884014f3a4dc882368884014f3ae3c882368884014f3b79c882368884014f3c0fc280c0c280c0';
    const infraction = ScriptEngine.decodeStakingStatExtra(data);
    console.log(infraction);
  });

  // it('should decode account lock', () => {
  //   const data =
  //     '0xffffffffdeadbeeff839c4808203eab3f26405808080940000000000000000000000000000000000000000940000000000000000000000000000000000000000808080';
  //   const decoded = ScriptEngine.decodeScriptData(data);
  //   ScriptEngine.encodeScriptData(ScriptEngine.ModuleID.AccountLock, decoded);
  //   console.log('decoded: ', decoded);
  // });
});
