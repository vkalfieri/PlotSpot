const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const ProfileSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    handle: {
        type: String,
        required: true,
        max: 40
    },
    website: {
        type: String
    },
    location: {
        type: String
    },
    status: {
        type: String,
        required: true
    },
    skills: {
        type: [String],
    },
    bio: {
        type: String
    },
    publishedworks: [
        {
            title: {
                type: String,
                required: true
            },
            author: {
                type: String,
                required: true
            },
            coauthor: {
                type: String
            },
            publisher: {
                type: String,
                required: true
            },
            blurb: {
                type: String
            },
        }
    ],   
    social: {
        facebook: {
            type: String
        },
        twitter: {
            type: String
        },
        linkedin: {
            type: String
        },
        instagram: {
            type: String
        },

    },
    date: {
        type: Date,
        default: Date.now
    }     
});

module.exports = Profile = mongoose.model('profile', ProfileSchema);