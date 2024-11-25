const express = require('express');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 8080;

const uri = "mongodb+srv://www-data:RBFarENUKSNgpAVg@cluster0.talem.mongodb.net/project?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(uri);

const userSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: uuidv4
    },
    email: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    admin: {
        type: Boolean,
        default: false
    },
    datetime: {
        type: Date,
        default: Date.now
    }
}, { collection: 'user' });

userSchema.pre('save', async function(next) {
    const user = this;
    if (!user.isModified('password')) {
        return next();
    }

    try {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        user.password = hashedPassword;
        next();
    } catch (error) {
        return next(error);
    }
});

const USER = mongoose.model('user', userSchema);

app.use(express.json());

app.post('/api/user/add', async (req, res) => {
    const { email, username, password } = req.body;
    if (!email || !username || !password) {
        return res.status(400).json({ message: 'Email, username, and password are required' });
    }

    try {
        const newUser = new USER({ email, username, password });
        await newUser.save();
        return res.status(201).json({ message: 'User created successfully'});
    } catch (error) {
        return res.status(500).json({ message: 'Failed to create user' });
    }
});
// curl -X POST http://localhost:8080/api/newuser -H "Content-Type: application/json" -d \
// '{"email": "lau.boss@lauboss.com", "username": "lauboss", "password": "P@ssw0rd"}'
app.get('/api/user/showall', async (req, res) => {
    try {
        const users = await USER.find();
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// curl http://localhost:8080/api/user/showall
app.delete('/api/user/drop/:user_id', async (req, res) => {
    const userid = req.params.user_id;
    try {
        const user = await USER.findById(userid);
        if (!user) {
            return res.status(404).json({ message: `User with user_id ${userid} not found.` });
        }
        const result = await USER.deleteOne({ _id: userid });

        if (result.deletedCount === 1) {
            res.json({ message: `User with user_id ${userid} has been successfully deleted.` });
        } else {
            res.status(404).json({ message: `User with user_id ${userid} not found.` });
        }
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ error: 'An error occurred while deleting the user.' });
    }
});
// curl -X DELETE http://localhost:8080/api/dropuser/7dde9edc-5323-48a3-8d19-ef8a2ccc741c
app.put('/api/user/update/:userid', async (req, res) => {
    const { userid } = req.params;
    const { email, username, password, admin } = req.body;
    try {
        const user = await USER.findById(userid);
        if (!user) {
            return res.status(404).json({ message: `User with user_id ${userid} not found.` });
        }

        if (email !== undefined) {
            user.email = email;
        }
        if (username !== undefined) {
            user.username = username;
        }
        if (password !== undefined) {
            user.password = password;
        }
        if (admin !== undefined) {
            user.admin = admin;
        }
        await user.save();
        return res.json({ message: `User with user_id ${userid} updated successfully` });
    } catch (error) {
        console.error('Error updating user:', error);
        return res.status(500).json({ message: `Failed with user_id ${userid} to update user` });
    }
});
// curl -X PUT http://localhost:8080/api/updateuser/14dcb036-fbad-49cf-be5f-6028c4b99a2d \
// -H "Content-Type: application/json" \
// -d '{
//     "email": "newemail@example.com",
//     "username": "newusername",
//     "password": "newpassword",
//     "admin": true
// }'
app.get('/api/user/get_with_username/:username', async (req, res) => {
    const username = req.params.username;
    try {
        const users = await USER.find({ username: { $regex: username, $options: 'i' } });
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching users.' });
    }
});

app.get('/api/blogs/get_all_blog', async (req, res) => {
    try {
        const blogCollection = mongoose.connection.collection('blog');
        const aggregationResult = await blogCollection.aggregate([
            {
                $lookup: {
                    from: 'user',
                    localField: 'user_id',
                    foreignField: '_id',
                    as: 'userdetails'
                }
            },
            {
                $sort: {
                    datatime: 1
                }
            }
        ]).toArray();

        res.json(aggregationResult);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/blogs/get_blog_comment/:blogid', async (req, res) => {
    try {
        const blogid = req.params.blogid;

        const commentCollection = mongoose.connection.collection('comment');
        const aggregationResult = await commentCollection.aggregate([
            {
                $match: {
                    blog_id: blogid  // Assuming the field storing the blog id is 'blog_id'
                }
            },
            {
                $lookup: {
                    from: 'user',
                    localField: 'user_id',
                    foreignField: '_id',
                    as: 'userdetails'
                }
            },
            {
                $sort: {
                    datatime: 1
                }
            }
        ]).toArray();

        res.json(aggregationResult);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/api/blogs/delete_comment/:comment_id', async (req, res) => {
    const commentid = req.params.comment_id;
    try {
        const commentCollection = mongoose.connection.collection('comment');
        const comment = await commentCollection.findOne({ _id: commentid });
        if (!comment) {
            return res.status(404).json({ message: `Comment with comment_id ${commentid} not found.` });
        }
        const result = await commentCollection.deleteOne({ _id: commentid });
        if (result.deletedCount === 1) {
            res.json({ message: `Comment with comment_id ${commentid} has been successfully deleted.` });
        } else {
            res.status(404).json({ message: `Comment with comment_id ${commentid} not found.` });
        }
    } catch (error) {
        console.error("Error deleting comment:", error);
        res.status(500).json({ error: 'An error occurred while deleting the comment.' });
    }
});

app.delete('/api/blogs/delete_blog/:user_id', async (req, res) => {
    const userid = req.params.user_id;
    try {
        const blogCollection = mongoose.connection.collection('blog');
        const result = await blogCollection.deleteMany({ user_id: userid });

        if (result.deletedCount > 0) {
            res.json({ message: `All blog for user with user_id ${userid} have been successfully deleted.` });
        } else {
            res.status(404).json({ message: `No blog found for user with user_id ${userid} to delete.` });
        }
    } catch (error) {
        console.error("Error deleting blog:", error);
        res.status(500).json({ error: 'An error occurred while deleting the bolg.' });
    }
});

app.delete('/api/user/delete_comment/:user_id', async (req, res) => {
    const userid = req.params.user_id;
    try {
        const commentCollection = mongoose.connection.collection('comment');
        const result = await commentCollection.deleteMany({ user_id: userid });

        if (result.deletedCount > 0) {
            res.json({ message: `All comments for user with user_id ${userid} have been successfully deleted.` });
        } else {
            res.status(404).json({ message: `No comments found for user with user_id ${userid} to delete.` });
        }
    } catch (error) {
        console.error("Error deleting comments:", error);
        res.status(500).json({ error: 'An error occurred while deleting the comments.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
