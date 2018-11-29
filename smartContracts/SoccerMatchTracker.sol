/*
I am using the latest stable version of Solidity -nightly builds excluded- by November 24th 2018
Given that I am not using the experimental ABI, the smart contract below can be deployed on the MainNet/Rinkeby safely.
*/
pragma solidity ^0.5.0;

/*
===============================================================================
This smart contract allows you to keep track of soccer match results.
Author: Claudio Romero
===============================================================================
*/
contract SoccerMatchTracker {

    // The owner of the smart contract
    address payable private contractOwner;
    
    // The struct below represents a single match between two teams
    struct MatchResult {
        bytes32 localTeam;      // Team #1
        bytes32 visitorTeam;    // Team #2
        uint8 localScore;       // The final score of Team #1
        uint8 visitorScore;     // The final score of Team #2
    }
    
    // Holds the scores of every single match in the league
    MatchResult[] private scores;

    // The list of accounts authorized to submit match results
    mapping (address => bool) private authorizedAccounts;

    modifier contractOwnerOnly()
    {
        require(msg.sender == contractOwner, "Unauthorized. Only the contract owner is allowed to execute this function."
        );
        _;
    }
    
    modifier authorizedAccount()
    {
        require(authorizedAccounts[msg.sender], "Sender not authorized. You are not allowed to submit match results. Contact the owner of the contract"
        );
        _;
    }

    // Constructor
    constructor() public {
        contractOwner = msg.sender;
    }

    // Destructor
    function kill() public contractOwnerOnly { 
        selfdestruct(contractOwner);
    }

    // Grants the account specified permissions to submit match results
    function grantAccess(address account) public contractOwnerOnly {
        authorizedAccounts[account] = true;
    }

    // Revokes permissions from the account specified
    function revokeAccess(address account) public contractOwnerOnly {
        authorizedAccounts[account] = false;
    }
    
    /*
    Stores the results of a given match.
    This function can only be executed by authorized accounts.
    The owner of the contract is the only one who can grant or revoke access to this, at their sole discretion.
    */
    function storeMatchResult(bytes32 localTeam, bytes32 visitorTeam, uint8 localScore, uint8 visitorScore) public authorizedAccount {
        // Validations
        require(localTeam != bytes32(0), "The local team is required");
        require(visitorTeam != bytes32(0), "The visitor team is required");
        require(localTeam != visitorTeam, "The local and the visitor cannot be the same team");
        require(localScore >= 0, "The score of the local team cannot be negative");
        require(visitorScore >= 0, "The score of the visitor team cannot be negative");
        require(localScore < 200, "The score of the local team must be lower than 200");
        require(visitorScore < 200, "The score of the visitor team must be lower than 200");
        
        // Store the score of the match
        scores.push(MatchResult(localTeam, visitorTeam, localScore, visitorScore));
    }    

    /*
    * Gets the results of all matches.
    * Notes:
    * -------
    *    1) We cannot return an array of structs unless we use the experimental ABI interface of Solidity 0.4+
    *    2) However, nothing prevents us from returning parallel arrays using the production-standard ABI! way to go :)
    */
    function getScores() public view returns (bytes32[] memory, bytes32[] memory, uint8[] memory, uint8[] memory) {
        // The number of game matches recorded so far
        uint256 totalScores = scores.length;
        
        // The search results (parallel arrays)
        bytes32[] memory localTeams = new bytes32[](totalScores);
        bytes32[] memory visitorTeams = new bytes32[](totalScores);
        uint8[] memory localScores = new uint8[](totalScores);
        uint8[] memory visitorScores = new uint8[](totalScores);
        
        // Collect the results
        for (uint256 i = 0; i < totalScores; i++) {
            localTeams[i] = scores[i].localTeam;
            visitorTeams[i] = scores[i].visitorTeam;
            localScores[i] = scores[i].localScore;
            visitorScores[i] = scores[i].visitorScore;
        }
        
        return (localTeams, visitorTeams, localScores, visitorScores);
    }
}
