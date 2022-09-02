import 'dotenv/config';

import type { RequestHandler } from '@sveltejs/kit';
import pinataSdk from '@pinata/sdk';

const pinata = pinataSdk(
  process.env.PINATA_SDK_KEY,
  process.env.PINATA_SDK_SECRET
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
