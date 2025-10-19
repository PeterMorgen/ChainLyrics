// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {FHE, euint32, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title VoteContract - 版本投票（可选密态票数）
/// @notice 为简化，默认一人一票；演示使用 euint32 累加票数，可切换为明文票数
contract VoteContract is SepoliaConfig {
    struct Voting {
        uint256 songId;
        mapping(uint256 => euint32) votes; // versionId => encrypted votes
        mapping(address => bool) voted;
        uint256[] versions;
        bool closed;
    }

    mapping(uint256 => Voting) private _votings; // songId => Voting

    event VotingOpened(uint256 indexed songId, uint256[] versions);
    event Voted(uint256 indexed songId, uint256 indexed versionId, address voter);
    event VotingClosed(uint256 indexed songId);

    modifier onlyOpened(uint256 songId) {
        require(_votings[songId].songId != 0 && !_votings[songId].closed, "Not open");
        _;
    }

    function openVoting(uint256 songId, uint256[] calldata versionIds) external {
        Voting storage v = _votings[songId];
        require(v.songId == 0, "Already opened");
        v.songId = songId;
        v.versions = versionIds;
        emit VotingOpened(songId, versionIds);
    }

    /// @notice 使用密态 +1（外部传入密文 1，或使用 trivial asEuint32(1) 改为链上标量加法）
    function voteForVersion(uint256 songId, uint256 versionId, externalEuint32 oneExt, bytes calldata proof) external onlyOpened(songId) {
        Voting storage v = _votings[songId];
        require(!v.voted[msg.sender], "Already voted");
        bool known = false;
        for (uint256 i = 0; i < v.versions.length; i++) if (v.versions[i] == versionId) { known = true; break; }
        require(known, "Bad version");

        euint32 one = FHE.fromExternal(oneExt, proof);
        euint32 cur = v.votes[versionId];
        cur = FHE.add(cur, one);
        v.votes[versionId] = cur;

        FHE.allowThis(cur);
        FHE.allow(cur, msg.sender);

        v.voted[msg.sender] = true;
        emit Voted(songId, versionId, msg.sender);
    }

    function getEncryptedVotes(uint256 songId, uint256 versionId) external view returns (euint32) {
        return _votings[songId].votes[versionId];
    }

    function closeVoting(uint256 songId) external onlyOpened(songId) {
        _votings[songId].closed = true;
        emit VotingClosed(songId);
    }
}






