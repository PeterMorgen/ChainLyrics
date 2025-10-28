import { NextResponse } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file field" }, { status: 400 });
    }

    // 使用 Pinata 官方 SDK（简化，彻底解决端点/权限问题）
    const pinataJwt = process.env.PINATA_JWT;
    if (pinataJwt) {
      const { PinataSDK } = await import("pinata-web3");
      const pinata = new PinataSDK({ pinataJwt });
      
      // 转为 Node.js File 对象（Pinata SDK 接收）
      const buffer = Buffer.from(await file.arrayBuffer());
      const nodeFile = new File([buffer], file.name, { type: file.type || "application/octet-stream" });
      
      const upload = await pinata.upload.file(nodeFile);
      const cid = upload.IpfsHash;
      
      return NextResponse.json({ cid, url: `https://ipfs.io/ipfs/${cid}` });
    }

    // 旧版 NFT.Storage Classic JWT（以 eyJ 开头）
    const nftToken = process.env.NFT_STORAGE_TOKEN?.trim();
    if (nftToken && nftToken.startsWith("ey")) {
      const { NFTStorage } = await import("nft.storage");
      const client = new NFTStorage({ token: nftToken });
      const cid = await client.storeBlob(file as unknown as Blob);
      return NextResponse.json({ cid, url: `https://ipfs.io/ipfs/${cid}` });
    }

    return NextResponse.json(
      { error: "Missing IPFS credentials: set PINATA_JWT or NFT_STORAGE_TOKEN (Classic JWT)" },
      { status: 500 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e), stack: e?.stack }, { status: 500 });
  }
}
