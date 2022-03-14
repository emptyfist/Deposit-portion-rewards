/**
 * @type import('hardhat/config').HardhatUserConfig
 */
 require("@nomiclabs/hardhat-waffle");
 require('@nomiclabs/hardhat-ethers');
 
 module.exports = {
   networks: {
     ropsten: {
       url: "https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
       chainId: 3,
       accounts: ["e87426bdc2da01e617981c5a7971818cc4f71e649656f4e2dfdb411fd8b93d07"],
     },
     rinkeby: {
       url: "https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
       chainId: 4,
       accounts: ["e87426bdc2da01e617981c5a7971818cc4f71e649656f4e2dfdb411fd8b93d07"],
     },
     mumbai: {
       url: "https://rpc-mumbai.maticvigil.com",
       chainId: 80001,
       accounts: ["e87426bdc2da01e617981c5a7971818cc4f71e649656f4e2dfdb411fd8b93d07"],
     }
   },
   solidity: {
     compilers: [
       {
         version: '0.8.0',
         settings: {
           optimizer: {
             enabled: true,
           },
         },
       },
       {
         version: '0.8.4',
         settings: {
           optimizer: {
             enabled: true,
           },
         },
       },
       {
         version: '0.7.5',
         settings: {
           optimizer: {
             enabled: true,
           },
         },
       },
     ],
   },
   mocha: {
     timeout: 20000
   }
 };
 