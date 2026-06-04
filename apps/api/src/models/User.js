"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserModel = void 0;
var mongoose_1 = require("mongoose");
var bcryptjs_1 = __importDefault(require("bcryptjs"));
var shared_1 = require("@medicalink/shared");
var constants_1 = require("../utils/constants");
var userSchema = new mongoose_1.Schema({
    tenantId: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    password: { type: String, select: false },
    role: { type: String, enum: Object.values(shared_1.Role), required: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    staffId: { type: String, trim: true },
    department: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Department' },
    isActive: { type: Boolean, default: true },
    isEmailVerified: { type: Boolean, default: false },
    twoFactorSecret: { type: String, select: false },
    twoFactorEnabled: { type: Boolean, default: false },
    refreshTokens: [
        {
            tokenHash: { type: String, required: true },
            device: String,
            ip: String,
            createdAt: { type: Date, default: Date.now },
            expiresAt: { type: Date, required: true },
        },
    ],
    lastLogin: { type: Date },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
    avatar: { type: String },
}, { timestamps: true });
userSchema.index({ email: 1, tenantId: 1 }, { unique: true });
userSchema.index({ staffId: 1 });
userSchema.index({ role: 1 });
userSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function () {
        var salt, _a, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!this.isModified('password') || !this.password)
                        return [2 /*return*/, next()];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, bcryptjs_1.default.genSalt(constants_1.SALT_ROUNDS)];
                case 2:
                    salt = _b.sent();
                    _a = this;
                    return [4 /*yield*/, bcryptjs_1.default.hash(this.password, salt)];
                case 3:
                    _a.password = _b.sent();
                    next();
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _b.sent();
                    next(error_1);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
});
userSchema.methods.comparePassword = function (candidatePassword) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (!this.password)
                return [2 /*return*/, false];
            return [2 /*return*/, bcryptjs_1.default.compare(candidatePassword, this.password)];
        });
    });
};
userSchema.methods.isLocked = function () {
    return !!(this.lockUntil && this.lockUntil.getTime() > Date.now());
};
userSchema.methods.incrementLoginAttempts = function () {
    return __awaiter(this, void 0, void 0, function () {
        var updates;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (this.lockUntil && this.lockUntil.getTime() < Date.now()) {
                        return [2 /*return*/, this.updateOne({
                                $set: { loginAttempts: 1 },
                                $unset: { lockUntil: 1 },
                            })];
                    }
                    updates = { $inc: { loginAttempts: 1 } };
                    if (this.loginAttempts + 1 >= constants_1.MAX_LOGIN_ATTEMPTS && !this.isLocked()) {
                        updates.$set = { lockUntil: Date.now() + 15 * 60 * 1000 }; // lock for 15 minutes
                    }
                    return [4 /*yield*/, this.updateOne(updates)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
};
userSchema.methods.resetLoginAttempts = function () {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, this.updateOne({
                        $set: { loginAttempts: 0 },
                        $unset: { lockUntil: 1 },
                    })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
};
/**
 * Gets the User model on the specific tenant database connection.
 */
var getUserModel = function (tenantDb) {
    return tenantDb.model('User', userSchema);
};
exports.getUserModel = getUserModel;
