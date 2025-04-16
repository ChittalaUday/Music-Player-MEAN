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
exports.getFavorites = exports.addToRecentlyPlayed = exports.removeFromFavorites = exports.addToFavorites = void 0;
const User_1 = __importDefault(require("../models/User")); // Adjust path as needed
const songModel_1 = __importDefault(require("../models/songModel"));
// ✅ Add a music track to user's favorites
const addToFavorites = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, songId } = req.body;
    if (!userId || !songId) {
        res.status(400).json({ message: 'userId and songId are required' });
        return;
    }
    try {
        const user = yield User_1.default.findOne({ _id: userId });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        if (!user.favorites.includes(songId)) {
            user.favorites.push(songId);
            yield user.save();
        }
        res.status(200).json({ message: 'Added to favorites', favorites: user.favorites });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
});
exports.addToFavorites = addToFavorites;
// ✅ Remove a music track from user's favorites
const removeFromFavorites = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, songId } = req.body;
    if (!userId || !songId) {
        res.status(400).json({ message: 'userId and songId are required' });
        return;
    }
    try {
        const user = yield User_1.default.findOne({ _id: userId });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        user.favorites = user.favorites.filter(id => id !== songId);
        yield user.save();
        res.status(200).json({ message: 'Removed from favorites', favorites: user.favorites });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
});
exports.removeFromFavorites = removeFromFavorites;
// ✅ Add a song to recently played (limit to 5, no duplicates)
const addToRecentlyPlayed = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, songId } = req.body;
    if (!userId || !songId) {
        res.status(400).json({ message: 'userId and songId are required' });
        return;
    }
    try {
        const user = yield User_1.default.findOne({ _id: userId });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        user.recentlyPlayed = user.recentlyPlayed.filter(id => id !== songId);
        user.recentlyPlayed.unshift(songId);
        user.recentlyPlayed = user.recentlyPlayed.slice(0, 5);
        yield user.save();
        res.status(200).json({ message: 'Updated recently played', recentlyPlayed: user.recentlyPlayed });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
});
exports.addToRecentlyPlayed = addToRecentlyPlayed;
const getFavorites = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.query;
    if (!userId || typeof userId !== 'string') {
        res.status(400).json({ message: 'Missing or invalid userId' });
        return;
    }
    try {
        const user = yield User_1.default.findById(userId).lean();
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        // Query songs that match user's favorite song IDs
        const favoriteSongs = yield songModel_1.default.find({ _id: { $in: user.favorites || [] } });
        res.status(200).json(favoriteSongs);
    }
    catch (err) {
        console.error('Error fetching favorites:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getFavorites = getFavorites;
