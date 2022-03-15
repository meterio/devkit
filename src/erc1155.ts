import { abi } from './abi';
import { XORBatch } from './bitwise';

const TransferSingleABI: abi.Event.Definition = {
  anonymous: false,
  inputs: [
    { indexed: true, internalType: 'address', name: 'operator', type: 'address' },
    { indexed: true, internalType: 'address', name: 'from', type: 'address' },
    { indexed: true, internalType: 'address', name: 'to', type: 'address' },
    { indexed: false, internalType: 'uint256', name: 'id', type: 'uint256' },
    { indexed: false, internalType: 'uint256', name: 'value', type: 'uint256' },
  ],
  name: 'TransferSingle',
  type: 'event',
};

const TransferBatchABI: abi.Event.Definition = {
  anonymous: false,
  inputs: [
    { indexed: true, internalType: 'address', name: 'operator', type: 'address' },
    { indexed: true, internalType: 'address', name: 'from', type: 'address' },
    { indexed: true, internalType: 'address', name: 'to', type: 'address' },
    { indexed: false, internalType: 'uint256[]', name: 'ids', type: 'uint256[]' },
    { indexed: false, internalType: 'uint256[]', name: 'values', type: 'uint256[]' },
  ],
  name: 'TransferBatch',
  type: 'event',
};

const ApprovalForAllABI: abi.Event.Definition = {
  anonymous: false,
  inputs: [
    { indexed: true, internalType: 'address', name: 'account', type: 'address' },
    { indexed: true, internalType: 'address', name: 'operator', type: 'address' },
    { indexed: false, internalType: 'bool', name: 'approved', type: 'bool' },
  ],
  name: 'ApprovalForAll',
  type: 'event',
};

const URIABI: abi.Event.Definition = {
  anonymous: false,
  inputs: [
    { indexed: false, internalType: 'string', name: 'value', type: 'string' },
    { indexed: true, internalType: 'uint256', name: 'id', type: 'uint256' },
  ],
  name: 'URI',
  type: 'event',
};

const safeTransferFromABI: abi.Function.Definition = {
  inputs: [
    { internalType: 'address', name: 'from', type: 'address' },
    { internalType: 'address', name: 'to', type: 'address' },
    { internalType: 'uint256', name: 'id', type: 'uint256' },
    { internalType: 'uint256', name: 'amount', type: 'uint256' },
    { internalType: 'bytes', name: 'data', type: 'bytes' },
  ],
  name: 'safeTransferFrom',
  outputs: [],
  stateMutability: 'nonpayable',
  type: 'function',
};
const safeBatchTransferFromABI: abi.Function.Definition = {
  inputs: [
    { internalType: 'address', name: 'from', type: 'address' },
    { internalType: 'address', name: 'to', type: 'address' },
    { internalType: 'uint256[]', name: 'ids', type: 'uint256[]' },
    { internalType: 'uint256[]', name: 'amounts', type: 'uint256[]' },
    { internalType: 'bytes', name: 'data', type: 'bytes' },
  ],
  name: 'safeBatchTransferFrom',
  outputs: [],
  stateMutability: 'nonpayable',
  type: 'function',
};
const balanceOfABI: abi.Function.Definition = {
  inputs: [
    { internalType: 'address', name: 'account', type: 'address' },
    { internalType: 'uint256', name: 'id', type: 'uint256' },
  ],
  name: 'balanceOf',
  outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
  stateMutability: 'view',
  type: 'function',
};
const balanceOfBatchABI: abi.Function.Definition = {
  inputs: [
    { internalType: 'address[]', name: 'accounts', type: 'address[]' },
    { internalType: 'uint256[]', name: 'ids', type: 'uint256[]' },
  ],
  name: 'balanceOfBatch',
  outputs: [{ internalType: 'uint256[]', name: '', type: 'uint256[]' }],
  stateMutability: 'view',
  type: 'function',
};
const setApprovalForAllABI: abi.Function.Definition = {
  inputs: [
    { internalType: 'address', name: 'operator', type: 'address' },
    { internalType: 'bool', name: 'approved', type: 'bool' },
  ],
  name: 'setApprovalForAll',
  outputs: [],
  stateMutability: 'nonpayable',
  type: 'function',
};
const isApprovedForAllABI: abi.Function.Definition = {
  inputs: [
    { internalType: 'address', name: 'account', type: 'address' },
    { internalType: 'address', name: 'operator', type: 'address' },
  ],
  name: 'isApprovedForAll',
  outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
  stateMutability: 'view',
  type: 'function',
};
const TransferSingle = new abi.Event(TransferSingleABI);
const TransferBatch = new abi.Event(TransferBatchABI);
const ApprovalForAll = new abi.Event(ApprovalForAllABI);
const URI = new abi.Event(URIABI);

const balanceOf = new abi.Function(balanceOfABI);
const balanceOfBatch = new abi.Function(balanceOfBatchABI);
const safeBatchTransferFrom = new abi.Function(safeBatchTransferFromABI);
const safeTransferFrom = new abi.Function(safeTransferFromABI);
const setApprovalForAll = new abi.Function(setApprovalForAllABI);
const isApprovedForAll = new abi.Function(isApprovedForAllABI);

export const ERC1155 = {
  TransferSingle,
  TransferBatch,
  ApprovalForAll,
  URI,
  balanceOf,
  balanceOfBatch,
  safeBatchTransferFrom,
  safeTransferFrom,
  setApprovalForAll,
  isApprovedForAll,
  interfaceID: XORBatch(
    balanceOf.signature,
    balanceOfBatch.signature,
    safeTransferFrom.signature,
    safeBatchTransferFrom.signature,
    setApprovalForAll.signature,
    isApprovedForAll.signature
  ),
};

const uri = new abi.Function({
  inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
  name: 'uri',
  outputs: [{ internalType: 'string', name: '', type: 'string' }],
  stateMutability: 'view',
  type: 'function',
});

export const ERC1155Metadata = {
  uri,
  interfaceID: XORBatch(uri.signature),
};
