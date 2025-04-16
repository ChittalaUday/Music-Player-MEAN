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
const songModel_1 = __importDefault(require("../models/songModel"));
function getRecommendations(songId) {
    return __awaiter(this, void 0, void 0, function* () {
        const song = yield songModel_1.default.findOne({ songId });
        if (!song) {
            throw new Error('Song not found');
        }
        const allSongs = yield songModel_1.default.find({
            songId: { $ne: songId }, // Exclude the selected song
        });
        // Calculate a score for each song based on similarity
        const scoredSongs = allSongs.map(otherSong => {
            var _a, _b;
            let score = 0;
            // Ensure composers are arrays
            const songComposers = Array.isArray(song.composer) ? song.composer : [song.composer];
            const otherSongComposers = Array.isArray(otherSong.composer) ? otherSong.composer : [otherSong.composer];
            // Add points for matching genre
            score += otherSong.genre.filter(genre => song.genre.includes(genre)).length;
            // Add points for matching composer
            score += otherSongComposers.filter(composer => songComposers.includes(composer)).length;
            // Add points for matching album (less weight)
            if (otherSong.album === song.album) {
                score += 0.5;
            }
            // Add points for similar year (less weight), if both years are defined
            if (otherSong.year !== undefined && song.year !== undefined) {
                if (Math.abs(otherSong.year - song.year) <= 2) {
                    score += 0.5;
                }
            }
            // Ensure tags are initialized
            const songTags = (_a = song.tags) !== null && _a !== void 0 ? _a : [];
            const otherSongTags = (_b = otherSong.tags) !== null && _b !== void 0 ? _b : [];
            // Add points for matching tags, if they exist
            if (songTags.length > 0 && otherSongTags.length > 0) {
                score += otherSongTags.filter(tag => songTags.includes(tag)).length;
            }
            return { song: otherSong, score };
        });
        // Sort songs by score in descending order and take the top 5
        const recommendations = scoredSongs.sort((a, b) => b.score - a.score).slice(0, 5).map(item => item.song);
        return recommendations;
    });
}
exports.default = getRecommendations;
