import { ethers } from "./ethers-5.6.esm.min.js";
import { abi, contractAddress } from "./constant.js";

const connectButton = document.getElementById("connect");
const fundButton = document.getElementById("fund");
const balanceButton = document.getElementById("balance");
const withdrawButton = document.getElementById("withdraw");

connectButton.onclick = connect;
fundButton.onclick = fund;
balanceButton.onclick = getBalance;
withdrawButton.onclick = withdraw;
async function connect() {
  if (typeof window.ethereum !== "undefined") {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    connectButton.innerHTML = "connected!";
  } else {
    connectButton.innerHTML = "Metamask not installed!";
  }
}

async function fund() {
  const ethAmount = document.getElementById("ethAmount").value;
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const fundMeContract = new ethers.Contract(contractAddress, abi, signer);
  try {
    const transactionResponse = await fundMeContract.fund({
      value: ethers.utils.parseEther(ethAmount),
    });
    await listenForTransactionMine(transactionResponse, provider);
    console.log("Done!");
  } catch (error) {
    console.error(error);
  }
}

async function getBalance() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const balance = await provider.getBalance(contractAddress);
    console.log(ethers.utils.formatEther(balance));
  }
}

async function listenForTransactionMine(transactionResponse, provider) {
  console.log(`Mining ${transactionResponse.hash}`);

  // listen for this transcation finish
  return new Promise((resolve, reject) => {
    provider.once(transactionResponse.hash, (transactionReceipt) => {
      console.log(
        `completed with ${transactionReceipt.confirmations} confirmations`
      );
      resolve();
    });
  });
}

async function withdraw() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const fundMeContract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const transactionResponse = await fundMeContract.withdraw();
      console.log("withdrawing...");
      await listenForTransactionMine(transactionResponse, provider);
      console.log("Done!");
    } catch (error) {
      console.error(error);
    }
  }
}
