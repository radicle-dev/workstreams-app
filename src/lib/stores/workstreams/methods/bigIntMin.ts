export default function (...args: bigint[]): bigint {
  if (args.length < 1) {
    throw 'Min of empty list';
  }
  let m = args[0];
  args.forEach((a) => {
    if (a < m) {
      m = a;
    }
  });
  return m;
}
