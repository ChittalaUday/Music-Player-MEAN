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
exports.searchUsers = exports.getUserProfile = exports.deleteProfileImage = exports.updateProfile = exports.getProfile = exports.uploadProfileImage = void 0;
const User_1 = __importDefault(require("../models/User"));
const firebase_1 = __importDefault(require("../config/firebase"));
const uuid_1 = require("uuid");
// Get a reference to the storage bucket
const bucket = firebase_1.default.storage().bucket();
const uploadProfileImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!req.file) {
            res.status(400).json({ message: 'No file uploaded' });
            return;
        }
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Assuming you have user info from auth middleware
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        // Create a unique filename
        const fileExtension = req.file.originalname.split('.').pop();
        const fileName = `profile-images/${userId}-${(0, uuid_1.v4)()}.${fileExtension}`;
        // Create a file object in the bucket
        const file = bucket.file(fileName);
        // Create a write stream and upload the file
        const stream = file.createWriteStream({
            metadata: {
                contentType: req.file.mimetype,
            },
            resumable: false
        });
        // Handle upload errors
        stream.on('error', (error) => {
            console.error('Upload error:', error);
            res.status(500).json({ message: 'Error uploading to Firebase Storage' });
        });
        // Handle successful upload
        stream.on('finish', () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                // Make the file publicly accessible
                yield file.makePublic();
                // Get the public URL
                const imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
                // Update user's profile picture URL in database
                yield User_1.default.findByIdAndUpdate(userId, { profilePicture: imageUrl });
                res.status(200).json({
                    message: 'Profile image uploaded successfully',
                    imageUrl
                });
            }
            catch (error) {
                console.error('Error after upload:', error);
                res.status(500).json({ message: 'Server error after file upload' });
            }
        }));
        stream.end(req.file.buffer);
    }
    catch (error) {
        console.error('Profile image upload error:', error);
        res.status(500).json({ message: 'Server error during file upload' });
    }
});
exports.uploadProfileImage = uploadProfileImage;
const getProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.params) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const user = yield User_1.default.findById(userId).select('-password');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.status(200).json({ user });
    }
    catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Server error while fetching profile' });
    }
});
exports.getProfile = getProfile;
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.params) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const { name, bio, gender, dateOfBirth } = req.body;
        // Fields that are allowed to be updated
        const updateData = {};
        if (name)
            updateData.name = name;
        if (bio !== undefined)
            updateData.bio = bio;
        if (gender !== undefined)
            updateData.gender = gender;
        if (dateOfBirth != null)
            updateData.dateOfBirth = dateOfBirth;
        const updatedUser = yield User_1.default.findByIdAndUpdate(userId, { $set: updateData }, { new: true }).select('-password');
        if (!updatedUser) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.status(200).json({
            message: 'Profile updated successfully',
            user: updatedUser
        });
    }
    catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Server error while updating profile' });
    }
});
exports.updateProfile = updateProfile;
const deleteProfileImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const user = yield User_1.default.findById(userId);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        if (!user.profilePicture) {
            res.status(400).json({ message: 'No profile image to delete' });
            return;
        }
        // Extract the file path from the URL
        const fileUrl = user.profilePicture;
        const filePathMatch = fileUrl.match(/\/([^\/]+\/[^\/]+)$/);
        if (!filePathMatch) {
            res.status(400).json({ message: 'Invalid profile image URL' });
            return;
        }
        const filePath = filePathMatch[1];
        const file = bucket.file(filePath);
        // Check if file exists
        const [exists] = yield file.exists();
        if (exists) {
            yield file.delete();
        }
        // Remove the profile picture URL from the user's record
        user.profilePicture = '';
        yield user.save();
        res.status(200).json({ message: 'Profile image deleted successfully' });
    }
    catch (error) {
        console.error('Delete profile image error:', error);
        res.status(500).json({ message: 'Server error while deleting profile image' });
    }
});
exports.deleteProfileImage = deleteProfileImage;
const getUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        if (!userId) {
            res.status(400).json({ message: 'User ID is required' });
            return;
        }
        // Fetch public profile data (exclude sensitive fields)
        const user = yield User_1.default.findById(userId).select('name profilePicture bio location website createdAt');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.status(200).json({ user });
    }
    catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({ message: 'Server error while fetching user profile' });
    }
});
exports.getUserProfile = getUserProfile;
const searchUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { query } = req.query;
        if (!query || typeof query !== 'string') {
            res.status(400).json({ message: 'Search query is required' });
            return;
        }
        // Search for users by name (case insensitive)
        const users = yield User_1.default.find({
            name: { $regex: query, $options: 'i' }
        }).select('name profilePicture bio').limit(10);
        res.status(200).json({ users });
    }
    catch (error) {
        console.error('Search users error:', error);
        res.status(500).json({ message: 'Server error while searching users' });
    }
});
exports.searchUsers = searchUsers;
