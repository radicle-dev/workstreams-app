import { bytes, CID, digest } from 'multiformats';

/**
 * Convert an IPFS CIDv0 to a reversibe base10 representation that can
 * fit into a uint256.
 *
 * @param cid The CID to convert.
 * @returns The Base 10 representation of the CID.
 */
export function cidToBase10(cid: CID): string {
  return BigInt('0x' + bytes.toHex(cid.multihash.digest)).toString(10);
}

/**
 * Convert a base10 representation of a CIDv0 back into a CIDv0.
 *
 * @param base10 The base10 representation to convert.
 * @returns The parsed CID.
 */
export function base10toCid(base10: string) {
  return CID.create(
    0,
    112,
    digest.create(18, bytes.fromHex(BigInt(base10).toString(16)))
  );
}
