import { Box, Typography, Stack } from '@mui/material';
import { Answer } from '@/types/questions';
import { formatXDaiFromWei } from '@/utils/formatting';
import { formatDistanceToNow } from 'date-fns';
import { FC } from 'react';

interface AnswerHistoryProps {
    responses: Array<{
        value: string;
        timestamp: number;
        bond: string;
        user: string;
    }>;
    qType: string;
    options: string[];
}

export const AnswerHistory: FC<AnswerHistoryProps> = ({
    responses,
    qType,
    options
}) => {
    const decodeHexAnswer = (hexAnswer: string): number => {
        return Number(hexAnswer);
    };

    const formatAnswer = (answer: string) => {
        if (['single-select', 'bool'].includes(qType) && answer) {

            return options[decodeHexAnswer(answer)];
        }
        return answer || 'No answer yet';
    };

    return (
        <Box>
            <Typography variant="h6" mb={2}>Answer History</Typography>

            <Stack spacing={2}>
                {responses.map((response, index) => (

                    <Box
                        key={index}
                        p={2}
                        bgcolor="background.default"
                        borderRadius={1}
                    >
                        <Typography variant="body2">
                            Answer: {formatAnswer(response.value)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Bond: {formatXDaiFromWei(response.bond)} xDAI • 
                            {formatDistanceToNow(response.timestamp, { addSuffix: true })} • 
                            By: {response.user || (
                                <Typography
                                    component="span"
                                    variant="caption"
                                    color="text.disabled"
                                    sx={{ fontStyle: 'italic' }}
                                >
                                    Unavailable
                                </Typography>
                            )}
                        </Typography>
                    </Box>
                ))}
            </Stack>
        </Box>
    );
}; 