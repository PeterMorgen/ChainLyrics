import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy, log } = hre.deployments;

  const args: any[] = [];

  const r1 = await deploy("LyricsRegistry", { from: deployer, log: true, args });
  log("LyricsRegistry deployed:", r1.address);

  const r2 = await deploy("CollaborationManager", { from: deployer, log: true, args });
  log("CollaborationManager deployed:", r2.address);

  const r3 = await deploy("VoteContract", { from: deployer, log: true, args });
  log("VoteContract deployed:", r3.address);

  const r4 = await deploy("LyricsNFT", { from: deployer, log: true, args });
  log("LyricsNFT deployed:", r4.address);

  const r5 = await deploy("RevenueSplit", { from: deployer, log: true, args });
  log("RevenueSplit deployed:", r5.address);

  const r6 = await deploy("LikeRegistry", { from: deployer, log: true, args });
  log("LikeRegistry deployed:", r6.address);
};

export default func;
func.id = "deploy_core";
func.tags = ["Core"];



