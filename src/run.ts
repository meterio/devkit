import { ERC1155 } from './erc1155';

const topics = [
  '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62',
  '0x000000000000000000000000d10283b232c43924bcc2834bd73f811918851f3c',
  '0x0000000000000000000000000000000000000000000000000000000000000000',
  '0x000000000000000000000000d10283b232c43924bcc2834bd73f811918851f3c',
];
const data =
  '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001';
const res = ERC1155.TransferSingle.decode(data, topics);
console.log(res);
