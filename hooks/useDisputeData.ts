import { useState, useEffect } from "react";
import { Question, Evidence } from "@/types/questions";
import { Chain } from "@/constants/chains";
import { BRIDGES } from "@/constants/bridges";
import { getDisputeId } from "@/utils/getDisputeId";
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

      setDisputeLoading(true);
      try {
        // Find the bridge that matches both the arbitrator (Home Proxy) address and the Home Chain
        const bridge = BRIDGES.find(
          (b) =>
            b["Home Chain"] === selectedChain.name &&
            b["Home Proxy"]?.toLowerCase() ===
              question.arbitrator?.toLowerCase()
        );

        if (!bridge || !bridge["Foreign Proxy"]) {
          console.warn("No matching bridge found or no Foreign Proxy", bridge);
          return;
        }

        // Get dispute ID from question data
        const id = await getDisputeId(
          bridge["Foreign Proxy"],
          question.id,
          "https://rpc.ankr.com/eth"
        );
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

            const response = await fetch(
              "https://gateway.thegraph.com/api/73380b22a17017c081123ec9c0e34677/subgraphs/id/Edg8H3AioJtYaih5PtfJhRNaERS6bU1XMn9dfPjEr5ao",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ query: disputeQuery }),
              }
            );

            const { data } = await response.json();

            if (data?.dispute) {
              setDispute(data.dispute);
              setEvidence(data.dispute.evidenceGroup?.evidence || []);

              const metaEvidenceResponse = await fetch(
                `https://kleros-api.netlify.app/.netlify/functions/get-dispute-metaevidence?chainId=1&disputeId=${id}`
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
