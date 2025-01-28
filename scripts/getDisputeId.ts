const { getDisputeId: getDisputeIdFn } = require('../utils/getDisputeId');

async function main() {
    const foreignProxy = process.argv[2];
    const questionId = process.argv[3];
    const rpcUrl = process.argv[4];

    if (!foreignProxy || !questionId || !rpcUrl) {
        console.error('Usage: yarn ts-node scripts/getDisputeId.ts <foreignProxy> <questionId> <rpcUrl>');
        process.exit(1);
    }

    try {
        console.log('Fetching dispute ID...');
        const disputeId = await getDisputeIdFn(foreignProxy, questionId, rpcUrl);
        console.log('Dispute ID:', disputeId);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit(0);
    }
}

main(); 