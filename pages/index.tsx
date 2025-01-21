import { useState } from 'react';
import {
    Box,
    Container,
    Typography,
    AppBar,
    Toolbar,
    Button,
    ThemeProvider,
    createTheme,
    CssBaseline,
    Stack,
    Tabs,
    Tab
} from '@mui/material';
import { QuestionList } from '@/components/QuestionList';
import { QuestionDetail } from '@/components/QuestionDetail';
import { Question, QuestionPhase } from '@/types/questions';
import { useQuestions } from '@/hooks/useQuestions';
import { useWallet } from '@/hooks/useWallet';
import LooksOneIcon from '@mui/icons-material/LooksOne';
import LooksTwoIcon from '@mui/icons-material/LooksTwo';
import Looks3Icon from '@mui/icons-material/Looks3';

const theme = createTheme({
    typography: {
        fontFamily: '"Open Sans", "Helvetica", "Arial", sans-serif',
        h1: {
            fontFamily: '"Open Sans", "Helvetica", "Arial", sans-serif',
        },
        h2: {
            fontFamily: '"Open Sans", "Helvetica", "Arial", sans-serif',
        },
        h3: {
            fontFamily: '"Open Sans", "Helvetica", "Arial", sans-serif',
        },
        h4: {
            fontFamily: '"Open Sans", "Helvetica", "Arial", sans-serif',
        },
        h5: {
            fontFamily: '"Open Sans", "Helvetica", "Arial", sans-serif',
        },
        h6: {
            fontFamily: '"Open Sans", "Helvetica", "Arial", sans-serif',
        },
        body1: {
            fontFamily: '"Open Sans", "Helvetica", "Arial", sans-serif',
        },
        body2: {
            fontFamily: '"Open Sans", "Helvetica", "Arial", sans-serif',
        },
    },
    palette: {
        mode: 'light',
        primary: {
            main: '#7B1FA2', // Deep Purple
        },
        background: {
            default: '#F8F5FF', // Very light purple
            paper: '#FFFFFF',
        },
    },
});

export default function Home() {
    const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
    const { questions, loading: questionsLoading } = useQuestions();
    const { address, isConnected } = useWallet();
    const [statusFilter, setStatusFilter] = useState<QuestionPhase | 'ALL'>('ALL');

    const handleQuestionSelect = (question: Question) => {
        setSelectedQuestion(question);
    };

    const handleBackToList = () => {
        setSelectedQuestion(null);
    };

    const filteredQuestions = questions.filter(q =>
        statusFilter === 'ALL' ? true : q.phase === statusFilter
    );

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                <AppBar
                    position="static"
                    sx={{
                        bgcolor: '#1A1A2E', // Dark background for AppBar
                        color: 'white',
                        boxShadow: 1
                    }}
                >
                    <Toolbar>
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                            <Box 
                                component="img"
                                src="/kleros-logo-symbol-fullwhite.png"
                                alt="Kleros Logo"
                                sx={{ 
                                    width: 40, 
                                    height: 40,
                                    mr: 2 
                                }} 
                            />
                            <Typography 
                                variant="h6" 
                                component="div" 
                                sx={{ flexGrow: 1 }}
                            >
                                Kleros Optimistic Oracle
                            </Typography>
                            <Button
                                variant="contained"
                                color="primary"
                                sx={{
                                    borderRadius: 2,
                                    bgcolor: '#4A148C',  // Deeper purple color
                                    '&:hover': {
                                        bgcolor: '#3A1070'  // Even deeper purple for hover
                                    }
                                }}
                            >
                                Connect wallet
                            </Button>
                        </Box>
                    </Toolbar>
                </AppBar>

                <Container 
                    maxWidth="lg" 
                    sx={{ 
                        mt: 4,
                        px: { xs: 2, sm: 4, md: 8, lg: 12 },
                        flex: 1
                    }}
                >
                    <Box sx={{ mb: 3 }}>
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3, justifyContent: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography 
                                    variant="h4" 
                                    component="h1" 
                                    sx={{ 
                                        fontWeight: 700,
                                        fontSize: { 
                                            xs: '1.5rem',
                                            sm: '2.5rem',
                                        },
                                        textAlign: 'center',
                                    }}
                                >
                                    {!selectedQuestion && (
                                        <>
                                            <span style={{ color: '#000' }}>Verify </span>
                                            <span style={{ color: '#4A148C' }}>
                                                {filteredQuestions.filter(q => q.phase !== QuestionPhase.FINALIZED).length}
                                            </span>
                                            <span style={{ color: '#000' }}> Questions</span>
                                        </>
                                    )}
                                </Typography>
                            </Box>
                        </Stack>
                    </Box>

                    <Box sx={{ mb: 4 }}>
                        <Stack spacing={2}>
                            <Stack
                                direction="row"
                                spacing={4}
                                justifyContent="space-between"
                                sx={{ px: 2 }}
                            >
                                <Box sx={{ textAlign: 'center', flex: 1 }}>
                                    <LooksOneIcon sx={{ fontSize: 32, mb: 0.5 }} />
                                    <Typography variant="body2">
                                        Proposers post a bond to assert that a piece of data is correct.
                                    </Typography>
                                </Box>
                                <Box sx={{ textAlign: 'center', flex: 1 }}>
                                    <LooksTwoIcon sx={{ fontSize: 32, mb: 0.5 }} />
                                    <Typography variant="body2">
                                        During the challenge period, data proposals are verified and can be disputed.
                                    </Typography>
                                </Box>
                                <Box sx={{ textAlign: 'center', flex: 1 }}>
                                    <Looks3Icon sx={{ fontSize: 32, mb: 0.5 }} />
                                    <Typography variant="body2">
                                        If correctly disputed, the data is not used and the challenger receives a reward.
                                    </Typography>
                                </Box>
                            </Stack>
                        </Stack>
                    </Box>

                    {!selectedQuestion && (
                        <Tabs
                            value={statusFilter}
                            onChange={(_, newValue) => setStatusFilter(newValue)}
                            sx={{ borderBottom: 1, borderColor: 'divider' }}
                            centered
                        >
                            <Tab label="All Questions" value="ALL" />
                            <Tab label="Open" value={QuestionPhase.OPEN} />
                            <Tab label="In Arbitration" value={QuestionPhase.PENDING_ARBITRATION} />
                            <Tab label="Finalized" value={QuestionPhase.FINALIZED} />
                            <Tab label="Settled Too Soon" value={QuestionPhase.SETTLED_TOO_SOON} />
                        </Tabs>
                    )}

                    {!selectedQuestion ? (
                        <QuestionList
                            questions={filteredQuestions}
                            loading={questionsLoading}
                            onQuestionSelect={handleQuestionSelect}
                        />
                    ) : (
                        <QuestionDetail
                            question={selectedQuestion}
                            userAddress={address}
                            isConnected={isConnected}
                            onBack={handleBackToList}
                        />
                    )}
                </Container>
                
                <Box
                    component="footer"
                    sx={{
                        py: 2,
                        px: 2,
                        backgroundColor: '#1A1A2E',
                        color: 'white',
                        textAlign: 'center'
                    }}
                >
                    <Typography variant="body2">
                        © {new Date().getFullYear()} Kleros. All rights reserved.
                    </Typography>
                </Box>
            </Box>
        </ThemeProvider>
    );
} 