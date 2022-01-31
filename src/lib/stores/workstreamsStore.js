import { writable } from 'svelte/store';

export const workstreams = writable([]);

workstreams.set([
  {
    id: 0,
    type: "grant",
    workstream_state: "rfp",
    creator: "0x5d68cF61C1Fa28A538da2979D3bD377FaD9607b6",
    created_at: 1641458535,
    starting_at: 1641460000,
    ending_at: 1641500000,
    payment_rate:  0.008,
    payment_currency: "DAI",
    receivers: [],
    title: "Org Naming Flow for Radicle Upstream",
    desc: `
## Project Overview 📄

Note: This is an application for retroactive funding.

### Overview

This project adds the ability to register and edit ENS names for orgs on 'upstream', allowing users to link rich identities with org names, URLs, avatars & social profiles to orgs, and displays said metadata within the interface.

![Mockup](https://user-images.githubusercontent.com/1018218/126983865-f24e17e6-4bec-4330-a513-ab9207fb6586.png)

Triggered by a click on "Register name" on the org screen, a new flow appears and guides the user through entering and registering a name, linking it to the org, and setting metadata such as GitHub profile link & logo URL.

The project scope includes UX & UI Design of the flow and implementation on the radicle upstream client.

### Project Details

- Pre-development flow step mockups can be found in the [upstream Figma file](https://www.figma.com/file/owmgsbs6lnUt8R1bixstCA/Radicle-Upstream?node-id=9755%3A169401).
- ENS registrar interaction logic is based on existing implementation in ['radicle-interface'](https://github.com/radicle-dev/radicle-interface/tree/master/src/base/registrations).

### Ecosystem Fit

Previously, while radicle orgs did appear on upstream, registering & linking names was possible only through the 'radicle-interface' client. Additionally, orgs appeared with placeholder logos & only their address, even if a name was already linked. Being able to create and link names right from within 'upstream', as well as displaying rich metadata for orgs makes the Radicle Orgs feature vastly more accessible within the upstream client.
    `,
    dripshub_account: 0,
    applications: [
      {
        title: "application for grant x by Julien",
        proposal_id: 0,
        desc: "I think you should choose me cause I'm **awesome**! Some more text so that it's longer then 1 line.",
        creator: "0x0Baf8fDF6f68737476Ba13CDB3781B29fe71F471",
        recipients: ["0x0Baf8fDF6f68737476Ba13CDB3781B29fe71F471"],
        payment_rate: 0.005,
        currency: "DAI",
        created_at: 1641458535,
        ending_at: 1641500000,
        workstream_id: 0,
        state: "pending"
      },
      {
        title: "application for grant x by Damon",
        proposal_id: 0,
        desc: "Dude, I have all the experience. Pick me.",
        creator: "0x5d68cF61C1Fa28A538da2979D3bD377FaD9607b6",
        recipients: ["0x5d68cF61C1Fa28A538da2979D3bD377FaD9607b6"],
        payment_rate: 0.006,
        currency: "DAI",
        created_at: 1641458535,
        ending_at: 1641500000,
        workstream_id: 0,
        state: "pending"
      },
    ],
  }
]
)



