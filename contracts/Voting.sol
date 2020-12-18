pragma solidity 0.5.16;
// written for Solidity version 0.4.18 and above that doesnt break functionality

contract Voting {
    // an event that is called whenever a Candidate is added so the frontend could
    // appropriately display the candidate with the right element id (it is used
    // to vote for the candidate, since it is one of arguments for the function "vote")
    event AddedCandidate(uint candidateID);

    // describes a Voter, which has an id and the ID of the candidate they voted for
    address owner;
    constructor() public {
        owner=msg.sender;
    }
    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }
    /*struct Voter {
        bytes32 uid; // bytes32 type are basically strings
        uint candidateIDVote;
    }*/
    // describes a Candidate
    struct Candidate {
        bytes32 name;
        bytes32 party; 
        uint votecount;
        bool doesExist; 
    }

    // These state variables are used keep track of the number of Candidates/Voters 
    // and used to as a way to index them     
    uint numCandidates; // declares a state variable - number Of Candidates
    uint numVoters;

    
    // Think of these as a hash table, with the key as a uint and value of 
    // the struct Candidate/Voter. These mappings will be used in the majority
    // of our transactions/calls
    // These mappings will hold all the candidates and Voters respectively
    mapping (uint => Candidate) candidates;
    mapping (bytes32 => uint) voters;
    
    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     *  These functions perform transactions, editing the mappings *
     * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

    function addCandidate(bytes32 name, bytes32 party) onlyOwner public {
        // candidateID is the return variable
        uint candidateID = numCandidates++;
        // Create new Candidate Struct with name and saves it to storage.
        candidates[candidateID] = Candidate(name,party,0,true);
        emit AddedCandidate(candidateID);
    }

    function vote(bytes32 uid, uint candidateID) public returns (bool) {
        // checks if the struct exists for that candidate
        if (candidates[candidateID].doesExist == true && voters[uid]==0) {
            //uint voterID = numVoters++; //voterID is the return variable
            voters[uid] = 1;
            candidates[candidateID].votecount+=1;
            //return true;
        }
        else{
            //return false;
            revert("Already Voted");
        }
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * 
     *  Getter Functions, marked by the key word "view" *
     * * * * * * * * * * * * * * * * * * * * * * * * * */
    

    // finds the total amount of votes for a specific candidate by looping
    // through voters 
    function totalVotes(uint candidateID) view public returns (uint) {
        return candidates[candidateID].votecount; 
    }

    function getNumOfCandidates() public view returns(uint) {
        return numCandidates;
    }

    function getNumOfVoters() public view returns(uint) {
        return numVoters;
    }
    // returns candidate information, including its ID, name, and party
    function getCandidate(uint candidateID) public view returns (uint,bytes32, bytes32) {
        return (candidateID,candidates[candidateID].name,candidates[candidateID].party);
    }
}
