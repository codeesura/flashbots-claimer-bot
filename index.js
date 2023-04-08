const { ethers } = require("ethers");
const { FlashbotsBundleProvider, FlashbotsBundleResolution} = require("@flashbots/ethers-provider-bundle");

const addresses = {
    'StgTokenToken': '0xAf5191B0De278C7286d6C7CC6ab6BB8A73bA2Cd6',
    'claimContract': '0x4dFCAD285eF39FeD84e77eDf1B7DBC442565E55e',
    'contractAddressWETH': '0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640',
    'contractAddressStgToken': '0x6ce6D6D40a4C4088309293B0582372A2e6bB632E'
};

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
const CHAIN_ID = 1;
const provider = new ethers.providers.JsonRpcProvider('https://eth-mainnet.g.alchemy.com/v2/API_KEY');

const armutPrivateKey = process.env.ARMUT_PRIVATE_KEY;
const hacklenenPrivateKey = process.env.HACKLENEN_PRIVATE_KEY;

const armut = new ethers.Wallet(armutPrivateKey, provider)
const hacklenen = new ethers.Wallet(hacklenenPrivateKey, provider)

const contractABI = [];
const tokenABI = [];
const StgTokenContractABI = []; 
const WETHCContractABI = [];

const claimInterface = new ethers.utils.Interface(contractABI);
const tokenInterface = new ethers.utils.Interface(tokenABI);
const WETHInterface = new ethers.Contract(addresses.contractAddressWETH, WETHCContractABI, provider);
const StgTokenInterface = new ethers.Contract(addresses.contractAddressStgToken, StgTokenContractABI, provider);

const contract = new ethers.Contract(addresses.claimContract, contractABI, provider);
const contractToken = new ethers.Contract(addresses.StgTokenToken, tokenABI, provider);

function roundToNextDecimal(number, decimalPlaces) {
    const scaleFactor = Math.pow(10, decimalPlaces);
    return Math.round(number * scaleFactor) / scaleFactor;
}

async function main() {
    const flashbotsProvider = await FlashbotsBundleProvider.create(provider, ethers.Wallet.createRandom())
    provider.on('block', async (blockNumber) => {
        try {
            const balance = await contract.redeemable(hacklenen.address);
            const balanceDecimal = parseInt(balance.toString()) / 10**18 ;
            const gasPrice = await provider.getGasPrice();
            const gasPriceDecimal = ((parseInt(gasPrice.toString()) / 1000000000) + 0.5).toFixed(8);

              if (parseInt(balance.toString()) > 4000000000000000000n) {
                  const WETHSlot0 = await WETHInterface.slot0();
                  const WETHPrice = 1/((parseInt(WETHSlot0[0].toString()))**2 / 2**192) * 10**12
                  const StgTokenSlot0 = await StgTokenInterface.slot0();
                  const StgTokenPrice = WETHPrice/(1/((parseInt(StgTokenSlot0[0].toString()))**2 / 2**192))
                  
                  const gweiCalculate = (21000 * gasPriceDecimal) / 1000000000 ;
                  const valueCalculate = roundToNextDecimal((gasPriceDecimal * 91000)/1000000000,8) ;
                  const costCalculate = gweiCalculate + valueCalculate ;
                  
                  if ((costCalculate * WETHPrice) < (balanceDecimal * StgTokenPrice - 0.3)) {
                      const accountBalance = await contractToken.balanceOf(hacklenen.address);
                      const bundle = [
                          {
                              transaction: {
                                  chainId: CHAIN_ID,
                                  to:hacklenen.address,
                                  value: ethers.utils.parseEther((valueCalculate.toFixed(8)).toString()),
                                  type: 2,
                                  gasLimit: 21000,
                                  maxFeePerGas: ethers.utils.parseUnits(gasPriceDecimal.toString(), 'gwei'),
                                  maxPriorityFeePerGas: ethers.utils.parseUnits(gasPriceDecimal.toString(), 'gwei'),
                                },
                                signer: armut 
                            },
                            {
                                transaction: {
                                    chainId: CHAIN_ID,
                                    to: addresses.claimContract,
                                    data: claimInterface.encodeFunctionData("redeem"),
                                    type: 2,
                                    gasLimit: 60000,
                                    maxFeePerGas: ethers.utils.parseUnits(gasPriceDecimal.toString(), 'gwei'),
                                    maxPriorityFeePerGas: ethers.utils.parseUnits(gasPriceDecimal.toString(), 'gwei'),
                                },
                                signer: hacklenen
                            },
                            {
                                transaction: {
                                    chainId: CHAIN_ID,
                                    to: addresses.StgTokenToken,
                                    data: tokenInterface.encodeFunctionData("transfer",[
                                        armut.address,
                                        (parseInt(accountBalance)+parseInt(balance)).toString()
                                    ]),
                                    type: 2,
                                    gasLimit: 36000,
                                    maxFeePerGas: ethers.utils.parseUnits(gasPriceDecimal.toString(), 'gwei'),
                                    maxPriorityFeePerGas: ethers.utils.parseUnits(gasPriceDecimal.toString(), 'gwei'),
                                },
                                signer: hacklenen
                            },
                        ]
                        const flashbotsTransactionResponse = await flashbotsProvider.sendBundle(
                            bundle,
                            blockNumber + 1,
                            );
                        }
                        const resolution = await flashbotsTransactionResponse.wait();
                        if ('error' in flashbotsTransactionResponse) {
                            console.warn(flashbotsTransactionResponse.error.message)
                            return;
                        ;
                    }
                } catch(error) {
                    return;
                }
            })
        }
main();
