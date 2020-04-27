import * as rlp from 'rlp';

export namespace ScriptEngine {
  const DEFAULT_PORT = 8670;
  const SCRIPT_ENGINE_PREFIX = Buffer.from('ffffffffdeadbeef', 'hex');
  const SCRIPT_ENGINE_VERSION = 0;
  const STAKING_VERSION = 0;
  const AUCTION_VERSION = 0;
  const EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000';
  const EMPTY_BYTE32 = '0x0000000000000000000000000000000000000000000000000000000000000000';

  export enum ModuleID {
    Staking = 1000,
    Auction = 1001,
  }

  export enum Token {
    Meter = 0,
    MeterGov = 1,
  }

  export enum ScriptOpCode {
    // staking
    StakingBound = 1,
    StakingUnbound = 2,
    StakingCandidate = 3,
    StakingUncandidate = 4,
    StakingDelegate = 5,
    StakingUndelegate = 6,
    StakingCandidateUpdate = 7,

    // auction
    AuctionBid = 3, //
  }

  export enum ScriptOption {
    Empty = 0,
    OneWeekLock = 1,
    twoWeekLock = 2,
    threeWeekLock = 3,
    fourWeekLock = 4,
  }

  export class StakingBody {
    public OpCode: ScriptOpCode;
    public readonly Version: number;
    public Option: ScriptOption;
    public HolderAddr: string;
    public CandidateAddr: string;
    public CandidateName: string;
    public CandidatePubKey: string;
    public CandidateIP: string;
    public CandidatePort: number;
    public BucketID: string;
    public Amount: string;
    public Token: Token;
    public Timestamp: number;
    public Nonce: number;

    constructor(
      op: ScriptOpCode,
      option: ScriptOption,
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
      this.OpCode = op;
      this.Version = STAKING_VERSION;
      this.Option = option;
      if (candidateAddr === '') {
        // default value for candidateAddr
        candidateAddr = EMPTY_ADDRESS;
      }
      if (bucketID === '') {
        // default value for bucketID
        bucketID = EMPTY_BYTE32;
      }

      // remove 0x prefix
      if (holderAddr.startsWith('0x')) {
        holderAddr = holderAddr.replace('0x', '');
      }
      if (candidateAddr.startsWith('0x')) {
        candidateAddr = candidateAddr.replace('0x', '');
      }
      if (bucketID.toString().startsWith('0x')) {
        bucketID = bucketID.replace('0x', '');
      }
      this.HolderAddr = holderAddr;
      this.CandidateAddr = candidateAddr;
      this.CandidateName = candidateName;
      this.CandidatePubKey = candidatePubKey;
      this.CandidateIP = candidateIP;
      this.CandidatePort = candidatePort;
      this.BucketID = bucketID;
      this.Amount = amount.toString();
      this.Token = token;
      if (timestamp != 0) {
        this.Timestamp = timestamp;
      } else {
        this.Timestamp = Math.ceil(new Date().getTime() / 1000);
      }
      if (nonce != 0) {
        this.Nonce = nonce;
      } else {
        this.Nonce = getRandomInt64();
      }
    }

    public serialize(): string {
      const holderAddr = Buffer.from(this.HolderAddr, 'hex');
      const candAddr = Buffer.from(this.CandidateAddr, 'hex');
      const bktID = Buffer.from(this.BucketID, 'hex');

      let tokenVal = Buffer.from('', 'hex');
      if (this.Token === Token.MeterGov) {
        tokenVal = Buffer.from('01', 'hex');
      }
      const amountNum = parseInt(this.Amount, 10);
      const body = [
        this.OpCode,
        this.Version,
        this.Option,
        holderAddr,
        candAddr,
        this.CandidateName,
        this.CandidatePubKey,
        this.CandidateIP,
        this.CandidatePort,
        bktID,
        amountNum,
        tokenVal,
        this.Timestamp,
        this.Nonce,
      ];
      const payloadBytes = rlp.encode(body);
      console.log('opCode Hex: ', rlp.encode(this.OpCode).toString('hex'));
      console.log('version Hex: ', rlp.encode(this.Version).toString('hex'));
      console.log('option Hex: ', rlp.encode(this.Option).toString('hex'));
      console.log('holderAddr Hex: ', rlp.encode(holderAddr).toString('hex'));
      console.log('candAddr Hex: ', rlp.encode(candAddr).toString('hex'));

      console.log('Payload Hex: ', payloadBytes.toString('hex'));
      const header = [SCRIPT_ENGINE_VERSION, ModuleID.Staking];

      const script = [header, payloadBytes];
      let data = rlp.encode(script);
      data = Buffer.concat([SCRIPT_ENGINE_PREFIX, data]);
      console.log('DATA:', data);
      return `0x${data.toString('hex')}`;
    }
  }

  export function getBoundData(
    option: number,
    holderAddr: string,
    candidateAddr: string,
    candidateName: string,
    candidatePubKey: string,
    candidateIP: string,
    candidatePort: number,
    amount: number | string,
    timestamp = 0,
    nonce = 0
  ): string {
    const body = new StakingBody(
      ScriptOpCode.StakingBound,
      option,
      holderAddr,
      candidateAddr,
      candidateName,
      candidatePubKey,
      candidateIP,
      candidatePort,
      '',
      amount,
      Token.MeterGov,
      timestamp,
      nonce
    );
    return body.serialize();
  }

  export function getUnboundData(
    holderAddr: string,
    stakingIDStr: string,
    amount: number | string,
    timestamp = 0,
    nonce = 0
  ): string {
    const body = new StakingBody(
      ScriptOpCode.StakingUnbound,
      ScriptOption.Empty,
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
    return body.serialize();
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
  ): string {
    const body = new StakingBody(
      ScriptOpCode.StakingCandidate,
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
    return body.serialize();
  }

  export function getUncandidateData(candidateAddr: string, timestamp = 0, nonce = 0) {
    const body = new StakingBody(
      ScriptOpCode.StakingUncandidate,
      ScriptOption.Empty,
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
    return body.serialize();
  }

  export function getDelegateData(
    holderAddr: string,
    candidateAddr: string,
    candidateName: string,
    candidatePubKey: string,
    candidateIP: string,
    candidatePort: number,
    bucketID: string,
    amount: string | number,
    timestamp = 0,
    nonce = 0
  ): string {
    const body = new StakingBody(
      ScriptOpCode.StakingDelegate,
      ScriptOption.Empty,
      holderAddr,
      candidateAddr,
      candidateName,
      candidatePubKey,
      candidateIP,
      candidatePort,
      bucketID,
      amount.toString(),
      Token.MeterGov,
      timestamp,
      nonce
    );
    return body.serialize();
  }

  export function getUndelegateData(
    holderAddr: string,
    stakingIDStr: string,
    amount: number | string,
    timestamp = 0,
    nonce = 0
  ): string {
    const body = new StakingBody(
      ScriptOpCode.StakingUndelegate,
      ScriptOption.Empty,
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
    return body.serialize();
  }

  function getRandomInt(max: number): number {
    return Math.floor(Math.random() * Math.floor(max));
  }

  function getRandomInt64(): number {
    return getRandomInt(9007199254740992);
  }

  class AuctionBody {
    public OpCode: ScriptOpCode;
    public Version: number;
    public Option: ScriptOption;
    public StartHeight: number;
    public StartEpoch: number;
    public EndHeight: number;
    public EndEpoch: number;
    public AuctionID: string;
    public Bidder: string;
    public Amount: string;
    public Token: Token;
    public Timestamp: number;
    public Nonce: number;

    constructor(
      opCode: ScriptOpCode,
      option: number,
      auctionID: string,
      bidder: string,
      amount: string | number,
      timestamp = 0,
      nonce = 0
    ) {
      if (bidder.startsWith('0x')) {
        bidder = bidder.replace('0x', '');
      }
      if (auctionID.startsWith('0x')) {
        auctionID = auctionID.replace('0x', '');
      }
      if (auctionID === '') {
        auctionID = '0000000000000000000000000000000000000000000000000000000000000000';
      }

      this.OpCode = opCode;
      this.Version = AUCTION_VERSION;
      this.Option = option;
      this.Bidder = bidder;
      this.StartHeight = 0;
      this.StartEpoch = 0;
      this.EndHeight = 0;
      this.EndEpoch = 0;
      this.AuctionID = auctionID;
      this.Token = Token.Meter;
      this.Amount = amount.toString();
      if (timestamp != 0) {
        this.Timestamp = timestamp;
      } else {
        this.Timestamp = Math.ceil(new Date().getTime() / 1000);
      }
      if (nonce != 0) {
        this.Nonce = nonce;
      } else {
        this.Nonce = getRandomInt64();
      }
    }

    serialize(): string {
      const auctionIDBuffer = Buffer.from(this.AuctionID, 'hex');
      const bidderBuffer = Buffer.from(this.Bidder, 'hex');
      const body = [
        this.OpCode,
        this.Version, // version
        this.Option, // option
        this.StartHeight, // start height
        this.StartEpoch,
        this.EndHeight,
        this.EndEpoch,
        auctionIDBuffer,
        bidderBuffer,
        parseInt(this.Amount, 10),
        Token.Meter,
        this.Timestamp,
        this.Nonce,
      ];
      const payloadBytes = rlp.encode(body);
      console.log('Payload Hex: ', payloadBytes.toString('hex'));
      const header = [SCRIPT_ENGINE_VERSION, ModuleID.Auction];

      const script = [header, payloadBytes];
      let data = rlp.encode(script);
      data = Buffer.concat([SCRIPT_ENGINE_PREFIX, data]);
      console.log('Script Data Hex', data.toString('hex'));
      return `0x${data.toString('hex')}`;
    }
  }

  export function getBidData(
    bidder: string,
    amount: number | string,
    timestamp = 0,
    nonce = 0
  ): string {
    const body = new AuctionBody(
      ScriptOpCode.AuctionBid,
      ScriptOption.Empty,
      EMPTY_BYTE32,
      bidder,
      amount,
      timestamp,
      nonce
    );
    return body.serialize();
  }
}
