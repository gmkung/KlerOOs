import { useState, useEffect } from 'react';

export const useWallet = () => {
  const [address, setAddress] = useState<string>();
  const [isConnected, setIsConnected] = useState(true);

  // TODO: Add actual wallet connection logic here
  
  // For demo purposes, hardcode isConnected to true
  const userAddress = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";  // Demo address
  
  return {
    address,
    isConnected,
    userAddress,
  };
}; 