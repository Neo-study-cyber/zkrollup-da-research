// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "./IGroth16Verifier.sol";

contract YulRollupDA {
    address public immutable verifierContract;
    bytes32 public currentStateRoot;
    uint256 public totalBatchesSubmitted;

    event BatchSubmitted(
        uint256 indexed batchId,
        bytes32 indexed newStateRoot,
        bytes32 blobHash,
        uint256 transactionCount
    );

    constructor(address _verifierContract, bytes32 _initialStateRoot) {
        verifierContract = _verifierContract;
        currentStateRoot = _initialStateRoot;
    }

    function submitBatchYul(
        uint256[2] calldata _pA,
        uint256[2][2] calldata _pB,
        uint256[2] calldata _pC,
        uint256[2] calldata _pubSignals,
        bytes32 _blobHash
    ) external returns (bool) {
        bool isValid = IGroth16Verifier(verifierContract).verifyProof(_pA, _pB, _pC, _pubSignals);
        require(isValid, "Invalid ZK Proof!");

        bytes32 newStateRoot;
        
        assembly {
            newStateRoot := calldataload(_pubSignals)
        }

        currentStateRoot = newStateRoot;
        
        assembly {
            let currentBatches := sload(totalBatchesSubmitted.slot)
            sstore(totalBatchesSubmitted.slot, add(currentBatches, 1))
        }

        emit BatchSubmitted(totalBatchesSubmitted, newStateRoot, _blobHash, 32);

        return true;
    }
}
