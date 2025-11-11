export type Program = "Smiles" | "TudoAzul" | "LatamPass";

export const SOURCES: Array<{
  name: string;
  url: string;
  program: Program;
}> = [
  { name: "HotMilhas", url: "https://www.hotmilhas.com.br/", program: "Smiles" },
  { name: "MaxMilhas", url: "https://www.maxmilhas.com.br/", program: "LatamPass" },
  { name: "123Milhas", url: "https://www.123milhas.com/", program: "TudoAzul" },
  { name: "ComproMilhas", url: "https://www.compromilhas.com.br/", program: "Smiles" },
];
