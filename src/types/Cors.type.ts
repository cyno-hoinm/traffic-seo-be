export type CorsOrigin =
  | string
  | RegExp
  | (string | RegExp)[]
  | boolean
  | ((origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => void);

export type CorsOptions = {
  origin: CorsOrigin;
  methods: string[];
  allowedHeaders: string[];
  exposedHeaders: string[];
  credentials: boolean;
  maxAge: number; // Seconds
};
