// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

/// @title LyricsRegistry - 链上作品基础注册与存证
/// @notice 存储作品元数据（标题、歌词与旋律CID、协作开关与协作者）
contract LyricsRegistry {
    struct Song {
        uint256 id;
        address creator;
        string title;
        string lyricsCID; // IPFS CID
        string melodyCID; // 可选
        bool isCollaborative;
        address[] collaborators; // 启用协作时的初始协作名单
        uint64 createdAt;
    }

    event SongCreated(uint256 indexed songId, address indexed creator, string title, string lyricsCID, string melodyCID, bool isCollaborative);
    event LyricsUpdated(uint256 indexed songId, string newLyricsCID);
    event CollaboratorsSet(uint256 indexed songId, address[] collaborators);

    uint256 public nextSongId = 1;
    mapping(uint256 => Song) private _songs;

    modifier onlyCreator(uint256 songId) {
        require(_songs[songId].creator == msg.sender, "Not song creator");
        _;
    }

    function createSong(
        string calldata title,
        string calldata lyricsCID,
        string calldata melodyCID,
        bool isCollaborative,
        address[] calldata initialCollaborators
    ) external returns (uint256 songId) {
        songId = nextSongId++;
        Song storage s = _songs[songId];
        s.id = songId;
        s.creator = msg.sender;
        s.title = title;
        s.lyricsCID = lyricsCID;
        s.melodyCID = melodyCID;
        s.isCollaborative = isCollaborative;
        s.createdAt = uint64(block.timestamp);

        if (initialCollaborators.length > 0) {
            s.collaborators = initialCollaborators;
        }

        emit SongCreated(songId, msg.sender, title, lyricsCID, melodyCID, isCollaborative);
    }

    function updateLyrics(uint256 songId, string calldata newLyricsCID) external onlyCreator(songId) {
        _songs[songId].lyricsCID = newLyricsCID;
        emit LyricsUpdated(songId, newLyricsCID);
    }

    function setCollaborators(uint256 songId, address[] calldata collaborators) external onlyCreator(songId) {
        _songs[songId].collaborators = collaborators;
        emit CollaboratorsSet(songId, collaborators);
    }

    function getSong(uint256 songId) external view returns (Song memory) {
        require(_songs[songId].creator != address(0), "Song not found");
        return _songs[songId];
    }
}




