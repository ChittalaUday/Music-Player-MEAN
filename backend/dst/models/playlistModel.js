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
// Schema for the Playlist
const PlaylistSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Playlist name is required'],
        trim: true,
        maxlength: [100, 'Playlist name cannot be more than 100 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot be more than 500 characters']
    },
    userId: {
        type: String,
        required: [true, 'User ID is required'],
        index: true
    },
    songIds: [
        {
            type: String,
            required: true
        }
    ],
    isPublic: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});
// Create indexes for faster queries
PlaylistSchema.index({ name: 'text', description: 'text' });
// Example method to find playlists by user ID
PlaylistSchema.statics.findByUserId = function (userId) {
    return this.find({ userId });
};
// Define a virtual property for song count
PlaylistSchema.virtual('songCount').get(function () {
    return this.songIds.length;
});
// Create the model
const Playlist = mongoose_1.default.model('Playlist', PlaylistSchema);
exports.default = Playlist;
