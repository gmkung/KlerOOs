import { formatUnits } from 'ethers';

export const formatXDaiFromWei = (weiAmount: string): string => {
    return parseFloat(formatUnits(weiAmount, 18)).toFixed(3);
}; 