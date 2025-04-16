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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const morgan = require('morgan');
const authController_1 = require("../controllers/authController");
const adminController_1 = require("../controllers/adminController");
const songController_1 = require("../controllers/songController");
const profileController_1 = require("../controllers/profileController");
const playlistController_1 = require("../controllers/playlistController");
const recommendationService_1 = __importDefault(require("../services/recommendationService"));
const auth_1 = require("../middleware/auth");
const favoritesController_1 = require("../controllers/favoritesController");
const router = (0, express_1.Router)();
// Multer config for profile image uploads
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/'))
            cb(null, true);
        else
            cb(new Error('Only image files are allowed!'));
    }
});
// Create temp directory if not exists
const tempDir = 'temp';
if (!fs_1.default.existsSync(tempDir))
    fs_1.default.mkdirSync(tempDir);
// Logging setup
const logDirectory = path_1.default.join(__dirname, '../logs');
if (!fs_1.default.existsSync(logDirectory))
    fs_1.default.mkdirSync(logDirectory);
const accessLogStream = fs_1.default.createWriteStream(path_1.default.join(logDirectory, 'access.log'), { flags: 'a' });
router.use(morgan('combined', { stream: accessLogStream }));
router.use(morgan('dev'));
// Debug log for form-data
router.use((req, res, next) => {
    console.log('Form-data fields:', req.body);
    next();
});
const songController = new songController_1.SongController();
// 🏠 Welcome Route
router.get("/", (req, res) => {
    res.send("🎵 Welcome to Music Player API");
});
// 🔐 Auth Routes
router.post('/login', authController_1.loginUser);
router.post('/register', upload.single('profileImage'), authController_1.registerUser);
router.post('/admin/register', upload.single('profileImage'), adminController_1.isAdmin, authController_1.adminRegisterUser);
// 👤 Profile Routes
router.get('/me/:id', auth_1.authenticateJWT, profileController_1.getProfile);
router.put('/me/:id', auth_1.authenticateJWT, profileController_1.updateProfile);
router.post('/me/image', auth_1.authenticateJWT, upload.single('profileImage'), profileController_1.uploadProfileImage);
router.delete('/me/image', auth_1.authenticateJWT, profileController_1.deleteProfileImage);
router.get('/search', profileController_1.searchUsers);
// 🎶 Song Routes
router.get('/songs', songController.getAllSongs);
router.post('/songs/upload', auth_1.authenticateJWT, songController_1.songUpload.single('songFile'), songController.uploadSong);
router.get('/songs/:id', songController.getSongDetails);
router.delete('/songs/:id', auth_1.authenticateJWT, songController.deleteSong);
router.get('/search', songController.searchSongs);
router.get('/songs/:songId/cover', songController.getCoverImage);
// 🏷️ Song Tag Routes
router.post('/songs/:songId/add-tags', songController.addTags);
router.post('/songs/:songId/remove-tags', songController.removeTags);
// fav and recently
router.post('/add-favorite', auth_1.authenticateJWT, favoritesController_1.addToFavorites);
router.post('/add-recently', auth_1.authenticateJWT, favoritesController_1.addToRecentlyPlayed);
router.delete('/remove-favorite', auth_1.authenticateJWT, favoritesController_1.removeFromFavorites);
router.get("/get-favorites", auth_1.authenticateJWT, favoritesController_1.getFavorites);
//playlists
router.post('/playlist', auth_1.authenticateJWT, playlistController_1.createPlaylist);
router.get('/playlists/:userId', auth_1.authenticateJWT, playlistController_1.getUserPlaylists);
router.put('/playlist/:playlistId/add-song', auth_1.authenticateJWT, playlistController_1.addSongsToPlaylist);
router.put('/playlist/:playlistId/remove-song', auth_1.authenticateJWT, playlistController_1.removeSongsFromPlaylist);
router.get('/playlist/:playlistId', auth_1.authenticateJWT, playlistController_1.getPlaylistById);
// 🤖 Recommendation
router.get('/songs/recommendations/:songId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { songId } = req.params;
        const recommendations = yield (0, recommendationService_1.default)(songId);
        res.json(recommendations);
    }
    catch (error) {
        console.error('Recommendation error:', error);
        res.status(500).json({ error: error || 'Internal Server Error' });
    }
}));
// 🛠️ Admin Routes
router.get('/admin/users', auth_1.authenticateJWT, adminController_1.isAdmin, adminController_1.getAllUsers);
router.put('/admin/users/role', auth_1.authenticateJWT, adminController_1.isAdmin, adminController_1.updateUserRole);
router.delete('/admin/users/:userId', auth_1.authenticateJWT, adminController_1.isAdmin, adminController_1.deleteUser);
exports.default = router;
