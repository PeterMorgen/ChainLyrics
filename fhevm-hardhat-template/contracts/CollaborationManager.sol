// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {FHE, euint32, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title CollaborationManager - 共创与贡献分管理（密态贡献分）
/// @notice 使用 FHE 在链上对贡献分进行同态累加，避免过程泄露
contract CollaborationManager is SepoliaConfig {
    struct Collaboration {
        uint256 songId;
        address[] members;
        mapping(address => bool) isMember;
        mapping(address => euint32) contributionScore; // 成员的密态分
        euint32 totalScore;                             // 总密态分
        mapping(uint256 => string) versions;            // versionId => CID
        uint256 nextVersionId;
        bool finalized;
        uint256 finalizedVersionId;
    }

    event CollaborationOpened(uint256 indexed songId, address indexed opener);
    event Joined(uint256 indexed songId, address indexed member);
    event VersionSubmitted(uint256 indexed songId, uint256 indexed versionId, string cid);
    event ContributionRecorded(uint256 indexed songId, address indexed member);
    event Finalized(uint256 indexed songId, uint256 versionId);

    mapping(uint256 => Collaboration) private _collabs; // songId => Collaboration

    modifier onlyMember(uint256 songId) {
        require(_collabs[songId].isMember[msg.sender], "Not collaborator");
        _;
    }

    function openCollaboration(uint256 songId, address[] calldata initialMembers) external {
        Collaboration storage c = _collabs[songId];
        require(c.songId == 0, "Already opened");
        c.songId = songId;
        c.nextVersionId = 1;

        // 添加初始成员
        for (uint256 i = 0; i < initialMembers.length; i++) {
            address m = initialMembers[i];
            if (!c.isMember[m]) {
                c.isMember[m] = true;
                c.members.push(m);
            }
        }
        emit CollaborationOpened(songId, msg.sender);
    }

    function joinCollab(uint256 songId) external {
        Collaboration storage c = _collabs[songId];
        require(c.songId != 0, "Not opened");
        require(!c.isMember[msg.sender], "Already member");
        c.isMember[msg.sender] = true;
        c.members.push(msg.sender);
        emit Joined(songId, msg.sender);
    }

    function submitVersion(uint256 songId, string calldata versionCID) external onlyMember(songId) returns (uint256 versionId) {
        Collaboration storage c = _collabs[songId];
        require(!c.finalized, "Finalized");
        versionId = c.nextVersionId++;
        c.versions[versionId] = versionCID;
        emit VersionSubmitted(songId, versionId, versionCID);
    }

    /// @notice 记录贡献分：外部传入密文句柄+证明，转为内部 euint32 并同态累加
    function recordContribution(uint256 songId, externalEuint32 scoreExt, bytes calldata inputProof) external onlyMember(songId) {
        Collaboration storage c = _collabs[songId];
        require(!c.finalized, "Finalized");

        euint32 score = FHE.fromExternal(scoreExt, inputProof);

        // 成员分 = 成员分 + score
        euint32 memberScore = c.contributionScore[msg.sender];
        memberScore = FHE.add(memberScore, score);
        c.contributionScore[msg.sender] = memberScore;

        // 总分 = 总分 + score
        c.totalScore = FHE.add(c.totalScore, score);

        // ACL：允许本合约与提交者后续访问/解密
        FHE.allowThis(memberScore);
        FHE.allow(memberScore, msg.sender);
        FHE.allowThis(c.totalScore);
        FHE.allow(c.totalScore, msg.sender);

        emit ContributionRecorded(songId, msg.sender);
    }

    function getMemberEncryptedScore(uint256 songId, address member) external view returns (euint32) {
        Collaboration storage c = _collabs[songId];
        require(c.songId != 0, "Not opened");
        return c.contributionScore[member];
    }

    function getTotalEncryptedScore(uint256 songId) external view returns (euint32) {
        Collaboration storage c = _collabs[songId];
        require(c.songId != 0, "Not opened");
        return c.totalScore;
    }

    function finalizeVersion(uint256 songId, uint256 versionId) external onlyMember(songId) {
        Collaboration storage c = _collabs[songId];
        require(!c.finalized, "Finalized");
        require(bytes(c.versions[versionId]).length != 0, "Bad version");
        c.finalized = true;
        c.finalizedVersionId = versionId;
        emit Finalized(songId, versionId);
    }

    function getVersionCID(uint256 songId, uint256 versionId) external view returns (string memory) {
        Collaboration storage c = _collabs[songId];
        require(c.songId != 0, "Not opened");
        return c.versions[versionId];
    }
}




