// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "forge-std/Test.sol";
import "../src/Groth16Verifier.sol";
import "../src/RollupDA.sol";
import "../src/YulRollupDA.sol";

contract RollupBenchmarkTest is Test {
    Groth16Verifier public verifier;
    RollupDA public rollupSol;
    YulRollupDA public rollupYul;

    function setUp() public {
        verifier = new Groth16Verifier();
        rollupSol = new RollupDA(address(verifier), bytes32(0));
        rollupYul = new YulRollupDA(address(verifier), bytes32(0));
    }

    function testGasStandardSolidity() public {
        uint256[2] memory pA = [uint256(0), uint256(0)];
        uint256[2][2] memory pB = [[uint256(0), uint256(0)], [uint256(0), uint256(0)]];
        uint256[2] memory pC = [uint256(0), uint256(0)];
        uint256[2] memory pubSignals = [uint256(12345), uint256(0)];
        bytes32 blobHash = keccak256("test_blob");

        // Giả lập pass verification để test Gas Submit
        vm.mockCall(
            address(verifier),
            abi.encodeWithSelector(Groth16Verifier.verifyProof.selector),
            abi.encode(true)
        );

        uint256 gasBefore = gasleft();
        rollupSol.submitBatch(pA, pB, pC, pubSignals, blobHash);
        uint256 gasUsed = gasBefore - gasleft();

        emit log_named_uint("Standard Solidity Gas Used", gasUsed);
    }

    function testGasYulAssembly() public {
        uint256[2] memory pA = [uint256(0), uint256(0)];
        uint256[2][2] memory pB = [[uint256(0), uint256(0)], [uint256(0), uint256(0)]];
        uint256[2] memory pC = [uint256(0), uint256(0)];
        uint256[2] memory pubSignals = [uint256(12345), uint256(0)];
        bytes32 blobHash = keccak256("test_blob");

        vm.mockCall(
            address(verifier),
            abi.encodeWithSelector(Groth16Verifier.verifyProof.selector),
            abi.encode(true)
        );

        uint256 gasBefore = gasleft();
        rollupYul.submitBatchYul(pA, pB, pC, pubSignals, blobHash);
        uint256 gasUsed = gasBefore - gasleft();

        emit log_named_uint("Yul Assembly Gas Used", gasUsed);
    }
}
