

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
        type: String
    }
}, { collection: 'blog' });

const userSchema = new mongoose.Schema({
	_id: {
        type: String,
        default: uuidv4
    },
    username: {
        type: String,
        required: true
    }
}, { collection: 'user'});

const Blog = mongoose.model('Blog', blogSchema);
const User = mongoose.model('User', userSchema);
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
  }
]).toArray();
        res.render('list', { blogs: aggregationResult});
    } catch (err) {
        res.status(500).send(err);
    }
});

app.get('/blogs/:id', async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).send('Blog not found');
        }
        
        res.render('details', { blog: blog });
    } catch (err) {
        res.status(500).send(err);
    }
});

app.get('/search', async (req, res) => {
    const query = req.query.query;
    if (!query) {
        return res.redirect('/blogs');
    }
    try {
        const blogs = await Blog.find({
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { content: { $regex: query, $options: 'i' } }
            ]
        });
        res.render('list', { blogs: blogs });
    } catch (err) {
        res.status(500).send(err);
    }
});
