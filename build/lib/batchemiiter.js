"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class BatchEmitter {
    constructor(cb) {
        this.running = false;
        this.requestCount = 0;
        this.requestCache = [];
        this.cb = cb;
    }
    emit(args) {
        let self = this;
        self.requestCount++;
        if (args)
            self.requestCache.push(args);
        if (self.running)
            return; // 已经在跑
        self.running = true; // 设置状态在跑
        process.nextTick(() => __awaiter(this, void 0, void 0, function* () {
            while (self.requestCount > 0) {
                const [count, cache] = [self.requestCount, self.requestCache];
                self.requestCount = 0;
                self.requestCache = [];
                yield self.cb(count, cache);
            }
            self.running = false; // 本轮完成
        }));
    }
}
exports.BatchEmitter = BatchEmitter;
//# sourceMappingURL=batchemiiter.js.map