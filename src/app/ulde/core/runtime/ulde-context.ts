export class UldeContext {
  constructor(public path: string) {}

  raw: string = '';
  html: string = '';
  metadata: Record<string, any> = {};
}
