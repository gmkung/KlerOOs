import { ethers } from "ethers";

export async function getDisputeIdNative(
  homeProxy: string,
  questionId: string,
  rpcUrl: string
): Promise<string | null> {
  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const iface = new ethers.Interface([
      "event DisputeIDToQuestionID(uint256 indexed _disputeID, bytes32 indexed _questionID)",
    ]);

    const questionIdPadded = ethers.zeroPadValue(questionId.toLowerCase(), 32);

    console.log("Looking for logs with:");
    console.log("Address:", homeProxy);
    console.log("QuestionID:", questionIdPadded);

    const filter = {
      address: homeProxy,
      topics: [ethers.id("DisputeIDToQuestionID(uint256,bytes32)")],
      fromBlock: 0,
      toBlock: "latest",
    };
    console.log(
      "Event Hash:",
      ethers.id("DisputeIDToQuestionID(uint256,bytes32)")
    );
    console.log("Filter:", filter);

    const latestBlock = await provider.getBlockNumber();
    console.log("Searching from block 0 to", latestBlock);

    const logs = await provider.getLogs(filter);
    const matchingLogs = logs.filter((log) => {
      console.log("Log data:", log.data);
      return log.data
        .toLowerCase()
        .includes(questionIdPadded.slice(2).toLowerCase());
    });

    if (matchingLogs.length === 0) {
      console.log("Trying without questionId filter...");
      const broadFilter = {
        address: homeProxy,
        topics: [ethers.id("DisputeIDToQuestionID(uint256,bytes32)")],
        fromBlock: 0,
        toBlock: "latest",
      };
      const allLogs = await provider.getLogs(broadFilter);
      console.log("Total events found:", allLogs);
      if (allLogs.length > 0) {
        console.log("Sample event:", allLogs[0]);
      }
    }

    if (matchingLogs.length === 0) {
      console.log("No logs found for this question ID");
      return null;
    }

    const disputeID = Number(matchingLogs[0].topics[1]);
    return disputeID.toString();
  } catch (error) {
    console.error("Error getting dispute ID:", error);
    return null;
  }
}
