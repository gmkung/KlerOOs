import { FC } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Stack,
  Alert
} from '@mui/material';
import { Question, QuestionPhase } from '@/types/questions';
import { formatUnits } from 'ethers/lib/utils';

interface ActionPanelProps {
  question: Question;
  isConnected: boolean;
}

const formatXDaiFromWei = (weiAmount: string): string => {
  return parseFloat(formatUnits(weiAmount, 18)).toFixed(3);
};

export const ActionPanel: FC<ActionPanelProps> = ({
  question,
  isConnected
}) => {
  const renderActionsByPhase = () => {
    if (!isConnected) {
      return (
        <Alert severity="info">
          Please connect your wallet to interact with this question
        </Alert>
      );
    }

    switch (question.phase) {
      case QuestionPhase.OPEN:
        return (
          <Stack spacing={2}>
            <Typography variant="subtitle1">
              Propose an Answer
            </Typography>
            <TextField
              label="Your Answer"
              fullWidth
              multiline
              rows={2}
            />
            <Typography variant="caption">
              Minimum bond required: {formatXDaiFromWei(question.minimumBond)} xDAI
            </Typography>
            <Button variant="contained">
              Submit Answer
            </Button>
          </Stack>
        );

      case QuestionPhase.PENDING_ARBITRATION:
        return (
          <Alert severity="warning">
            This question is currently under arbitration
          </Alert>
        );

      case QuestionPhase.FINALIZED:
        return (
          <Alert severity="success">
            Final Answer: {question.finalAnswer}
          </Alert>
        );

      case QuestionPhase.SETTLED_TOO_SOON:
        return (
          <Stack spacing={2}>
            <Alert severity="error">
              This question was settled too soon
            </Alert>
            <Button variant="contained" color="warning">
              Reopen Question
            </Button>
          </Stack>
        );

      default:
        return null;
    }
  };

  return (
    <Box>
      <Typography variant="h6" mb={2}>Actions</Typography>
      {renderActionsByPhase()}
    </Box>
  );
}; 