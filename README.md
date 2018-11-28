# Soccer League Demo

## Overview
- Smart contract tested and published on the blockchain (*Rinkeby*). The contract address is https://rinkeby.etherscan.io/address/0xf98100214fd34f67b8b784227638163f15880fc6
- Smart contract security implemented through ***modifiers*** and validations.
- A simple user interface is also available, for demo purposes. (*HTML5, responsive*)
- Blockchain queries are also saved in a database (*LevelDB*) for the sake of performance.
- The API provides endpoints for recording the results of a match as well as for querying the raw data and aggregates table.
- The smart contract stores the match results only, using efficient Solidity code in order to keep gas consumption at the minimum possible.

## Smart contract security
- The owner of the contract (that would be me, *Claudio*) is the only party who can grant or revoke permissions on the smart contract.
- Only the users authorized by Claudio will be allowed to submit match results on the blockchain.
- Such security scheme was implemented through *"modifiers"* in the smart contract. 
- As a result, it cannot be gamed even if you inherit from the contract.

## How can I become an authorized party?
- Email me your public address
- I will grant you permissions to submit game results on the blockchain.

## Can this be gamed? Can I revoke Claudio's permissions? Could I hack the scheme through inheritance?
- Not really, but you are welcome to try, just for kicks :)
- The contract does not expose any public properties due to security reasons.
- Also notice that the modifiers will prevent you from revoking my account rights.

## Database selected
- The API caches blockchain queries in a database, for the sake of performance.
- I choose **LevelDB** because it is fast and lightweight, not to mention it is ranked as one of the fastest key-value stores available.
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

The user interface and the API will be reachable at http://localhost:8080/

