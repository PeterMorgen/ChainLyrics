// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

interface IERC20Like {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
}

/// @title RevenueSplit - 收益按比例分配（pull-based 提现）
contract RevenueSplit {
    struct Share { address account; uint96 bps; } // 百分比基点，总和<=10000
    struct Balance { mapping(address => uint256) tokenToAmount; }

    mapping(uint256 => Share[]) private _songShares;
    mapping(address => Balance) private _balances; // 用户可提余额（token=>amount）

    event SharesSet(uint256 indexed songId, Share[] shares);
    event Distributed(uint256 indexed songId, address token, uint256 amount);
    event Credited(uint256 indexed songId, address indexed account, address token, uint256 amount);
    event Withdrawn(address indexed user, address token, uint256 amount);

    function setShares(uint256 songId, Share[] calldata shares) external {
        delete _songShares[songId];
        uint256 total;
        for (uint256 i = 0; i < shares.length; i++) {
            _songShares[songId].push(shares[i]);
            total += shares[i].bps;
        }
        require(total <= 10000, "bps>100%" );
        emit SharesSet(songId, shares);
    }

    function distributeRevenue(uint256 songId, address token, uint256 amount) external payable {
        if (token == address(0)) {
            // native
            require(msg.value == amount, "bad msg.value");
        } else {
            require(IERC20Like(token).transferFrom(msg.sender, address(this), amount));
        }
        Share[] storage arr = _songShares[songId];
        require(arr.length > 0, "no shares");
        for (uint256 i = 0; i < arr.length; i++) {
            uint256 part = (amount * arr[i].bps) / 10000;
            _balances[arr[i].account].tokenToAmount[token] += part;
            emit Credited(songId, arr[i].account, token, part);
        }
        emit Distributed(songId, token, amount);
    }

    function withdraw(address token) external {
        uint256 bal = _balances[msg.sender].tokenToAmount[token];
        require(bal > 0, "no balance");
        _balances[msg.sender].tokenToAmount[token] = 0;
        if (token == address(0)) {
            (bool ok,) = payable(msg.sender).call{value: bal}("");
            require(ok, "eth transfer failed");
        } else {
            require(IERC20Like(token).transfer(msg.sender, bal));
        }
        emit Withdrawn(msg.sender, token, bal);
    }

    /// @notice 读取用户在本合约内的可提余额（token 为 0 表示原生 ETH）
    function getBalance(address user, address token) external view returns (uint256) {
        return _balances[user].tokenToAmount[token];
    }
}


