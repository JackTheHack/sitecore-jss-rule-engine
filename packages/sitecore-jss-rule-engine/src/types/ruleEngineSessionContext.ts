
export class RuleEngineSessionContext {
    private variables: Map<string, any>;

    constructor() {
        this.variables = new Map<string, any>();
    }

    public get<T>(key: string): T {
        return this.variables.get(key) as T;
    }

    public set<T>(key: string, value: T): void {
        this.variables.set(key, value);
    }

    public delete(key: string): boolean {
        return this.variables.delete(key);
    }

    public has(key: string): boolean {
        return this.variables.has(key);
    }

    public clear(): void {
        this.variables.clear();
    }
}