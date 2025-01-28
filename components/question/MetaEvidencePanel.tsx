import { Box, Typography, Button, Divider } from '@mui/material';

interface MetaEvidencePanelProps {
    metaEvidence: {
        title: string;
        description: string;
        question: string;
        fileURI?: string;
        evidenceDisplayInterfaceURI?: string;
        arbitrableChainID: string;
    };
    disputeId?: string;
    arbitrableContractAddress?: string;
}

export const MetaEvidencePanel: React.FC<MetaEvidencePanelProps> = ({ 
    metaEvidence, 
    disputeId,
    arbitrableContractAddress 
}) => {
    if (!metaEvidence) return null;

    const getRpcUrl = (chainId: string) => {
        switch (chainId) {
            case "100":
                return "https://rpc.ankr.com/gnosis";
            case "1":
                return "https://rpc.ankr.com/eth";
            case "137":
                return "https://rpc.ankr.com/polygon";
            default:
                return "https://rpc.ankr.com/eth"; // fallback to ETH mainnet
        }
    };

    const evidenceDisplayUrl = metaEvidence.evidenceDisplayInterfaceURI && disputeId ? 
        `https://cdn.kleros.link${metaEvidence.evidenceDisplayInterfaceURI}?` + new URLSearchParams({
            disputeID: disputeId,
            arbitrableChainID: metaEvidence.arbitrableChainID,
            arbitrableJsonRpcUrl: getRpcUrl(metaEvidence.arbitrableChainID),
            arbitrableContractAddress: arbitrableContractAddress || '',
            arbitratorContractAddress: '0x988b3A538b618C7A603e1c11Ab82Cd16dbE28069',
            arbitratorJsonRpcUrl: 'https://mainnet.infura.io/v3/54fb3d87cd07464591ad2be29a1db32f',
            arbitratorChainID: '1'
        }).toString()
        : null;

    return (
        <Box mb={3}>
            <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    {metaEvidence.title}
                </Typography>
                <Typography variant="body2" paragraph>
                    {metaEvidence.description}
                </Typography>
                <Typography variant="body2" paragraph>
                    <strong>Question: </strong>{metaEvidence.question}
                </Typography>
                {evidenceDisplayUrl && (
                    <Box sx={{ mt: 2, height: '500px' }}>
                        <iframe 
                            src={evidenceDisplayUrl}
                            style={{
                                width: '100%',
                                height: '100%',
                                border: 'none',
                                borderRadius: '4px'
                            }}
                            title="Evidence Display Interface"
                        />
                    </Box>
                )}
                {metaEvidence.fileURI && (
                    <Button
                        variant="text"
                        component="a"
                        href={`https://ipfs.kleros.io${metaEvidence.fileURI}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ mt: 1 }}
                    >
                        View Resolution Policy
                    </Button>
                )}
            </Box>
            <Divider sx={{ my: 3 }} />
        </Box>
    );
}; 