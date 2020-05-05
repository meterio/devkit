import * as rlp from 'rlp';
import { RLP } from './rlp';

export namespace ScriptEngine {
  export const SCRIPT_ENGINE_PREFIX = Buffer.from('ffffffffdeadbeef', 'hex');
  export const SCRIPT_ENGINE_VERSION = 0;
  export const STAKING_VERSION = 0;
  export const AUCTION_VERSION = 0;
  export const EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000';
  export const EMPTY_BYTE32 = '0x0000000000000000000000000000000000000000000000000000000000000000';

  export enum ModuleID {
    Staking = 1000,
    Auction = 1001,
  }

  export enum Token {
    Meter = 0,
    MeterGov = 1,
  }

  export enum OpCode {
    // staking
    StakingBound = 1,
    StakingUnbound = 2,
    StakingCandidate = 3,
    StakingUncandidate = 4,
    StakingDelegate = 5,
    StakingUndelegate = 6,
    StakingCandidateUpdate = 7,

    // auction
    AuctionStart = 1,
    AuctionEnd = 2,
    AuctionBid = 3, //
  }

  export enum Option {
    Empty = 0,
    OneWeekLock = 1,
    twoWeekLock = 2,
    threeWeekLock = 3,
    fourWeekLock = 4,
  }

  function getRandomInt(max: number): number {
    return Math.floor(Math.random() * Math.floor(max));
  }

  function getRandomInt64(): number {
    return getRandomInt(9007199254740992);
  }

  // ------------------------------------------
  //                STAKING
  // ------------------------------------------
  export class StakingBody {
    public static profile: RLP.Profile = {
      name: '',
      kind: [
        { name: 'opCode', kind: new RLP.NumericKind() },
        { name: 'version', kind: new RLP.NumericKind() },
        { name: 'option', kind: new RLP.NumericKind() },
        { name: 'holderAddr', kind: new RLP.BufferKind() },
        { name: 'candidateAddr', kind: new RLP.BufferKind() },
        { name: 'candidateName', kind: new RLP.BufferKind() },
        { name: 'candidatePubKey', kind: new RLP.BufferKind() },
        { name: 'candidateIP', kind: new RLP.BufferKind() },
        { name: 'candidatePort', kind: new RLP.NumericKind() },
        { name: 'bucketID', kind: new RLP.BufferKind() },
        { name: 'amount', kind: new RLP.NumericKind() },
        { name: 'token', kind: new RLP.NumericKind() },
        { name: 'timestamp', kind: new RLP.NumericKind() },
        { name: 'nonce', kind: new RLP.NumericKind() },
        { name: 'extra', kind: new RLP.BufferKind() },
      ],
    };
    public opCode: OpCode;
    public version: number;
    public option: Option;
    public holderAddr: Buffer;
    public candidateAddr: Buffer;
    public candidateName: Buffer;
    public candidatePubKey: Buffer;
    public candidateIP: Buffer;
    public candidatePort: number;
    public bucketID: Buffer;
    public amount: string;
    public token: Token;
    public timestamp: number;
    public nonce: number;
    public extra: Buffer;

    constructor(
      op: OpCode,
      option: Option,
      holderAddr: string,
      candidateAddr: string,
      candidateName: string,
      candidatePubKey: string,
      candidateIP: string,
      candidatePort: number,
      bucketID: string,
      amount: string | number,
      token: Token,
      timestamp = 0,
      nonce = 0
    ) {
      this.opCode = op;
      this.version = STAKING_VERSION;
      this.option = option;
      let holderAddrStr = holderAddr;
      let candidateAddrStr = candidateAddr;
      let bucketIDStr = bucketID;
      if (holderAddrStr === '' || holderAddrStr === '0x') {
        holderAddrStr = EMPTY_ADDRESS;
      }
      if (candidateAddrStr === '' || candidateAddrStr === '0x') {
        candidateAddrStr = EMPTY_ADDRESS;
      }
      if (bucketIDStr === '' || bucketIDStr === '0x') {
        bucketIDStr = EMPTY_BYTE32;
      }

      // remove 0x prefix
      if (holderAddrStr.startsWith('0x')) {
        holderAddrStr = holderAddrStr.replace('0x', '');
      }
      if (candidateAddrStr.startsWith('0x')) {
        candidateAddrStr = candidateAddrStr.replace('0x', '');
      }
      if (bucketIDStr.toString().startsWith('0x')) {
        bucketIDStr = bucketIDStr.replace('0x', '');
      }
      this.holderAddr = Buffer.from(holderAddrStr, 'hex');
      this.candidateAddr = Buffer.from(candidateAddrStr, 'hex');
      this.candidateName = Buffer.from(candidateName);
      this.candidatePubKey = Buffer.from(candidatePubKey);
      this.candidateIP = Buffer.from(candidateIP);
      this.candidatePort = candidatePort;
      this.bucketID = Buffer.from(bucketIDStr, 'hex');
      this.amount = amount.toString();
      this.token = token;
      if (timestamp != 0) {
        this.timestamp = timestamp;
      } else {
        this.timestamp = Math.ceil(new Date().getTime() / 1000);
      }
      if (nonce != 0) {
        this.nonce = nonce;
      } else {
        this.nonce = getRandomInt64();
      }
      this.extra = Buffer.from('', 'hex');
    }

    public encode(): Buffer {
      let tokenVal = Buffer.from('', 'hex');
      if (this.token === Token.MeterGov) {
        tokenVal = Buffer.from('01', 'hex');
      }
      const amountNum = parseInt(this.amount, 10);
      const body = [
        this.opCode,
        this.version,
        this.option,
        this.holderAddr,
        this.candidateAddr,
        this.candidateName,
        this.candidatePubKey,
        this.candidateIP,
        this.candidatePort,
        this.bucketID,
        amountNum,
        tokenVal,
        this.timestamp,
        this.nonce,
      ];
      const payloadBytes = rlp.encode(body);
      const header = [SCRIPT_ENGINE_VERSION, ModuleID.Staking];
      const script = [header, payloadBytes];
      const data = rlp.encode(script);
      return Buffer.concat([SCRIPT_ENGINE_PREFIX, data]);
    }

    public decode(data: Buffer): void {
      const body = new RLP(StakingBody.profile).decode(data);
      Object.assign(this, body);
    }
  }

  export function getBoundData(
    option: number,
    holderAddr: string,
    candidateAddr: string,
    amount: number | string,
    timestamp = 0,
    nonce = 0
  ): Buffer {
    const body = new StakingBody(
      OpCode.StakingBound,
      option,
      holderAddr,
      candidateAddr,
      '',
      '',
      '',
      0,
      '',
      amount,
      Token.MeterGov,
      timestamp,
      nonce
    );
    return body.encode();
  }

  export function getUnboundData(
    holderAddr: string,
    stakingIDStr: string,
    amount: number | string,
    timestamp = 0,
    nonce = 0
  ): Buffer {
    const body = new StakingBody(
      OpCode.StakingUnbound,
      Option.Empty,
      holderAddr,
      '',
      '',
      '',
      '',
      0,
      stakingIDStr,
      amount,
      Token.MeterGov,
      timestamp,
      nonce
    );
    return body.encode();
  }

  export function getCandidateData(
    option: number,
    holderAddr: string,
    candidateName: string,
    candidatePubKey: string,
    candidateIP: string,
    candidatePort: number,
    amount: number | string,
    timestamp = 0,
    nonce = 0
  ): Buffer {
    const body = new StakingBody(
      OpCode.StakingCandidate,
      option,
      holderAddr,
      holderAddr,
      candidateName,
      candidatePubKey,
      candidateIP,
      candidatePort,
      '',
      amount.toString(),
      Token.MeterGov,
      timestamp,
      nonce
    );
    return body.encode();
  }

  export function getUncandidateData(candidateAddr: string, timestamp = 0, nonce = 0): Buffer {
    const body = new StakingBody(
      OpCode.StakingUncandidate,
      Option.Empty,
      EMPTY_ADDRESS,
      candidateAddr,
      '',
      '',
      '',
      0,
      '',
      0,
      Token.MeterGov,
      timestamp,
      nonce
    );
    return body.encode();
  }

  export function getDelegateData(
    holderAddr: string,
    candidateAddr: string,
    bucketID: string,
    amount: string | number,
    timestamp = 0,
    nonce = 0
  ): Buffer {
    const body = new StakingBody(
      OpCode.StakingDelegate,
      Option.Empty,
      holderAddr,
      candidateAddr,
      '',
      '',
      '',
      0,
      bucketID,
      amount.toString(),
      Token.MeterGov,
      timestamp,
      nonce
    );
    return body.encode();
  }

  export function getUndelegateData(
    holderAddr: string,
    stakingIDStr: string,
    amount: number | string,
    timestamp = 0,
    nonce = 0
  ): Buffer {
    const body = new StakingBody(
      OpCode.StakingUndelegate,
      Option.Empty,
      holderAddr,
      '',
      '',
      '',
      '',
      0,
      stakingIDStr,
      amount.toString(),
      Token.MeterGov,
      timestamp,
      nonce
    );
    return body.encode();
  }

  export function parseStakingData(data: string) {
    if (data.startsWith('0x')) {
      data = data.replace('0x', '');
    }
    data = data.replace('ffffffffdeadbeef', '');
    console.log('data:', data);
    const out = rlp.decode(Buffer.from(data, 'hex'));
    const iter = out.entries();
    // const headerBuffer = iter.next();
    iter.next();
    const bodyBuffer = iter.next();
    console.log(bodyBuffer.value[1]);
    const items = rlp.decode(bodyBuffer.value[1]);
    const bodyIter = items.entries();
    let i = 0;
    let item: IteratorResult<[number, number], any>;
    do {
      item = bodyIter.next();
      console.log(i + 1, ':', item);
      i += 1;
    } while (item.done != true);
  }

  // ------------------------------------------
  //                AUCTION
  // ------------------------------------------
  export class AuctionBody {
    public static profile: RLP.Profile = {
      name: '',
      kind: [
        { name: 'opCode', kind: new RLP.NumericKind() },
        { name: 'version', kind: new RLP.NumericKind() },
        { name: 'option', kind: new RLP.NumericKind() },
        { name: 'startHeight', kind: new RLP.NumericKind() },
        { name: 'startEpoch', kind: new RLP.NumericKind() },
        { name: 'endHeight', kind: new RLP.NumericKind() },
        { name: 'endEpoch', kind: new RLP.NumericKind() },
        { name: 'auctionID', kind: new RLP.BufferKind() },
        { name: 'bidder', kind: new RLP.BufferKind() },
        { name: 'amount', kind: new RLP.NumericKind() },
        { name: 'token', kind: new RLP.NumericKind() },
        { name: 'timestamp', kind: new RLP.NumericKind() },
        { name: 'nonce', kind: new RLP.NumericKind() },
      ],
    };

    public opCode: OpCode;
    public version: number;
    public option: Option;
    public startHeight: number;
    public startEpoch: number;
    public endHeight: number;
    public endEpoch: number;
    public auctionID: Buffer;
    public bidder: Buffer;
    public amount: string;
    public token: Token;
    public timestamp: number;
    public nonce: number;

    constructor(
      opCode: OpCode,
      option: number,
      auctionID: string,
      bidder: string,
      amount: string | number,
      timestamp = 0,
      nonce = 0
    ) {
      let bidderStr = bidder;
      let auctionIDStr = auctionID;

      if (bidderStr === '' || bidderStr === '0x') {
        bidderStr = EMPTY_ADDRESS;
      }
      if (auctionIDStr === '' || auctionIDStr === '0x') {
        auctionIDStr = EMPTY_BYTE32;
      }

      if (bidderStr.startsWith('0x')) {
        bidderStr = bidderStr.replace('0x', '');
      }
      if (auctionIDStr.startsWith('0x')) {
        auctionIDStr = auctionIDStr.replace('0x', '');
      }

      this.opCode = opCode;
      this.version = AUCTION_VERSION;
      this.option = option;
      this.startHeight = 0;
      this.startEpoch = 0;
      this.endHeight = 0;
      this.endEpoch = 0;
      this.auctionID = Buffer.from(auctionIDStr, 'hex');
      this.bidder = Buffer.from(bidderStr, 'hex');
      this.amount = amount.toString();
      this.token = Token.Meter;
      if (timestamp != 0) {
        this.timestamp = timestamp;
      } else {
        this.timestamp = Math.ceil(new Date().getTime() / 1000);
      }
      if (nonce != 0) {
        this.nonce = nonce;
      } else {
        this.nonce = getRandomInt64();
      }
    }

    encode(): Buffer {
      const body = [
        this.opCode,
        this.version, // version
        this.option, // option
        this.startHeight, // start height
        this.startEpoch,
        this.endHeight,
        this.endEpoch,
        this.auctionID,
        this.bidder,
        parseInt(this.amount, 10),
        Token.Meter,
        this.timestamp,
        this.nonce,
      ];
      const payloadBytes = rlp.encode(body);
      // console.log('Payload Hex: ', payloadBytes.toString('hex'));
      const header = [SCRIPT_ENGINE_VERSION, ModuleID.Auction];

      const script = [header, payloadBytes];
      const data = rlp.encode(script);
      return Buffer.concat([SCRIPT_ENGINE_PREFIX, data]);
    }

    public decode(data: Buffer): void {
      const body = new RLP(AuctionBody.profile).decode(data);
      Object.assign(this, body);
    }
  }

  export function getBidData(
    bidder: string,
    amount: number | string,
    timestamp = 0,
    nonce = 0
  ): Buffer {
    const body = new AuctionBody(
      OpCode.AuctionBid,
      Option.Empty,
      EMPTY_BYTE32,
      bidder,
      amount,
      timestamp,
      nonce
    );
    return body.encode();
  }
}
