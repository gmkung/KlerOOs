import React, { useState } from 'react';
import { Box, Typography, Button, Divider, Modal, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

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
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

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
        }).toString() : undefined;

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
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    {evidenceDisplayUrl && (
                        <Button variant="contained" color="primary" onClick={handleOpen}>
                            View Primary Evidence
                        </Button>
                    )}
                    {metaEvidence.fileURI && (
                        <Button
                            variant="contained"
                            component="a"
                            color='primary'
                            href={`https://ipfs.kleros.io${metaEvidence.fileURI}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            View Resolution Policy
                        </Button>
                    )}
                </Box>
                <Modal
                    open={open}
                    onClose={handleClose}
                    aria-labelledby="evidence-modal-title"
                    aria-describedby="evidence-modal-description"
                >
                    <Box
                        sx={{
                            position: 'absolute' as const,
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '80%',
                            height: '80%',
                            bgcolor: 'background.paper',
                            boxShadow: 24,
                            p: 2,
                            outline: 'none',
                            borderRadius: '8px',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <IconButton onClick={handleClose}>
                                <CloseIcon />
                            </IconButton>
                        </Box>
                        <Box sx={{ flexGrow: 1 }}>
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
                    </Box>
                </Modal>
            </Box>
            <Divider sx={{ my: 3 }} />
        </Box>
    );
}; 