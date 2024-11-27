const express = require('express');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');
const bcrypt = require('bcrypt');
const app = express();
const PORT = 8080;
const uri = "mongodb+srv://www-data:RBFarENUKSNgpAVg@cluster0.talem.mongodb.net/project?retryWrites=true&w=majority&appName=Cluster0";

app.set('view engine', 'ejs');
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({ secret: 'your_secret_key', resave: false, saveUninitialized: true }));
app.use(express.static(path.join(__dirname, 'public'))); // 从 'public' 目录提供静态文件

mongoose.connect(uri);

function checkAuth(req, res, next) {
    if (req.session.user && req.cookies.user) {
      // 检查 session 和 cookie 是否匹配
      bcrypt.compare(req.session.user, req.cookies.user, (err, isMatch) => {
        if (isMatch) {
          return next(); // 继续到下一个中间件或路由处理程序
        } else {
          // 销毁 session 并清除 cookie
          req.session.destroy(err => {
            if (err) {
              console.log('Failed to destroy session:', err);
              return res.redirect('/');
            }
            res.clearCookie('user');
            res.redirect('/');
          });
        }
      });
    } else {
      res.redirect('/');
    }
  }

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

const blogSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: uuidv4
    },
    user_id: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    datetime: {
        type: Date,
        default: Date.now
    }
}, { collection: 'blog' });

const commentSchema = new mongoose.Schema({
    _id: {
    type: String,
    default: uuidv4
    },
    blog_id: {
    type: String,
    required: true
    },
    user_id: {
    type: String,
    required: true
    },
    content: {
    type: String,
    required: true
    },
    datetime: {
    type: Date,
    default: Date.now
    }
}, { collection: 'comment' });

const USER = mongoose.model('user', userSchema);
const Blog = mongoose.model('Blog', blogSchema);
const Comment = mongoose.model('Comment', commentSchema);

app.get('/', (req, res) => {
    res.render('login_out');
});
// 渲染 success 页，受 checkAuth 中间件保护
app.get('/success', checkAuth, (req, res) => {
    res.render('success', { user: req.session.user });
});

// 渲染 admin 页，受 checkAuth 中间件保护
app.get('/admin', checkAuth, (req, res) => {
    res.render('admin', { user: req.session.user });
});

// 注册端点
app.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const existingUser = await USER.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const newUser = new USER({ email, username, password });
        await newUser.save();
        res.redirect('/'); // 成功注册后重定向到首页
        } catch (error) {
        res.status(400).send('Error registering user: ' + error.message);
    }
});
  
  // 登录端点
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
    const user = await USER.findOne({ email });
    if (user) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
        req.session.user = user._id; // 存储 UUID 到 session
        if (user.admin){
            res.cookie('isAdmin', 'true');
        }
        res.cookie('user', user._id, { maxAge: 24 * 60 * 60 * 1000, httpOnly: true }); // 存储哈希化后的 UUID 到 cookie，有效期一天
        res.redirect('/blogs'); // 重定向到 success 页
        
        } else {
        res.status(400).json({ message: 'Invalid email or password' }); // 返回 JSON 响应
        }
    } else {
        res.status(400).json({ message: 'Invalid email or password' }); // 返回 JSON 响应
    }
    } catch (error) {
    res.status(400).send('Error logging in: ' + error.message);
    }
});

  // 处理 logout 请求
app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
        console.log('Failed to destroy session:', err);
        return res.redirect('/admin');
        }
        res.clearCookie('isAdmin');
        res.clearCookie('user');
        res.render('logout');
    });
});

app.get('/reset_password', (req, res) => {
    res.render('reset_password');
});

app.post('/reset', async (req, res) => {
    const { email, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
        return res.status(400).send('Passwords do not match');
    }

    try {
        const user = await USER.findOne({ email });

        if (!user) {
            return res.status(404).send('User not found');
        }

        user.password = newPassword; // No need to hash the password here

        await user.save();

        const script = `<script>alert('Password reset successful');</script>`;
        res.send(script);
        res.redirect('/')
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while resetting the password');
    }
});

app.get('/blogs', async (req, res) => {
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
        { $unwind: '$userdetails' },
        {
            $project: {
            title: 1,
            content: 1,
            channel :1,
            datetime: 1,
            'userdetails.username': 1
            }
        },
        {
            $sort: {
                datetime: -1
            }
        }
        ]).toArray();
        res.render('list', { blogs: aggregationResult});
    } catch (err) {
        res.status(500).send(err);
    }
});

app.get('/blogs/:id', async (req, res) => {
    const isAdmin = req.cookies.isAdmin === 'true';
    try {
        const blogId = req.params.id;
        const blog = await mongoose.connection.collection('blog').findOne({ _id: blogId });
        if (!blog) {
            return res.status(404).send('Blog not found');
        }
        const blogTitle = blog.title;
    const blogContent = blog.content;
        const commentCollection = mongoose.connection.collection('comment');
        const aggregationResult = await commentCollection.aggregate([
            {
                $match: {
                    blog_id: blogId
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
                    datetime: 1
                }
            }
        ]).toArray();

        res.render('blogcomments', { isAdmin: isAdmin, blogTitle: blogTitle, aggregationResult: aggregationResult, blogContent: blogContent, commentid: blogId });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/search', async (req, res) => {
    const searchString = req.query.search;
    try {
        if (!searchString) {
            return res.redirect('/blogs');
        }
        const regex = new RegExp(searchString, 'i');
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
            { $unwind: '$userdetails' },
            {
                $match: {
                    title: { $regex: regex }
                }
            },
            {
                $project: {
                    title: 1,
                    content: 1,
                    channel: 1,
                    datetime: 1,
                    'userdetails.username': 1
                }
            }
        ]).toArray();
        if (aggregationResult.length === 0) {
            return res.render('noresults', { searchQuery: searchString });
        }
        res.render('list', { blogs: aggregationResult });
    } catch (err) {
        res.status(500).send(err);
    }
});

app.post('/deletecomment/:id', async (req, res) => { 
    try { 
	const commentid = req.params.id;
	const commentCollection = mongoose.connection.collection('comment');
    const comment = await commentCollection.findOne({ _id: commentid });
	const result = await commentCollection.deleteOne({ _id: commentid });
    res.redirect(`back`);
} catch (error) {
	console.error('Error deleting comment:', error);
	res.status(500).send('Server Error');
}});
// Route for displaying the form to create a new blog
app.get('/createblog', (req, res) => {
    res.render('createblog');
});

app.post('/blog/create', async(req, res) => {
    const { title, content } = req.body;
    const userId = req.cookies.user;
    const newBlog = new Blog({ user_id: userId, title, content });
    try {
        await newBlog.save();
        res.redirect('/blogs');
        } catch (error) {
        res.status(400).send('Error registering user: ' + error.message);
    }
});

app.post('/createcomment/:post_id', (req, res) => {
    res.render('createcomment', { blog_id: req.params.post_id });
});


app.post('/comment/create/:blog_id', async (req, res) => {
    const blogId = req.params.blog_id;
    const { content } = req.body;
    const userId = req.cookies.user; // ensure user cookie is set
    const newComment = new Comment({ user_id: userId, blog_id: blogId, content });

    try {
        await newComment.save();
        res.redirect(`/blogs/${blogId}`);
    } catch (error) {
        res.status(400).send('Error creating comment: ' + error.message);
    }
});

app.get('/api/test', async (req, res) => {
    return res.status(201).json({ message: 'Hello world!' });
});

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
                    datetime: 1
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
                    datetime: 1
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

app.delete('/api/user/delete_blog/:user_id', async (req, res) => {
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

app.delete('/api/blogs/delete_blog/:blog_id', async (req, res) => {
    const blogid = req.params.blog_id;
    try {
        const blogCollection = mongoose.connection.collection('blog');
        const result = await blogCollection.deleteMany({ _id: blogid });

        if (result.deletedCount > 0) {
            res.json({ message: `All blog for user with blog_id ${blogid} have been successfully deleted.` });
        } else {
            res.status(404).json({ message: `No blog found for user with blog_id ${blogid} to delete.` });
        }
    } catch (error) {
        console.error("Error deleting blog:", error);
        res.status(500).json({ error: 'An error occurred while deleting the bolg.' });
    }
});

app.delete('/api/blogs/delete_comments/:blog_id', async (req, res) => {
    const blogid = req.params.blog_id;
    try {
        const commentCollection = mongoose.connection.collection('comment');
        const result = await commentCollection.deleteMany({ blog_id: blogid });

        if (result.deletedCount > 0) {
            res.json({ message: `All comments for user with blog_id ${blogid} have been successfully deleted.` });
        } else {
            res.status(404).json({ message: `No comments found for user with blog_id ${blogid} to delete.` });
        }
    } catch (error) {
        console.error("Error deleting comments:", error);
        res.status(500).json({ error: 'An error occurred while deleting the comments.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
