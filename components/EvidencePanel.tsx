import { FC, useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Stack,
    Button,
    Skeleton
} from '@mui/material';
import { format } from 'date-fns';
import CourtInfo from './CourtInfo';
import { courtData } from '@/mocks/court'; // You'll need to create this
import { Evidence } from '@/types/questions';


interface EvidenceWithContents extends Evidence {
    id: string;
    URI: string;
    URI_contents: {
        name: string;
        description: string;
    };
    creationTime: string;
    sender: string;
    loading?: boolean;
    error?: string;
}


interface EvidencePanelProps {
    evidences: Evidence[];
    canSubmit: boolean;
    onSubmitClick: () => void;
}

export const EvidencePanel: FC<EvidencePanelProps> = ({ evidences, canSubmit, onSubmitClick }) => {
    const [evidenceWithContents, setEvidenceWithContents] = useState<EvidenceWithContents[]>([]);

    useEffect(() => {
        // Initialize all evidence items with loading state
        setEvidenceWithContents(evidences.map(item => ({
            ...item,
            loading: true
        })));

        // Fetch each evidence item independently
        evidences.forEach(async (item, index) => {
            try {
                const response = await fetch(`https://cdn.kleros.link${item.URI}`);
                if (!response.ok) throw new Error('Failed to fetch');
                console.log(response)
                const contents = await response.json();

                setEvidenceWithContents(current => {
                    const updated = [...current];
                    updated[index] = {
                        ...item,
                        URI_contents: contents,
                        loading: false
                    };
                    return updated;
                });
            } catch (error) {
                console.error('Error fetching evidence:', error);
                setEvidenceWithContents(current => {
                    const updated = [...current];
                    updated[index] = {
                        ...item,
                        URI_contents: {
                            name: 'Error loading evidence',
                            description: 'Could not load evidence contents'
                        },
                        loading: false,
                        error: 'Failed to load evidence'
                    };
                    return updated;
                });
            }
        });

    }, [evidences]);

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
                {evidenceWithContents.map((item) => (
                    <Card key={item.id} variant="outlined">
                        <CardContent>
                            {item.loading ? (
                                <>
                                    <Skeleton variant="text" width="60%" height={24} />
                                    <Skeleton variant="text" width="100%" height={20} />
                                    <Skeleton variant="text" width="100%" height={20} />
                                </>
                            ) : (
                                <>
                                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                        {item.URI_contents?.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" paragraph>
                                        {item.URI_contents?.description}
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
                                </>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </Stack>
        </Box>
    );
}; 