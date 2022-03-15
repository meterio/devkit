export const XOR = (hex1: string, hex2: string) => {
  hex1 = hex1.replace('0x', '');
  hex2 = hex2.replace('0x', '');
  const buf1 = Buffer.from(hex1, 'hex');
  const buf2 = Buffer.from(hex2, 'hex');
  const bufResult = buf1.map((b, i) => b ^ buf2[i]);
  return '0x' + Buffer.from(bufResult).toString('hex');
};

export const XORBatch = (...hexs: string[]) => {
  let hex1 = hexs[0];
  for (const hex2 of hexs.slice(1)) {
    hex1 = XOR(hex1, hex2);
  }
  return hex1;
};
