# Soccer League Demo
- This API allows you to keep track of soccer match results on the blockchain.
- It also provides endpoints for querying the raw data as well as a Table Of Positions (*rank*), 
either directly from the Blockchain or via a database (***LevelDB***)
- A simple user interface is also available, for demo purposes.

## Primary Technical Contact
- This API was created by [Claudio Romero](https://ar.linkedin.com/in/claudioromero)
- Please feel free to reach out via LinkedIn in case you have any questions or suggestions.

## Overview
- The smart contract was tested and published on the blockchain (***Rinkeby***). 
- The contract address is [0xf98100214fd34f67b8b784227638163f15880fc6](https://rinkeby.etherscan.io/address/0xf98100214fd34f67b8b784227638163f15880fc6), available on Etherscan
- Smart contract code is as efficient as possible (*see the ABI*)
- Smart contract code is production-safe. It does not use the experimental ABI of Solidity.
- Smart contract security implemented through ***modifiers*** and validations.
- The smart contract stores the match results only, using efficient Solidity code in order to keep gas consumption at the minimum possible.

## Smart contract security
- The owner of the contract (*that would be me, Claudio*) is the only party who can grant or revoke permissions on the smart contract, for demo purposes.
- Only users authorized by *Claudio* will be allowed to submit match results on the blockchain.
- Such security scheme was implemented through ***"modifiers"*** in the smart contract. 
- As a result it cannot be gamed, even if you inherit from the contract.

## Can this be gamed? Can I hack the scheme through inheritance?
- Not really, but I encourage you to try - just for kicks :)
- The smart contract does not expose any public properties due to security reasons, even if you inherit from
- Also notice that the modifiers will prevent you from revoking my account rights.

## So how can I become an authorized party?
- Send me your public address and I will grant you the respective permissions to submit game results on the blockchain.
- Simple as that.
- Meanwhile you can post results using the sample credentials I sent you in private.

## Database selected
- The API caches blockchain queries in a database, for the sake of performance.
- I've choosen **LevelDB** because it is fast and lightweight, not to mention it is ranked as one of the fastest key-value stores available.
- LevelDB is available at https://github.com/Level/level

## Code Styling Policy
- Source code styling is being monitored by a third-party tool called **esLint**, with their default rules.
- The source code of the API meets all of the requirements and code practices reported by the tool, with no exception.

## Build from sources

1) Download the code from Github by running the following:

    `git clone https://github.com/claudioromero/soccer-league-demo.git`


2) Install the API on your local environment by running the following:

    `npm install`

## How to run the API in your local environment

To run the API on your local environment please run the following on the command prompt:

    `npm start`

The user interface and the API will be reachable through a web browser at http://localhost:8080/

