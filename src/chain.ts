export function calcChainTag(genesisID: string): number {
  let id = genesisID;
  if (genesisID.startsWith('0x')) {
    id = genesisID.replace('0x', '');
  }
  const buf = Buffer.from(id, 'hex');
  return buf[31];
}
