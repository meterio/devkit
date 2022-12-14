import { abi } from './abi';

const OwnershipTransferredABI = {
  anonymous: false,
  inputs: [
    { indexed: true, internalType: 'address', name: 'previousOwner', type: 'address' },
    { indexed: true, internalType: 'address', name: 'newOwner', type: 'address' },
  ],
  name: 'OwnershipTransferred',
  type: 'event',
};

const OwnershipTransferred = new abi.Event(OwnershipTransferredABI as abi.Event.Definition);

export const EIP173ABI = {
  OwnershipTransferredABI,
};
export const EIP173 = {
  OwnershipTransferred,
};
