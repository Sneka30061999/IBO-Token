import { createPublicClient, fallback, http, formatUnits, parseAbi, getAddress } from "viem";
import { bsc } from "viem/chains";
import { tokenConfig, isAddress } from "../config/token";

const transport = fallback(tokenConfig.rpcUrls.map((u) => http(u, { timeout: 12_000, retryCount: 1 })));

export const client = createPublicClient({ chain: bsc, transport });

const erc20 = parseAbi([
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
]);

const pairAbi = parseAbi([
  "function token0() view returns (address)",
  "function token1() view returns (address)",
  "function getReserves() view returns (uint112,uint112,uint32)",
]);

export interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: number;
  chainId: number;
  supplyMismatch: boolean;
}

export async function fetchTokenInfo(): Promise<TokenInfo> {
  const address = tokenConfig.contractAddress;
  if (!isAddress(address)) throw new Error("Token contract address is not configured.");

  const chainId = await client.getChainId();
  if (chainId !== tokenConfig.chainId) throw new Error(`Wrong network (chain ${chainId}).`);

  const [name, symbol, decimals, supply] = await Promise.all([
    client.readContract({ address, abi: erc20, functionName: "name" }),
    client.readContract({ address, abi: erc20, functionName: "symbol" }),
    client.readContract({ address, abi: erc20, functionName: "decimals" }),
    client.readContract({ address, abi: erc20, functionName: "totalSupply" }),
  ]);
  const totalSupply = Number(formatUnits(supply, decimals));
  return {
    name,
    symbol,
    decimals,
    totalSupply,
    chainId,
    supplyMismatch: Math.abs(totalSupply - tokenConfig.expectedTotalSupply) > 0.5,
  };
}

export interface BurnStats {
  /** Balance held at recognised dead addresses (not necessarily removed from totalSupply). */
  deadAddressBalance: number;
  /** Balance held by the configured annual burn wallet, if one is set. */
  annualWalletBalance: number | null;
  /** Supply reduction implied by totalSupply() vs expected supply (contract-level burn). */
  supplyReduction: number;
  decimals: number;
}

export async function fetchBurnStats(): Promise<BurnStats> {
  const address = tokenConfig.contractAddress;
  if (!isAddress(address)) throw new Error("Token contract address is not configured.");

  const decimals = await client.readContract({ address, abi: erc20, functionName: "decimals" });
  const supply = await client.readContract({ address, abi: erc20, functionName: "totalSupply" });

  const deadBalances = await Promise.all(
    tokenConfig.deadAddresses.map((a) =>
      client.readContract({ address, abi: erc20, functionName: "balanceOf", args: [getAddress(a)] }),
    ),
  );
  const dead = deadBalances.reduce((s, b) => s + b, 0n);

  let annualWalletBalance: number | null = null;
  if (isAddress(tokenConfig.annualBurnAddress)) {
    const b = await client.readContract({
      address,
      abi: erc20,
      functionName: "balanceOf",
      args: [tokenConfig.annualBurnAddress],
    });
    annualWalletBalance = Number(formatUnits(b, decimals));
  }

  return {
    deadAddressBalance: Number(formatUnits(dead, decimals)),
    annualWalletBalance,
    supplyReduction: Math.max(0, tokenConfig.expectedTotalSupply - Number(formatUnits(supply, decimals))),
    decimals,
  };
}

export interface PoolInfo {
  address: string;
  pairedSymbol: string;
  pairedAddress: string;
  iboReserve: number;
  pairedReserve: number;
}

export async function fetchPool(): Promise<PoolInfo | null> {
  const pair = tokenConfig.dexPairAddress;
  const token = tokenConfig.contractAddress;
  if (!isAddress(pair) || !isAddress(token)) return null;

  const [t0, t1, reserves] = await Promise.all([
    client.readContract({ address: pair, abi: pairAbi, functionName: "token0" }),
    client.readContract({ address: pair, abi: pairAbi, functionName: "token1" }),
    client.readContract({ address: pair, abi: pairAbi, functionName: "getReserves" }),
  ]);
  const iboIs0 = t0.toLowerCase() === token.toLowerCase();
  if (!iboIs0 && t1.toLowerCase() !== token.toLowerCase()) {
    throw new Error("Configured pair does not contain the IBO token.");
  }
  const pairedAddress = iboIs0 ? t1 : t0;
  const [pSym, pDec, iboDec] = await Promise.all([
    client.readContract({ address: pairedAddress, abi: erc20, functionName: "symbol" }),
    client.readContract({ address: pairedAddress, abi: erc20, functionName: "decimals" }),
    client.readContract({ address: token, abi: erc20, functionName: "decimals" }),
  ]);
  const iboRaw = iboIs0 ? reserves[0] : reserves[1];
  const pRaw = iboIs0 ? reserves[1] : reserves[0];
  return {
    address: pair,
    pairedSymbol: pSym,
    pairedAddress,
    iboReserve: Number(formatUnits(iboRaw, iboDec)),
    pairedReserve: Number(formatUnits(pRaw, pDec)),
  };
}
