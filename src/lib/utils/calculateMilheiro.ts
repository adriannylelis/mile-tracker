export function calculateMilheiro(price: number, miles: number): number {
  if (!miles || miles <= 0) return 0;
  return Number(((price / miles) * 1000).toFixed(2));
}

export default calculateMilheiro;
