"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const SongSchema = new mongoose_1.Schema({
    songId: {
        type: String,
        required: true,
        unique: true,
        default: () => `song_${new mongoose_1.default.Types.ObjectId().toString()}`
    },
    title: { type: String, required: true },
    artist: { type: String, default: 'Unknown Artist' },
    artists: { type: [String], default: [] },
    composer: { type: mongoose_1.Schema.Types.Mixed, default: 'Unknown Composer' },
    album: { type: String, default: 'Unknown Album' },
    year: { type: Number },
    genre: { type: [String], default: ['Unknown'] },
    duration: { type: Number },
    bitrate: { type: Number },
    sampleRate: { type: Number },
    channels: { type: Number },
    format: { type: String },
    fileSize: { type: Number, required: true },
    originalFilename: { type: String, required: true },
    fileUrl: { type: String },
    coverImageUrl: { type: String, default: __dirname + "../assests/282120.png" }, // Add this field to store the cover image URL
    uploadDate: { type: Date, default: Date.now },
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' },
    tags: { type: [String], default: [] }
}, {
    timestamps: true,
    versionKey: false
});
exports.default = mongoose_1.default.model('Song', SongSchema);
