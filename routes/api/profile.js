const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// Load Validation
const validateProfileInput = require('../../validation/profile');
const validatePublishedworksInput = require('../../validation/publishedworks');
// Load Profile Model
const Profile = require('../../models/Profile');
// Load User Profile
const Profile = require('../../models/User');


// @route GET api/profile/test
// desc Tests profile route
// @access Public
router.get('/test', (req, res) => res.json({msg: "Profile Works"}));

// @route GET api/profile/
// desc Get Current User Profile
// @access Private

router.get('/', passport.authenticate('jwt', {session: false}), (req, res) => {
    const errors = {};

    Profile.findOne({ user: req.user.id })
    .populate('user', ['name', 'avatar'])
    .then(profile => {
        if(!profile){
            errors.noprofile = 'There is no profile for this user';
            return res.status(404).json(errors);
        }
        res.json(profile);
    })
    .catch(err => res.status(404).json(err));
});


// @route GET api/profile/all
// desc Get profile by handle
// @access Public

router.get('/all', (req, res) => {
    const errors = {};
    Profile.find()
    .populate('user', ['name', 'avatar'])
    .then(profiles => {
        if(!profiles) {
            errors.noprofile = 'There are no profiles';
            res.status(404).json(errors);
        }
        res.json(profiles);
    })
    .catch(err => res.status(404).json({ profile: 'There are no profiles' }));
});

// @route GET api/profile/handle/:handle
// desc Get profile by handle
// @access Public

router.get('/handle/:handle', (req, res) => {
    const errors = {};
    Profile.findOne({ handle: req.params.handle })
    .populate('user', ['name', 'avatar'])
    .then(profile => {
        if(profile) {
            errors.noprofile = 'There is no profile for this user';
            res.status(404).json(errors);
        }
        res.json(profile);
    })
    .catch(err => res.status(404).json(err));
});


// @route GET api/profile/user/:user
// desc Get profile by handle
// @access Public

router.get('/user/:user_id', (req, res) => {
    const errors = {};
    Profile.findOne({ user: req.params.user_id })
    .populate('user', ['name', 'avatar'])
    .then(profile => {
        if(profile) {
            errors.noprofile = 'There is no profile for this user';
            res.status(404).json(errors);
        }
        res.json(profile);
    })
    .catch(err => res.status(404).json({profile: 'There is no profile for this user'}));
});


// @route POST api/profile/
// desc Create or Edit User Profile
// @access Private

router.post('/', 
    passport.authenticate('jwt', {session: false}),     
    (req, res) => {
        const { errors, isValid } = validateProfileInput(req.body);

        // Check Validation
        if(!isValid) {
            // Return any errors with 400 status
            return res.status(400).json(errors); 
        }
    

        // Get fields
        const profileFields = {};
        profileFields.user = req.user.id;
        if(req.body.handle) profileFields.handle = req.body.handle;
        if(req.body.website) profileFields.website = req.body.website;
        if(req.body.location) profileFields.location = req.body.location;
        if(req.body.bio) profileFields.bio = req.body.bio;
        if(req.body.status) profileFields.status = req.body.status;
        // Skills - Split into array
        if(typeof req.body.skills !== 'undefined') {
            profileFields.skills = req.body.skills.split(',');
        }
        // Social
        profileFields.social = {};
        if(req.body.facebook) profileFields.social.facebook = req.body.facebook;
        if(req.body.twitter) profileFields.social.twitter = req.body.twitter;
        if(req.body.instagram) profileFields.social.instagram = req.body.instagram;
        if(req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;

        Profile.findOne({ user: req.user.id }).then(profile => {
            if(profile) {
                // Update
                Profile.findOneAndUpdate({ user: req.user.id }, { $set: profileFields }, { new: true})
                .then(profile => res.json(profile));
            } else {
                //Create

                // Check if handle exists
                Profile.findOne({ handle: profileFields.handle }).then(profile => {
                    if (profile) {
                        errors.handle = 'That handle already exists';
                        res.status(400).json(errors);
                    }

                    // Save Profile
                    new Profile(profileFields).save().then(profile => res.json(profile));
                });
            }
        });
    }
);

// @route POST api/profile/experience
// desc Add experience to profile 
// @access Private
router.post('/publishedworks', passport.authenticate('jwt', { session: false}), (req,res) => {
    const { errors, isValid } = validatePublishedworksInput(req.body);

    // Check Validation
    if(!isValid) {
        // Return any errors with 400 status
        return res.status(400).json(errors); 
    }
   
    Profile.findOne( { user: req.user.id })
    .then(profile => {
        const newPub = {
            title: req.body.title,
            author: req.body.author,
            coauthor: req.body.coauthor,
            publisher: req.body.publisher,
            blurb: req.body.blurb
        }

        // Add to experience array
        profile.publishedworks.unshift(newPub);

        profile.save().then(profile => res.json(profile));
    })
})

// @route DELETE api/profile/publishedworks/:pub_id
// desc Delete published works from profile 
// @access Private
router.delete('/publishedworks/:pub_id', passport.authenticate('jwt', { session: false}), (req,res) => {
    
    Profile.findOne( { user: req.user.id }).then(profile => {
        // Get remove index
        const removeIndex = profile.publishedworks
        .map(item => item.id)
        .indexOf(req.param.pub_id);

        // Splice out of array
        profile.publishedworks.splice(removeIndex, 1);

        // Save
        profile.save().then(profile => res.json(profile));
    })
    .catch(err => res.status(404).json(err));
});

// @route DELETE api/profile/publishedworks/:pub_id
// desc Delete published works from profile 
// @access Private
router.delete(
    '/',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        Profile.findOneAndRemove({ user: req.user.id })
        .then(() =>{
            User.findOneAndRemove({ _id: req.user.id }).then(() =>
              res.json({ success: true })
        );
        });
    }
);

module.exports = router;