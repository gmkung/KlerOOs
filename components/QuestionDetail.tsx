import { FC, useState } from 'react';
import {
    Paper,
    Typography,
    Box,
    Divider,
    IconButton,
    Stack,
    LinearProgress,
    Chip,
    Button,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Question, QuestionPhase, Answer } from '@/types/questions';
import { EvidencePanel } from './EvidencePanel';
import { ActionPanel } from './ActionPanel';
import { formatUnits } from 'ethers/lib/utils';
import { VoteModal } from './VoteModal';
import { formatDistanceToNow } from 'date-fns';
import { mockEvidence } from '@/mocks/evidence';

interface QuestionDetailProps {
    question: Question;
    userAddress?: string;
    isConnected: boolean;
    onBack: () => void;
}

const formatTimeRemaining = (timeRemaining: number) => {
    if (timeRemaining <= 0) return 'Ended';
    return formatDistanceToNow(new Date(Date.now() + timeRemaining), { addSuffix: true });
};

const formatXDaiFromWei = (weiAmount: string): string => {
    return parseFloat(formatUnits(weiAmount, 18)).toFixed(3);
};

type RulingStatus = 'Waiting' | 'Appealable' | 'Solved';

interface VotingStats {
    calinGeorgescu: number;
    elenaLasconi: number;
    answeredTooSoon: number;
    refuseToArbitrate: number;
    pending: number;
    currentRuling: 'Calin Georgescu' | 'Elena Lasconi' | 'Answered Too Soon' | 'Refuse to Arbitrate' | null;
    status: RulingStatus;
    periodTimeRemaining: number;
}

// Mock data - replace with real data later
const votingStats: VotingStats = {
    calinGeorgescu: 45,
    elenaLasconi: 25,
    answeredTooSoon: 15,
    refuseToArbitrate: 5,
    pending: 10,
    currentRuling: 'Calin Georgescu',
    status: 'Waiting',
    periodTimeRemaining: 320000000
};

const StatusChip: FC<{ status: RulingStatus }> = ({ status }) => {
    const getColor = () => {
        switch (status) {
            case 'Waiting': return 'warning';
            case 'Appealable': return 'info';
            case 'Solved': return 'success';
            default: return 'default';
        }
    };
    return <Chip label={status} color={getColor()} size="small" />;
};

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
    onBack
}) => {
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
                <Box flex={question.phase === QuestionPhase.PENDING_ARBITRATION ? 0.4 : 1}>
                    <Box 
                        display="flex" 
                        alignItems="center" 
                        mb={2}
                        flexWrap="wrap"
                        gap={1}
                    >
                        <IconButton onClick={onBack}>
                            <ArrowBackIcon />
                        </IconButton>
                        <Typography 
                            variant="h5"
                            sx={{ 
                                fontSize: { xs: '1.2rem', md: '1.5rem' }
                            }}
                        >
                            {question.title}
                        </Typography>
                    </Box>

                    <Typography variant="body1" mb={3}>
                        {question.description}
                    </Typography>

                    <ActionPanel
                        question={question}
                        isConnected={isConnected}
                    />

                    <Divider sx={{ my: 3 }} />

                    <Box>
                        <Typography variant="h6" mb={2}>Answer History</Typography>
                        <Stack spacing={2}>
                            {question.answers.map((answer: Answer, index: number) => (
                                <Box
                                    key={index}
                                    p={2}
                                    bgcolor="background.default"
                                    borderRadius={1}
                                >
                                    <Typography variant="body2">
                                        Answer: {answer.value}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Bond: {formatXDaiFromWei(answer.bond)} xDAI • By: {answer.provider}
                                    </Typography>
                                </Box>
                            ))}
                        </Stack>
                    </Box>
                </Box>

                {question.phase === QuestionPhase.PENDING_ARBITRATION && (
                    <Box sx={{ 
                        width: { 
                            xs: '100%',    // Full width on mobile
                            md: '550px'    // Fixed width for dispute details on desktop
                        },
                        flex: 0.6          // Added flex property to fill remaining space
                    }}>
                        <Box mb={3}>
                            <Typography variant="h6" gutterBottom>
                                Dispute Details
                            </Typography>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                <Typography variant="subtitle2">Current Votes</Typography>
                                <Box display="flex" flexDirection="column" alignItems="flex-end" gap={0.5}>
                                    <StatusChip status={votingStats.status} />
                                    <Typography variant="caption" color="text.secondary">
                                        Period ends {formatTimeRemaining(votingStats.periodTimeRemaining)}
                                    </Typography>
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                                <Box flex={1}>
                                    <LinearProgress 
                                        variant="buffer"
                                        value={votingStats.calinGeorgescu}
                                        valueBuffer={votingStats.calinGeorgescu + votingStats.pending}
                                        sx={{ height: 10, borderRadius: 1 }}
                                    />
                                </Box>
                                <Typography variant="caption" sx={{ minWidth: 100 }}>
                                    Calin Georgescu: {votingStats.calinGeorgescu}%
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                                <Box flex={1}>
                                    <LinearProgress 
                                        variant="buffer"
                                        value={votingStats.elenaLasconi}
                                        valueBuffer={votingStats.elenaLasconi + votingStats.pending}
                                        sx={{ height: 10, borderRadius: 1, '& .MuiLinearProgress-bar': { bgcolor: 'error.main' } }}
                                    />
                                </Box>
                                <Typography variant="caption" sx={{ minWidth: 100 }}>
                                    Elena Lasconi: {votingStats.elenaLasconi}%
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                                <Box flex={1}>
                                    <LinearProgress 
                                        variant="buffer"
                                        value={votingStats.answeredTooSoon}
                                        valueBuffer={votingStats.answeredTooSoon + votingStats.pending}
                                        sx={{ height: 10, borderRadius: 1, '& .MuiLinearProgress-bar': { bgcolor: 'warning.main' } }}
                                    />
                                </Box>
                                <Typography variant="caption" sx={{ minWidth: 100 }}>
                                    Answered Too Soon: {votingStats.answeredTooSoon}%
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                                <Box flex={1}>
                                    <LinearProgress 
                                        variant="buffer"
                                        value={votingStats.refuseToArbitrate}
                                        valueBuffer={votingStats.refuseToArbitrate + votingStats.pending}
                                        sx={{ height: 10, borderRadius: 1, '& .MuiLinearProgress-bar': { bgcolor: 'grey.500' } }}
                                    />
                                </Box>
                                <Typography variant="caption" sx={{ minWidth: 100 }}>
                                    Refuse to Arbitrate: {votingStats.refuseToArbitrate}%
                                </Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between" mt={1}>
                                <Typography variant="caption" color="text.secondary">
                                    Pending Votes: {votingStats.pending}%
                                </Typography>
                                {votingStats.currentRuling && (
                                    <Typography variant="caption" color="text.secondary">
                                        Current Ruling: <strong>{votingStats.currentRuling}</strong>
                                    </Typography>
                                )}
                            </Box>
                            <Box display="flex" justifyContent="center" mt={3}>
                                <Tooltip title={isConnected ? "Your address is eligible to vote" : "Please connect your wallet to vote"}>
                                    <span>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={handleVoteClick}
                                            disabled={!isConnected}
                                        >
                                            Cast Your Vote
                                        </Button>
                                    </span>
                                </Tooltip>
                            </Box>
                            <Divider sx={{ my: 3 }} />
                        </Box>
                        <EvidencePanel
                            evidence={mockEvidence}
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