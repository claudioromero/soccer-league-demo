# Soccer League Demo

## Overview
> Smart contract tested and published on the blockchain (*Rinkeby*). The contract address is 0xf98100214FD34f67B8b784227638163F15880fC6
> Smart contract security implemented through *modifiers* and validations.
> A simple user interface is also available, for demo purposes. (*HTML5, responsive*)
> Blockchain queries are also saved in a database (*LevelDB*) for the sake of performance.
> The API provides endpoints for recording the results of a match as well as for querying the raw data and aggregates table.
> The smart contract stores the match results only

## Database selected
> The API caches blockchain queries in a database, for the sake of performance.
> I choose **LevelDB** because it is fast and lightweight, not to mention it is ranked as one of the fastest key-value stores available.
> https://github.com/Level/level

## Smart contract security
> **Only authorized users are allowed to submit match results on the blockchain.**
> This security rule is implemented through a *"modifier"* in the smart contract. 
> As a result, you cannot game this even if you inherit from this smart contract.
>
> The contract owner can grant or revoke access to authorized parties, at their sole discretion.

## Code Styling Policy
- Source code styling is being monitored by a third-party tool called **esLint**, with their default rules.
- The source code of the API meets all of the requirements and code practices reported by the tool, with no exception.

## Build from sources

1) Download the code from the repository by running the following on the command prompt:

    `git clone https://github.com/claudioromero/soccer-league-demo.git`


2) To install the API on your local environment please run the following:

    `npm install`

3) The user interface and API will be reachable at http://localhost:8080/


## How to run the API

To run the API on your local environment please run the following on the command prompt:

    npm start

