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

    const allRows = [
        { label: 'Period', value: (dispute.period) },
        { label: 'Deadline', value: formatDistanceToNow(parseInt(dispute.periodDeadline) * 1000, { addSuffix: true }) },
        { label: 'Rounds', value: dispute.nbRounds },
        { label: 'Choices', value: dispute.nbChoices },
        { label: 'Current Round Jurors', value: dispute.rounds.find(r => r.isCurrentRound)?.jurors || '0' },
        { label: 'Last Period Change', value: formatDistanceToNow(parseInt(dispute.lastPeriodChangeTs) * 1000, { addSuffix: false }) },
        { label: 'Status', value: dispute.ruled ? 'Ruled' : 'Pending' },
        { label: 'Ruling', value: dispute.ruled ? getRulingText(dispute.ruling) : 'Not yet ruled' },
    ].filter(row => row.value != null && row.value !== '');

    // Split rows into two arrays
    const midpoint = Math.ceil(allRows.length / 2);
    const leftRows = allRows.slice(0, midpoint);
    const rightRows = allRows.slice(midpoint);

    return (
        <Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
                <TableContainer component={Paper} variant="outlined" sx={{ flex: 1 }}>
                    <Table size="small">
                        <TableBody>
                            {leftRows.map((row) => (
                                <TableRow key={row.label}>
                                    <TableCell
                                        component="th"
                                        scope="row"
                                        sx={{
                                            fontWeight: 'bold',
                                            width: '40%',
                                            py: 1
                                        }}
                                    >
                                        {row.label}
                                    </TableCell>
                                    <TableCell sx={{ py: 1 }}>{row.value}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TableContainer component={Paper} variant="outlined" sx={{ flex: 1 }}>
                    <Table size="small">
                        <TableBody>
                            {rightRows.map((row) => (
                                <TableRow key={row.label}>
                                    <TableCell
                                        component="th"
                                        scope="row"
                                        sx={{
                                            fontWeight: 'bold',
                                            width: '40%',
                                            py: 1
                                        }}
                                    >
                                        {row.label}
                                    </TableCell>
                                    <TableCell sx={{ py: 1 }}>{row.value}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Box>
    );
};

function getRulingText(ruling: string): string {
    // Check for "Answered too soon" special case
    if (ruling === '115792089237316195423570985008687907853269984665640564039457584007913129639935') {
        return 'Answered too soon';
    }
    if (ruling === '0') {
        return 'Refuse to Arbitrate';
    }

    return ruling;
}