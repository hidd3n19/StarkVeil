pragma circom 2.1.0;

include "node_modules/circomlib/circuits/poseidon.circom";

// Enforces that a leaf belongs to a Merkle tree of depth nLevels
template MerkleTreeInclusionProof(nLevels) {
    signal input leaf;
    signal input pathElements[nLevels];
    signal input pathIndices[nLevels];
    
    signal output root;
    
    component hashers[nLevels];
    
    signal levels[nLevels + 1];
    signal left[nLevels];
    signal right[nLevels];
    
    levels[0] <== leaf;
    
    for (var i = 0; i < nLevels; i++) {
        hashers[i] = Poseidon(2);
        
        // If pathIndices[i] == 0: level[i] is left, pathElement is right
        // If pathIndices[i] == 1: pathElement is left, level[i] is right
        left[i] <== pathIndices[i] * (pathElements[i] - levels[i]) + levels[i];
        right[i] <== pathIndices[i] * (levels[i] - pathElements[i]) + pathElements[i];
        
        // Ensure pathIndices is 0 or 1
        pathIndices[i] * (1 - pathIndices[i]) === 0;
        
        hashers[i].inputs[0] <== left[i];
        hashers[i].inputs[1] <== right[i];
        
        levels[i+1] <== hashers[i].out;
    }
    
    root <== levels[nLevels];
}

// Semaphore Circuit
template Semaphore(nLevels) {
    signal input identityNullifier;
    signal input identityTrapdoor;
    signal input treePathIndices[nLevels];
    signal input treeSiblings[nLevels];
    
    signal input messageHash;
    signal input scope;
    
    signal output root;
    signal output nullifierHash;
    
    // 1. Calculate the Identity Commitment
    component identityCommitmentHasher = Poseidon(2);
    identityCommitmentHasher.inputs[0] <== identityNullifier;
    identityCommitmentHasher.inputs[1] <== identityTrapdoor;
    
    // 2. Validate Identity Commitment is in the Merkle Tree
    component tree = MerkleTreeInclusionProof(nLevels);
    tree.leaf <== identityCommitmentHasher.out;
    for (var i = 0; i < nLevels; i++) {
        tree.pathElements[i] <== treeSiblings[i];
        tree.pathIndices[i] <== treePathIndices[i];
    }
    root <== tree.root;
    
    // 3. Calculate the Nullifier Hash
    component nullifierHasher = Poseidon(2);
    nullifierHasher.inputs[0] <== identityNullifier;
    nullifierHasher.inputs[1] <== scope;
    nullifierHash <== nullifierHasher.out;
    
    // 4. Dummy constraints to ensure messageHash and scope are tied to the proof
    signal messageSquare <== messageHash * messageHash;
}

// Target 20 levels of depth
component main {public [messageHash, scope]} = Semaphore(20);
