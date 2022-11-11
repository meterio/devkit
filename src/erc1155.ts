import { abi } from './abi';
import { XORBatch } from './bitwise';

const TransferSingleABI = {
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

const TransferBatchABI = {
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

const ApprovalForAllABI = {
  anonymous: false,
  inputs: [
    { indexed: true, internalType: 'address', name: 'account', type: 'address' },
    { indexed: true, internalType: 'address', name: 'operator', type: 'address' },
    { indexed: false, internalType: 'bool', name: 'approved', type: 'bool' },
  ],
  name: 'ApprovalForAll',
  type: 'event',
};

const URIABI = {
  anonymous: false,
  inputs: [
    { indexed: false, internalType: 'string', name: 'value', type: 'string' },
    { indexed: true, internalType: 'uint256', name: 'id', type: 'uint256' },
  ],
  name: 'URI',
  type: 'event',
};

const safeTransferFromABI = {
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
const safeBatchTransferFromABI = {
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
const balanceOfABI = {
  inputs: [
    { internalType: 'address', name: 'account', type: 'address' },
    { internalType: 'uint256', name: 'id', type: 'uint256' },
  ],
  name: 'balanceOf',
  outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
  stateMutability: 'view',
  type: 'function',
};
const balanceOfBatchABI = {
  inputs: [
    { internalType: 'address[]', name: 'accounts', type: 'address[]' },
    { internalType: 'uint256[]', name: 'ids', type: 'uint256[]' },
  ],
  name: 'balanceOfBatch',
  outputs: [{ internalType: 'uint256[]', name: '', type: 'uint256[]' }],
  stateMutability: 'view',
  type: 'function',
};
const setApprovalForAllABI = {
  inputs: [
    { internalType: 'address', name: 'operator', type: 'address' },
    { internalType: 'bool', name: 'approved', type: 'bool' },
  ],
  name: 'setApprovalForAll',
  outputs: [],
  stateMutability: 'nonpayable',
  type: 'function',
};
const isApprovedForAllABI = {
  inputs: [
    { internalType: 'address', name: 'account', type: 'address' },
    { internalType: 'address', name: 'operator', type: 'address' },
  ],
  name: 'isApprovedForAll',
  outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
  stateMutability: 'view',
  type: 'function',
};

const TransferSingle = new abi.Event(TransferSingleABI as abi.Event.Definition);
const TransferBatch = new abi.Event(TransferBatchABI as abi.Event.Definition);
const ApprovalForAll = new abi.Event(ApprovalForAllABI as abi.Event.Definition);
const URI = new abi.Event(URIABI as abi.Event.Definition);

const balanceOf = new abi.Function(balanceOfABI as abi.Function.Definition);
const balanceOfBatch = new abi.Function(balanceOfBatchABI as abi.Function.Definition);
const safeBatchTransferFrom = new abi.Function(safeBatchTransferFromABI as abi.Function.Definition);
const safeTransferFrom = new abi.Function(safeTransferFromABI as abi.Function.Definition);
const setApprovalForAll = new abi.Function(setApprovalForAllABI as abi.Function.Definition);
const isApprovedForAll = new abi.Function(isApprovedForAllABI as abi.Function.Definition);

const uriABI = {
  inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
  name: 'uri',
  outputs: [{ internalType: 'string', name: '', type: 'string' }],
  stateMutability: 'view',
  type: 'function',
};

const uri = new abi.Function(uriABI as abi.Function.Definition);

export const ERC1155Metadata = {
  uri,
  interfaceID: XORBatch(uri.signature),
};

export const ERC1155ABI = {
  TransferSingle: TransferSingleABI,
  TransferBatch: TransferBatchABI,
  ApprovalForAll: ApprovalForAllABI,
  URI: URIABI, // event
  uri: uriABI, // function
  balanceOf: balanceOfABI,
  balanceOfBatch: balanceOfBatchABI,
  safeTransferFrom: safeTransferFromABI,
  setApprovalForAll: setApprovalForAllABI,
  isApprovedForAll: isApprovedForAllABI,
};

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
