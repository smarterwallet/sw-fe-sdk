export class CommonUtils {
    public static isBrowserEnvironment(): Boolean {
        return typeof window !== 'undefined' && typeof window.document !== 'undefined';
    }
}