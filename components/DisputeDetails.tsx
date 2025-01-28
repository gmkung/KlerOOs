import { FC } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    Paper,
    Typography,
    Box,
    Skeleton
} from '@mui/material';
import { Dispute } from '@/types/disputes';
import { formatDistanceToNow } from 'date-fns';

interface DisputeDetailsProps {
    dispute?: Dispute;
    loading: boolean;
}

export const DisputeDetails: FC<DisputeDetailsProps> = ({ dispute, loading }) => {
    if (loading) {
        return <Skeleton variant="rectangular" height={400} />;
    }

    if (!dispute) {
        return <Typography color="error">No dispute data available</Typography>;
    }

    const rows = [
        { label: 'Period', value: (dispute.period) },
        { label: 'Deadline', value: formatDistanceToNow(parseInt(dispute.periodDeadline) * 1000, { addSuffix: true }) },
        { label: 'Rounds', value: dispute.nbRounds },
        { label: 'Choices', value: dispute.nbChoices },
        { label: 'Current Round Jurors', value: dispute.rounds.find(r => r.isCurrentRound)?.jurors || '0' },
        { label: 'Last Period Change', value: formatDistanceToNow(parseInt(dispute.lastPeriodChangeTs) * 1000, { addSuffix: false }) },
        { label: 'Status', value: dispute.ruled ? 'Ruled' : 'Pending' },
        { label: 'Ruling', value: dispute.ruled ? getRulingText(dispute.ruling) : 'Not yet ruled' },
    ];

    return (
        <Box>
            <TableContainer component={Paper} variant="outlined">
                <Table>
                    <TableBody>
                        {rows.map((row) => (
                            <TableRow key={row.label}>
                                <TableCell component="th" scope="row" sx={{ fontWeight: 'bold', width: '40%' }}>
                                    {row.label}
                                </TableCell>
                                <TableCell>{row.value}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

function getRulingText(ruling: string): string {
    const rulings = ['Refuse to Arbitrate', 'Calin Georgescu', 'Elena Lasconi'];
    return rulings[parseInt(ruling)] || 'Unknown';
} 