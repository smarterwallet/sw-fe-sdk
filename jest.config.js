module.exports = {
    preset: 'ts-jest',
    // 使用 ts-jest 处理 `.ts` 或 `.tsx` 文件
    transform: {
        '^.+\\.(t|j)sx?$': 'ts-jest',
    },
    // 配置 Jest 测试环境
    testEnvironment: 'node',
    // 如果你的项目中同时使用了 JS 和 TS，
    // 你可能需要告诉 Jest 哪些文件是测试文件
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$',
    // 模块文件扩展名数组
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

};  