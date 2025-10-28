import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(process.cwd(), "../fhevm-hardhat-template");
const OUT = path.resolve("./src/abi");
const CONTRACTS = [
  "LyricsRegistry",
  "CollaborationManager",
  "VoteContract",
  "LyricsNFT",
  "RevenueSplit",
  "LikeRegistry"
];

if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

function readDeployment(chain, name) {
  const dir = path.join(ROOT, "deployments", chain);
  if (!fs.existsSync(dir)) return null;
  const file = path.join(dir, `${name}.json`);
  if (!fs.existsSync(file)) return null;
  const json = JSON.parse(fs.readFileSync(file, "utf-8"));
  return json;
}

const localhost = CONTRACTS.map((c) => readDeployment("localhost", c));
const sepolia = CONTRACTS.map((c) => readDeployment("sepolia", c));

for (let i = 0; i < CONTRACTS.length; i++) {
  const name = CONTRACTS[i];
  const depLocal = localhost[i];
  const depSep = sepolia[i];
  if (!depLocal) {
    console.error(`Missing localhost deployment for ${name}`);
    process.exit(1);
  }
  const abiTs = `export const ${name}ABI = ${JSON.stringify({ abi: depLocal.abi }, null, 2)} as const;\n`;
  const addrTs = `export const ${name}Addresses = {\n  "11155111": { address: "${depSep?.address ?? "0x0000000000000000000000000000000000000000"}", chainId: 11155111, chainName: "sepolia" },\n  "31337": { address: "${depLocal.address}", chainId: 31337, chainName: "hardhat" },\n};\n`;
  fs.writeFileSync(path.join(OUT, `${name}ABI.ts`), abiTs, "utf-8");
  fs.writeFileSync(path.join(OUT, `${name}Addresses.ts`), addrTs, "utf-8");
  console.log(`Generated ${name} ABI & addresses`);
}



