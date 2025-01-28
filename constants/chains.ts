export interface Chain {
  id: string;
  name: string;
  subgraphUrl: string;
  public_rpc_url: string;
}

export const SUPPORTED_CHAINS: Chain[] = [
  {
    id: "ethereum",
    name: "Ethereum",
    subgraphUrl:
      "https://gateway-arbitrum.network.thegraph.com/api/73380b22a17017c081123ec9c0e34677/subgraphs/id/AGLkTv6eaW7JhQsLgB6SMzo43uM9V12ZoNkjAw7uijra",
    public_rpc_url: "https://rpc.ankr.com/eth",
  },
  {
    id: "gnosis",
    name: "Gnosis",
    subgraphUrl:
      "https://gateway-arbitrum.network.thegraph.com/api/73380b22a17017c081123ec9c0e34677/subgraphs/id/E7ymrCnNcQdAAgLbdFWzGE5mvr5Mb5T9VfT43FqA7bNh",
    public_rpc_url: "https://rpc.ankr.com/gnosis",
  },
  {
    id: "polygon",
    name: "Polygon",
    subgraphUrl:
      "https://gateway-arbitrum.network.thegraph.com/api/73380b22a17017c081123ec9c0e34677/subgraphs/id/AWx6jkeKZ3xKRzkrzgfCAMPT7d6Jc3AMcqB8koN3QEqE",
    public_rpc_url: "https://rpc.ankr.com/polygon",
  },
] as const;
