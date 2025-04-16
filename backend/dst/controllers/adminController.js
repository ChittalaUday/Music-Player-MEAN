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
exports.deleteUser = exports.updateUserRole = exports.getAllUsers = exports.isAdmin = void 0;
const User_1 = __importDefault(require("../models/User"));
// Middleware to check if user is admin
const isAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Assuming you have user info from auth middleware
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const user = yield User_1.default.findById(userId);
        if (!user || user.role !== 'admin') {
            res.status(403).json({ message: 'Access denied: Admin privileges required' });
            return;
        }
        next();
    }
    catch (error) {
        console.error('Admin authorization error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.isAdmin = isAdmin;
// Get all users (admin only)
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield User_1.default.find().select('-password'); // Exclude passwords
        res.status(200).json(users);
    }
    catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getAllUsers = getAllUsers;
// Update user role (admin only)
const updateUserRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, role } = req.body;
        if (!userId || !role || !['user', 'admin'].includes(role)) {
            res.status(400).json({ message: 'Invalid user ID or role' });
            return;
        }
        const updatedUser = yield User_1.default.findByIdAndUpdate(userId, { role }, { new: true }).select('-password');
        if (!updatedUser) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.status(200).json({
            message: 'User role updated successfully',
            user: updatedUser
        });
    }
    catch (error) {
        console.error('Update user role error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.updateUserRole = updateUserRole;
// Delete user (admin only)
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const deletedUser = yield User_1.default.findByIdAndDelete(userId);
        if (!deletedUser) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.status(200).json({ message: 'User deleted successfully' });
    }
    catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.deleteUser = deleteUser;
