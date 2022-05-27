import query from '$lib/api';
import { GET_DRIPS_ACCOUNT } from '$lib/api/queries';
import type {
  DripsAccount,
  DripsAccountVariables
} from '$lib/api/__generated__/DripsAccount';

export default async function (
  creator: string,
  accountId: number,
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
