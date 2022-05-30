// export const chainId = '0x61'; // bsc
// export const params = {
//   chainId: '0x61',
//   rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545'],
//   chainName: 'BSC testnet',
//   nativeCurrency: {
//     name: 'BNB',
//     symbol: 'BNB', // 2-6 characters long
//     decimals: 18,
//   },
//   blockExplorerUrls: ['https://testnet.bscscan.com'],
//   // iconUrls
// };

export const chainId = '0x13881'; // polygon
export const params = {
  chainId: '0x13881',
  rpcUrls: ['https://rpc-mumbai.maticvigil.com'],
  chainName: 'Mumbai polygon testnet',
  nativeCurrency: {
    name: 'MATIC',
    symbol: 'MATIC', // 2-6 characters long
    decimals: 18,
  },
  blockExplorerUrls: ['https://mumbai.polygonscan.com'],
};

export default { chainId, params };
