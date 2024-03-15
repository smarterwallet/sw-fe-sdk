export default [
    {
        inputs: [
            {
                internalType: "address",
                name: "_router",
                type: "address"
            },
            {
                internalType: "address",
                name: "_link",
                type: "address"
            },
            {
                internalType: "address",
                name: "_crossChainToken",
                type: "address"
            }
        ],
        stateMutability: "nonpayable",
        type: "constructor"
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "currentBalance",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "calculatedFees",
                type: "uint256"
            }
        ],
        name: "NotEnoughBalance",
        type: "error"
    },
    {
        inputs: [],
        name: "ReentrancyGuardReentrantCall",
        type: "error"
    },
    {
        inputs: [],
        name: "SourceChainSender__Insufficient",
        type: "error"
    },
    {
        inputs: [],
        name: "SourceChainSender__InsufficientBalance",
        type: "error"
    },
    {
        inputs: [],
        name: "SourceChainSender__NeedFundToken",
        type: "error"
    },
    {
        inputs: [],
        name: "SourceChainSender__NeedSendMore",
        type: "error"
    },
    {
        inputs: [],
        name: "SourceChainSender__TransferFailed",
        type: "error"
    },
    {
        inputs: [],
        name: "SourceChainSender__WithdrawFailed",
        type: "error"
    },
    {
        anonymous: false,
        inputs: [
            {
                "indexed": true,
                internalType: "bytes32",
                name: "messageId",
                type: "bytes32"
            },
            {
                "indexed": true,
                internalType: "uint64",
                name: "destinationChainSelector",
                type: "uint64"
            },
            {
                "indexed": false,
                internalType: "address",
                name: "receiver",
                type: "address"
            },
            {
                "indexed": false,
                internalType: "address",
                name: "feeToken",
                type: "address"
            },
            {
                "indexed": false,
                internalType: "uint256",
                name: "fees",
                type: "uint256"
            },
            {
                "indexed": false,
                internalType: "address",
                name: "to",
                type: "address"
            },
            {
                "indexed": false,
                internalType: "uint256",
                name: "amount",
                type: "uint256"
            }
        ],
        name: "MessageSent",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            {
                "indexed": true,
                internalType: "address",
                name: "owner",
                type: "address"
            },
            {
                "indexed": true,
                internalType: "uint256",
                name: "amount",
                type: "uint256"
            }
        ],
        name: "OwnerWithdrawn",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            {
                "indexed": true,
                internalType: "address",
                name: "from",
                type: "address"
            },
            {
                "indexed": true,
                internalType: "address",
                name: "to",
                type: "address"
            }
        ],
        name: "OwnershipTransferRequested",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            {
                "indexed": true,
                internalType: "address",
                name: "from",
                type: "address"
            },
            {
                "indexed": true,
                internalType: "address",
                name: "to",
                type: "address"
            }
        ],
        name: "OwnershipTransferred",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            {
                "indexed": true,
                internalType: "address",
                name: "sender",
                type: "address"
            },
            {
                "indexed": true,
                internalType: "uint256",
                name: "amount",
                type: "uint256"
            }
        ],
        name: "TokenInPut",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            {
                "indexed": true,
                internalType: "address",
                name: "owner",
                type: "address"
            },
            {
                "indexed": true,
                internalType: "uint256",
                name: "amount",
                type: "uint256"
            }
        ],
        name: "Withdrawn",
        type: "event"
    },
    {
        inputs: [],
        name: "acceptOwnership",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "amount",
                type: "uint256"
            }
        ],
        name: "fund",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "funder",
                type: "address"
            }
        ],
        name: "getFunderBalance",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            }
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [],
        name: "getPoolBalance",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            }
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [],
        name: "getTokenAddress",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address"
            }
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "amount",
                type: "uint256"
            }
        ],
        name: "onlyOwnerWithdraw",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [],
        name: "owner",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address"
            }
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "uint64",
                name: "destinationChainSelector",
                type: "uint64"
            },
            {
                internalType: "address",
                name: "receiver",
                type: "address"
            },
            {
                internalType: "enum SourceChainSender.payFeesIn",
                name: "feeToken",
                type: "uint8"
            },
            {
                internalType: "address",
                name: "to",
                type: "address"
            },
            {
                internalType: "uint256",
                name: "amount",
                type: "uint256"
            }
        ],
        name: "sendMessage",
        outputs: [
            {
                internalType: "bytes32",
                name: "messageId",
                type: "bytes32"
            }
        ],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "to",
                type: "address"
            }
        ],
        name: "transferOwnership",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "amount",
                type: "uint256"
            }
        ],
        name: "withdraw",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        stateMutability: "payable",
        type: "receive"
    }
]