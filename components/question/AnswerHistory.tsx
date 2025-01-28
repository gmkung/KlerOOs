import { Box, Typography, Stack } from '@mui/material';
import { Answer } from '@/types/questions';
import { formatXDaiFromWei } from '@/utils/formatting';

interface AnswerHistoryProps {
    answers: Answer[];
}

export const AnswerHistory: React.FC<AnswerHistoryProps> = ({ answers }) => {
    return (
        <Box>
            <Typography variant="h6" mb={2}>Answer History</Typography>

            <Stack spacing={2}>
                {answers.map((answer, index) => (

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
    );
}; 