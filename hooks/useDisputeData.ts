import { useState, useEffect } from "react";
import { Question, Evidence } from "@/types/questions";
import { Chain, SUPPORTED_CHAINS } from "@/constants/chains";
import { BRIDGES } from "@/constants/bridges";
import { getDisputeId } from "@/utils/getDisputeId";
import { getDisputeIdNative } from "@/utils/getDisputeIdNative";

import { Dispute } from "@/types/disputes";

export const useDisputeData = (question: Question, selectedChain: Chain) => {
  const [disputeId, setDisputeId] = useState<string | null>(null);
  const [dispute, setDispute] = useState<Dispute>();
  const [disputeLoading, setDisputeLoading] = useState(false);
  const [evidences, setEvidence] = useState<Evidence[]>([]);
  const [metaEvidence, setMetaEvidence] = useState<any>(null);

  useEffect(() => {
    const fetchDisputeData = async () => {
      if (!question || !selectedChain) {
        return;
      }
      console.log("selectedChain",selectedChain)
      setDisputeLoading(true);
      try {
        // Find the bridge that matches both the arbitrator (Home Proxy) address and the Home Chain
        const bridge = BRIDGES.find(
          (b) =>
            b["Home Chain"] === selectedChain.name &&
            b["Home Proxy"]?.toLowerCase() ===
              question.arbitrator?.toLowerCase()
        );
        console.log("Found Bridge: ", bridge);
        let id;

        if (!bridge?.["Foreign Proxy"]) {
          const rpcUrl = selectedChain.public_rpc_url;
          if (!rpcUrl) {
            console.warn("No RPC URL found for chain:", selectedChain.name);
            return;
          }
          id = await getDisputeIdNative(
            question.arbitrator,
            question.id,
            rpcUrl
          );
        } else if (bridge?.["Foreign Proxy"]) {
          // For foreign chain, find the matching chain from SUPPORTED_CHAINS
          const foreignChain = SUPPORTED_CHAINS.find(
            chain => chain.name === bridge["Foreign Chain"]
          );
          const rpcUrl = foreignChain?.public_rpc_url;
          if (!rpcUrl) {
            console.warn("No RPC URL found for Foreign Chain:", bridge["Foreign Chain"]);
            return;
          }
          id = await getDisputeId(bridge["Foreign Proxy"], question.id, rpcUrl);
        } else {
          console.warn("No matching bridge found or no Foreign Proxy", bridge);
          return;
        }

        console.log("Dispute ID: ", id);
        setDisputeId(id);

        if (id) {
          try {
            const disputeQuery = `{
              dispute(id: "${id}") {
                id
                period
                periodDeadline
                nbRounds
                nbChoices
                rounds {
                  jurors
                  isCurrentRound
                }
                lastPeriodChangeTs
                arbitrableHistory {
                  id
                  metaEvidence
                }
                arbitrated
                ruled
                ruling
                evidenceGroup {
                  id
                  length
                  dispute {
                    id
                  }
                  evidence {
                    id
                    URI
                    sender
                    creationTime
                  }
                }
              }
            }`;

            // Determine which chain to use for queries
            const queryChain = bridge?.["Foreign Chain"] && bridge["Foreign Chain"] !== "-" 
              ? bridge["Foreign Chain"] 
              : selectedChain.name;
            console.log("queryChain: ", queryChain);
            // Get chain-specific subgraph URL
            let subgraphUrl;
            switch (queryChain) {
              case "Gnosis":
                subgraphUrl =
                  "https://gateway.thegraph.com/api/73380b22a17017c081123ec9c0e34677/subgraphs/id/FxhLntVBELrZ4t1c2HNNvLWEYfBjpB8iKZiEymuFSPSr";
                break;
              case "Ethereum":
                subgraphUrl =
                  "https://gateway.thegraph.com/api/73380b22a17017c081123ec9c0e34677/subgraphs/id/Edg8H3AioJtYaih5PtfJhRNaERS6bU1XMn9dfPjEr5ao";
                break;
              default:
                console.warn("Unsupported chain for subgraph:", queryChain);
                return;
            }

            const response = await fetch(subgraphUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ query: disputeQuery }),
            });

            const { data } = await response.json();

            if (data?.dispute) {
              setDispute(data.dispute);
              setEvidence(data.dispute.evidenceGroup?.evidence || []);

              // Get chain-specific chainId
              let chainId;
              switch (queryChain) {
                case "Gnosis":
                  chainId = "100";
                  break;
                case "Ethereum":
                  chainId = "1";
                  break;
                default:
                  console.warn(
                    "Unsupported chain for meta evidence:",
                    queryChain
                  );
                  return;
              }

              const metaEvidenceResponse = await fetch(
                `https://kleros-api.netlify.app/.netlify/functions/get-dispute-metaevidence?chainId=${chainId}&disputeId=${id}`
              );
              const { metaEvidenceUri } = await metaEvidenceResponse.json();

              if (metaEvidenceUri) {
                const metaEvidenceData = await fetch(
                  `https://cdn.kleros.link${metaEvidenceUri}`
                );
                const metaEvidenceJson = await metaEvidenceData.json();
                setMetaEvidence(metaEvidenceJson);
              }
            }
          } catch (error) {
            console.error("Error fetching dispute data:", error);
          }
        }
      } catch (error) {
        console.error("Error fetching dispute data:", error);
      } finally {
        setDisputeLoading(false);
      }
    };

    fetchDisputeData();
  }, [question, selectedChain]);

  return {
    disputeId,
    dispute,
    disputeLoading,
    evidences,
    metaEvidence,
    arbitrableContractAddress: dispute?.arbitrated,
  };
};
