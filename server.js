<<<<<<< HEAD
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid'); // import uuid 

const app = express();
const PORT = 3000;

// MongoDB connection parameters
const mongoURL = 'mongodb+srv://huangchunyu1234:huangchunyu1234@cluster0.7ia5w.mongodb.net/';
const databaseName = 'Cluster0';

// Connect to MongoDB
mongoose.connect(`${mongoURL}${databaseName}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000, // Increase the timeout to 30 seconds
  socketTimeoutMS: 45000,          // Socket timeout to 45 seconds
  connectTimeoutMS: 30000          // Connection timeout to 30 seconds
})
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.log('MongoDB connection error:', err));

// Create a schema and model for User
const userSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, unique: true },
  password: String,
  uuid: { type: String, unique: true },
  role: { type: String, default: 'user' }
});
const User = mongoose.model('User', userSchema);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({ secret: 'your_secret_key', resave: false, saveUninitialized: true }));
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the 'public' directory

// Set EJS as the templating engine
app.set('view engine', 'ejs');

// Middleware function to check cookie and session
function checkAuth(req, res, next) {
  if (req.session.user && req.cookies.user) {
    // Check if session and cookie match
    bcrypt.compare(req.session.user, req.cookies.user, (err, isMatch) => {
      if (isMatch) {
        return next(); // Proceed to the next middleware or route handler
      } else {
        // Destroy session and clear cookie
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

// Render the login_out page
app.get('/', (req, res) => {
  res.render('login_out');
});

// Render the success page, protected by checkAuth middleware
app.get('/success', checkAuth, (req, res) => {
  res.render('success', { user: req.session.user });
});

// Render the admin page, protected by checkAuth middleware
app.get('/admin', checkAuth, (req, res) => {
  res.render('admin', { user: req.session.user });
});

// Signup endpoint
app.post('/signup', async (req, res) => {
  const { fullName, email, password, role } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10); // hashing password
    const userUuid = uuidv4(); // creat UUID
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      uuid: userUuid,
      role: role || 'user'
    });
    await newUser.save();
    res.redirect('/'); // Redirect to homepage after successful registration
  } catch (error) {
    res.status(400).send('Error registering user: ' + error.message);
  }
});

// Login endpoint
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        req.session.user = user.uuid; // Store UUID to session
        const hashedUuid = await bcrypt.hash(user.uuid, 10); // Hashing UUID
        res.cookie('user', hashedUuid, { maxAge: 24 * 60 * 60 * 1000, httpOnly: true }); // Store the hashed UUID in the cookie, the latest day

        // Redirect based on user email
        if (user.email === 'admin@admin.com') {
          res.redirect('/admin'); // Redirect to admin page
        } else {
          res.redirect('/success'); // Redirect to success page
        }
      } else {
        res.status(400).json({ message: 'Invalid email or password' });
      }
    } else {
      res.status(400).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(400).send('Error logging in: ' + error.message);
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
=======

// 1. Create Blog Post
app.post('/api/blogs', authenticateUser, async (req, res) => {
  const { title, channel } = req.body;

  if (!title || !channel) {
    return res.status(400).json({ error: 'Title and channel are required' });
  }

  if (!ALLOWED_CHANNELS.includes(channel)) {
    return res.status(400).json({ error: `Invalid channel. Allowed channels are: ${ALLOWED_CHANNELS.join(', ')}` });
  }

  try {
    const blog = new Blog({
      Blog_id: Math.floor(Math.random() * 100000), // Random unique ID
      User_id: req.user.User_id,
      title,
      channel,
    });
    await blog.save();
    res.status(201).json(blog);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create blog post' });
  }
});

// 2. Edit Blog Post
app.put('/api/blogs/:blogId', authenticateUser, async (req, res) => {
  const { blogId } = req.params;
  const { title, channel } = req.body;

  if (!title || !channel) {
    return res.status(400).json({ error: 'Title and channel are required' });
  }

  if (!ALLOWED_CHANNELS.includes(channel)) {
    return res.status(400).json({ error: `Invalid channel. Allowed channels are: ${ALLOWED_CHANNELS.join(', ')}` });
  }

  try {
    const blog = await Blog.findOne({ Blog_id: blogId });
    if (!blog) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    if (blog.User_id !== req.user.User_id) {
      return res.status(403).json({ error: 'You are not allowed to edit this blog post' });
    }

    blog.title = title;
    blog.channel = channel;
    await blog.save();
    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ error: 'Failed to edit blog post' });
  }
});

// 3. Fetch a Single Blog Post
app.get('/api/blogs/:blogId', authenticateUser, async (req, res) => {
  const { blogId } = req.params;

  try {
    const blog = await Blog.findOne({ Blog_id: blogId });
    if (!blog) {
      return res.status(404).json({ error: 'Blog post not found' });
    }
    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch blog post' });
  }
});

// 4. Create Comment
app.post('/api/blogs/:blogId/comments', authenticateUser, async (req, res) => {
  const { blogId } = req.params;
  const { comment } = req.body;

  if (!comment) {
    return res.status(400).json({ error: 'Comment text is required' });
  }

  try {
    const blog = await Blog.findOne({ Blog_id: blogId });
    if (!blog) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    const newComment = new Comment({
      Blog_id: blogId,
      User_id: req.user.User_id,
      comment,
    });
    await newComment.save();
    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

// 5. Edit Comment
app.put('/api/blogs/:blogId/comments/:commentId', authenticateUser, async (req, res) => {
  const { blogId, commentId } = req.params;
  const { comment } = req.body;

  if (!comment) {
    return res.status(400).json({ error: 'Comment text is required' });
  }

  try {
    const commentToEdit = await Comment.findOne({ _id: commentId, Blog_id: blogId });
    if (!commentToEdit) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (commentToEdit.User_id !== req.user.User_id) {
      return res.status(403).json({ error: 'You are not allowed to edit this comment' });
    }

    commentToEdit.comment = comment;
    await commentToEdit.save();
    res.status(200).json(commentToEdit);
  } catch (error) {
    res.status(500).json({ error: 'Failed to edit comment' });
  }
>>>>>>> 1f0aa5df1b306b1180bc6feebf3e19fa71c18d4b
});
