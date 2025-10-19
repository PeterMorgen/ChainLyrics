// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title LyricsNFT - 作品版权凭证
contract LyricsNFT is ERC721, Ownable {
    uint256 private _nextTokenId = 1;

    struct Metadata {
        uint256 songId;
        string title;
        string finalVersionCID;
        address[] contributors;
        uint64 mintedAt;
    }

    mapping(uint256 => Metadata) private _metas;

    event Minted(uint256 indexed tokenId, uint256 indexed songId);

    constructor() ERC721("ChainLyrics", "CLYR") Ownable(msg.sender) {}

    function mintNFT(
        address to,
        uint256 songId,
        string calldata title,
        string calldata finalVersionCID,
        address[] calldata contributors
    ) external onlyOwner returns (uint256 tokenId) {
        tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _metas[tokenId] = Metadata({
            songId: songId,
            title: title,
            finalVersionCID: finalVersionCID,
            contributors: contributors,
            mintedAt: uint64(block.timestamp)
        });
        emit Minted(tokenId, songId);
    }

    function getMetadata(uint256 tokenId) external view returns (Metadata memory) {
        require(_ownerOf(tokenId) != address(0), "bad tokenId");
        return _metas[tokenId];
    }
}






