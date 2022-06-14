export interface AwaitPendingPayload {
  promise: () => Promise<void>;
  message?: string;
}
