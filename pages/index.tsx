import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/router';
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
    Tab,
    ToggleButtonGroup,
    Switch,
    FormControlLabel,
    ToggleButton,
    TextField
} from '@mui/material';

import { QuestionList } from '@/components/QuestionList';
import { QuestionDetail } from '@/components/QuestionDetail';
import { Question, QuestionPhase } from '@/types/questions';
import { useQuestions } from '@/hooks/useQuestions';
import { useWallet } from '@/hooks/useWallet';
import LooksOneIcon from '@mui/icons-material/LooksOne';
import LooksTwoIcon from '@mui/icons-material/LooksTwo';
import Looks3Icon from '@mui/icons-material/Looks3';
import { SUPPORTED_CHAINS, type Chain } from '@/constants/chains';

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

const QUESTIONS_PER_PAGE = 20;

const LoadingDots = () => {
    const [dots, setDots] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            setDots(prev => prev.length >= 3 ? '' : prev + '.');
        }, 500);

        return () => clearInterval(interval);
    }, []);

    return (
        <span style={{
            display: 'inline-block',
            width: '1.1em',
            textAlign: 'left',
            fontSize: '0.8em',
            opacity: 0.6,
            position: 'relative',
            top: '-2px'
        }}>
            {dots}
        </span>
    );
};

export default function Home() {
    const router = useRouter();
    const { chain, q: searchQuery, id: questionId, arbitrated } = router.query;

    const selectedChain = SUPPORTED_CHAINS.find(c => c.id === chain) || SUPPORTED_CHAINS[0];
    const currentPage = parseInt(router.query.page as string) || 1;
    const searchTerm = (searchQuery ?? '') as string;
    const [showArbitrated, setShowArbitrated] = useState(arbitrated === 'true');

    const { questions, loading: questionsLoading, error } = useQuestions({
        selectedChain,
        searchTerm
    });

    const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

    // Update selected question when URL or questions change
    useEffect(() => {
        if (questionId && questions.length > 0) {
            const question = questions.find(q => q.id === questionId);
            setSelectedQuestion(question || null);
        } else {
            setSelectedQuestion(null);
        }
    }, [questionId, questions]);

    const { address, isConnected } = useWallet();
    const [statusFilter, setStatusFilter] = useState<QuestionPhase | 'ALL'>('ALL');

    const handleQuestionSelect = (question: Question) => {
        router.push({
            pathname: router.pathname,
            query: { ...router.query, id: question.id }
        });
    };

    const handleBackToList = () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...query } = router.query;
        router.push({ pathname: router.pathname, query });
    };

    const handleChainChange = (event: React.MouseEvent<HTMLElement>, newChain: Chain | null) => {
        if (newChain) {
            router.push({
                pathname: router.pathname,
                query: { ...router.query, chain: newChain.id, page: 1 }
            });
        }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        router.push({
            pathname: router.pathname,
            query: { ...router.query, q: e.target.value, page: 1 }
        });
    };

    // Apply status filter and arbitrated filter
    const filteredQuestions = useMemo(() => {
        return questions.filter(q => {
            const matchesStatus = statusFilter === 'ALL' ? true : q.phase === statusFilter;
            const matchesArbitrated = showArbitrated ? q.arbitrationRequestedBy != null : true;
            return matchesStatus && matchesArbitrated;
        });
    }, [questions, statusFilter, showArbitrated]);

    // Calculate total pages
    const totalPages = useMemo(() => {
        return Math.ceil(filteredQuestions.length / QUESTIONS_PER_PAGE) || 1;
    }, [filteredQuestions.length]);

    // Ensure currentPage is within bounds
    useEffect(() => {
        if (currentPage > totalPages) {
            router.push({
                pathname: router.pathname,
                query: { ...router.query, page: totalPages }
            });
        }
    }, [currentPage, totalPages, router]);

    // Calculate the questions to display on the current page
    const indexOfLastQuestion = currentPage * QUESTIONS_PER_PAGE;
    const indexOfFirstQuestion = indexOfLastQuestion - QUESTIONS_PER_PAGE;
    const currentQuestions = filteredQuestions.slice(indexOfFirstQuestion, indexOfLastQuestion);

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
                                onClick={() => {
                                    // Implement wallet connection logic here
                                }}
                            >
                                {isConnected ? `Connected: ${address}` : "Connect wallet"}
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
                                            {filteredQuestions.length === 0 ? (
                                                <span style={{ color: '#4A148C' }}>
                                                    Loading<LoadingDots />
                                                </span>
                                            ) : (
                                                <>
                                                    <span style={{ color: '#000' }}>Verify </span>
                                                    <span style={{ color: '#4A148C' }}>
                                                        {filteredQuestions.length}
                                                        {questionsLoading && (
                                                            <span style={{ color: '#4A148C' }}>
                                                                + <LoadingDots />
                                                            </span>
                                                        )}
                                                    </span>
                                                    <span style={{ color: '#000' }}> Questions</span>
                                                </>
                                            )}
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

                    <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
                        <ToggleButtonGroup
                            value={selectedChain}
                            exclusive
                            onChange={handleChainChange}
                            aria-label="chain selection"
                        >
                            {SUPPORTED_CHAINS.map((chain) => (
                                <ToggleButton key={chain.id} value={chain}>
                                    {chain.name}
                                </ToggleButton>
                            ))}
                        </ToggleButtonGroup>
                    </Box>

                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Search questions..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        sx={{ mb: 2 }}
                        InputProps={{
                            startAdornment: <Box component="span" sx={{ color: 'text.secondary', mr: 1 }}>🔍</Box>
                        }}
                    />

                    {!selectedQuestion && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Tabs
                                value={statusFilter}
                                onChange={(_, newValue) => {
                                    setStatusFilter(newValue);
                                    router.push({
                                        pathname: router.pathname,
                                        query: { ...router.query, status: newValue }
                                    });
                                }}
                                sx={{ borderBottom: 1, borderColor: 'divider', flex: 1 }}
                                centered
                            >
                                <Tab label="All Questions" value="ALL" />
                                <Tab label="Open" value={QuestionPhase.OPEN} />
                                <Tab label="In Arbitration" value={QuestionPhase.PENDING_ARBITRATION} />
                                <Tab label="Finalized" value={QuestionPhase.FINALIZED} />
                                <Tab label="Settled Too Soon" value={QuestionPhase.SETTLED_TOO_SOON} />
                            </Tabs>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={showArbitrated}
                                        onChange={() => {
                                            setShowArbitrated(!showArbitrated);
                                            router.push({
                                                pathname: router.pathname,
                                                query: { ...router.query, arbitrated: !showArbitrated }
                                            });
                                        }}
                                        color="primary"
                                    />
                                }
                                label="Show Arbitrated Only"
                                sx={{ ml: 2 }}
                            />
                        </Box>
                    )}

                    {!selectedQuestion && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                            <Typography variant="body1" sx={{ mr: 1 }}>
                                Page
                            </Typography>
                            <TextField
                                type="number"
                                value={currentPage}
                                onChange={(e) => {
                                    router.push({
                                        pathname: router.pathname,
                                        query: { ...router.query, page: e.target.value }
                                    });
                                }}
                                inputProps={{
                                    min: 1,
                                    max: totalPages,
                                    style: { textAlign: 'center', width: '60px' }
                                }}
                                sx={{ mx: 1 }}
                                variant="outlined"
                            />
                            <Typography variant="body1" sx={{ mr: 2 }}>
                                of {totalPages}
                            </Typography>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => {
                                    router.push({
                                        pathname: router.pathname,
                                        query: { ...router.query, page: Math.max(currentPage - 1, 1) }
                                    });
                                }}
                                disabled={currentPage === 1}
                                sx={{ mr: 1 }}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => {
                                    router.push({
                                        pathname: router.pathname,
                                        query: { ...router.query, page: Math.min(currentPage + 1, totalPages) }
                                    });
                                }}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </Button>
                        </Box>
                    )}

                    {!selectedQuestion ? (
                        <>
                            <QuestionList
                                questions={currentQuestions}
                                loading={questions.length == 0}
                                onQuestionSelect={handleQuestionSelect}
                            />

                            <Box sx={{ textAlign: 'center', mt: 2 }}>
                                <Typography variant="body2">
                                    Showing {indexOfFirstQuestion + 1}-
                                    {Math.min(indexOfLastQuestion, filteredQuestions.length)} of {filteredQuestions.length} questions
                                </Typography>
                            </Box>
                        </>
                    ) : (
                        <QuestionDetail
                            question={selectedQuestion}
                            userAddress={address}
                            isConnected={isConnected}
                            onBack={handleBackToList}
                            selectedChain={selectedChain}
                        />
                    )}

                    {error && (
                        <Box sx={{ mt: 4 }}>
                            <Typography variant="body1" color="error" align="center">
                                {error}
                            </Typography>
                        </Box>
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