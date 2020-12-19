import "../css/style.css"

import { default as Web3} from "web3"
import { default as contract } from "truffle-contract"

import votingArtifacts from "../../build/contracts/Voting.json"
var VotingContract = contract(votingArtifacts)


window.App = {
  start: function() { 
    VotingContract.setProvider(window.web3.currentProvider)
    VotingContract.defaults({from: window.web3.eth.accounts[0],gas:6721975})
    VotingContract.deployed().then(function(instance){

     
      instance.getNumOfCandidates().then(function(numOfCandidates){

        if (numOfCandidates == 0){
          
          instance.addCandidate("Candidate1","Democratic").then(function(result){ 
            $("#candidate-box").append(`<div class='form-check'><input class='form-check-input' type='checkbox' value='' id=${result.logs[0].args.candidateID}><label class='form-check-label' for=0>Candidate1</label></div>`)
          })
          instance.addCandidate("Candidate2","Republican").then(function(result){
            $("#candidate-box").append(`<div class='form-check'><input class='form-check-input' type='checkbox' value='' id=${result.logs[0].args.candidateID}><label class='form-check-label' for=1>Candidate1</label></div>`)
          })
          numOfCandidates = 2 
        }
        else { 
          for (var i = 0; i < numOfCandidates; i++ ){
            instance.getCandidate(i).then(function(data){
              $("#candidate-box").append(`<div class="form-check"><input class="form-check-input" type="checkbox" value="" id=${data[0]}><label class="form-check-label" for=${data[0]}>${window.web3.toAscii(data[1])}</label></div>`)
            })
          }
      }
        window.numOfCandidates = numOfCandidates 
      })
    }).catch(function(err){ 
      console.error("ERROR! " + err.message)
    })
  },

  vote: function() {
    var uid = $("#id-input").val() 

     
    if (uid == ""){
      $("#msg").html("<p>Please enter id.</p>")
      return
    }
    if ($("#candidate-box :checkbox:checked").length > 0){ 
      var candidateID = $("#candidate-box :checkbox:checked")[0].id
    } 
    else {
      $("#msg").html("<p>Please vote for a candidate.</p>")
      return
    }
    VotingContract.deployed().then(function(instance){
      instance.vote(uid,parseInt(candidateID)).then(function(result){
        /*if(result==true){
          $("#msg").html("<p>Voted</p>")
        }
        else{
          $("#msg").html("<p>Already Voted</p>")
        }*/
        $("#msg").html("<p>Voted</p>")
      }).catch(function(err){ 
        console.log("ERROR! " + err.message)
        $("#msg").html("<p>Already Voted</p>")
      })
    }).catch(function(err){ 
      console.log("ERROR! " + err.message)
    })
  },

  // function called when the "Count Votes" button is clicked
  findNumOfVotes: function() {
    VotingContract.deployed().then(function(instance){
      // this is where we will add the candidate vote Info before replacing whatever is in #vote-box
      var box = $("<section></section>") 

      // loop through the number of candidates and display their votes
      for (var i = 0; i < window.numOfCandidates; i++){
        // calls two smart contract functions
        var candidatePromise = instance.getCandidate(i)
        var votesPromise = instance.totalVotes(i)

        // resolves Promises by adding them to the variable box
        Promise.all([candidatePromise,votesPromise]).then(function(data){
          box.append(`<p>${window.web3.toAscii(data[0][1])}: ${data[1]}</p>`)
        }).catch(function(err){ 
          console.error("ERROR! " + err.message)
        })
      }
      $("#vote-box").html(box) // displays the "box" and replaces everything that was in it before
    })
  }
}

// When the page loads, we create a web3 instance and set a provider. We then set up the app
window.addEventListener("load", function() {
  // Is there an injected web3 instance?
  if (window.ethereum) {
    const web3 = new Web3(window.ethereum);
    try {
      // Request account access if needed
      window.ethereum.enable();
      // Acccounts now exposed
      window.web3= web3;
    } catch (error) {
      console.error(error);
    }
  }
  // Legacy dapp browsers...
  else if (window.web3) {
    // Use Mist/MetaMask's provider.
    console.log('Injected web3 detected.');

  }
  // Fallback to localhost; use dev console port by default...
  else {
    const provider = new Web3.providers.HttpProvider('http://127.0.0.1:7545');
    const web3 = new Web3(provider);
    console.log('No web3 instance injected, using Local web3.');
    window.web3= web3;
  }
  // initializing the App
  window.App.start()
})