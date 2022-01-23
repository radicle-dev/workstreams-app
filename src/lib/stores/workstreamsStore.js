import { writable } from 'svelte/store';

export const workstreams = writable([]);

workstreams.set([
  {
    timeframe: 1641458535,
    currency: 'DAI',
    title: 'Rinkeby faucet',
    desc: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Repellendus et culpa necessitatibus numquam, doloremque nam corrupti eveniet officiis eum ipsa impedit aliquid illo magnam iste consectetur fuga, vel dolor adipisci!',
    owner: '0x061294782b7c73a675cf54124853c8133e3463fc',
    type: 'grant',
    rate: 1.1,
  },
  {
    timeframe: 1641458535,
    currency: 'DAI',
    title: 'Stream 2',
    desc: 'Doloremque nam corrupti eveniet officiis eum ipsa impedit aliquid illo magnam iste consectetur fuga, vel dolor adipisci!',
    owner: '0x0Baf8fDF6f68737476Ba13CDB3781B29fe71F471',
    type: 'role',
    rate: 2,
  },
  {
    timeframe: 1641458535,
    currency: 'DAI',
    title: 'Stream 3',
    desc: 'Lorem ipsum dolor',
    owner: '0x0Baf8fDF6f68737476Ba13CDB3781B29fe71F471',
    type: 'role',
    rate: 2,
  },
  {
    timeframe: 1641458535,
    currency: 'DAI',
    title: 'Rinkeby faucet 4',
    desc: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Repellendus et culpa necessitatibus numquam, doloremque nam corrupti eveniet officiis eum ipsa impedit aliquid illo magnam iste consectetur fuga, vel dolor adipisci!',
    owner: '0x061294782b7c73a675cf54124853c8133e3463fc',
    type: 'grant',
    rate: 1.1,
  },
  {
    timeframe: 1641458535,
    currency: 'DAI',
    title: 'other stream 5',
    desc: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Repellendus et culpa necessitatibus numquam, doloremque nam corrupti eveniet officiis eum ipsa impedit aliquid illo magnam iste consectetur fuga, vel dolor adipisci!',
    owner: '0x0Baf8fDF6f68737476Ba13CDB3781B29fe71F471',
    type: 'role',
    rate: 2,
  },
  {
    timeframe: 1641458535,
    currency: 'DAI',
    title: 'other stream 6',
    desc: '',
    owner: '0x061294782b7c73a675cf54124853c8133e3463fc',
    type: 'role',
    rate: 2,
  }]
)
