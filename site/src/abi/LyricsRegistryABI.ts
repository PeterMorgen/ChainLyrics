export const LyricsRegistryABI = {
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
          "indexed": false,
          "internalType": "address[]",
          "name": "collaborators",
          "type": "address[]"
        }
      ],
      "name": "CollaboratorsSet",
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
          "internalType": "string",
          "name": "newLyricsCID",
          "type": "string"
        }
      ],
      "name": "LyricsUpdated",
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
          "name": "creator",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "title",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "lyricsCID",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "melodyCID",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "isCollaborative",
          "type": "bool"
        }
      ],
      "name": "SongCreated",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "title",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "lyricsCID",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "melodyCID",
          "type": "string"
        },
        {
          "internalType": "bool",
          "name": "isCollaborative",
          "type": "bool"
        },
        {
          "internalType": "address[]",
          "name": "initialCollaborators",
          "type": "address[]"
        }
      ],
      "name": "createSong",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "songId",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
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
      "name": "getSong",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "id",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "creator",
              "type": "address"
            },
            {
              "internalType": "string",
              "name": "title",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "lyricsCID",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "melodyCID",
              "type": "string"
            },
            {
              "internalType": "bool",
              "name": "isCollaborative",
              "type": "bool"
            },
            {
              "internalType": "address[]",
              "name": "collaborators",
              "type": "address[]"
            },
            {
              "internalType": "uint64",
              "name": "createdAt",
              "type": "uint64"
            }
          ],
          "internalType": "struct LyricsRegistry.Song",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "nextSongId",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
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
          "internalType": "address[]",
          "name": "collaborators",
          "type": "address[]"
        }
      ],
      "name": "setCollaborators",
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
          "name": "newLyricsCID",
          "type": "string"
        }
      ],
      "name": "updateLyrics",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]
} as const;
