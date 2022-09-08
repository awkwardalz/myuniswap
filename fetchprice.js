const { ethers } = require('ethers');
const { Pool } = require('@uniswap/v3-sdk');
const { Token } = require('@uniswap/sdk-core');
require('dotenv').config();
const IUniswapV3PoolABI = require('./abi/UniswapV3Pool.json').abi;
const fetch = require("node-fetch");
const ETHERSCAN = process.env.ETHERSCAN;
const KEY = process.env.INFURA_API;
const provider = new ethers.providers.JsonRpcProvider(`https://mainnet.infura.io/v3/${KEY}`);
const poolAddress = '0x70fa8b467e801327e46f49d635d99910b82ad7d2';
const poolContract = new ethers.Contract(poolAddress, IUniswapV3PoolABI, provider);
async function getPoolImmutables() {
    const [factory, token0, token1, fee, tickSpacing, maxLiquidityPerTick] = await Promise.all([
        poolContract.factory(),
        poolContract.token0(),
        poolContract.token1(),
        poolContract.fee(),
        poolContract.tickSpacing(),
        poolContract.maxLiquidityPerTick(),
    ]);
    const immutables = {
        factory,
        token0,
        token1,
        fee,
        tickSpacing,
        maxLiquidityPerTick,
    };
    return immutables;
}
async function getPoolState() {
    const [liquidity, slot] = await Promise.all([poolContract.liquidity(), poolContract.slot0()]);
    const PoolState = {
        liquidity,
        sqrtPriceX96: slot[0],
        tick: slot[1],
        observationIndex: slot[2],
        observationCardinality: slot[3],
        observationCardinalityNext: slot[4],
        feeProtocol: slot[5],
        unlocked: slot[6],
    };
    return PoolState;
}
async function main() {
    const [immutables, state] = await Promise.all([getPoolImmutables(), getPoolState()]);
    const TokenA = new Token(1, immutables.token0, 18, 'PEACH', 'PEACH');
    const TokenB = new Token(1, immutables.token1, 18, 'WETH', 'Wrapped Ether');
    const poolPeach = new Pool(TokenA, TokenB, immutables.fee, state.sqrtPriceX96.toString(), state.liquidity.toString(), state.tick);
    const url = `https://api.etherscan.io/api?module=stats&action=ethprice&apikey=${ETHERSCAN}`;
    const ethprice = await fetch(url)
        .then(res => res.json())
        .then(res => {
            return res.result.ethusd
        })

    const solprice = await fetch('https://api.binance.com/api/v3/avgPrice?symbol=SOLUSDC')
        .then(res => res.json())
        .then(res => {
            return res.price
        })
    const p = poolPeach.token0Price.toSignificant(6);
    //  console.log(ethprice)
    const PEACH_USD = Number(p) * ethprice;
    const PEACH_SOL = PEACH_USD / solprice;
    console.log('1 PEACH = ', PEACH_USD, 'USD');
    console.log('1 PEACH = ', p, 'ETH; or 1 ETH = ', 1 / p, 'PEACH')
    console.log('1 PEACH = ', PEACH_SOL, 'SOL; or 1 SOL = ', 1 / PEACH_SOL, 'PEACH')
}
main();