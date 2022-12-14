import { abi } from './abi';
import { XORBatch } from './bitwise';

const supportsInterfaceABI = {
  inputs: [{ internalType: 'bytes4', name: 'interfaceId', type: 'bytes4' }],
  name: 'supportsInterface',
  outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
  stateMutability: 'view',
  type: 'function',
};
const supportsInterface = new abi.Function(supportsInterfaceABI as abi.Function.Definition);

export const ERC165ABI = {
  supportsInterfaceABI,
};

export const ERC165 = {
  supportsInterface,
  interfaceID: XORBatch(supportsInterface.signature),
};
