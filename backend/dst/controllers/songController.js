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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SongController = exports.songUpload = exports.songUploadMultiple = void 0;
const path = __importStar(require("path"));
const mm = __importStar(require("music-metadata"));
const multer_1 = __importDefault(require("multer"));
const fs = __importStar(require("fs"));
const firebase_1 = __importDefault(require("../config/firebase"));
const songModel_1 = __importDefault(require("../models/songModel"));
const axios_1 = __importDefault(require("axios"));
const mongoose_1 = __importDefault(require("mongoose"));
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const tempDir = path.join(process.cwd(), 'temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        cb(null, tempDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});
exports.songUploadMultiple = (0, multer_1.default)({
    storage: storage, // Assuming your storage configuration remains the same as before
    limits: { fileSize: 15 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('audio/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only audio files are allowed!'));
        }
    }
}).array('songs');
exports.songUpload = (0, multer_1.default)({
    storage: storage,
    limits: { fileSize: 15 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('audio/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only audio files are allowed!'));
        }
    }
});
class SongController {
    constructor() {
        this.uploadSong = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                if (!req.file) {
                    res.status(400).json({ success: false, message: 'No file uploaded' });
                    return;
                }
                const tempFilePath = req.file.path;
                const originalFilename = req.file.originalname;
                try {
                    const metadata = yield this.extractMetadata(tempFilePath, originalFilename);
                    const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || null;
                    const song = new songModel_1.default(Object.assign(Object.assign({}, metadata), { userId }));
                    // Check if a cover image exists, if not use a default image
                    let coverImageUrl = metadata.coverImage || __dirname + "../assests/282120.png"; // Set default image path
                    if (coverImageUrl !== __dirname + "../assests/282120.png") {
                        // If the cover image is found, upload it
                        coverImageUrl = yield this.uploadCoverImage(metadata.coverImage, song.songId);
                    }
                    song.coverImageUrl = coverImageUrl;
                    yield song.save();
                    const fileUrl = yield this.uploadToFirebase(tempFilePath, originalFilename, song);
                    song.fileUrl = fileUrl;
                    yield song.save();
                    fs.unlinkSync(tempFilePath);
                    res.status(200).json({
                        success: true,
                        message: 'Song uploaded successfully',
                        song
                    });
                }
                catch (error) {
                    console.error('Error processing uploaded file:', error);
                    if (fs.existsSync(tempFilePath))
                        fs.unlinkSync(tempFilePath);
                    res.status(500).json({ success: false, message: 'Failed to process uploaded file', error });
                }
            }
            catch (error) {
                console.error('Error in upload handler:', error);
                res.status(500).json({ success: false, message: 'Server error during upload', error });
            }
        });
        this.getAllSongs = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const songs = yield songModel_1.default.find();
                res.status(200).json({ success: true, data: songs });
            }
            catch (error) {
                console.error('Error retrieving songs:', error);
                res.status(500).json({ success: false, message: 'Failed to retrieve songs', error });
            }
        });
        this.deleteSong = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                if (!id) {
                    res.status(400).json({ success: false, message: 'Song ID is required' });
                    return;
                }
                const song = yield songModel_1.default.findOne({ $or: [{ _id: mongoose_1.default.isValidObjectId(id) ? new mongoose_1.default.Types.ObjectId(id) : null }, { songId: id }] });
                if (!song) {
                    res.status(404).json({ success: false, message: 'Song not found' });
                    return;
                }
                if (req.user && song.userId && req.user.id !== song.userId.toString()) {
                    res.status(403).json({ success: false, message: 'Unauthorized to delete this song' });
                    return;
                }
                const ext = path.extname(song.originalFilename);
                const filePath = `songs/${song.songId}${ext}`;
                try {
                    yield this.bucket.file(filePath).delete();
                    console.log(`Firebase file deleted: ${filePath}`);
                }
                catch (error) {
                    console.error('Error deleting from Firebase Storage:', error);
                }
                yield songModel_1.default.findByIdAndDelete(song._id);
                res.status(200).json({ success: true, message: 'Song deleted successfully' });
            }
            catch (error) {
                console.error('Error deleting song:', error);
                res.status(500).json({ success: false, message: 'Failed to delete song', error });
            }
        });
        this.getSongDetails = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                if (!id) {
                    res.status(400).json({ success: false, message: 'Song ID is required' });
                    return;
                }
                const song = yield songModel_1.default.findById(id);
                if (!song) {
                    res.status(404).json({ success: false, message: 'Song not found' });
                    return;
                }
                res.status(200).json({ success: true, data: song });
            }
            catch (error) {
                console.error('Error getting song details:', error);
                res.status(500).json({ success: false, message: 'Failed to get song details', error });
            }
        });
        this.addTags = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                var { songId } = req.params;
                const { tags } = req.body;
                if (!songId || !tags || !Array.isArray(tags)) {
                    res.status(400).json({ success: false, message: 'Song ID and tags are required' });
                    return;
                }
                const song = yield songModel_1.default.findOne({ _id: songId });
                if (!song) {
                    res.status(404).json({ success: false, message: 'Song not found' });
                    return;
                }
                song.tags = [...new Set([...(song.tags || []), ...tags])];
                yield song.save();
                res.status(200).json({ success: true, message: 'Tags added successfully', song });
            }
            catch (error) {
                console.error('Error adding tags:', error);
                res.status(500).json({ success: false, message: 'Failed to add tags', error });
            }
        });
        this.removeTags = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                var { songId } = req.params;
                const { tags } = req.body;
                if (!songId || !tags || !Array.isArray(tags)) {
                    res.status(400).json({ success: false, message: 'Song ID and tags are required' });
                    return;
                }
                const song = yield songModel_1.default.findOne({ _id: songId });
                if (!song) {
                    res.status(404).json({ success: false, message: 'Song not found' });
                    return;
                }
                song.tags = (song.tags || []).filter(tag => !tags.includes(tag));
                yield song.save();
                res.status(200).json({ success: true, message: 'Tags removed successfully', song });
            }
            catch (error) {
                console.error('Error removing tags:', error);
                res.status(500).json({ success: false, message: 'Failed to remove tags', error });
            }
        });
        this.getCoverImage = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { songId } = req.params;
                const song = yield songModel_1.default.findOne({ songId });
                if (!song || !song.fileUrl) {
                    res.status(404).json({ success: false, message: 'Song or file URL not found' });
                    return;
                }
                try {
                    // Fetch the audio file from the provided URL (fileUrl)
                    const response = yield axios_1.default.get(song.fileUrl, { responseType: 'arraybuffer' });
                    const buffer = Buffer.from(response.data);
                    // Extract audio metadata
                    const metadata = yield mm.parseBuffer(buffer, 'audio/mpeg');
                    const picture = (_a = metadata.common.picture) === null || _a === void 0 ? void 0 : _a[0]; // First picture (cover image)
                    if (!picture) {
                        // No cover image embedded, return a fallback image
                        const defaultCoverImagePath = 'path/to/default/cover-image.png'; // Replace with your fallback image path
                        const defaultCoverImage = fs.readFileSync(defaultCoverImagePath);
                        res.setHeader('Content-Type', 'image/png');
                        res.send(defaultCoverImage);
                    }
                    else {
                        // Send the extracted cover image
                        res.setHeader('Content-Type', picture.format || 'image/jpeg');
                        res.send(picture.data);
                    }
                }
                catch (error) {
                    console.error('Error extracting cover image from audio file:', error);
                    // If extraction fails, send fallback image
                    const defaultCoverImagePath = 'path/to/default/cover-image.png'; // Replace with your fallback image path
                    const defaultCoverImage = fs.readFileSync(defaultCoverImagePath);
                    res.setHeader('Content-Type', 'image/png');
                    res.send(defaultCoverImage);
                }
            }
            catch (error) {
                console.error('Error processing cover image request:', error);
                res.status(500).json({ success: false, message: 'Failed to process cover image request', error });
            }
        });
        this.searchSongs = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { query } = req.query;
                if (!query || typeof query !== 'string') {
                    res.status(400).json({ success: false, message: 'Search query is required' });
                    return;
                }
                const regex = new RegExp(query, 'i');
                const songs = yield songModel_1.default.find({ $text: { $search: query } });
                res.status(200).json({ success: true, data: songs });
            }
            catch (error) {
                console.error('Error searching songs:', error);
                res.status(500).json({ success: false, message: 'Failed to search songs', error });
            }
        });
        this.bucket = firebase_1.default.storage().bucket();
    }
    extractMetadata(filePath, originalFilename) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const stats = fs.statSync(filePath);
                const fileContent = fs.readFileSync(filePath);
                const metadata = yield mm.parseBuffer(fileContent);
                let composerValue = metadata.common.composer || 'Unknown Composer';
                if (Array.isArray(composerValue) && composerValue.length > 0) {
                    composerValue = composerValue.flat();
                }
                let artistsArray = metadata.common.artists || ['Unknown Artist'];
                if (metadata.common.artist)
                    artistsArray = [metadata.common.artist];
                const coverImage = metadata.common.picture ? metadata.common.picture[0] : null;
                return {
                    title: metadata.common.title || originalFilename,
                    artist: metadata.common.artist || 'Unknown Artist',
                    artists: artistsArray,
                    composer: composerValue,
                    album: metadata.common.album || 'Unknown Album',
                    year: metadata.common.year,
                    genre: metadata.common.genre || ['Unknown'],
                    duration: metadata.format.duration,
                    bitrate: metadata.format.bitrate,
                    sampleRate: metadata.format.sampleRate,
                    channels: metadata.format.numberOfChannels,
                    format: metadata.format.container,
                    fileSize: stats.size,
                    originalFilename: originalFilename,
                    uploadDate: new Date(),
                    coverImage
                };
            }
            catch (error) {
                console.error('Error extracting metadata:', error);
                throw error;
            }
        });
    }
    uploadToFirebase(filePath, originalFilename, song) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const ext = path.extname(originalFilename);
                const storageFilename = `songs/${song.songId}${ext}`;
                yield this.bucket.upload(filePath, {
                    destination: storageFilename,
                    metadata: {
                        contentType: `audio/${ext.substring(1)}`,
                        metadata: { originalFilename, songId: song.songId, mongoDbId: song._id.toString() }
                    }
                });
                yield this.bucket.file(storageFilename).makePublic();
                return `https://storage.googleapis.com/${this.bucket.name}/${storageFilename}`;
            }
            catch (error) {
                console.error('Error uploading to Firebase:', error);
                throw error;
            }
        });
    }
    uploadCoverImage(coverImage, songId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!coverImage)
                return null;
            try {
                const ext = coverImage.format || 'image/jpeg';
                const coverImageBuffer = Buffer.from(coverImage.data);
                const coverImageFilename = `covers/${songId}.jpg`;
                yield this.bucket.file(coverImageFilename).save(coverImageBuffer, {
                    contentType: ext,
                    public: true,
                });
                return `https://storage.googleapis.com/${this.bucket.name}/${coverImageFilename}`;
            }
            catch (error) {
                console.error('Error uploading cover image:', error);
                throw error;
            }
        });
    }
}
exports.SongController = SongController;
