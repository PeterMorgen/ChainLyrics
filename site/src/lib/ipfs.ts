export type IpfsUploadResult = { cid: string; url: string };

// 使用 nft.storage（浏览器友好，解决 CORS），需要 NEXT_PUBLIC_NFT_STORAGE_TOKEN
export async function uploadToIPFS(file: File | Blob, filename?: string): Promise<IpfsUploadResult> {
  // 走 Next.js API Route，避免前端暴露 token 与 CORS 问题
  const form = new FormData();
  form.append("file", file, filename ?? `file-${Date.now()}`);
  const res = await fetch("/api/ipfs", { method: "POST", body: form });
  if (!res.ok) throw new Error(`IPFS upload failed: ${res.status}`);
  return (await res.json()) as IpfsUploadResult;
}


