"use strict";

// const ERC20 = require("./abi/ERC20.json");
/**
 * Example JavaScript code that interacts with the page and Web3 wallets
 */

// Unpkg imports
const Web3Modal = window.Web3Modal.default;
const WalletConnectProvider = window.WalletConnectProvider.default;
const EvmChains = window.EvmChains;
const Fortmatic = window.Fortmatic;

// Web3modal instance
let web3Modal;

// Chosen wallet provider given by the dialog window
let provider;

// Address of the selected account
let selectedAccount;

/**
 * Setup the orchestra
 */
function init() {
	console.log("WalletConnectProvider is", WalletConnectProvider);
	console.log("Fortmatic is", Fortmatic);

	// Tell Web3modal what providers we have available.
	// Built-in web browser provider (only one can exist as a time)
	// like MetaMask, Brave or Opera is added automatically by Web3modal
	const providerOptions = {
		walletconnect: {
			package: WalletConnectProvider,
			options: {
				// please change according to your own Infura app id
				infuraId: "8043bb2cf99347b1bfadfb233c5325c0",
			},
		},

		fortmatic: {
			package: Fortmatic,
			options: {
				// please change according to your own Fortmatic key
				key: "pk_test_391E26A3B43A3350",
			},
		},
	};

	web3Modal = new Web3Modal({
		cacheProvider: false, // optional
		providerOptions, // required
	});
}

/**
 * Kick in the UI action after Web3modal dialog has chosen a provider
 */
async function fetchAccountData() {
	// Get a Web3 instance for the wallet
	const web3 = new Web3(provider);

	console.log("Web3 instance is", web3);

	// Get connected chain id from Ethereum node
	const chainId = await web3.eth.getChainId();
	console.log("EvmChains - ", EvmChains);
	// Load chain information over an HTTP API
	// const chainData = await EvmChains.getChain(chainId);
	// document.querySelector("#network-name").textContent = chainData.name;

	// Get list of accounts of the connected wallet
	const accounts = await web3.eth.getAccounts();

	// MetaMask does not give you all accounts, only the selected account
	console.log("Got accounts", accounts);
	selectedAccount = accounts[0];

	document.querySelector("#selected-account").textContent = selectedAccount;

	// Get a handl
	const template = document.querySelector("#template-balance");
	const accountContainer = document.querySelector("#accounts");

	// Purge UI elements any previously loaded accounts
	accountContainer.innerHTML = "";

	// Go through all accounts and get their ETH balance
	const rowResolvers = accounts.map(async (address) => {
		const balance = await web3.eth.getBalance(address);
		// ethBalance is a BigNumber instance
		// https://github.com/indutny/bn.js/
		const ethBalance = web3.utils.fromWei(balance, "ether");
		const humanFriendlyBalance = parseFloat(ethBalance).toFixed(4);
		// Fill in the templated row and put in the document
		const clone = template.content.cloneNode(true);
		clone.querySelector(".address").textContent = address;
		clone.querySelector(".balance").textContent = humanFriendlyBalance;
		accountContainer.appendChild(clone);
	});

	// Because rendering account does its own RPC commucation
	// with Ethereum node, we do not want to display any results
	// until data for all accounts is loaded
	await Promise.all(rowResolvers);

	// Display fully loaded UI for wallet data
	document.querySelector("#prepare").style.display = "none";
	document.querySelector("#connected").style.display = "block";
}

async function refreshAccountData() {
	// If any current data is displayed when
	// the user is switching acounts in the wallet
	// immediate hide this data
	document.querySelector("#connected").style.display = "none";
	document.querySelector("#prepare").style.display = "block";

	// Disable button while UI is loading.
	// fetchAccountData() will take a while as it communicates
	// with Ethereum node via JSON-RPC and loads chain data
	// over an API call.
	document.querySelector("#btn-connect").setAttribute("disabled", "disabled");
	await fetchAccountData(provider);
	document.querySelector("#btn-connect").removeAttribute("disabled");
}

/**
 * Connect wallet button pressed.
 */
async function onConnect() {
	console.log("Opening a dialog", web3Modal);
	try {
		provider = await web3Modal.connect();
	} catch (e) {
		console.log("Could not get a wallet connection", e);
		return;
	}

	// Subscribe to accounts change
	provider.on("accountsChanged", (accounts) => {
		fetchAccountData();
	});

	// Subscribe to chainId change
	provider.on("chainChanged", (chainId) => {
		fetchAccountData();
	});

	// Subscribe to networkId change
	provider.on("networkChanged", (networkId) => {
		fetchAccountData();
	});

	await refreshAccountData();
}

/**
 * Disconnect wallet button pressed.
 */
async function onDisconnect() {
	console.log("Killing the wallet connection", provider);

	// TODO: Which providers have close method?
	if (provider.close) {
		await provider.close();

		// If the cached provider is not cleared,
		// WalletConnect will default to the existing session
		// and does not allow to re-scan the QR code with a new wallet.
		// Depending on your use case you may want or want not his behavir.
		await web3Modal.clearCachedProvider();
		provider = null;
	}

	selectedAccount = null;

	// Set the UI back to the initial state
	document.querySelector("#prepare").style.display = "block";
	document.querySelector("#connected").style.display = "none";
}

//used for getting balance of the currenct selected address of wallet
// param Erc20ContractAddress: address of the ERC20 contract
// param erc20ABI: ABI of the ERC20 contract
const getBalance = async (Erc20ContractAddress, erc20ABI) => {
	if (window.ethereum) {
		await window.ethereum.enable();
		window.web3 = new Web3(window.ethereum);
		const ERC20Contract = new window.web3.eth.Contract(
			erc20ABI,
			Erc20ContractAddress
		);

		try {
			const amount = await ERC20Contract.methods
				.balanceOf(selectedAccount)
				.call();

			return amount;
		} catch (err) {
			throw Error(
				`Error getting balance of ${selectedAccount} for contract address ${Erc20ContractAddress} : ${err}`
			);
		}
	} else {
		alert("install wallet extension!!");
	}
};

// used for getting the name of the ERC20 token
// param Erc20ContractAddress: address of the ERC20 contract
// param erc20ABI: ABI of the ERC20 contract
const getName = async (Erc20ContractAddress, erc20ABI) => {
	if (window.ethereum) {
		await window.ethereum.enable();
		window.web3 = new Web3(window.ethereum);
		const ERC20Contract = new window.web3.eth.Contract(
			erc20ABI,
			Erc20ContractAddress
		);

		try {
			const name = await ERC20Contract.methods.name().call();

			return name;
		} catch (err) {
			throw Error(
				`Error getting name of contract address ${Erc20ContractAddress} : ${err}`
			);
		}
	} else {
		alert("install wallet extension!!");
	}
};

// used for getting the symbol of the ERC20 token
// param Erc20ContractAddress: address of the ERC20 contract
// param erc20ABI: ABI of the ERC20 contract
const getTokenSymbol = async (Erc20ContractAddress, erc20ABI) => {
	if (window.ethereum) {
		await window.ethereum.enable();
		window.web3 = new Web3(window.ethereum);
		const ERC20Contract = new window.web3.eth.Contract(
			erc20ABI,
			Erc20ContractAddress
		);

		try {
			const symbol = await ERC20Contract.methods.symbol().call();

			return symbol;
		} catch (err) {
			throw Error(
				`Error getting symbol of contract address ${Erc20ContractAddress} : ${err}`
			);
		}
	} else {
		alert("install wallet extension!!");
	}
};

// used for getting the allowance of the ERC20 token address
// param Erc20ContractAddress: address of the ERC20 contract
// param erc20ABI: ABI of the ERC20 contract
// param ownerBalanceAddress: address of the owner of the ERC20 token
// param spenderAddres: address of the spender of the ERC20 token
const getAllowance = async (
	Erc20ContractAddress,
	erc20ABI,
	ownerBalanceAddress, //some options is to change this to selectedAccount
	spenderAddres
) => {
	if (window.ethereum) {
		await window.ethereum.enable();
		window.web3 = new Web3(window.ethereum);
		const ERC20Contract = new window.web3.eth.Contract(
			erc20ABI,
			Erc20ContractAddress
		);

		try {
			const allowance = await ERC20Contract.methods
				.allowance(ownerBalanceAddress, spenderAddres)
				.call();

			return allowance;
		} catch (err) {
			throw Error(
				`Error getting allowance of contract address ${Erc20ContractAddress} for spender  ${spenderAddres} for owner ${ownerBalanceAddress}: ${err}`
			);
		}
	} else {
		alert("install wallet extension!!");
	}
};

// used for getting the decimals of the ERC20 token address
// param Erc20ContractAddress: address of the ERC20 contract
// param erc20ABI: ABI of the ERC20 contract
const getDecimals = async (Erc20ContractAddress, erc20ABI) => {
	if (window.ethereum) {
		await window.ethereum.enable();
		window.web3 = new Web3(window.ethereum);
		const ERC20Contract = new window.web3.eth.Contract(
			erc20ABI,
			Erc20ContractAddress
		);

		try {
			const decimals = await ERC20Contract.methods.decimals().call();

			return decimals;
		} catch (err) {
			throw Error(
				`Error getting decimals of contract address ${Erc20ContractAddress} : ${err}`
			);
		}
	} else {
		alert("install wallet extension!!");
	}
};

// used for getting the totalSupply of the ERC20 token address
// param Erc20ContractAddress: address of the ERC20 contract
// param erc20ABI: ABI of the ERC20 contract
const getTokenTotalSupply = async (Erc20ContractAddress, erc20ABI) => {
	if (window.ethereum) {
		await window.ethereum.enable();
		window.web3 = new Web3(window.ethereum);
		const ERC20Contract = new window.web3.eth.Contract(
			erc20ABI,
			Erc20ContractAddress
		);

		try {
			const totalSupply = await ERC20Contract.methods.totalSupply().call();

			return totalSupply;
		} catch (err) {
			throw Error(
				`Error getting totalSupply of contract address ${Erc20ContractAddress} : ${err}`
			);
		}
	} else {
		alert("install wallet extension!!");
	}
};

// non-view functions

// used for setting allowance for spender address to spend the ERC20 token of the selected account address
// param Erc20ContractAddress: address of the ERC20 contract
// param erc20ABI: ABI of the ERC20 contract
// param spenderAddress: address of the spender of the ERC20 token
// param spentAmount: amount of the ERC20 token to be spent by the spender
const setApprove = async (
	Erc20ContractAddress,
	erc20ABI,
	spenderAddress,
	spentAmount
) => {
	if (window.ethereum) {
		await window.ethereum.enable();
		window.web3 = new Web3(window.ethereum);
		const ERC20Contract = new window.web3.eth.Contract(
			erc20ABI,
			Erc20ContractAddress
		);

		try {
			await ERC20Contract.methods.approve(spenderAddress, spentAmount).send({
				gas: `1000000`,
				gasPrice: `100000000000`,
				from: selectedAccount,
			});
		} catch (err) {
			throw Error(
				`Error approving spender ${spenderAddress} to spend ${spentAmount} of contract address ${Erc20ContractAddress} : ${err}`
			);
		}
	} else {
		alert("install wallet extension!!");
	}
};

// used for transfering the ERC20 token of the selected account address to recipient address
// param Erc20ContractAddress: address of the ERC20 contract
// param erc20ABI: ABI of the ERC20 contract
// param recipientAddress: address of the recipient of the ERC20 token
// param amount: amount of the ERC20 token to be transfered to the recipient
const transferToken = async (
	Erc20ContractAddress,
	erc20ABI,
	recipientAddress,
	amount
) => {
	if (window.ethereum) {
		await window.ethereum.enable();
		window.web3 = new Web3(window.ethereum);
		const ERC20Contract = new window.web3.eth.Contract(
			erc20ABI,
			Erc20ContractAddress
		);

		try {
			await ERC20Contract.methods.transfer(recipientAddress, amount).send({
				gas: `1000000`,
				gasPrice: `100000000000`,
				from: selectedAccount,
			});
		} catch (err) {
			throw Error(
				`Error transfering ${amount} of contract address ${Erc20ContractAddress} for recipient ${recipientAddress} : ${err}`
			);
		}
	} else {
		alert("install wallet extension!!");
	}
};

// used for transfering the ERC20 token of om behalf of sender address to recipient address
// param Erc20ContractAddress: address of the ERC20 contract
// param erc20ABI: ABI of the ERC20 contract
// param senderAddress: address of the sender of the ERC20 token
// param recipientAddress: address of the recipient of the ERC20 token
// param spenderAddress: address of the spender of the ERC20 token [by default selectedAccount is used as spenderAddress
// param amount: amount of the ERC20 token to be transfered to the recipient by the sender
// NOTE : please make sure that spenderAddress has enough allowance to spend the amount of ERC20 token
const transferTokenFrom = async (
	Erc20ContractAddress,
	erc20ABI,
	senderAddress,
	recipientAddress,
	spenderAddress = selectedAccount, //by default selectedAccount is used as spenderAddress
	amount
) => {
	if (window.ethereum) {
		await window.ethereum.enable();
		window.web3 = new Web3(window.ethereum);
		const ERC20Contract = new window.web3.eth.Contract(
			erc20ABI,
			Erc20ContractAddress
		);

		try {
			await ERC20Contract.methods
				.transferFrom(senderAddress, recipientAddress, amount)
				.send({
					gas: `1000000`,
					gasPrice: `100000000000`,
					from: spenderAddress,
				});
		} catch (err) {
			throw Error(
				`Error transfering ${amount} of contract address ${Erc20ContractAddress} for recipient ${recipientAddress} by sender ${senderAddress} : ${err}`
			);
		}
	} else {
		alert("install wallet extension!!");
	}
};

// used for transfering the ERC20 token of om behalf of sender address to recipient address
// param Erc20ContractAddress: address of the ERC20 contract
// param erc20ABI: ABI of the ERC20 contract
// param spenderAddress: address of the spender of the ERC20 token
// param addedAmount: amount of the ERC20 token to be added to the allowance of the spender address
const increaseAllowance = async (
	Erc20ContractAddress,
	erc20ABI,
	spenderAddress,
	addedAmount
) => {
	if (window.ethereum) {
		await window.ethereum.enable();
		window.web3 = new Web3(window.ethereum);
		const ERC20Contract = new window.web3.eth.Contract(
			erc20ABI,
			Erc20ContractAddress
		);

		try {
			await ERC20Contract.methods
				.increaseAllowance(spenderAddress, addedAmount)
				.send({
					gas: `1000000`,
					gasPrice: `100000000000`,
					from: selectedAccount,
				});
		} catch (err) {
			throw Error(
				`Error transfering ${amount} of contract address ${Erc20ContractAddress} for recipient ${recipientAddress} by sender ${senderAddress} : ${err}`
			);
		}
	} else {
		alert("install wallet extension!!");
	}
};

window.getBalance = getBalance;
window.getName = getName;
window.getTokenSymbol = getTokenSymbol;
window.getAllowance = getAllowance;
window.getDecimals = getDecimals;
window.getTokenTotalSupply = getTokenTotalSupply;
window.setApprove = setApprove;
window.transferToken = transferToken;
window.transferTokenFrom = transferTokenFrom;
window.increaseAllowance = increaseAllowance;

/**
 * Main entry point.
 */
window.addEventListener("load", async () => {
	init();
	document.querySelector("#btn-connect").addEventListener("click", onConnect);
	document
		.querySelector("#btn-disconnect")
		.addEventListener("click", onDisconnect);
});
