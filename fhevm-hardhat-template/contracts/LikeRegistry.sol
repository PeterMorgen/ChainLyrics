// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

/// @title LikeRegistry - 记录作品点赞
contract LikeRegistry {
    // songId => user => liked
    mapping(uint256 => mapping(address => bool)) public liked;
    // songId => count
    mapping(uint256 => uint256) public likeCount;

    event Liked(uint256 indexed songId, address indexed user);
    event Unliked(uint256 indexed songId, address indexed user);

    function like(uint256 songId) external {
        require(!liked[songId][msg.sender], "already liked");
        liked[songId][msg.sender] = true;
        likeCount[songId] += 1;
        emit Liked(songId, msg.sender);
    }

    function unlike(uint256 songId) external {
        require(liked[songId][msg.sender], "not liked");
        liked[songId][msg.sender] = false;
        likeCount[songId] -= 1;
        emit Unliked(songId, msg.sender);
    }

    function isLiked(uint256 songId, address user) external view returns (bool) {
        return liked[songId][user];
    }
}





