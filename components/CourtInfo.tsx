import { FC, useState } from 'react';
import { IconButton, Modal, Box, Typography, Link } from '@mui/material';
import GavelIcon from '@mui/icons-material/Gavel';

type Court = {
  description: string;
  name: string;
  policy: string;
};

const CourtInfo: FC<{ court: Court }> = ({ court }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <IconButton 
        onClick={() => setOpen(true)}
        size="small"
        aria-label="Court Information"
      >
        <GavelIcon fontSize="small" />
      </IconButton>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="court-info"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600,
          bgcolor: 'background.paper',
          p: 4,
          borderRadius: 1,
          maxHeight: '90vh',
          overflow: 'auto',
        }}>
          <Typography id="court-info" variant="h5" gutterBottom>
            {court.name}
          </Typography>
          
          <Typography sx={{ whiteSpace: 'pre-line', mb: 3 }}>
            {court.description.replace(/\*\*/g, '')}
          </Typography>

          <Link href={`https://ipfs.io${court.policy}`} target="_blank">
            View Court Policy
          </Link>
        </Box>
      </Modal>
    </>
  );
};

export default CourtInfo; 