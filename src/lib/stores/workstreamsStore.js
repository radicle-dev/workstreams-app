import { writable } from 'svelte/store';

export const workstreams = writable([]);

workstreams.set([
  {
    created_at: 1641458535,
    title: 'Org Naming Flow for Radicle Upstream',
    type: 'grant',
    owner: '0x5d68cF61C1Fa28A538da2979D3bD377FaD9607b6',
    desc: `
- **Team Name:** Georgios Jason Efstathiou
- **Payment Address:** '0x5d68cF61C1Fa28A538da2979D3bD377FaD9607b6'
- **Level:** 🌱 Seed Grant (Level 1)

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

## Team

### Team members

- Name of team leader: Georgios Jason Efstathiou
- Names of team members: N/A

### Contact

- **Contact Name:** Georgios Jason Efstathiou
- **Contact Email:** j@jason-e.dev
- **Website:** https://jason-e.dev/

### Legal Structure

- **Registered Address:** N/A
- **Registered Legal Entity:** N/A

### Team's experience

I'm a Product Director at Grover in Berlin and software engineer with a background in UI/UX Design. You can check my CV on LinkedIn below or read about a few selected projects on my personal website (check "Contact" section above).

### Team Code Repos

- https://github.com/efstajas

### Team LinkedIn Profiles (if available)

- https://www.linkedin.com/in/jason-efstathiou/

## Development Status 📖

At the end of the project, I opened this PR:
https://github.com/radicle-dev/radicle-upstream/pull/2180

My work was then integrated into the PR below, which has been merged to the main codebase:
https://github.com/radicle-dev/radicle-upstream/pull/2191

## Development Roadmap 🔩

### Flows & Usecases

- [x] Support registering a new ENS record for an org.
- [x] Support linking an ENS record to an org.
- [x] Support updating an existing ENS record for an org.
- [x] Display ENS metadata across the client UI (org logos & names).

### Edge cases to handle
- [x] If the user enters an already-registered ENS name (that they own), the flow skips the registration part and moves on straight to linking the name with the org.
- [x] Display an error if the entered name is already registered by someone else.
- [x] Display a warning if the entered name is currently already pointing to a different org.
- [x] After linking a name to a different org than before, ensure that the other org shows up without a name afterward.
- [x] Fetch registration and allow updating metadata when entering a name that has already been registered by the user previously.
- [x] Skip the organization link step when the organization is already linked to the entered name.

### Behind the scenes
- [x] Develop ENS registrar logic based on implementation in ['radicle-interface'](https://github.com/radicle-dev/radicle-interface/tree/master/src/base/registrations)

### Overview

- **Total Estimated Duration:** 4 days
- **Full-Time Equivalent (FTE):**  1 FTE
- **Total Costs:** 2000 Euros (to be converted to USDC stable coin at the rate when the PR was completed or today's price, which is higher)

### Milestone 1: Org naming for upstream

| Number      | Deliverable     | Specification   |
| ----------- | -----------     | --------------- |
| 1           | Org naming flow | Design & implementation of user flow that allows 1) registering an ENS name, 2) linking said name to an org, 3) updating the record with metadata such as logo URL.|
| 2           | Displaying ENS record metadata on Upstream | An implementation that fetches ENS records for orgs associated with the user in order to display logo images & org names within the upstream client (currently represented by placeholder images). |

## Future Plans

N/A

## Additional Information ➕

**How did you hear about the Grants Program?** Personal recommendation
    `,
    timeframe: 38,
    start_date: null,
    currency: 'DAI',
    rate: 0.008,
  },
  {
    created_at: 1641458535,
    title: 'Stream 2',
    type: 'role',
    owner: '0x151ef20a3ade1cc1161391594f8a32461389a54e',
    desc: 'Doloremque nam corrupti eveniet officiis eum ipsa impedit aliquid illo magnam iste consectetur fuga, vel dolor adipisci!',
    timeframe: null,
    start_date: 1641458535,
    currency: 'DAI',
    rate: 0.0065,
  },
  {
    created_at: 1641458535,
    title: 'Stream 3',
    type: 'grant',
    owner: '0x0Baf8fDF6f68737476Ba13CDB3781B29fe71F471',
    desc: 'Lorem ipsum dolor',
    timeframe: 6,
    start_date: null,
    currency: 'DAI',
    rate: 0.0065,
  },
  {
    created_at: 1641458535,
    title: 'Rinkeby faucet 4',
    type: 'grant',
    owner: '0x061294782b7c73a675cf54124853c8133e3463fc',
    desc: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Repellendus et culpa necessitatibus numquam, doloremque nam corrupti eveniet officiis eum ipsa impedit aliquid illo magnam iste consectetur fuga, vel dolor adipisci!',
    timeframe: 28,
    start_date: null,
    currency: 'DAI',
    rate: 0.008,
  },
  {
    created_at: 1641458535,
    title: 'other stream 5',
    type: 'grant',
    owner: '0x151ef20a3ade1cc1161391594f8a32461389a54e',
    desc: 'Repellendus et culpa necessitatibus numquam, doloremque nam corrupti eveniet officiis eum ipsa impedit aliquid illo magnam iste consectetur fuga, vel dolor adipisci!',
    timeframe: 21,
    start_date: null,
    currency: 'DAI',
    rate: 0.0065,
  },
  {
    created_at: 1641458535,
    title: 'other stream 6',
    type: 'role',
    owner: '0x061294782b7c73a675cf54124853c8133e3463fc',
    desc: 'A grant about something new',
    timeframe: null,
    start_date: 1641458535,
    currency: 'DAI',
    rate: 0.0065,
  }]
)
