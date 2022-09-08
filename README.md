# myuniswap
Fetch PEACH/WETH price from Uniswap V3, and provide exchange rate to USD & SOL.
Note:
- PEACH/USD - Calculated from ETH/USDT rate from Etherscan
- PEACH/SOL - Calculated from SOL/USD rate from Binance

## Requirement
- node v16.13.2 (See nvm: https://github.com/nvm-sh/nvm)

## Setup
- `$ npm i`
- Set up .env file:
```
INFURA_API=             Infura API key
ETHERSCAN=              Etherscan API key
```

## Output
Sample console log output:
```
1 PEACH =  0.014537220745699998 USD
1 PEACH =  0.0004353094183655936 SOL; or 1 SOL =  2297.216549447943 PEACH
```