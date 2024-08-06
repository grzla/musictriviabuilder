import crypto from 'crypto';

// Function to create a hash value using SHA-256
function createHash(seed: number, value: string): number {
  const hash = crypto.createHash('md5');
  hash.update(value + seed.toString());
  return parseInt(hash.digest('hex').slice(0, 8), 16);
}

// Function to generate multiple hash functions
export function getHashFunctions(num: number): ((value: string) => number)[] {
  const hashFunctions = [];
  for (let i = 0; i < num; i++) {
    hashFunctions.push((value: string) => createHash(i, value));
  }
  return hashFunctions;
}

// Function to compute the MinHash signature for a set of tokens
export function minhashSignature(tokens: Set<string>, hashFunctions: ((value: string) => number)[]): number[] {
  return hashFunctions.map(hashFunc => {
    let minHash = Number.MAX_SAFE_INTEGER;
    tokens.forEach(token => {
      const hash = hashFunc(token);
      if (hash < minHash) {
        minHash = hash;
      }
    });
    return minHash;
  });
}

// Function to estimate the Jaccard similarity between two MinHash signatures
export function estimateJaccardSimilarity(sig1: number[], sig2: number[]): number {
  let matchCount = 0;
  for (let i = 0; i < sig1.length; i++) {
    if (sig1[i] === sig2[i]) {
      matchCount++;
    }
  }
  return matchCount / sig1.length;
}
