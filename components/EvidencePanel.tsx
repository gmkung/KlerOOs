import { FC } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Stack,
    Button
} from '@mui/material';
import { format } from 'date-fns';
import CourtInfo from './CourtInfo';
import { courtData } from '@/mocks/court'; // You'll need to create this
import { Evidence } from '@/types/questions';

interface EvidencePanelProps {
    evidence: Evidence[];
    canSubmit: boolean;
    onSubmitClick: () => void;
}

export const EvidencePanel: FC<EvidencePanelProps> = ({ evidence, canSubmit, onSubmitClick }) => {
    const formatTimestamp = (timestamp: string) => {
        return format(new Date(parseInt(timestamp) * 1000), 'MMM d, yyyy HH:mm:ss');
    };

    const formatAddress = (address: string) => {
        return address.includes('.eth') ?
            address :
            `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box display="flex" alignItems="center">
                    <Typography variant="h6" sx={{ mr: 1 }}>Evidence</Typography>
                    <CourtInfo court={courtData} />
                </Box>
                {canSubmit && (
                    <Button variant="contained" color="primary" size="small" onClick={onSubmitClick}>
                        Submit Evidence
                    </Button>
                )}
            </Box>

            <Stack spacing={2}>
                {evidence.map((item) => (
                    <Card key={item.id} variant="outlined">
                        <CardContent>
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                {item.URI_contents.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" paragraph>
                                {item.URI_contents.description}
                            </Typography>
                            <Box
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                                sx={{ mt: 1 }}
                            >
                                <Typography variant="caption" color="text.secondary">
                                    By: {formatAddress(item.sender)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {formatTimestamp(item.creationTime)}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                ))}
            </Stack>
        </Box>
    );
}; 