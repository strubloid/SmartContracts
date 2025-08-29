import { createThirdwebClient } from "thirdweb";
import { env } from './config/env';
import { loadThirdwebClient, LoadThirdwebClientResult, getClientOrThrow } from "./components/ThirdWeb/LoadThirdwebClient";
import { loadThirdwebCollections } from "./components/ThirdWeb/LoadThirdwebCollections";

async function main() {
  
    
    const client: LoadThirdwebClientResult = await loadThirdwebClient();
    // console.log('ThirdWeb Client Load Result:', client);

    // Load ThirdWeb collections
    let thirdwebCollections = await loadThirdwebCollections();
    // console.log('ThirdWeb Collections Load Result:', thirdwebCollections);

    // CLI/HTTP logic here
    // console.log('Scaffold ready.');
    // console.log('ThirdWeb Service:', thirdWeb);
}

main();
