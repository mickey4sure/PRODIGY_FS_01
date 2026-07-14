const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// MongoDB Schema Definition
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Auto-hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (error) {
    return next(error);
  }
});

// Verification helper
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const MongooseUser = mongoose.model('User', userSchema);


// Mock local JSON file storage logic (offline mode fallback)
const JSON_FILE_PATH = path.join(__dirname, '../data/users.json');

const getLocalUsers = () => {
  if (!fs.existsSync(path.dirname(JSON_FILE_PATH))) {
    fs.mkdirSync(path.dirname(JSON_FILE_PATH), { recursive: true });
  }
  if (!fs.existsSync(JSON_FILE_PATH)) {
    fs.writeFileSync(JSON_FILE_PATH, JSON.stringify([]));
  }
  try {
    return JSON.parse(fs.readFileSync(JSON_FILE_PATH, 'utf-8'));
  } catch (e) {
    return [];
  }
};

const saveLocalUsers = (users) => {
  fs.writeFileSync(JSON_FILE_PATH, JSON.stringify(users, null, 2));
};

const MockUser = {
  findOne: async function (query) {
    const users = getLocalUsers();
    const user = users.find(u => {
      if (query.email) return u.email === query.email.toLowerCase();
      if (query.username) return u.username === query.username;
      return false;
    });
    if (!user) return null;
    return {
      ...user,
      comparePassword: async function (enteredPassword) {
        return await bcrypt.compare(enteredPassword, this.password);
      }
    };
  },

  findById: function (id) {
    return {
      select: async function () {
        const users = getLocalUsers();
        const user = users.find(u => u._id === id);
        if (!user) return null;
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      },
      then: async function (resolve, reject) {
        try {
          const users = getLocalUsers();
          const user = users.find(u => u._id === id);
          resolve(user);
        } catch (err) {
          reject(err);
        }
      }
    };
  },

  create: async function (userData) {
    const users = getLocalUsers();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    
    // Automatically flag admin email or fallback to standard role
    const assignedRole = userData.email.toLowerCase() === 'admin@aegis.com' ? 'admin' : (userData.role || 'user');

    const newUser = {
      _id: Math.random().toString(36).substring(2, 11),
      username: userData.username,
      email: userData.email.toLowerCase(),
      password: hashedPassword,
      role: assignedRole,
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    saveLocalUsers(users);
    
    return {
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      createdAt: newUser.createdAt
    };
  }
};

// Exports proxy interface to dynamically swap database layer
module.exports = new Proxy({}, {
  get: function (target, prop) {
    return global.useMockDb ? MockUser[prop] : MongooseUser[prop];
  }
});
