# Flashbots Claimer Bot

This repository contains a simple Flashbots claimer bot that executes a series of transactions on Ethereum mainnet using the Flashbots service. Flashbots is a permissionless, transparent, and efficient MEV (Miner Extractable Value) extraction service that aims to minimize the negative externalities of MEV on the Ethereum ecosystem.

## Overview

The bot listens for new blocks, and when certain conditions are met, it sends a bundle of transactions using the Flashbots service. The transactions include redeeming a token, transferring funds between wallets, and performing an claim operation.

## Prerequisites

1. [Node.js](https://nodejs.org/en/) (version 12.x or higher)
2. [npm](https://www.npmjs.com/get-npm) (usually bundled with Node.js)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/codeesura/flashbots-claimer-bot.git
cd flashbots-claimer-bot
```

2. Install the required packages:

```bash
npm install
```

3. Create a .env file in the root directory of the project and set your private keys:

```makefile
ARMUT_PRIVATE_KEY=your_armut_private_key
HACKLENEN_PRIVATE_KEY=your_hacklenen_private_key
```

⚠️ WARNING: Never share your private keys with anyone or commit them to version control. Keep them secure.

## Usage

To run the bot, execute the following command:

```bash
node index.js
```

The bot will start listening for new blocks and execute the transactions when the specified conditions are met.

## License

This project is released under the [MIT License](https://github.com/codeesura/flashbots-claimer-bot/blob/main/LICENSE).

## Disclaimer

This project is for educational purposes only. Use it at your own risk. The authors are not responsible for any financial losses, damages, or any other consequences that may arise from using this bot. Always review and test the code thoroughly before deploying it on mainnet.
