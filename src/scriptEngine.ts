import { RLP } from './rlp';
import BigNumber from 'bignumber.js';
const blake = require('blakejs');

export namespace ScriptEngine {
  export const SCRIPT_ENGINE_PREFIX = 'ffffffff';
  export const SCRIPT_ENGINE_VERSION = 0;
  export const SCRIPT_DATA_PREFIX = 'deadbeef';
  export const STAKING_VERSION = 0;
  export const AUCTION_VERSION = 0;
  export const EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000';
  export const EMPTY_BYTE32 = '0x0000000000000000000000000000000000000000000000000000000000000000';

  export enum ModuleID {
    Staking = 1000,
    Auction = 1001,
    AccountLock = 1002,
  }

  export enum Token {
    Meter = 0,
    MeterGov = 1,
  }

  export enum StakingOpCode {
    Bound = 1,
    Unbound = 2,
    Candidate = 3,
    Uncandidate = 4,
    Delegate = 5,
    Undelegate = 6,
    CandidateUpdate = 7,
    BucketUpdate = 8,
    DelegateStats = 101,
    BailOut = 102,
    FlushAllStats = 103,
    Governing = 10001,
  }

  export const explainStakingOpCode = (opCode: StakingOpCode) => {
    switch (opCode) {
      case StakingOpCode.Bound:
        return 'Bound';
      case StakingOpCode.Unbound:
        return 'Unbound';
      case StakingOpCode.Candidate:
        return 'Candidate';
      case StakingOpCode.Uncandidate:
        return 'Uncandidate';
      case StakingOpCode.Delegate:
        return 'Delegate';
      case StakingOpCode.Undelegate:
        return 'Undelegate';
      case StakingOpCode.CandidateUpdate:
        return 'UpdateCandidate';
      case StakingOpCode.BucketUpdate:
        return 'UpdateBucket';
      case StakingOpCode.DelegateStats:
        return 'DelegateStats';
      case StakingOpCode.BailOut:
        return 'BailOut';
      case StakingOpCode.FlushAllStats:
        return 'FlushStats';
      case StakingOpCode.Governing:
        return 'Govern';
    }
  };

  export enum StakingOption {
    Empty = 0,
    // staking bound
    OneWeekLock = 1,
    TwoWeekLock = 2,
    ThreeWeekLock = 3,
    FourWeekLock = 4,
  }

  export enum BucketUpdateOption {
    Add = 0,
    Sub = 1,
  }

  export enum AuctionOpCode {
    Start = 1,
    End = 2,
    Bid = 3, //
  }

  export enum AuctionOption {
    Userbid = 0,
    Autobid = 1,
  }

  export const explainAuctionOpCode = (opCode: AuctionOpCode, option: AuctionOption) => {
    switch (opCode) {
      case AuctionOpCode.Start:
        return 'StartAuction';
      case AuctionOpCode.End:
        return 'EndAuction';
      case AuctionOpCode.Bid:
        if (option === AuctionOption.Userbid) {
          return 'Userbid';
        } else if (option === AuctionOption.Autobid) {
          return 'Autobid';
        } else {
          return 'Bid';
        }
    }
  };

  export enum AccountLockOpCode {
    // account lock
    Add = 1, // only allowed in kblock
    Remove = 2, // only allowed in kblock
    Transfer = 3,
    Governing = 100, // only allowed in kblock
  }

  export const explainAccountLockOpCode = (opCode: AccountLockOpCode) => {
    switch (opCode) {
      case AccountLockOpCode.Add:
        return 'AddAcctLock';
      case AccountLockOpCode.Remove:
        return 'RemoveAcctLock';
      case AccountLockOpCode.Transfer:
        return 'TransferAcctLock';
      case AccountLockOpCode.Governing:
        return 'GovernAcctLock';
    }
  };

  function getRandomInt(max: number): number {
    return Math.floor(Math.random() * Math.floor(max));
  }

  function getRandomInt64(): number {
    return getRandomInt(9007199254740992);
  }

  class DecodeError extends Error {
    constructor(message?: string) {
      super(message); // 'Error' breaks prototype chain here
      Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
    }
  }

  class EncodeError extends Error {
    constructor(message?: string) {
      super(message); // 'Error' breaks prototype chain here
      Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
    }
  }

  export function IsScriptEngineData(hexStr: string): boolean {
    let str = hexStr;
    if (hexStr.startsWith('0x')) {
      str = hexStr.replace('0x', '');
    }
    const enginePrefix = SCRIPT_ENGINE_PREFIX;
    const dataPrefix = SCRIPT_DATA_PREFIX;

    return str.startsWith(enginePrefix + dataPrefix);
  }

  // ScriptData encode/decode
  export function encodeScriptData(moduleID: ModuleID, body: StakingBody | AuctionBody): string {
    switch (moduleID) {
      case ModuleID.Staking:
        if (!(body instanceof StakingBody)) {
          throw new EncodeError('module is set to staking, but no staking body is provided');
        }
        return new ScriptData(moduleID, body.encode()).encode();
      case ModuleID.Auction:
        if (!(body instanceof AuctionBody)) {
          throw new EncodeError('module is set to auction, but no auction body is provided');
        }
        return new ScriptData(moduleID, body.encode()).encode();
      default:
        throw new EncodeError(`unrecognized moduleID: ${moduleID}`);
    }
  }

  export function decodeScriptData(input: Buffer | string): DecodedScriptData {
    let buf: Buffer;
    if (typeof input === 'string') {
      buf = Buffer.from(input.replace('0x', ''), 'hex');
    } else {
      buf = input;
    }
    let hexStr = buf.toString('hex');
    const sePrefixStr = SCRIPT_ENGINE_PREFIX;
    const sdPrefixStr = SCRIPT_DATA_PREFIX;
    if (hexStr.startsWith(sePrefixStr)) {
      hexStr = hexStr.substring(sePrefixStr.length);
    }

    if (!hexStr.startsWith(sdPrefixStr)) {
      throw new DecodeError('could not decode script data: 0x' + buf.toString('hex'));
    }
    const truncated = Buffer.from(hexStr.substring(sdPrefixStr.length), 'hex');
    const sd = new RLP(ScriptDataProfile).decode(truncated);
    let action = '';
    switch (sd.header.modId) {
      case ModuleID.AccountLock:
        const alb = decodeAccountLockBody(sd.payload);
        action = explainAccountLockOpCode(alb.opCode);
        return new DecodedScriptData(sd, action, alb);
      case ModuleID.Auction:
        const ab = decodeAuctionBody(sd.payload);
        action = explainAuctionOpCode(ab.opCode, ab.option);
        return new DecodedScriptData(sd, action, ab);
      case ModuleID.Staking:
        const sb = decodeStakingBody(sd.payload);
        action = explainStakingOpCode(sb.opCode);
        return new DecodedScriptData(sd, action, sb);
    }
    return new DecodedScriptData(sd, '');
  } // end of Script Data encode/decode

  // Staking Body decode
  export function decodeStakingBody(input: Buffer | string): DecodedStakingBody {
    let buf: Buffer;
    if (typeof input === 'string') {
      buf = Buffer.from(input.replace('0x', ''), 'hex');
    } else {
      buf = input;
    }
    const sb = new RLP(StakingBodyProfile).decode(buf) as StakingBody;
    let extra: undefined | RewardInfo[] | Infraction = undefined;
    if (sb.opCode === StakingOpCode.Governing) {
      extra = decodeStakingGoverningExtra(sb.extra);
    }
    if (sb.opCode === StakingOpCode.DelegateStats) {
      extra = decodeStakingStatExtra(sb.extra);
    }
    return new DecodedStakingBody(sb, extra);
  }

  // Auction Body decode
  export function decodeAuctionBody(input: Buffer | string): AuctionBody {
    let buf: Buffer;
    if (typeof input === 'string') {
      buf = Buffer.from(input.replace('0x', ''), 'hex');
    } else {
      buf = input;
    }
    return new RLP(AuctionBodyProfile).decode(buf) as AuctionBody;
  }

  // Account Lock Body decode
  export function decodeAccountLockBody(input: Buffer | string): AccountLockBody {
    let buf: Buffer;
    if (typeof input === 'string') {
      buf = Buffer.from(input.replace('0x', ''), 'hex');
    } else {
      buf = input;
    }
    return new RLP(AccountLockBodyProfile).decode(buf) as AccountLockBody;
  }

  // Staking Governing Extra decode
  export function decodeStakingGoverningExtra(input: Buffer | string): RewardInfo[] {
    let buf: Buffer;
    if (typeof input === 'string') {
      buf = Buffer.from(input.replace('0x', ''), 'hex');
    } else {
      buf = input;
    }
    return new RLP(StakingGoverningExtraProfile).decode(buf) as RewardInfo[];
  }

  // Staking Statistics Extra decode
  export function decodeStakingStatExtra(input: Buffer | string): Infraction {
    let buf: Buffer;
    if (typeof input === 'string') {
      buf = Buffer.from(input.replace('0x', ''), 'hex');
    } else {
      buf = input;
    }
    return new RLP(InfractionProfile).decode(buf) as Infraction;
  }

  // Auction Tx decode
  export function getAuctionTxFromAuctionBody(body: AuctionBody): AuctionTx | undefined {
    if (body.opCode === AuctionOpCode.Bid) {
      return new AuctionTx(body.bidder, body.amount, body.option, body.timestamp, body.nonce);
    }
    return undefined;
  }

  // ------------------------------------------------
  //                 SCRIPT DATA
  // ------------------------------------------------
  export const ScriptDataProfile: RLP.Profile = {
    name: 'scriptDataProfile',
    kind: [
      {
        name: 'header',
        kind: [
          { name: 'version', kind: new RLP.NumericKind() },
          { name: 'modId', kind: new RLP.NumericKind() },
        ],
      },
      { name: 'payload', kind: new RLP.HexKind() },
    ],
  };
  export class ScriptDataHeader {
    public version: number;
    public modId: number;
    constructor(version: number, modId: number) {
      this.version = version;
      this.modId = modId;
    }
  }
  export class DecodedScriptData {
    public header: { version: number; modId: number };
    public payload: string;
    public action: string;
    public body: AuctionBody | DecodedStakingBody | AccountLockBody | undefined;
    constructor(
      data: ScriptData,
      action: string,
      body: AuctionBody | DecodedStakingBody | AccountLockBody | undefined = undefined
    ) {
      this.header = { ...data.header };
      this.payload = data.payload;
      this.action = action;
      this.body = body;
    }
  }
  export class ScriptData {
    public header: ScriptDataHeader;
    public payload: string;

    constructor(modId: number, payload: string) {
      this.header = new ScriptDataHeader(SCRIPT_ENGINE_VERSION, modId);
      this.payload = payload;
    }

    encode(): string {
      return (
        '0x' +
        SCRIPT_ENGINE_PREFIX +
        SCRIPT_DATA_PREFIX +
        new RLP(ScriptDataProfile).encode(this).toString('hex')
      );
    }
  }

  // ------------------------------------------
  //                STAKING
  // ------------------------------------------
  export const StakingGoverningExtraProfile: RLP.Profile = {
    name: 'stakingGoverningExtraProfile',
    kind: {
      item: [
        { name: 'address', kind: new RLP.HexKind() },
        { name: 'amount', kind: new RLP.NumericKind() },
      ],
    },
  };
  export class RewardInfo {
    public address: string;
    public amount: string;
    constructor(address: string, amount: string) {
      this.address = address;
      this.amount = amount;
    }
  }

  export class RoundInfo {
    public epoch: number;
    public round: number;
    constructor(epoch: number, round: number) {
      this.epoch = epoch;
      this.round = round;
    }
  }

  export class HeightInfo {
    public epoch: number;
    public height: number;
    constructor(epoch: number, height: number) {
      this.epoch = epoch;
      this.height = height;
    }
  }
  export class MissingLeader {
    public counter: number;
    public info: RoundInfo[];
    constructor(counter: number, info: RoundInfo[]) {
      this.counter = counter;
      this.info = info;
    }
  }

  export class MissingProposer {
    public counter: number;
    public info: HeightInfo[];
    constructor(counter: number, info: HeightInfo[]) {
      this.counter = counter;
      this.info = info;
    }
  }

  export class MissingVoter {
    public counter: number;
    public info: HeightInfo[];
    constructor(counter: number, info: HeightInfo[]) {
      this.counter = counter;
      this.info = info;
    }
  }
  export class DoubleSign {
    public counter: number;
    public info: HeightInfo[];
    constructor(counter: number, info: HeightInfo[]) {
      this.counter = counter;
      this.info = info;
    }
  }
  export class Infraction {
    public missingLeader: MissingLeader;
    public missingProposer: MissingProposer;
    public missingVoter: MissingVoter;
    public doubleSign: DoubleSign;
    constructor(
      missingLeader: MissingLeader,
      missingProposer: MissingProposer,
      missingVoter: MissingVoter,
      doubleSign: DoubleSign
    ) {
      this.missingLeader = missingLeader;
      this.missingProposer = missingProposer;
      this.missingVoter = missingVoter;
      this.doubleSign = doubleSign;
    }

    public encode(): string {
      return '0x' + new RLP(InfractionProfile).encode(this).toString('hex');
    }
  }

  export const MissingLeaderProfile: RLP.Profile = {
    name: 'missingLeaderProfile',
    kind: [
      { name: 'counter', kind: new RLP.NumericKind() },
      {
        name: 'info',
        kind: {
          item: [
            { name: 'epoch', kind: new RLP.NumericKind() },
            { name: 'height', kind: new RLP.NumericKind() },
          ],
        },
      },
    ],
  };

  export const MissingProposerProfile: RLP.Profile = {
    name: 'missingProposerProfile',
    kind: [
      { name: 'counter', kind: new RLP.NumericKind() },
      {
        name: 'info',
        kind: {
          item: [
            { name: 'epoch', kind: new RLP.NumericKind() },
            { name: 'round', kind: new RLP.NumericKind() },
          ],
        },
      },
    ],
  };

  export const MissingVoterProfile: RLP.Profile = {
    name: 'missingVoterProfile',
    kind: [
      { name: 'counter', kind: new RLP.NumericKind() },
      {
        name: 'info',
        kind: {
          item: [
            { name: 'epoch', kind: new RLP.NumericKind() },
            { name: 'round', kind: new RLP.NumericKind() },
          ],
        },
      },
    ],
  };
  export const DoubleSignProfile: RLP.Profile = {
    name: 'doubleSignProfile',
    kind: [
      { name: 'counter', kind: new RLP.NumericKind() },
      {
        name: 'info',
        kind: {
          item: [
            { name: 'epoch', kind: new RLP.NumericKind() },
            { name: 'round', kind: new RLP.NumericKind() },
          ],
        },
      },
    ],
  };
  export const InfractionProfile: RLP.Profile = {
    name: 'infractionProfile',
    kind: [MissingLeaderProfile, MissingProposerProfile, MissingVoterProfile, DoubleSignProfile],
  };

  export const StakingBodyProfile: RLP.Profile = {
    name: 'stakingBodyProfile',
    kind: [
      { name: 'opCode', kind: new RLP.NumericKind() },
      { name: 'version', kind: new RLP.NumericKind() },
      { name: 'option', kind: new RLP.NumericKind() },
      { name: 'holderAddr', kind: new RLP.HexKind() },
      { name: 'candidateAddr', kind: new RLP.HexKind() },
      { name: 'candidateName', kind: new RLP.TextKind() },
      { name: 'candidateDescription', kind: new RLP.TextKind() },
      { name: 'candidatePubKey', kind: new RLP.TextKind() },
      { name: 'candidateIP', kind: new RLP.TextKind() },
      { name: 'candidatePort', kind: new RLP.NumericKind() },
      { name: 'bucketID', kind: new RLP.HexKind() },
      { name: 'amount', kind: new RLP.NumericKind() },
      { name: 'token', kind: new RLP.NumericKind() },
      { name: 'autobid', kind: new RLP.NumericKind() },
      { name: 'timestamp', kind: new RLP.NumericKind() },
      { name: 'nonce', kind: new RLP.NumericKind() },
      { name: 'extra', kind: new RLP.HexKind() },
    ],
  };

  export const BucketIDProfile: RLP.Profile = {
    name: 'bucketID',
    kind: [
      { name: 'owner', kind: new RLP.HexKind() },
      { name: 'nonce', kind: new RLP.NumericKind() },
      { name: 'timestamp', kind: new RLP.NumericKind() },
    ],
  };
  export class DecodedStakingBody {
    public opCode: StakingOpCode;
    public version: number;
    public option: number;
    public holderAddr: string;
    public candidateAddr: string;
    public candidateName: string;
    public candidateDescription: string;
    public candidatePubKey: string;
    public candidateIP: string;
    public candidatePort: number;
    public bucketID: string;
    public amount: string;
    public token: Token;
    public autobid: number;
    public timestamp: number;
    public nonce: number;
    public extra: undefined | Infraction | RewardInfo[];
    constructor(sb: StakingBody, extra: undefined | Infraction | RewardInfo[]) {
      this.opCode = sb.opCode;
      this.version = sb.version;
      this.option = sb.option;
      this.holderAddr = sb.holderAddr;
      this.candidateAddr = sb.candidateAddr;
      this.candidateName = sb.candidateName;
      this.candidateDescription = sb.candidateDescription;
      this.candidatePubKey = sb.candidatePubKey;
      this.candidateIP = sb.candidateIP;
      this.candidatePort = sb.candidatePort;
      this.bucketID = sb.bucketID;
      this.amount = sb.amount;
      this.token = sb.token;
      this.autobid = sb.autobid;
      this.timestamp = sb.timestamp;
      this.nonce = sb.nonce;
      this.extra = extra;
    }
  }

  export class StakingBody {
    public opCode: StakingOpCode;
    public version: number;
    public option: number;
    public holderAddr: string;
    public candidateAddr: string;
    public candidateName: string;
    public candidateDescription: string;
    public candidatePubKey: string;
    public candidateIP: string;
    public candidatePort: number;
    public bucketID: string;
    public amount: string;
    public token: Token;
    public autobid: number;
    public timestamp: number;
    public nonce: number;
    public extra: string;

    constructor(
      op: StakingOpCode,
      option: number,
      holderAddr: string,
      candidateAddr: string,
      candidateName: string,
      candidateDescription: string,
      candidatePubKey: string,
      candidateIP: string,
      candidatePort: number,
      bucketID: string,
      amount: string | number,
      token: Token,
      autobid: number,
      timestamp = 0,
      nonce = 0
    ) {
      this.opCode = op;
      this.version = STAKING_VERSION;
      this.option = option;
      // set autobid to be in range [0,100]
      let autobidVal = autobid;
      if (autobid > 100) {
        autobidVal = 100;
      }
      if (autobid < 0) {
        autobidVal = 0;
      }
      this.autobid = autobidVal;
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

      this.holderAddr = holderAddr;
      this.candidateAddr = candidateAddr;
      this.candidateName = candidateName;
      this.candidateDescription = candidateDescription;
      this.candidatePubKey = candidatePubKey;
      this.candidateIP = candidateIP;
      this.candidatePort = candidatePort;
      this.bucketID = bucketID;
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
      this.extra = '';
    }

    public encode(): string {
      return '0x' + new RLP(StakingBodyProfile).encode(this).toString('hex');
    }
  }

  /**
   * @deprecated
   * @param sb
   * @returns
   */
  export function jsonFromStakingBody(sb: StakingBody): any {
    return {
      ...sb,
      amount: new BigNumber(sb.amount).toFixed(),
    };
  }

  export function getBoundData(
    option: number,
    holderAddr: string,
    candidateAddr: string,
    amount: number | string,
    timestamp = 0,
    nonce = 0,
    autobid = 0
  ): string {
    const body = new StakingBody(
      StakingOpCode.Bound,
      option,
      holderAddr,
      candidateAddr,
      '', // name
      '', // desc
      '', // pubkey
      '', // ip
      0, // port
      EMPTY_BYTE32, // bucket id
      amount,
      Token.MeterGov,
      autobid, // autobid
      timestamp,
      nonce
    );
    return new ScriptData(ModuleID.Staking, body.encode()).encode();
  }

  export function getUnboundData(
    holderAddr: string,
    stakingIDStr: string,
    amount: number | string,
    timestamp = 0,
    nonce = 0
  ): string {
    const body = new StakingBody(
      StakingOpCode.Unbound,
      StakingOption.Empty,
      holderAddr,
      '', // candidate addr
      '', // name
      '', // desc
      '', // pubkey
      '', // ip
      0, // port
      stakingIDStr, // bucket id
      amount,
      Token.MeterGov,
      0, // autobid
      timestamp,
      nonce
    );
    return new ScriptData(ModuleID.Staking, body.encode()).encode();
  }

  export function getBucketAddData(
    holderAddr: string,
    bucketID: string,
    amount: number | string,
    timestamp = 0,
    nonce = 0
  ): string {
    const body = new StakingBody(
      StakingOpCode.BucketUpdate,
      BucketUpdateOption.Add,
      holderAddr,
      holderAddr,
      '', // name
      '', // desc
      '', //
      '', // ip
      0, // port
      bucketID, // bucket id
      amount.toString(),
      Token.MeterGov,
      0, // autobid
      timestamp,
      nonce
    );
    return new ScriptData(ModuleID.Staking, body.encode()).encode();
  }

  export function getBucketSubData(
    holderAddr: string,
    bucketID: string,
    amount: number | string,
    timestamp = 0,
    nonce = 0
  ): string {
    const body = new StakingBody(
      StakingOpCode.BucketUpdate,
      BucketUpdateOption.Sub,
      holderAddr,
      holderAddr,
      '', // name
      '', // desc
      '', //
      '', // ip
      0, // port
      bucketID,
      amount.toString(),
      Token.MeterGov,
      0, // autobid
      timestamp,
      nonce
    );
    return new ScriptData(ModuleID.Staking, body.encode()).encode();
  }

  export function getCandidateData(
    // omitted option, every bucket is forever
    holderAddr: string,
    candidateName: string,
    candidateDescription: string,
    candidatePubKey: string,
    candidateIP: string,
    candidatePort: number,
    amount: number | string,
    commission: number,
    timestamp = 0,
    nonce = 0,
    autobid = 0
  ): string {
    let option = 0;
    if (commission >= 100 && commission <= 1000) {
      option = commission * 1e5;
    }
    const body = new StakingBody(
      StakingOpCode.Candidate,
      option,
      holderAddr,
      holderAddr,
      candidateName,
      candidateDescription,
      candidatePubKey,
      candidateIP,
      candidatePort,
      EMPTY_BYTE32, // bucket id
      amount.toString(),
      Token.MeterGov,
      autobid, // autobid
      timestamp,
      nonce
    );
    return new ScriptData(ModuleID.Staking, body.encode()).encode();
    // return body.encode();
  }

  export function getUncandidateData(candidateAddr: string, timestamp = 0, nonce = 0): string {
    const body = new StakingBody(
      StakingOpCode.Uncandidate,
      StakingOption.Empty,
      EMPTY_ADDRESS,
      candidateAddr, // candidate addr
      '', // name
      '', // desc
      '', // pubkey
      '', // ip
      0, // port
      EMPTY_BYTE32, // bucket id
      0, // amount
      Token.MeterGov, // token
      0, // autobid
      timestamp,
      nonce
    );
    return new ScriptData(ModuleID.Staking, body.encode()).encode();
  }

  export function getDelegateData(
    holderAddr: string,
    candidateAddr: string,
    bucketID: string,
    amount: string | number,
    timestamp = 0,
    nonce = 0,
    autobid = 0
  ): string {
    const body = new StakingBody(
      StakingOpCode.Delegate,
      StakingOption.Empty,
      holderAddr,
      candidateAddr,
      '', // name
      '', // desc
      '', // pubkey
      '', // ip
      0, // port
      bucketID, // bucket id
      amount.toString(),
      Token.MeterGov,
      autobid,
      timestamp,
      nonce
    );
    return new ScriptData(ModuleID.Staking, body.encode()).encode();
    // return body.encode();
  }

  export function getUndelegateData(
    holderAddr: string,
    stakingIDStr: string,
    amount: number | string,
    timestamp = 0,
    nonce = 0
  ): string {
    const body = new StakingBody(
      StakingOpCode.Undelegate,
      StakingOption.Empty,
      holderAddr,
      '', // candidate addr
      '', // name
      '', // desc
      '', // pubkey
      '', // ip
      0, // port
      stakingIDStr, // bucket id
      amount.toString(),
      Token.MeterGov,
      0, // autobid
      timestamp,
      nonce
    );
    return new ScriptData(ModuleID.Staking, body.encode()).encode();
    // return body.encode();
  }

  export function getCandidateUpdateData(
    holderAddr: string,
    candidateName: string,
    candidateDescription: string,
    candidatePubKey: string,
    candidateIP: string,
    candidatePort: number,
    commission: number,
    timestamp = 0,
    nonce = 0,
    autobid = 0
  ): string {
    let option = 0;
    if (commission >= 100 && commission <= 1000) {
      option = commission * 1e5;
    }
    const body = new StakingBody(
      StakingOpCode.CandidateUpdate,
      option,
      holderAddr,
      holderAddr,
      candidateName,
      candidateDescription,
      candidatePubKey,
      candidateIP,
      candidatePort,
      EMPTY_BYTE32, // bucket id
      0,
      Token.MeterGov,
      autobid, // autobid
      timestamp,
      nonce
    );
    return new ScriptData(ModuleID.Staking, body.encode()).encode();
    // return body.encode();
  }

  export function getBailOutData(holderAddr: string, timestamp = 0, nonce = 0): string {
    const body = new StakingBody(
      StakingOpCode.BailOut,
      StakingOption.Empty,
      holderAddr,
      holderAddr,
      '', // name
      '', // desc
      '', // pubkey
      '', // ip
      0, // port
      EMPTY_BYTE32, // bucket id
      '0', // amount
      Token.MeterGov,
      0, // autobid
      timestamp,
      nonce
    );
    return new ScriptData(ModuleID.Staking, body.encode()).encode();
    // return body.encode();
  }

  // ------------------------------------------
  //                AUCTION
  // ------------------------------------------
  export const AuctionControlBlockProfile: RLP.Profile = {
    name: 'auctionControlBlock',
    kind: [
      { name: 'startHeight', kind: new RLP.NumericKind() },
      { name: 'startEpoch', kind: new RLP.NumericKind() },
      { name: 'endHeight', kind: new RLP.NumericKind() },
      { name: 'endEpoch', kind: new RLP.NumericKind() },
      { name: 'rlsdMTRG', kind: new RLP.NumericKind() },
      { name: 'rsvdMTRG', kind: new RLP.NumericKind() },
      { name: 'rsvdPrice', kind: new RLP.NumericKind() },
      { name: 'createTime', kind: new RLP.NumericKind() },
    ],
  };
  export class AuctionControlBlock {
    public startHeight: number;
    public startEpoch: number;
    public endHeight: number;
    public endEpoch: number;
    public rlsdMTRG: string;
    public rsvdMTRG: string;
    public rsvdPrice: string;
    public createTime: number;

    constructor(
      startHeight: number,
      startEpoch: number,
      endHeight: number,
      endEpoch: number,
      rlsdMTRG: string | number,
      rsvdMTRG: string | number,
      rsvdPrice: string | number,
      createTime: number
    ) {
      this.startHeight = startHeight;
      this.startEpoch = startEpoch;
      this.endHeight = endHeight;
      this.endEpoch = endEpoch;
      this.rlsdMTRG = rlsdMTRG.toString();
      this.rsvdMTRG = rsvdMTRG.toString();
      this.rsvdPrice = rsvdPrice.toString();
      this.createTime = createTime;
    }

    ID(): string {
      const bytes = new RLP(AuctionControlBlockProfile).encode(this);
      const idBuf = blake.blake2bHex(bytes, null, 32);
      return '0x' + idBuf.toString('hex');
    }
  }

  export const AuctionTxProfile: RLP.Profile = {
    name: 'acutionTx',
    kind: [
      { name: 'address', kind: new RLP.BufferKind() },
      { name: 'amount', kind: new RLP.NumericKind() },
      { name: 'type', kind: new RLP.NumericKind() },
      { name: 'timestamp', kind: new RLP.NumericKind() },
      { name: 'nonce', kind: new RLP.NumericKind() },
    ],
  };
  export class AuctionTx {
    public address: Buffer;
    public amount: string;
    public type: number;
    public timestamp: number;
    public nonce: string;

    constructor(
      address: string,
      amount: string | number,
      type: number,
      timestamp: number,
      nonce: string | number
    ) {
      this.address = Buffer.from(address.replace('0x', ''), 'hex');
      this.amount = amount.toString();
      this.type = type;
      this.timestamp = timestamp;
      this.nonce = nonce.toString();
    }

    ID(): string {
      const bytes = new RLP(AuctionTxProfile).encode(this);
      const idBuf = blake.blake2bHex(bytes, null, 32);
      return '0x' + idBuf.toString('hex');
    }
  }

  export const AuctionBodyProfile: RLP.Profile = {
    name: 'auctionBody',
    kind: [
      { name: 'opCode', kind: new RLP.NumericKind() },
      { name: 'version', kind: new RLP.NumericKind() },
      { name: 'option', kind: new RLP.NumericKind() },
      { name: 'startHeight', kind: new RLP.NumericKind() },
      { name: 'startEpoch', kind: new RLP.NumericKind() },
      { name: 'endHeight', kind: new RLP.NumericKind() },
      { name: 'endEpoch', kind: new RLP.NumericKind() },
      { name: 'sequence', kind: new RLP.NumericKind() },
      { name: 'auctionID', kind: new RLP.HexKind() },
      { name: 'bidder', kind: new RLP.HexKind() },
      { name: 'amount', kind: new RLP.NumericKind() },
      { name: 'reserveAmount', kind: new RLP.NumericKind() },
      { name: 'token', kind: new RLP.NumericKind() },
      { name: 'timestamp', kind: new RLP.NumericKind() },
      { name: 'nonce', kind: new RLP.NumericKind() },
    ],
  };

  export class AuctionBody {
    public opCode: AuctionOpCode;
    public version: number;
    public option: AuctionOption;
    public startHeight: number;
    public startEpoch: number;
    public endHeight: number;
    public endEpoch: number;
    public sequence: number;
    public auctionID: string;
    public bidder: string;
    public amount: string;
    public reserveAmount: string;
    public token: Token;
    public timestamp: number;
    public nonce: number;

    constructor(
      opCode: AuctionOpCode,
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

      this.opCode = opCode;
      this.version = AUCTION_VERSION;
      this.option = option;
      this.startHeight = 0;
      this.startEpoch = 0;
      this.endHeight = 0;
      this.endEpoch = 0;
      this.sequence = 0;
      this.auctionID = auctionID;
      this.bidder = bidder;
      this.amount = amount.toString();
      this.reserveAmount = '0';
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

    public encode(): string {
      return '0x' + new RLP(AuctionBodyProfile).encode(this).toString('hex');
    }
  }

  /**
   * @deprecated
   * @param ab
   * @returns
   */
  export function jsonFromAuctionBody(ab: AuctionBody): object {
    return {
      ...ab,
      amount: new BigNumber(ab.amount).toFixed(),
      reserveAmount: new BigNumber(ab.reserveAmount).toFixed(),
    };
  }

  export function getBidData(
    bidder: string,
    amount: number | string,
    timestamp = 0,
    nonce = 0
  ): string {
    const body = new AuctionBody(
      AuctionOpCode.Bid,
      AuctionOption.Userbid,
      EMPTY_BYTE32,
      bidder,
      amount,
      timestamp,
      nonce
    );
    return new ScriptData(ModuleID.Auction, body.encode()).encode();
  }

  // ------------------------------------------
  //                ACCOUNT LOCK
  // ------------------------------------------
  export const AccountLockBodyProfile: RLP.Profile = {
    name: 'accountLockBodyProfile',
    kind: [
      { name: 'opCode', kind: new RLP.NumericKind() },
      { name: 'version', kind: new RLP.NumericKind() },
      { name: 'option', kind: new RLP.NumericKind() },
      { name: 'lockEpoch', kind: new RLP.NumericKind() },
      { name: 'releaseEpoch', kind: new RLP.NumericKind() },
      { name: 'fromAddr', kind: new RLP.HexKind() },
      { name: 'toAddr', kind: new RLP.HexKind() },
      { name: 'meterAmount', kind: new RLP.NumericKind() },
      { name: 'meterGovAmount', kind: new RLP.NumericKind() },
      { name: 'memo', kind: new RLP.TextKind() },
    ],
  };
  export class AccountLockBody {
    public opCode: AccountLockOpCode;
    public version: number;
    public option: number;
    public lockEpoch: number;
    public releaseEpoch: number;
    public fromAddr: string;
    public toAddr: string;
    public meterAmount: string;
    public meterGovAmount: string;
    public memo: string;

    constructor(
      op: AccountLockOpCode,
      lockEpoch: number,
      releaseEpoch: number,
      fromAddr: string,
      toAddr: string,
      meterAmount: number | string,
      meterGovAmount: number | string,
      memo: string
    ) {
      this.opCode = op;
      this.version = STAKING_VERSION;
      this.option = 0;
      let fromAddrStr = fromAddr;
      let toAddrStr = toAddr;
      if (fromAddrStr === '' || fromAddrStr === '0x') {
        fromAddrStr = EMPTY_ADDRESS;
      }
      if (toAddrStr === '' || toAddrStr === '0x') {
        toAddrStr = EMPTY_ADDRESS;
      }
      this.fromAddr = fromAddr;
      this.toAddr = toAddr;
      this.lockEpoch = lockEpoch;
      this.releaseEpoch = releaseEpoch;
      this.meterAmount = meterAmount.toString();
      this.meterGovAmount = meterGovAmount.toString();
      this.memo = memo;
    }

    public encode(): string {
      return '0x' + new RLP(AccountLockBodyProfile).encode(this).toString('hex');
    }
  }

  /**
   * @deprecated
   * @param alb
   * @returns
   */
  export function jsonFromAccountLockBody(alb: AccountLockBody): object {
    return {
      ...alb,
      meterAmount: new BigNumber(alb.meterAmount).toFixed(),
      meterGovAmount: new BigNumber(alb.meterGovAmount).toFixed(),
    };
  }

  export function getLockedTransferData(
    lockEpoch: number,
    releaseEpoch: number,
    fromAddr: string,
    toAddr: string,
    meterAmount: number | string,
    meterGovAmount: number | string,
    memo: string
  ): string {
    const body = new AccountLockBody(
      AccountLockOpCode.Transfer,
      lockEpoch,
      releaseEpoch,
      fromAddr,
      toAddr,
      meterAmount,
      meterGovAmount,
      memo
    );
    return new ScriptData(ModuleID.AccountLock, body.encode()).encode();
  }

  export function getBucketID(owner: string, nonce: number, timestamp: number): string {
    const bytes = new RLP(BucketIDProfile).encode({
      owner,
      nonce,
      timestamp,
    });
    const idBuf = blake.blake2bHex(bytes, null, 32);
    return '0x' + idBuf.toString('hex');
  }
}
