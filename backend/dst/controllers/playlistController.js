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
exports.removeSongsFromPlaylist = exports.getPlaylistById = exports.addSongsToPlaylist = exports.getUserPlaylists = exports.createPlaylist = void 0;
const playlist_1 = __importDefault(require("../models/playlist"));
// Create Playlist
const createPlaylist = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, userId, songIds } = req.body;
        const newPlaylist = new playlist_1.default({
            name,
            description,
            userId,
            songIds,
        });
        yield newPlaylist.save();
        res.status(201).json(newPlaylist);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to create playlist', details: err });
    }
});
exports.createPlaylist = createPlaylist;
// Get all playlists of a user
const getUserPlaylists = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const playlists = yield playlist_1.default.find({ userId });
        res.json(playlists);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch playlists' });
    }
});
exports.getUserPlaylists = getUserPlaylists;
const addSongsToPlaylist = (req, res) => {
    const { playlistId } = req.params;
    const { songIds } = req.body; // songIds should be an array
    if (!Array.isArray(songIds)) {
        res.status(400).json({ error: 'songIds must be an array' });
    }
    playlist_1.default.findByIdAndUpdate(playlistId, { $addToSet: { songIds: { $each: songIds } } }, { new: true })
        .then(updated => {
        if (!updated)
            return res.status(404).json({ error: 'Playlist not found' });
        res.json(updated);
    })
        .catch(err => {
        res.status(500).json({ error: 'Failed to add songs' });
    });
};
exports.addSongsToPlaylist = addSongsToPlaylist;
const getPlaylistById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { playlistId } = req.params;
        const playlist = yield playlist_1.default.findById(playlistId);
        if (!playlist) {
            res.status(404).json({ error: 'Playlist not found' });
            return; // Ensure we stop execution here after sending the response
        }
        res.json(playlist);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch playlist', details: err });
    }
});
exports.getPlaylistById = getPlaylistById;
const removeSongsFromPlaylist = (req, res) => {
    const { playlistId } = req.params;
    const { songIds } = req.body;
    if (!Array.isArray(songIds)) {
        res.status(400).json({ error: 'songIds must be an array' });
        return Promise.resolve();
    }
    return playlist_1.default.findByIdAndUpdate(playlistId, { $pull: { songIds: { $in: songIds } } }, { new: true })
        .then(updated => {
        if (!updated) {
            res.status(404).json({ error: 'Playlist not found' });
        }
        else {
            res.json(updated);
        }
    })
        .catch(err => {
        res.status(500).json({ error: 'Failed to remove songs' });
    });
};
exports.removeSongsFromPlaylist = removeSongsFromPlaylist;
