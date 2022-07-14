import query from '$lib/api/drips-subgraph';
import { GET_DRIPS_ACCOUNT } from '$lib/api/drips-subgraph/queries';
import type {
  DripsAccount,
  DripsAccountVariables
} from '$lib/api/drips-subgraph/__generated__/DripsAccount';

export default async function (
  creator: string,
  accountId: bigint,
  chainId: number
) {
  return (
    await query<DripsAccount, DripsAccountVariables>({
      query: GET_DRIPS_ACCOUNT,
      variables: {
        id: `${creator}-${accountId}`
      },
      chainId
    })
  ).dripsAccount;
}
