// tslint:disable:max-line-length
import { abi } from './abi';
import { XORBatch } from './bitwise';

const ApprovalABI: abi.Event.Definition = {
  anonymous: false,
  inputs: [
    { indexed: true, name: 'owner', type: 'address' },
    { indexed: true, name: 'approved', type: 'address' },
    { indexed: true, name: 'tokenId', type: 'uint256' },
  ],
  name: 'Approval',
  type: 'event',
};

const TransferABI: abi.Event.Definition = {
  anonymous: false,
  inputs: [
    { indexed: true, name: 'from', type: 'address' },
    { indexed: true, name: 'to', type: 'address' },
    { indexed: true, name: 'tokenId', type: 'uint256' },
  ],
  name: 'Transfer',
  type: 'event',
};

const ApprovalForAllABI: abi.Event.Definition = {
  anonymous: false,
  inputs: [
    { indexed: true, internalType: 'address', name: 'owner', type: 'address' },
    { indexed: true, internalType: 'address', name: 'operator', type: 'address' },
    { indexed: false, internalType: 'bool', name: 'approved', type: 'bool' },
  ],
  name: 'ApprovalForAll',
  type: 'event',
};

const approveABI: abi.Function.Definition = {
  inputs: [
    { name: 'to', type: 'address' },
    { name: 'tokenId', type: 'uint256' },
  ],
  name: 'approve',
  outputs: [],
  stateMutability: 'nonpayable',
  type: 'function',
};

const balanceOfABI: abi.Function.Definition = {
  inputs: [{ internalType: 'address', name: 'owner', type: 'address' }],
  name: 'balanceOf',
  outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
  stateMutability: 'view',
  type: 'function',
};

const getApprovedABI: abi.Function.Definition = {
  inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
  name: 'getApproved',
  outputs: [{ internalType: 'address', name: '', type: 'address' }],
  stateMutability: 'view',
  type: 'function',
};

const isApprovedForAllABI: abi.Function.Definition = {
  inputs: [
    { internalType: 'address', name: 'owner', type: 'address' },
    { internalType: 'address', name: 'operator', type: 'address' },
  ],
  name: 'isApprovedForAll',
  outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
  stateMutability: 'view',
  type: 'function',
};

const ownerOfABI: abi.Function.Definition = {
  inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
  name: 'ownerOf',
  outputs: [{ internalType: 'address', name: '', type: 'address' }],
  stateMutability: 'view',
  type: 'function',
};

const safeTransferFromABI: abi.Function.Definition = {
  inputs: [
    { internalType: 'address', name: 'from', type: 'address' },
    { internalType: 'address', name: 'to', type: 'address' },
    { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
  ],
  name: 'safeTransferFrom',
  outputs: [],
  stateMutability: 'nonpayable',
  type: 'function',
};

const safeTransferFrom2ABI: abi.Function.Definition = {
  inputs: [
    { internalType: 'address', name: 'from', type: 'address' },
    { internalType: 'address', name: 'to', type: 'address' },
    { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
    { internalType: 'bytes', name: '_data', type: 'bytes' },
  ],
  name: 'safeTransferFrom',
  outputs: [],
  stateMutability: 'nonpayable',
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

const transferFromABI: abi.Function.Definition = {
  inputs: [
    { internalType: 'address', name: 'from', type: 'address' },
    { internalType: 'address', name: 'to', type: 'address' },
    { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
  ],
  name: 'transferFrom',
  outputs: [],
  stateMutability: 'nonpayable',
  type: 'function',
};

// ERC721 metadata
const nameABI: abi.Function.Definition = {
  inputs: [],
  name: 'name',
  outputs: [{ internalType: 'string', name: '', type: 'string' }],
  stateMutability: 'view',
  type: 'function',
};

const symbolABI: abi.Function.Definition = {
  inputs: [],
  name: 'symbol',
  outputs: [{ internalType: 'string', name: '', type: 'string' }],
  stateMutability: 'view',
  type: 'function',
};

const tokenURIABI: abi.Function.Definition = {
  inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
  name: 'tokenURI',
  outputs: [{ internalType: 'string', name: '', type: 'string' }],
  stateMutability: 'view',
  type: 'function',
};

const Transfer = new abi.Event(TransferABI);
const Approval = new abi.Event(ApprovalABI);
const ApprovalForAll = new abi.Event(ApprovalForAllABI);

const balanceOf = new abi.Function(balanceOfABI);
const ownerOf = new abi.Function(ownerOfABI);
const safeTransferFrom2 = new abi.Function(safeTransferFrom2ABI);
const safeTransferFrom = new abi.Function(safeTransferFromABI);
const transferFrom = new abi.Function(transferFromABI);
const approve = new abi.Function(approveABI);
const setApprovalForAll = new abi.Function(setApprovalForAllABI);
const getApproved = new abi.Function(getApprovedABI);
const isApprovedForAll = new abi.Function(isApprovedForAllABI);

export const ERC721 = {
  Transfer,
  Approval,
  ApprovalForAll,
  balanceOf,
  ownerOf,
  safeTransferFrom,
  safeTransferFrom2,
  transferFrom,
  approve,
  setApprovalForAll,
  getApproved,
  isApprovedForAll,
  interfaceID: XORBatch(
    balanceOf.signature,
    ownerOf.signature,
    safeTransferFrom.signature,
    safeTransferFrom2.signature,
    transferFrom.signature,
    approve.signature,
    setApprovalForAll.signature,
    getApproved.signature,
    isApprovedForAll.signature
  ),
};

const name = new abi.Function(nameABI);
const symbol = new abi.Function(symbolABI);
const tokenURI = new abi.Function(tokenURIABI);

export const ERC721Metadata = {
  name,
  symbol,
  tokenURI,
  interfaceID: XORBatch(name.signature, symbol.signature, tokenURI.signature),
};
