import { abi } from './abi';
import { XORBatch } from './bitwise';

const supportsInterface = new abi.Function({
  inputs: [{ internalType: 'bytes4', name: 'interfaceId', type: 'bytes4' }],
  name: 'supportsInterface',
  outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
  stateMutability: 'view',
  type: 'function',
});

export const ERC165 = {
  supportsInterface,
  interfaceID: XORBatch(supportsInterface.signature),
};
