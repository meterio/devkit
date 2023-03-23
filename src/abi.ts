import {
  AbiCoder,
  FunctionFragment,
  FormatTypes,
  Result,
  EventFragment,
  Interface,
} from '@ethersproject/abi';
import { keccak256 } from './cry/keccak';

class Coder extends AbiCoder {
  constructor() {
    super((type: string, value: any) => {
      if (
        (type.match(/^u?int/) && !Array.isArray(value) && typeof value !== 'object') ||
        value._ethersType === 'BigNumber'
      ) {
        return value.toString();
      }
      return value;
    });
  }

  public encode(types: string[], values: any[]): string {
    try {
      return super.encode(types, values);
    } catch (err) {
      if (err.reason) {
        throw new Error(err.reason);
      }
      throw err;
    }
  }

  public decode(types: string[], data: string): Result {
    try {
      return super.decode(types, data);
    } catch (err) {
      if (err.reason) {
        throw new Error(err.reason);
      }
      throw err;
    }
  }
}

const coder = new Coder();

/** encode/decode parameters of contract function call, event log, according to ABI JSON */
export namespace abi {
  /**
   * encode single parameter
   * @param type type of the parameter
   * @param value value of the parameter
   * @returns encoded value in hex string
   */
  export function encodeParameter(type: string, value: any) {
    return coder.encode([type], [value]);
  }

  /**
   * decode single parameter
   * @param type type of the parameter
   * @param data encoded parameter in hex string
   * @returns decoded value
   */
  export function decodeParameter(type: string, data: string) {
    return coder.decode([type], data)[0].toString();
  }

  /**
   * encode a group of parameters
   * @param types type array
   * @param values value array
   * @returns encoded values in hex string
   */
  export function encodeParameters(types: Function.Parameter[], values: any[]) {
    return coder.encode(
      types.map((p) => p.type),
      values
    );
  }

  /**
   * decode a group of parameters
   * @param types type array
   * @param data encoded values in hex string
   * @returns decoded object
   */
  export function decodeParameters(types: Function.Parameter[], data: string) {
    const result = coder.decode(
      types.map((p) => p.type),
      data
    );
    const decoded: Decoded = {};
    types.forEach((t, i) => {
      decoded[i] = result[i];
      if (t.name) {
        decoded[t.name] = result[i];
      }
    });
    return decoded;
  }

  /** for contract function */
  export class Function {
    /** canonical name */
    public readonly canonicalName: string;

    /** the function signature, aka. 4 bytes prefix */
    public readonly signature: string;

    public readonly fragment: FunctionFragment;

    public readonly iface: Interface;

    /**
     * create a function object
     * @param definition abi definition of the function
     */
    constructor(public readonly definition: Function.Definition) {
      // this.signature = '0x' + keccak256(this.canonicalName).slice(0, 4).toString('hex');
      this.fragment = FunctionFragment.from(definition);
      this.iface = new Interface([this.fragment]);
      this.canonicalName = this.fragment.format(FormatTypes.full);
      this.signature = this.iface.getSighash(this.fragment);
    }

    /**
     * encode input parameters into call data
     * @param args arguments for the function
     */
    public encode(...args: any[]): string {
      return this.signature + encodeParameters(this.definition.inputs, args).slice(2);
    }

    /**
     * decode output data
     * @param outputData output data to decode
     */
    public decode(outputData: string) {
      return decodeParameters(this.definition.outputs, outputData);
    }
  }

  export namespace Function {
    export type StateMutability = 'pure' | 'view' | 'constant' | 'payable' | 'nonpayable';
    export interface Parameter {
      name: string;
      type: string;
      internalType?: string;
    }

    export interface Definition {
      type: 'function';
      name: string;
      constant?: boolean;
      payable?: boolean;
      stateMutability: StateMutability;
      inputs: Parameter[];
      outputs: Parameter[];
    }
  }

  /** for contract event */
  export class Event {
    /** canonical name */
    public readonly canonicalName: string;

    /** the event signature */
    public readonly signature: string;

    public readonly fragment: EventFragment;

    public readonly iface: Interface;

    /** for contract event */
    constructor(public readonly definition: Event.Definition) {
      this.fragment = EventFragment.from(definition);
      this.canonicalName = this.fragment.format(FormatTypes.full);

      this.iface = new Interface([this.fragment]);
      this.signature = this.iface.getEventTopic(definition.name);
    }

    /**
     * encode an object of indexed keys into topics.
     * @param indexed an object contains indexed keys
     */
    public encode(indexed: object): Array<string | null> {
      const topics: Array<string | null> = [];
      if (!this.definition.anonymous) {
        topics.push(this.signature);
      }
      for (const input of this.definition.inputs) {
        if (!input.indexed) {
          continue;
        }
        const value = (indexed as any)[input.name];
        if (value === undefined || value === null) {
          topics.push(null);
        } else {
          let topic;
          if (isDynamicType(input.type)) {
            if (input.type === 'string') {
              topic = '0x' + keccak256(value).toString('hex');
            } else {
              if (
                typeof value === 'string' &&
                /^0x[0-9a-f]+$/i.test(value) &&
                value.length % 2 === 0
              ) {
                topic = '0x' + keccak256(Buffer.from(value.slice(2), 'hex')).toString('hex');
              } else {
                throw new Error(`invalid ${input.type} value`);
              }
            }
          } else {
            topic = encodeParameter(input.type, value);
          }
          topics.push(topic);
        }
      }
      return topics;
    }

    /**
     * decode event log
     * @param data data in event output
     * @param topics topics in event
     */
    public decode(data: string, topics: string[]) {
      if (!this.definition.anonymous) {
        topics = topics.slice(1);
      }

      if (this.definition.inputs.filter((t) => t.indexed).length !== topics.length) {
        throw new Error('invalid topics count');
      }

      let padded = data;
      if (data.length % 2 == 1) {
        padded += '0';
      }
      const decodedNonIndexed = coder.decode(
        this.definition.inputs.filter((t) => !t.indexed).map((t) => t.type),
        padded
      );
      console.log('DECODENON INDEX:', decodedNonIndexed);

      const decoded: Decoded = {};
      let nonIndexed = 0;
      this.definition.inputs.forEach((t, i) => {
        if (t.indexed) {
          const topic = topics.shift()!;
          decoded[i] = isDynamicType(t.type) ? topic : decodeParameter(t.type, topic);
        } else {
          decoded[i] = decodedNonIndexed[nonIndexed++];
        }
        if (t.name) {
          decoded[t.name] = decoded[i];
        }
      });
      return decoded;
    }
  }

  export namespace Event {
    export interface Parameter {
      name: string;
      type: string;
      indexed: boolean;
      internalType?: string;
    }

    export interface Definition {
      type: 'event';
      name: string;
      anonymous?: boolean;
      inputs: Parameter[];
    }
  }

  export type Decoded = { [name: string]: any } & { [index: number]: any };

  function isDynamicType(type: string) {
    return type === 'bytes' || type === 'string' || type.endsWith('[]');
  }
}
