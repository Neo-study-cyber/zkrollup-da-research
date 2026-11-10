const crypto = require('crypto');

class SparseMerkleTree {
    constructor(depth = 20) {
        this.depth = depth;
        this.zeroHashes = new Array(depth + 1);
        this.nodes = new Map();

        let currentZero = '0x0000000000000000000000000000000000000000000000000000000000000000';
        this.zeroHashes[0] = currentZero;
        for (let i = 1; i <= depth; i++) {
            currentZero = this.hash(currentZero, currentZero);
            this.zeroHashes[i] = currentZero;
        }
    }

    hash(left, right) {
        return '0x' + crypto.createHash('sha256').update(left + right.replace('0x', '')).digest('hex');
    }

    getNodeKey(level, index) {
        return `${level}_${index}`;
    }

    getNode(level, index) {
        const key = this.getNodeKey(level, index);
        if (this.nodes.has(key)) {
            return this.nodes.get(key);
        }
        return this.zeroHashes[level];
    }

    update(leafIndex, leafValue) {
        let currentIndex = leafIndex;
        let currentValue = leafValue;
        this.nodes.set(this.getNodeKey(0, currentIndex), currentValue);

        for (let level = 0; level < this.depth; level++) {
            const isRight = currentIndex % 2n === 1n;
            const siblingIndex = isRight ? currentIndex - 1n : currentIndex + 1n;

            const siblingValue = this.getNode(level, siblingIndex);

            if (isRight) {
                currentValue = this.hash(siblingValue, currentValue);
            } else {
                currentValue = this.hash(currentValue, siblingValue);
            }

            currentIndex = currentIndex / 2n;
            this.nodes.set(this.getNodeKey(level + 1, currentIndex), currentValue);
        }

        return currentValue;
    }

    getRoot() {
        return this.getNode(this.depth, 0n);
    }
}

async function main() {
    console.log("=== SPARSE MERKLE TREE (SMT) STATE ENGINE ===");
    const tree = new SparseMerkleTree(20);
    console.log("Initial Empty Root (Depth 20):", tree.getRoot());

    console.log("\nInserting 3 Anonymous Identity Nullifiers...");
    const nullifiers = [
        "0x1233333322110000000000000000000000000000000000000000000000000001",
        "0x4566666655440000000000000000000000000000000000000000000000000002",
        "0x7899999988770000000000000000000000000000000000000000000000000003"
    ];

    for (let i = 0; i < nullifiers.length; i++) {
        const newRoot = tree.update(BigInt(i), nullifiers[i]);
        console.log(` -> Leaf ${i} inserted: ${nullifiers[i].substring(0, 18)}... | New Root: ${newRoot.substring(0, 18)}...`);
    }

    console.log("\n=== SMT STATE UPDATE COMPLETE ===");
    console.log("Final State Root Hash:", tree.getRoot());
}

main().catch(console.error);
