// Các tham số cấu hình BN254 / ALT_BN128 Elliptic Curve cho EVM
module.exports = {
    FIELD_SIZE: BigInt("21888242871839275222246405745257275088548364400416034343698204186575808495617"),
    TREE_DEPTH: 20, // Độ sâu Sparse Merkle Tree (Hỗ trợ 2^20 cử tri)
    BLOB_SIZE_BYTES: 131072 // 128 KB chuẩn EIP-4844 Blob
};
