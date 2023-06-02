const Web3Modal = window.Web3Modal.default;
const WalletConnectProvider = window.WalletConnectProvider.default;
const EvmChains = window.EvmChains;
const Fortmatic = window.Fortmatic;

mergeInto(LibraryManager.library, {
    getBalance: function (contractAddress, erc20ABI){
        if (window.getBalance){
            window.getBalance(contractAddress, erc20ABI);
            //or possibly just getBalance(). some source stated this is enough without window.
        }
    },

    getName: function (contractAddress, erc20ABI){
        if (window.getName){
            window.getName(contractAddress, erc20ABI);
        }
    },

    getTokenSymbol: function (contractAddress, erc20ABI){
        if (window.getTokenSymbol){
            window.getTokenSymbol(contractAddress, erc20ABI);
        }
    },

    getAllowance: function (contractAddress, erc20ABI, ownerBalanceAddress, spenderAddress){
        if (window.getAllowance){
            window.getAllowance(contractAddress, erc20ABI, ownerBalanceAddress, spenderAddress);
        }
    },

    getDecimals: function (contractAddress, erc20ABI){
        if (window.getDecimals){
            window.getDecimals(contractAddress, erc20ABI);
        }
    },

    getTokenTotalSupply: function (contractAddress, erc20ABI){
        if (window.getTokenTotalSupply){
            window.getTokenTotalSupply(contractAddress, erc20ABI);
        }
    },

    setApprove: function (contractAddress, erc20ABI, spenderAddress, spentAmount){
        if (window.setApprove){
            window.setApprove(contractAddress, erc20ABI, spenderAddress, spentAmount);
        }
    },

    transferToken: function (contractAddress, erc20ABI, recipientAddress,amount){
        if (window.transferToken){
            window.transferToken(contractAddress, erc20ABI, recipientAddress,amount);
        }
    },

    transferToken: function (contractAddress, erc20ABI, senderAddress, recipientAddress, spenderAddress, amount){
        if (window.transferToken){
            window.transferToken(contractAddress, erc20ABI, senderAddress, recipientAddress, spenderAddress, amount);
        }
    },

    increaseAllowance: function (contractAddress, erc20ABI, spenderAddress, addedAmount){
        if (window.increaseAllowance){
            window.increaseAllowance(contractAddress, erc20ABI, spenderAddress, addedAmount);
        }
    },

    BindWebGLTexture: function (texture) {
        GLctx.bindTexture(GLctx.TEXTURE_2D, GL.textures[texture]);
    },
});