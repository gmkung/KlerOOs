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
  Tooltip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Switch
} from '@mui/material';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { Question, QuestionPhase, ArbitrationStatus } from '@/types/questions';
import { formatDistanceToNow, format } from 'date-fns';
import { formatUnits } from 'ethers';

interface QuestionListProps {
  questions: Question[];
  loading: boolean;
  onQuestionSelect: (question: Question) => void;
  onFilterChange: (filters: Filters) => void;
}

// Define specific types for our filters
type FilterValue = string | number | boolean | null;
type Filters = Record<string, FilterValue>;

// Dynamic filter component
const DynamicFilters: FC<{
  onFilterChange: (filters: Filters) => void
}> = ({ onFilterChange }) => {
  const [filters, setFilters] = useState<Filters>({});

  // Define field types and their possible values
  const fieldDefinitions = {
    phase: {
      type: 'enum',
      values: Object.values(QuestionPhase),
    },
    arbitrationStatus: {
      type: 'enum',
      values: Object.values(ArbitrationStatus),
    },
    qType: {
      type: 'enum',
      values: ['single-select', 'bool'],
    },
    title: { type: 'string' },
    description: { type: 'string' },
    currentBond: { type: 'number' },
    timeRemaining: { type: 'number' },
    arbitratedBy: { type: 'boolean' },
  };

  const handleFilterChange = (field: string, value: FilterValue) => {
    const newFilters = {
      ...filters,
      [field]: value,
    };
    
    // Remove empty filters
    if (!value && value !== 0) {
      delete newFilters[field];
    }
    
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Typography>
          Filters 
          {Object.keys(filters).length > 0 && (
            <Chip 
              size="small" 
              label={`${Object.keys(filters).length} active`} 
              sx={{ ml: 1 }} 
            />
          )}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 2 }}>
          {Object.entries(fieldDefinitions).map(([field, definition]) => {
            if (definition.type === 'boolean') {
              return (
                <FormControl key={field} size="small">
                  <FormControlLabel
                    control={
                      <Switch
                        checked={!!filters[field]}
                        onChange={(e) => handleFilterChange(field, e.target.checked)}
                      />
                    }
                    label="Show Arbitrated Only"
                  />
                </FormControl>
              );
            }

            if (definition.type === 'enum') {
              return (
                <FormControl key={field} size="small">
                  <InputLabel>{field}</InputLabel>
                  <Select
                    value={filters[field] || ''}
                    label={field}
                    onChange={(e) => handleFilterChange(field, e.target.value)}
                  >
                    <MenuItem value="">Any</MenuItem>
                    {'values' in definition && definition.values.map((value) => (
                      <MenuItem key={value} value={value}>
                        {value}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              );
            }

            if (definition.type === 'string') {
              return (
                <TextField
                  key={field}
                  label={field}
                  size="small"
                  value={filters[field] || ''}
                  onChange={(e) => handleFilterChange(field, e.target.value)}
                />
              );
            }

            if (definition.type === 'number') {
              return (
                <TextField
                  key={field}
                  label={field}
                  size="small"
                  type="number"
                  value={filters[field] || ''}
                  onChange={(e) => handleFilterChange(field, e.target.value ? Number(e.target.value) : '')}
                />
              );
            }
          })}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export const QuestionList: FC<QuestionListProps> = ({
  questions,
  loading,
  onQuestionSelect,
  onFilterChange
}) => {
  const getPhaseColor = (phase: QuestionPhase) => {
    switch (phase) {
      case QuestionPhase.OPEN:
        return 'secondary';
      case QuestionPhase.PENDING_ARBITRATION:
        return 'warning';
      case QuestionPhase.FINALIZED:
        return 'default';
      case QuestionPhase.SETTLED_TOO_SOON:
        return 'error';
      case QuestionPhase.UPCOMING:
        return 'info';
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
        <DynamicFilters onFilterChange={onFilterChange} />
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
                variant="filled"
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
          </Paper>
        ))}
      </Stack>
    );
  }

  // Desktop view (existing table view)
  return (
    <Box>
      <DynamicFilters onFilterChange={onFilterChange} />
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
                    {question.arbitrationRequestedBy ? (
                      <Tooltip
                        title="Arbitration has been requested"
                        arrow
                        placement="top"
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            wordBreak: 'break-word',
                            whiteSpace: 'normal',
                            outline: '2px solid rgba(156, 39, 176, 0.3)',
                            outlineOffset: '2px',
                            padding: '4px',
                            borderRadius: '4px'
                          }}
                        >
                          {question.title}
                        </Typography>
                      </Tooltip>
                    ) : (
                      <Typography
                        variant="body2"
                        sx={{
                          wordBreak: 'break-word',
                          whiteSpace: 'normal'
                        }}
                      >
                        {question.title}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={question.phase}
                      color={getPhaseColor(question.phase)}
                      variant="filled"
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
    </Box>
  );
}; 