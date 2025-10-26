export const CollaborationManagerABI = {
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
          "internalType": "address",
          "name": "opener",
          "type": "address"
        }
      ],
      "name": "CollaborationOpened",
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
          "indexed": true,
          "internalType": "address",
          "name": "member",
          "type": "address"
        }
      ],
      "name": "ContributionRecorded",
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
          "internalType": "uint256",
          "name": "versionId",
          "type": "uint256"
        }
      ],
      "name": "Finalized",
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
          "indexed": true,
          "internalType": "address",
          "name": "member",
          "type": "address"
        }
      ],
      "name": "Joined",
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
          "indexed": true,
          "internalType": "uint256",
          "name": "versionId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "cid",
          "type": "string"
        }
      ],
      "name": "VersionSubmitted",
      "type": "event"
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
      "name": "finalizeVersion",
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
          "internalType": "address",
          "name": "member",
          "type": "address"
        }
      ],
      "name": "getMemberEncryptedScore",
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
        }
      ],
      "name": "getTotalEncryptedScore",
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
          "internalType": "uint256",
          "name": "versionId",
          "type": "uint256"
        }
      ],
      "name": "getVersionCID",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
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
        }
      ],
      "name": "joinCollab",
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
          "internalType": "address[]",
          "name": "initialMembers",
          "type": "address[]"
        }
      ],
      "name": "openCollaboration",
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
          "internalType": "externalEuint32",
          "name": "scoreExt",
          "type": "bytes32"
        },
        {
          "internalType": "bytes",
          "name": "inputProof",
          "type": "bytes"
        }
      ],
      "name": "recordContribution",
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
          "internalType": "string",
          "name": "versionCID",
          "type": "string"
        }
      ],
      "name": "submitVersion",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "versionId",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]
} as const;
