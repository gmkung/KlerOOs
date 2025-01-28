import { Box, Typography, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface QuestionHeaderProps {
    title: string;
    description: string;
    onBack: () => void;
}

export const QuestionHeader: React.FC<QuestionHeaderProps> = ({ title, description, onBack }) => {
    return (
        <>
            <Box
                display="flex"
                alignItems="center"
                mb={2}
                flexWrap="wrap"
                gap={1}
            >
                <IconButton onClick={onBack}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography
                    variant="h5"
                    sx={{
                        fontSize: { xs: '1.2rem', md: '1.5rem' }
                    }}
                >
                    {title}
                </Typography>
            </Box>

            <Typography variant="body1" mb={3}>
                {description}
            </Typography>
        </>
    );
}; 