import { getDisputeId } from '@/utils/getDisputeId';

describe('getDisputeId', () => {
  it('should fetch dispute ID for a known question', async () => {
    const foreignProxy = '0xfe0eb5fc686f929eb26d541d75bb59f816c0aa68';
    const questionId = '0xebe2fa691eda0ceb13b86c9115a94b94e6fd25460bf349b77dad4996c23752e8';
    const rpcUrl = 'https://rpc.ankr.com/eth';

    const result = await getDisputeId(foreignProxy, questionId, rpcUrl);
    console.log('Dispute ID:', result);
    
    expect(result).not.toBeNull();
  });
}); 