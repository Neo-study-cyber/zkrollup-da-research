const fs = require('fs');
const path = require('path');
const snarkjs = require('snarkjs');
const constants = require('../circuits/constants.js');

async function runBatcher() {
    console.log("=== LAYER-2 SEQUENCER BATCHING & EIP-4844 BLOB ENCODER ===");

    // 1. Giả lập sinh ZK Proof cho 1 cử tri/giao dịch L2
    const input = { secretKey: "123456789", electionId: "999" };
    const wasmPath = path.join(__dirname, "../circuits/voter_proof_js/voter_proof.wasm");
    const zkeyPath = path.join(__dirname, "../circuits/voter_proof_final.zkey");

    console.log("[1/3] Generating ZK Proof Off-chain...");
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(input, wasmPath, zkeyPath);
    console.log(" -> Proof generated successfully!");
    console.log(" -> Public Nullifier Hash:", publicSignals[0]);

    // 2. Nén mảng giao dịch ZK thành cấu trúc Blob 128 KB (EIP-4844)
    console.log("[2/3] Packing Batched Transactions into EIP-4844 Blob Buffer...");
    const blobBuffer = Buffer.alloc(constants.BLOB_SIZE_BYTES); // 131,072 Bytes
    const proofBytes = Buffer.from(JSON.stringify(proof));
    proofBytes.copy(blobBuffer, 0); // Đưa bằng chứng vào Blob Buffer

    console.log(` -> Blob Size: ${blobBuffer.length} Bytes (128 KB Standard Blob Allocated)`);

    // 3. Chuẩn bị Calldata cho Smart Contract RollupDA
    console.log("[3/3] Formatting Solidity Calldata for L1 Submission...");
    const calldataString = await snarkjs.groth16.exportSolidityCallData(proof, publicSignals);
    
    console.log("\n=== SEQUENCER BATCH READY FOR L1 SUBMISSION ===");
    console.log("Calldata Args:", calldataString.substring(0, 100) + "...");
}

runBatcher().catch(console.error);
