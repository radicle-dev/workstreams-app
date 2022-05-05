import type { DocumentNode } from 'graphql/language/ast';
import { print } from 'graphql/language/printer';

const graphUrl: { [chainId: number]: string } = {
  1: 'https://api.thegraph.com/subgraphs/name/gh0stwheel/drips-on-ethereum',
  4: 'https://api.thegraph.com/subgraphs/name/gh0stwheel/drips-on-rinkeby'
};

async function query<QT, VT>({
  query,
  chainId,
  variables
}: {
  query: DocumentNode;
  chainId: number;
  variables: VT;
}): Promise<QT> {
  const url = graphUrl[chainId];

  if (!url) throw new Error('Unsupported network!');

  const result = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: print(query), variables })
  });

  const data = await result.json();

  return data.data as QT;
}

export default query;
