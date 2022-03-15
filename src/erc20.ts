import { abi } from './abi';

const Transfer = new abi.Event({
  anonymous: false,
  inputs: [
    { indexed: true, internalType: 'address', name: 'from', type: 'address' },
    { indexed: true, internalType: 'address', name: 'to', type: 'address' },
    { indexed: false, internalType: 'uint256', name: 'value', type: 'uint256' },
  ],
  name: 'Transfer',
  type: 'event',
});

const Approval = new abi.Event({
  anonymous: false,
  inputs: [
    { indexed: true, internalType: 'address', name: 'owner', type: 'address' },
    { indexed: true, internalType: 'address', name: 'spender', type: 'address' },
    { indexed: false, internalType: 'uint256', name: 'value', type: 'uint256' },
  ],
  name: 'Approval',
  type: 'event',
});

const balanceOf = new abi.Function({
  inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
  name: 'balanceOf',
  outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
  stateMutability: 'view',
  type: 'function',
});

const decimals = new abi.Function({
  inputs: [],
  name: 'decimals',
  outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
  stateMutability: 'view',
  type: 'function',
});

const name = new abi.Function({
  inputs: [],
  name: 'name',
  outputs: [{ internalType: 'string', name: '', type: 'string' }],
  stateMutability: 'view',
  type: 'function',
});

const symbol = new abi.Function({
  inputs: [],
  name: 'symbol',
  outputs: [{ internalType: 'string', name: '', type: 'string' }],
  stateMutability: 'view',
  type: 'function',
});

const totalSupply = new abi.Function({
  inputs: [],
  name: 'totalSupply',
  outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
  stateMutability: 'view',
  type: 'function',
});

const transfer = new abi.Function({
  inputs: [
    { internalType: 'address', name: 'to', type: 'address' },
    { internalType: 'uint256', name: 'amount', type: 'uint256' },
  ],
  name: 'transfer',
  outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
  stateMutability: 'nonpayable',
  type: 'function',
});

const transferFrom = new abi.Function({
  inputs: [
    { internalType: 'address', name: 'from', type: 'address' },
    { internalType: 'address', name: 'to', type: 'address' },
    { internalType: 'uint256', name: 'amount', type: 'uint256' },
  ],
  name: 'transferFrom',
  outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
  stateMutability: 'nonpayable',
  type: 'function',
});

const approve = new abi.Function({
  inputs: [
    { internalType: 'address', name: 'spender', type: 'address' },
    { internalType: 'uint256', name: 'amount', type: 'uint256' },
  ],
  name: 'approve',
  outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
  stateMutability: 'nonpayable',
  type: 'function',
});

const allowance = new abi.Function({
  inputs: [
    { internalType: 'address', name: 'owner', type: 'address' },
    { internalType: 'address', name: 'spender', type: 'address' },
  ],
  name: 'allowance',
  outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
  stateMutability: 'view',
  type: 'function',
});

export const ERC20 = {
  Approval,
  Transfer,
  balanceOf,
  totalSupply,
  transfer,
  transferFrom,
  approve,
  allowance,
  name,
  decimals,
  symbol,
};
