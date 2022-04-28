/// <reference types="@sveltejs/kit" />
interface Window {
  ethereum: {
    isMetaMask?: boolean;
    isStatus?: boolean;
    host?: string;
    path?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    on?: any;
    sendAsync?: (
      request: { method: string; params?: Array<unknown> },
      callback: (error: unknnown, response: unknnown) => void
    ) => void;
    send?: (
      request: { method: string; params?: Array<unknown> },
      callback: (error: unknnown, response: unknnown) => void
    ) => void;
    request?: (request: {
      method: string;
      params?: Array<unknown>;
    }) => Promise<unknnown>;
  };
}
