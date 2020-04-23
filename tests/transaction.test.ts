import { expect } from 'chai';
import { cry, Transaction } from '../src';

describe('transaction', () => {
  const body: Transaction.Body = {
    chainTag: 1,
    blockRef: '0x00000000aabbccdd',
    expiration: 32,
    clauses: [
      {
        to: '0x7567d83b7b8d80addcb281a71d54fc7b3364ffed',
        value: 10000,
        data: '0x000000606060',
        token: 0,
      },
      {
        to: '0x7567d83b7b8d80addcb281a71d54fc7b3364ffed',
        value: 20000,
        data: '0x000000606060',
        token: 0,
      },
    ],
    gasPriceCoef: 128,
    gas: 21000,
    dependsOn: null,
    nonce: 12345678,
  };
  const unsigned = new Transaction(body);
  const unsignedEncoded = Buffer.from(
    'f8560184aabbccdd20f842e0947567d83b7b8d80addcb281a71d54fc7b3364ffed8227108086000000606060e0947567d83b7b8d80addcb281a71d54fc7b3364ffed824e20808600000060606081808252088083bc614ec0',
    'hex'
  );

  it('unsigned', () => {
    const signingHash = cry.blake2b256(unsigned.encode());
    expect(signingHash.toString('hex')).equal(
      'fc420290104d43f7c74ba45517a5ebdc2d65b86cab0e0c8584a8aa4cfcb1fe59'
    );
    expect(unsigned.signingHash().toString('hex')).equal(
      'fc420290104d43f7c74ba45517a5ebdc2d65b86cab0e0c8584a8aa4cfcb1fe59'
    );

    expect(unsigned.id).equal(null);
    expect(unsigned.intrinsicGas).equal(37432);
    expect(new Transaction({ ...body, clauses: [] }).intrinsicGas).equal(21000);
    expect(
      new Transaction({
        ...body,
        clauses: [
          {
            to: null,
            value: 0,
            data: '0x',
            token: 0,
          },
        ],
      }).intrinsicGas
    ).equal(53000);

    expect(unsigned.signature).equal(undefined);
    expect(unsigned.origin).equal(null);

    expect(unsigned.encode().toString('hex')).equal(unsignedEncoded.toString('hex'));
    expect(Transaction.decode(unsignedEncoded, true)).deep.equal(unsigned);
  });

  it('invalid body', () => {
    expect(() => {
      new Transaction({ ...body, chainTag: 256 }).encode();
    }).to.throw();
    expect(() => {
      new Transaction({ ...body, chainTag: -1 }).encode();
    }).to.throw();
    expect(() => {
      new Transaction({ ...body, chainTag: 1.1 }).encode();
    }).to.throw();

    expect(() => {
      new Transaction({ ...body, blockRef: '0x' }).encode();
    }).to.throw();
    expect(() => {
      new Transaction({ ...body, blockRef: '0x' + '0'.repeat(18) }).encode();
    }).to.throw();

    expect(() => {
      new Transaction({ ...body, expiration: 2 ** 32 }).encode();
    }).to.throw();
    expect(() => {
      new Transaction({ ...body, expiration: -1 }).encode();
    }).to.throw();
    expect(() => {
      new Transaction({ ...body, expiration: 1.1 }).encode();
    }).to.throw();

    expect(() => {
      new Transaction({ ...body, gasPriceCoef: 256 }).encode();
    }).to.throw();
    expect(() => {
      new Transaction({ ...body, gasPriceCoef: -1 }).encode();
    }).to.throw();
    expect(() => {
      new Transaction({ ...body, gasPriceCoef: 1.1 }).encode();
    }).to.throw();

    expect(() => {
      new Transaction({ ...body, gas: '0x10000000000000000' }).encode();
    }).to.throw();
    expect(() => {
      new Transaction({ ...body, nonce: '0x10000000000000000' }).encode();
    }).to.throw();
  });

  const signed = new Transaction(body);
  const signedEncoded = Buffer.from(
    'f8990184aabbccdd20f842e0947567d83b7b8d80addcb281a71d54fc7b3364ffed8227108086000000606060e0947567d83b7b8d80addcb281a71d54fc7b3364ffed824e20808600000060606081808252088083bc614ec0b8412cb8b616227972202d6a80b2a5b0b236e4988b274e8ee8f7f948ff7bf225a3ff061e333d7a2d16c25a8ecd53c11f13299ea220c85656e051199b800dcf3d6c4a00',
    'hex'
  );
  const privKey = Buffer.from(
    '7582be841ca040aa940fff6c05773129e135623e41acce3e0b8ba520dc1ae26a',
    'hex'
  );
  signed.signature = cry.secp256k1.sign(cry.blake2b256(signed.encode()), privKey);
  const signer = cry.publicKeyToAddress(cry.secp256k1.derivePublicKey(privKey));

  it('signed', () => {
    expect(signed.signature!.toString('hex')).equal(
      '2cb8b616227972202d6a80b2a5b0b236e4988b274e8ee8f7f948ff7bf225a3ff061e333d7a2d16c25a8ecd53c11f13299ea220c85656e051199b800dcf3d6c4a00'
    );
    expect(signed.origin).equal('0x' + signer.toString('hex'));
    expect(signed.id).equal('0x8b0c95930309aed68a24dc66dad23bdaed7c1a078eb9289126eb458a5ef5eee8');
    expect(signed.signingHash('0x' + signer.toString('hex')).toString('hex')).equal(
      '8b0c95930309aed68a24dc66dad23bdaed7c1a078eb9289126eb458a5ef5eee8'
    );
  });

  it('encode decode', () => {
    expect(signed.encode().toString('hex')).equal(signedEncoded.toString('hex'));
    expect(Transaction.decode(signedEncoded)).deep.equal(signed);

    expect(() => Transaction.decode(unsignedEncoded)).to.throw();
    expect(() => Transaction.decode(signedEncoded, true)).to.throw();
  });

  const incorrectlySigned = new Transaction(body);
  incorrectlySigned.signature = Buffer.from([1, 2, 3]);
  it('incorrectly signed', () => {
    expect(incorrectlySigned.origin).equal(null);
    expect(incorrectlySigned.id).equal(null);
  });

  const delegated = new Transaction({
    chainTag: 1,
    blockRef: '0x00000000aabbccdd',
    expiration: 32,
    clauses: [
      {
        to: '0x7567d83b7b8d80addcb281a71d54fc7b3364ffed',
        value: 10000,
        data: '0x000000606060',
        token: 0,
      },
      {
        to: '0x7567d83b7b8d80addcb281a71d54fc7b3364ffed',
        value: 20000,
        data: '0x000000606060',
        token: 0,
      },
    ],
    gasPriceCoef: 128,
    gas: 21000,
    dependsOn: null,
    nonce: 12345678,
    reserved: {
      features: 1,
    },
  });

  it('features', () => {
    expect(unsigned.delegated).equal(false);
    expect(delegated.delegated).equal(true);

    const priv1 = cry.secp256k1.generatePrivateKey();
    const priv2 = cry.secp256k1.generatePrivateKey();
    const addr1 = cry.publicKeyToAddress(cry.secp256k1.derivePublicKey(priv1));
    const addr2 = cry.publicKeyToAddress(cry.secp256k1.derivePublicKey(priv2));

    const hash = delegated.signingHash();
    const dhash = delegated.signingHash('0x' + addr1.toString('hex'));

    const sig = Buffer.concat([cry.secp256k1.sign(hash, priv1), cry.secp256k1.sign(dhash, priv2)]);

    delegated.signature = sig;

    expect(delegated.origin).equal('0x' + addr1.toString('hex'));
    expect(delegated.delegator).equal('0x' + addr2.toString('hex'));
  });
});
