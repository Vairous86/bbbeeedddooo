declare module "@vercel/kv" {
  export const kv: {
    get<T = any>(key: string): Promise<T | null>;
    set<T = any>(key: string, value: T | null): Promise<void>;
    del(key: string): Promise<void>;
    // mget/mset not required for our minimal usage
  };
  export default kv;
}

declare module "next/server" {
  // Lightweight placeholder so TypeScript in this repo won't error when importing NextResponse
  export const NextResponse: any;
}
