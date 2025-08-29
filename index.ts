import { createThirdwebClient } from "thirdweb";
import { env } from './config/env';
import { loadThirdwebClient, LoadThirdwebClientResult } from "./components/ThirdWeb/LoadThirdwebClient";

async function main() {
  
    
    const client : LoadThirdwebClientResult = await loadThirdwebClient();
    console.log('ThirdWeb Client Load Result:', client);

    // CLI/HTTP logic here
    console.log('Scaffold ready.');
    // console.log('ThirdWeb Service:', thirdWeb);
}

main();
