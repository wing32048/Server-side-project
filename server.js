
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
});
