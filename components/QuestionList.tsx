import { FC, useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  Tooltip
} from '@mui/material';
import { Question, QuestionPhase } from '@/types/questions';
import { formatDistanceToNow, format } from 'date-fns';
import { formatUnits } from 'ethers';
import GavelIcon from '@mui/icons-material/Gavel';

interface QuestionListProps {
  questions: Question[];
  loading: boolean;
  onQuestionSelect: (question: Question) => void;
}

export const QuestionList: FC<QuestionListProps> = ({
  questions,
  loading,
  onQuestionSelect
}) => {
  const getPhaseColor = (phase: QuestionPhase) => {
    switch (phase) {
      case QuestionPhase.OPEN:
        return 'primary';
      case QuestionPhase.PENDING_ARBITRATION:
        return 'warning';
      case QuestionPhase.FINALIZED:
        return 'success';
      case QuestionPhase.SETTLED_TOO_SOON:
        return 'error';
      default:
        return 'default';
    }
  };

  const formatTimeRemaining = (timeRemaining: number) => {
    if (timeRemaining <= 0) return 'Ended';
    return formatDistanceToNow(new Date(Date.now() + timeRemaining), { addSuffix: true });
  };

  const formatXDaiFromWei = (weiAmount: string): string => {
    return parseFloat(formatUnits(weiAmount, 18)).toFixed(3);
  };

  const decodeHexAnswer = (hexAnswer: string): number => {
    return Number(hexAnswer);
  };

  // Use useState and useEffect for mobile detection
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 600);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const formatExactTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return `${format(date, 'PPp')} (${date.toLocaleTimeString('en-US', { timeZoneName: 'short' }).split(' ')[2]})`;
  };

  const getTimelineTooltip = (question: Question) => {
    const createdTime = formatExactTime(question.createdTimestamp);
    const openingTime = formatExactTime(question.openingTimestamp);
    const closingTime = question.currentScheduledFinalizationTimestamp
      ? formatExactTime(parseInt(question.currentScheduledFinalizationTimestamp))
      : 'Not set';

    return (
      <Box sx={{ p: 1 }}>
        <Typography variant="body2">Created: {createdTime}</Typography>
        <Typography variant="body2">Opens: {openingTime}</Typography>
        <Typography variant="body2">Closes: {closingTime}</Typography>
      </Box>
    );
  };

  if (loading) {
    return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;
  }

  // Mobile view
  if (isMobile) {
    return (
      <Stack spacing={2} sx={{ mb: 4 }}>
        {questions.map((question) => (
          <Paper
            key={question.id}
            elevation={2}
            onClick={() => onQuestionSelect(question)}
            sx={{
              p: 2,
              cursor: 'pointer',
              '&:hover': { bgcolor: 'action.hover' }
            }}
          >
            <Typography variant="subtitle2" gutterBottom>
              {question.title}
            </Typography>
            <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
              <Chip
                label={question.phase}
                color={getPhaseColor(question.phase)}
                size="small"
              />
              <Typography variant="caption">
                {formatXDaiFromWei(question.currentBond)} xDAI
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
              <Typography variant="caption" color="text.secondary">
                {formatTimeRemaining(question.timeRemaining)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {question.qType === 'single-select' && question.currentAnswer
                  ? question.options[decodeHexAnswer(question.currentAnswer)]
                  : question.currentAnswer || question.answers[question.answers.length - 1]?.value || 'No answer yet'}
              </Typography>
            </Box>

            {question.arbitrationRequestedBy && (
              <Tooltip
                title="This question has a Kleros Court case linked to its resolution"
                arrow
                placement="top"
              >
                <GavelIcon sx={{ color: 'red', ml: 1, cursor: 'pointer' }} />
              </Tooltip>
            )}
          </Paper>
        ))}
      </Stack>
    );
  }

  // Desktop view (existing table view)
  return (
    <TableContainer component={Paper} elevation={2} sx={{ mb: 4 }}>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: 'background.default' }}>
            <TableCell width="45%"><Typography variant="subtitle2">Question</Typography></TableCell>
            <TableCell width="12%" align="center"><Typography variant="subtitle2">Status</Typography></TableCell>
            <TableCell width="12%"><Typography variant="subtitle2">Current Bond</Typography></TableCell>
            <TableCell width="12%"><Typography variant="subtitle2">Time Remaining</Typography></TableCell>
            <TableCell width="9%"><Typography variant="subtitle2">Type</Typography></TableCell>
            <TableCell width="10%"><Typography variant="subtitle2">Latest Answer</Typography></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {questions.map((question) => (
            <Tooltip
              key={question.id}
              title={getTimelineTooltip(question)}
              arrow
              followCursor
              placement="right-start"
              componentsProps={{
                tooltip: {
                  sx: {
                    bgcolor: 'background.paper',
                    '& .MuiTooltip-arrow': {
                      color: 'background.paper',
                    },
                    boxShadow: 1,
                    color: 'text.primary',
                  }
                }
              }}
            >
              <TableRow
                onClick={() => onQuestionSelect(question)}
                sx={{
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' },
                  '&:last-child td, &:last-child th': { border: 0 }
                }}
              >
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{
                      wordBreak: 'break-word',
                      whiteSpace: 'normal'
                    }}
                  >
                    {question.title}{question.arbitrationRequestedBy && (

                      <Tooltip
                        title="This question has a Kleros Court case linked to its resolution"
                        arrow
                        placement="top"
                      >
                        <GavelIcon sx={{ color: 'pink', ml: 1, cursor: 'pointer' }} />
                      </Tooltip>

                    )}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={question.phase}
                    color={getPhaseColor(question.phase)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {formatXDaiFromWei(question.currentBond)} xDAI
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {formatTimeRemaining(question.timeRemaining)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {question.qType === 'single-select' ? 'Single Choice' : 'Open Answer'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{
                      wordBreak: 'break-word',
                      whiteSpace: 'normal'
                    }}
                  >
                    {['single-select', 'bool'].includes(question.qType) && question.currentAnswer
                      ? question.options[decodeHexAnswer(question.currentAnswer)]
                      : question.currentAnswer || question.answers[question.answers.length - 1]?.value || 'No answer yet'}
                  </Typography>
                </TableCell>

              </TableRow>
            </Tooltip>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}; 