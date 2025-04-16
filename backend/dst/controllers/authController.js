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
exports.adminRegisterUser = exports.registerUser = exports.loginUser = void 0;
const User_1 = __importDefault(require("../models/User"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const firebase_1 = __importDefault(require("../config/firebase"));
const uuid_1 = require("uuid");
const dotenv_1 = __importDefault(require("dotenv"));
const bcrypt = require('bcrypt');
dotenv_1.default.config();
// Get a reference to the storage bucket
const bucket = firebase_1.default.storage().bucket();
// Helper function to upload image to Firebase Storage
const uploadImageToFirebase = (file) => __awaiter(void 0, void 0, void 0, function* () {
    // Create a unique filename
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `profile-images/${(0, uuid_1.v4)()}.${fileExtension}`;
    // Create a file object in the bucket
    const fileUpload = bucket.file(fileName);
    // Create a write stream and upload the file
    return new Promise((resolve, reject) => {
        const stream = fileUpload.createWriteStream({
            metadata: {
                contentType: file.mimetype,
            },
            resumable: false
        });
        // Handle upload errors
        stream.on('error', (error) => {
            reject(error);
        });
        // Handle successful upload
        stream.on('finish', () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                // Make the file publicly accessible
                yield fileUpload.makePublic();
                // Get the public URL
                const imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
                resolve(imageUrl);
            }
            catch (error) {
                reject(error);
            }
        }));
        // Write the file buffer to the stream
        stream.end(file.buffer);
    });
});
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        // Check if user exists
        const user = yield User_1.default.findOne({ email });
        if (!user) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }
        // Compare passwords
        const isMatch = yield bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }
        // Create token
        const token = jsonwebtoken_1.default.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' }); // Replace 'secretkey' with a real secret
        res.json({
            message: 'Login successful',
            token,
            user: user
        });
    }
    catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.loginUser = loginUser;
const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password } = req.body;
    try {
        // Check if user exists
        const existingUser = yield User_1.default.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }
        // Hash password
        const hashedPassword = yield bcrypt.hash(password, 10);
        // Handle profile image upload if file exists
        let profilePictureUrl = '';
        if (req.file) {
            try {
                profilePictureUrl = yield uploadImageToFirebase(req.file);
            }
            catch (uploadError) {
                console.error('Profile image upload error:', uploadError);
                res.status(500).json({ message: 'Error uploading profile image' });
                return;
            }
        }
        // Create new user
        const newUser = new User_1.default({
            name,
            email,
            password: hashedPassword,
            profilePicture: profilePictureUrl
        });
        yield newUser.save();
        // Generate JWT
        const token = jsonwebtoken_1.default.sign({ userId: newUser._id }, 'secretkey', {
            expiresIn: '1h'
        });
        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: newUser
        });
    }
    catch (err) {
        console.error('Registration Error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.registerUser = registerUser;
const adminRegisterUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password } = req.body;
    try {
        // Check if user exists
        const existingUser = yield User_1.default.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }
        // Hash password
        const hashedPassword = yield bcrypt.hash(password, 10);
        // Handle profile image upload if file exists
        let profilePictureUrl = '';
        if (req.file) {
            try {
                profilePictureUrl = yield uploadImageToFirebase(req.file);
            }
            catch (uploadError) {
                console.error('Profile image upload error:', uploadError);
                res.status(500).json({ message: 'Error uploading profile image' });
                return;
            }
        }
        // Create new user
        const newUser = new User_1.default({
            name,
            email,
            password: hashedPassword,
            role: 'admin',
            profilePicture: profilePictureUrl
        });
        yield newUser.save();
        // Generate JWT
        const token = jsonwebtoken_1.default.sign({ userId: newUser._id }, 'secretkey', {
            expiresIn: '1h'
        });
        res.status(201).json({
            message: 'Admin user registered successfully',
            token,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: 'admin',
                profilePicture: newUser.profilePicture
            }
        });
    }
    catch (err) {
        console.error('Registration Error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.adminRegisterUser = adminRegisterUser;
