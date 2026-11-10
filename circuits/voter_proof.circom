pragma circom 2.1.6;

template VoterIdentityProof() {
    signal input secretKey;
    signal input electionId;
    signal output nullifierHash;

    nullifierHash <-- secretKey * electionId;
    nullifierHash === secretKey * electionId;
}

component main {public [electionId]} = VoterIdentityProof();
