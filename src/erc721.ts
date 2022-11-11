// tslint:disable:max-line-length
import { abi } from './abi';
import { XORBatch } from './bitwise';

const ApprovalABI = {
  anonymous: false,
  inputs: [
    { indexed: true, name: 'owner', type: 'address' },
    { indexed: true, name: 'approved', type: 'address' },
    { indexed: true, name: 'tokenId', type: 'uint256' },
  ],
  name: 'Approval',
  type: 'event',
};

const TransferABI = {
  anonymous: false,
  inputs: [
    { indexed: true, name: 'from', type: 'address' },
    { indexed: true, name: 'to', type: 'address' },
    { indexed: true, name: 'tokenId', type: 'uint256' },
  ],
  name: 'Transfer',
  type: 'event',
};

const ApprovalForAllABI = {
  anonymous: false,
  inputs: [
    { indexed: true, internalType: 'address', name: 'owner', type: 'address' },
    { indexed: true, internalType: 'address', name: 'operator', type: 'address' },
    { indexed: false, internalType: 'bool', name: 'approved', type: 'bool' },
  ],
  name: 'ApprovalForAll',
  type: 'event',
};

const approveABI = {
  inputs: [
    { name: 'to', type: 'address' },
    { name: 'tokenId', type: 'uint256' },
  ],
  name: 'approve',
  outputs: [],
  stateMutability: 'nonpayable',
  type: 'function',
};

const balanceOfABI = {
  inputs: [{ internalType: 'address', name: 'owner', type: 'address' }],
  name: 'balanceOf',
  outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
  stateMutability: 'view',
  type: 'function',
};

const getApprovedABI = {
  inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
  name: 'getApproved',
  outputs: [{ internalType: 'address', name: '', type: 'address' }],
  stateMutability: 'view',
  type: 'function',
};

const isApprovedForAllABI = {
  inputs: [
    { internalType: 'address', name: 'owner', type: 'address' },
    { internalType: 'address', name: 'operator', type: 'address' },
  ],
  name: 'isApprovedForAll',
  outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
  stateMutability: 'view',
  type: 'function',
};

const ownerOfABI = {
  inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
  name: 'ownerOf',
  outputs: [{ internalType: 'address', name: '', type: 'address' }],
  stateMutability: 'view',
  type: 'function',
};

const safeTransferFromABI = {
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

const safeTransferFrom2ABI = {
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

const transferFromABI = {
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
const nameABI = {
  inputs: [],
  name: 'name',
  outputs: [{ internalType: 'string', name: '', type: 'string' }],
  stateMutability: 'view',
  type: 'function',
};

const symbolABI = {
  inputs: [],
  name: 'symbol',
  outputs: [{ internalType: 'string', name: '', type: 'string' }],
  stateMutability: 'view',
  type: 'function',
};

const tokenURIABI = {
  inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
  name: 'tokenURI',
  outputs: [{ internalType: 'string', name: '', type: 'string' }],
  stateMutability: 'view',
  type: 'function',
};

const Transfer = new abi.Event(TransferABI as abi.Event.Definition);
const Approval = new abi.Event(ApprovalABI as abi.Event.Definition);
const ApprovalForAll = new abi.Event(ApprovalForAllABI as abi.Event.Definition);

const balanceOf = new abi.Function(balanceOfABI as abi.Function.Definition);
const ownerOf = new abi.Function(ownerOfABI as abi.Function.Definition);
const safeTransferFrom2 = new abi.Function(safeTransferFrom2ABI as abi.Function.Definition);
const safeTransferFrom = new abi.Function(safeTransferFromABI as abi.Function.Definition);
const transferFrom = new abi.Function(transferFromABI as abi.Function.Definition);
const approve = new abi.Function(approveABI as abi.Function.Definition);
const setApprovalForAll = new abi.Function(setApprovalForAllABI as abi.Function.Definition);
const getApproved = new abi.Function(getApprovedABI as abi.Function.Definition);
const isApprovedForAll = new abi.Function(isApprovedForAllABI as abi.Function.Definition);

export const ERC721ABI = {
  Transfer: TransferABI,
  Approval: ApprovalABI,
  ApprovalForAll: ApprovalForAllABI,

  balanceOf: balanceOfABI,
  ownerOf: ownerOfABI,
  safeTransferFrom: safeTransferFromABI,
  safeTransferFrom2: safeTransferFrom2ABI,
  transferFrom: transferFromABI,
  approve: approveABI,
  setApprovalForAll: setApprovalForAllABI,
  getApproved: getApprovedABI,
  isApprovedForAll: isApprovedForAllABI,
  tokenURI: tokenURIABI,
  name: nameABI,
  symbol: symbolABI,
};

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

const name = new abi.Function(nameABI as abi.Function.Definition);
const symbol = new abi.Function(symbolABI as abi.Function.Definition);
const tokenURI = new abi.Function(tokenURIABI as abi.Function.Definition);

export const ERC721Metadata = {
  name,
  symbol,
  tokenURI,
  interfaceID: XORBatch(name.signature, symbol.signature, tokenURI.signature),
};
