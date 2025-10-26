export const VoteContractABI = {
  "abi": [
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "songId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "versionId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "voter",
          "type": "address"
        }
      ],
      "name": "Voted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "songId",
          "type": "uint256"
        }
      ],
      "name": "VotingClosed",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "songId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256[]",
          "name": "versions",
          "type": "uint256[]"
        }
      ],
      "name": "VotingOpened",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "songId",
          "type": "uint256"
        }
      ],
      "name": "closeVoting",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "songId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "versionId",
          "type": "uint256"
        }
      ],
      "name": "getEncryptedVotes",
      "outputs": [
        {
          "internalType": "euint32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "songId",
          "type": "uint256"
        },
        {
          "internalType": "uint256[]",
          "name": "versionIds",
          "type": "uint256[]"
        }
      ],
      "name": "openVoting",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "protocolId",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "songId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "versionId",
          "type": "uint256"
        },
        {
          "internalType": "externalEuint32",
          "name": "oneExt",
          "type": "bytes32"
        },
        {
          "internalType": "bytes",
          "name": "proof",
          "type": "bytes"
        }
      ],
      "name": "voteForVersion",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]
} as const;
