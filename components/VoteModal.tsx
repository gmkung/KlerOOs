import { FC, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    FormControl,
    FormControlLabel,
    Radio,
    RadioGroup,
    Typography
} from '@mui/material';

interface VoteModalProps {
    open: boolean;
    onClose: () => void;
    questionId: string;
    userAddress?: string;
}

export const VoteModal: FC<VoteModalProps> = ({
    open,
    onClose,
    questionId,
    userAddress
}) => {
    const [selectedVote, setSelectedVote] = useState<string>('');

    const handleVoteSubmit = async () => {
        // TODO: Implement voting logic here
        console.log('Submitting vote:', selectedVote, 'for question:', questionId);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Cast Your Vote</DialogTitle>
            <DialogContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    Voting from: {userAddress}
                </Typography>
                <FormControl component="fieldset" fullWidth sx={{ mt: 2 }}>
                    <RadioGroup
                        value={selectedVote}
                        onChange={(e) => setSelectedVote(e.target.value)}
                    >
                        <FormControlLabel 
                            value="Calin Georgescu" 
                            control={<Radio />} 
                            label="Calin Georgescu" 
                        />
                        <FormControlLabel 
                            value="Elena Lasconi" 
                            control={<Radio />} 
                            label="Elena Lasconi" 
                        />
                        <FormControlLabel 
                            value="Answered Too Soon" 
                            control={<Radio />} 
                            label="Answered Too Soon" 
                        />
                        <FormControlLabel 
                            value="Refuse to Arbitrate" 
                            control={<Radio />} 
                            label="Refuse to Arbitrate" 
                        />
                    </RadioGroup>
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button 
                    onClick={handleVoteSubmit} 
                    variant="contained" 
                    disabled={!selectedVote}
                >
                    Submit Vote
                </Button>
            </DialogActions>
        </Dialog>
    );
}; 