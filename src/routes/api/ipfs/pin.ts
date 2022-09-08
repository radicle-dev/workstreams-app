import 'dotenv/config';

import type { RequestHandler } from '@sveltejs/kit';
import pinataSdk from '@pinata/sdk';
import getEnvVar from '$lib/utils/getEnvVar';

const pinata = pinataSdk(
  getEnvVar('PINATA_SDK_KEY'),
  getEnvVar('PINATA_SDK_SECRET')
);

export const POST: RequestHandler<{ data: string }, string> = async ({
  request
}) => {
  const res = await pinata.pinJSONToIPFS(await request.json(), {
    pinataOptions: {
      cidVersion: 0
    }
  });

  return {
    body: res.IpfsHash
  };
};
