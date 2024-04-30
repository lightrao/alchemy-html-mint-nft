import { ethers } from "./lib/ethers-5.6.9.esm.min.js";
import { abi, contractAddress } from "./constants.js";

const connectButton = document.getElementById("connectButton");
const mintButton = document.getElementById("mintButton");
const addNftToMeataMaskButton = document.getElementById(
  "addNftToMeataMaskButton"
);

connectButton.onclick = connect;
mintButton.onclick = mintNFT;
addNftToMeataMaskButton.onclick = addNFTToMetaMask;

async function connect() {
  if (typeof window.ethereum !== "undefined") {
    try {
      await ethereum.request({ method: "eth_requestAccounts" });
      connectButton.innerHTML = "Connected";
      const accounts = await ethereum.request({ method: "eth_accounts" });
      console.log(accounts);
    } catch (error) {
      console.error("Connection error:", error);
      connectButton.innerHTML = "Connection Failed";
    }
  } else {
    connectButton.innerHTML = "Please install MetaMask";
  }

  ethereum.on("accountsChanged", (accounts) => {
    if (accounts.length === 0) {
      connectButton.innerHTML = "Connect";
    } else {
      connectButton.innerHTML = "Connected";
      console.log("Connected account:", accounts[0]);
    }
  });
}

async function mintNFT() {
  mintButton.disabled = true;
  mintButton.innerText = "Minting...";
  const tokenURI = document.getElementById("tokenURI").value;
  const recipient = document.getElementById("recipient").value;

  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const myNftContract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const transactionResponse = await myNftContract.mintNFT(
        recipient,
        tokenURI
      );
      await transactionResponse.wait();
      console.log(
        `NFT Minted! Check it out at: https://sepolia.etherscan.io/tx/${transactionResponse.hash}`
      );
      const receipt = await listenForTransactionMine(
        transactionResponse,
        provider
      );
      mintButton.innerText = "Minted Successfully";

      // Logging key information from the transaction receipt
      console.log("Transaction Receipt:");
      console.log(` - Block Hash: ${receipt.blockHash}`);
      console.log(` - Transaction Index: ${receipt.transactionIndex}`);
      console.log(` - From: ${receipt.from}`);
      console.log(` - To: ${receipt.to}`);
      console.log(` - Gas Used: ${receipt.gasUsed.toString()}`);
      console.log(
        ` - Cumulative Gas Used: ${receipt.cumulativeGasUsed.toString()}`
      );
      console.log(` - Contract Address: ${receipt.contractAddress}`);
      console.log(` - Status: ${receipt.status === 1 ? "Success" : "Failed"}`);
      console.log(` - Confirmations: ${receipt.confirmations}`);
    } catch (error) {
      console.error("Minting failed:", error);
      fundButton.innerText = "Mint Failed";
    } finally {
      mintButton.disabled = false;
    }
  } else {
    mintButton.innerText = "Please install MetaMask";
    mintButton.disabled = false;
  }
}

async function addNFTToMetaMask() {}

function listenForTransactionMine(transactionResponse, provider) {
  console.log(`Mining ${transactionResponse.hash}`);
  return new Promise((resolve, reject) => {
    provider.once(transactionResponse.hash, (transactionReceipt) => {
      if (transactionReceipt.status === 0) {
        reject(new Error("Transaction failed"));
      } else {
        console.log(
          `Transaction confirmed in block ${transactionReceipt.blockNumber}`
        );
        resolve(transactionReceipt);
      }
    });
  });
}
