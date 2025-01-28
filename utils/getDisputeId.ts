import { ethers } from "ethers";

export async function getDisputeId(
  foreignProxy: string,
  questionId: string,
  rpcUrl: string
): Promise<string | null> {
  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const iface = new ethers.Interface([
      "event ArbitrationCreated(bytes32 indexed _questionID, address indexed _requester, uint256 indexed _disputeID)",
    ]);

    const questionIdPadded = ethers.zeroPadValue(questionId.toLowerCase(), 32);
    console.log("Looking for logs with:");
    console.log("Address:", foreignProxy);
    console.log("QuestionID:", questionIdPadded);
    console.log(rpcUrl);
    const filter = {
      address: foreignProxy,
      topics: [
        ethers.id("ArbitrationCreated(bytes32,address,uint256)"),
        questionIdPadded,
      ],
      fromBlock: 0,
      toBlock: "latest",
    };

    const logs = await provider.getLogs(filter);
    console.log("Found logs:", logs);
    if (logs.length === 0) {
      console.log("No logs found for this question ID");
      return null;
    }

    const parsedLog = iface.parseLog(logs[0]);
    if (!parsedLog) return null;

    const disputeID = parsedLog.args.toObject()["_disputeID"];
    return disputeID.toString();
  } catch (error) {
    console.error("Error getting dispute ID:", error);
    return null;
  }
}
