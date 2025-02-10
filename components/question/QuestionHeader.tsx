import { Box, Typography, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface QuestionHeaderProps {
    title: string;
    description: string;
    options: string[];
    onBack: () => void;
}

export const QuestionHeader: React.FC<QuestionHeaderProps> = ({ 
    title, 
    description, 
    options, 
    onBack 
}) => {
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
                <Box>
                    <Typography
                        variant="h3"
                        sx={{
                            fontSize: { xs: '1.2rem', md: '1.5rem' }
                        }}
                    >
                        Question
                    </Typography>
                    <Typography variant="body1">
                        {title}
                    </Typography>
                </Box>
            </Box>

            <Typography variant="body1" mb={2}>
                {description}
            </Typography>

            <Box mb={3}>
                <Typography variant="body1" fontWeight="medium" mb={1}>
                    Options:
                </Typography>
                {options.map((option, index) => (
                    <Typography key={index} variant="body1" sx={{ ml: 2 }}>
                        {index + 1}. {option}
                    </Typography>
                ))}
            </Box>
        </>
    );
}; 