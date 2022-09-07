<script lang="ts">
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  import { createIcon } from 'radicle-design-system/lib/blockies.ts';
  import convertRemToPixels from '$lib/utils/remToPx';
  import ensNames from '$lib/stores/ensNames';

  export let address: string;
  export let rem = 1.5;

  $: px = convertRemToPixels(rem);

  $: blockyUrl =
    address &&
    createIcon({
      seed: address.toLowerCase(),
      size: 8,
      scale: 16
    }).toDataURL();

  $: url = $ensNames[address]?.pic ?? blockyUrl;
</script>

<img
  width={px}
  height={px}
  style={`border-radius: ${rem / 2}rem`}
  class="avatar"
  alt="user-avatar"
  src={url}
/>
