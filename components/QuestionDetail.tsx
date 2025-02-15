import { FC, useState } from 'react';
import {
    Paper,
    Box,
    Divider,
    Button,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Typography
} from '@mui/material';

import { Question } from '@/types/questions';
import { EvidencePanel } from './EvidencePanel';
import { ActionPanel } from './ActionPanel';
import { VoteModal } from './VoteModal';
import { type Chain } from '@/constants/chains';
import { DisputeDetails } from './DisputeDetails';
import { QuestionHeader } from './question/QuestionHeader';
import { AnswerHistory } from './question/AnswerHistory';
import { MetaEvidencePanel } from './question/MetaEvidencePanel';
import { useDisputeData } from '@/hooks/useDisputeData';


interface QuestionDetailProps {
    question: Question;
    userAddress?: string;
    isConnected: boolean;
    onBack: () => void;
    selectedChain: Chain;
}

interface Evidence {
    URI: string;
    URI_contents: {
        name: string;
        description: string;
    };
    creationTime: string;
    id: string;
    sender: string;
}

export const QuestionDetail: FC<QuestionDetailProps> = ({
    question,
    isConnected,
    userAddress,
    onBack,
    selectedChain
}) => {
    const {
        dispute,
        disputeLoading,
        evidences,
        metaEvidence
    } = useDisputeData(question, selectedChain);

    const [isVoteModalOpen, setIsVoteModalOpen] = useState(false);
    const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
    const [newEvidence, setNewEvidence] = useState<Partial<Evidence['URI_contents']>>({
        name: '',
        description: ''
    });

    const handleVoteClick = () => {
        setIsVoteModalOpen(true);
    };

    const handleCloseVoteModal = () => {
        setIsVoteModalOpen(false);
    };

    const handleEvidenceSubmit = () => {
        // TODO: Implement actual submission logic
        console.log('Submitting evidence:', newEvidence);
        setIsEvidenceModalOpen(false);
        setNewEvidence({ name: '', description: '' });
    };

    const handleEvidenceModalClose = () => {
        setIsEvidenceModalOpen(false);
        setNewEvidence({ name: '', description: '' });
    };

    return (
        <Paper
            elevation={2}
            sx={{
                width: {
                    xs: '100%',  // Full width on mobile
                    md: '120%'   // Original width on desktop
                },
                mx: 'auto',
                transform: {
                    xs: 'none',  // No transform on mobile
                    md: 'translateX(-10%)'  // Original transform on desktop
                }
            }}
        >
            <Box
                p={2}
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: { xs: 2, md: 3 }
                }}
            >
                <Box
                    sx={{
                        width: dispute ? '40%' : '100%',  // 40% when dispute exists, full width otherwise
                        minWidth: dispute ? '40%' : 'auto',
                        flexShrink: 0,
                    }}
                >
                    <QuestionHeader
                        title={question.title}
                        description={question.description}
                        options={question.options}
                        onBack={onBack}
                    />
                    <Box sx={{
                        mt: 1,
                        mb: 2,
                        display: 'flex',
                        gap: 2,
                        flexWrap: 'wrap',
                        color: 'text.secondary',
                        fontSize: '0.875rem'
                    }}>
                        <Typography component="span">
                            Question ID: {question.id}
                        </Typography>
                        {dispute && (
                            <Typography component="span">
                                Dispute ID: {dispute.id}
                            </Typography>
                        )}
                    </Box>
                    <ActionPanel
                        question={question}
                        isConnected={isConnected}
                    />
                    <Divider sx={{ my: 3 }} />
                    <AnswerHistory
                        responses={question.responses}
                        qType={question.qType}
                        options={question.options}
                    />
                </Box>

                {dispute && (
                    <Box sx={{
                        width: '60%',  // Fixed 4:6 ratio
                        minWidth: '60%',
                        flexShrink: 0,
                        bgcolor: 'background.paper',
                        borderRadius: 1,
                        boxShadow: 1,
                        overflow: 'hidden'
                    }}>
                        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                            <Typography variant="h6" gutterBottom>
                                Dispute Information
                            </Typography>
                        </Box>

                        <MetaEvidencePanel
                            metaEvidence={metaEvidence}
                            disputeId={dispute?.id}
                            arbitrableContractAddress={dispute?.arbitrated}
                        />
                        <Divider />
                        <DisputeDetails dispute={dispute} loading={disputeLoading} />
                        <Divider />

                        <Box display="flex" justifyContent="center" p={3} bgcolor="background.default">
                            <Tooltip title={isConnected ? "Your address is eligible to vote" : "Please connect your wallet to vote"}>
                                <span>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={handleVoteClick}
                                        disabled={!isConnected}
                                        sx={{ minWidth: 200 }}
                                    >
                                        Cast Your Vote
                                    </Button>
                                </span>
                            </Tooltip>
                        </Box>

                        <Divider />
                        <EvidencePanel
                            evidences={evidences}
                            canSubmit={isConnected}
                            onSubmitClick={() => setIsEvidenceModalOpen(true)}
                        />
                    </Box>
                )}
            </Box>

            <VoteModal
                open={isVoteModalOpen}
                onClose={handleCloseVoteModal}
                questionId={question.id}
                userAddress={userAddress}
            />
            <Dialog
                open={isEvidenceModalOpen}
                onClose={handleEvidenceModalClose}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Submit New Evidence</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="Evidence Title"
                            fullWidth
                            value={newEvidence.name}
                            onChange={(e) => setNewEvidence(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g., Initial Challenge: Vote Count Discrepancy"
                        />
                        <TextField
                            label="Evidence Description"
                            fullWidth
                            multiline
                            rows={4}
                            value={newEvidence.description}
                            onChange={(e) => setNewEvidence(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Provide a detailed description of your evidence..."
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleEvidenceModalClose} color="inherit">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleEvidenceSubmit}
                        variant="contained"
                        color="primary"
                        disabled={!newEvidence.name || !newEvidence.description}
                    >
                        Submit Evidence
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
}; 