const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid'); // 引入 uuid 库

const app = express();
const PORT = 3000;

// MongoDB 连接参数
const mongoURL = 'mongodb+srv://www-data:RBFarENUKSNgpAVg@cluster0.talem.mongodb.net/';
const databaseName = 'project';

// 连接到 MongoDB
mongoose.connect(`${mongoURL}${databaseName}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000, // 增加超时时间至 30 秒
  socketTimeoutMS: 45000,          // 套接字超时至 45 秒
  connectTimeoutMS: 30000          // 连接超时至 30 秒
})
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.log('MongoDB connection error:', err));

// 创建 User 模型的 schema
const userSchema = new mongoose.Schema({
  _id: { type: String, default: uuidv4 }, // 将 _id 设置为 UUID
  email: { type: String, unique: true },
  username: String,
  password: String,
  admin: { type: Boolean, default: false } // 默认值为 false
}, { collection: 'user' }); // 指定集合名称为 'user'

const User = mongoose.model('User', userSchema);

// 中间件配置
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({ secret: 'your_secret_key', resave: false, saveUninitialized: true }));
app.use(express.static(path.join(__dirname, 'public'))); // 从 'public' 目录提供静态文件

// 设置 EJS 作为模板引擎
app.set('view engine', 'ejs');

// 中间件函数检查 cookie 和 session
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

// 渲染 login_out 页
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
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10); // 哈希化密码
    const newUser = new User({
      _id: uuidv4(), // 设置 _id 为 UUID
      email,
      username,
      password: hashedPassword,
      admin: false // 默认管理员为 false
    });
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
    const user = await User.findOne({ email });
    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        req.session.user = user._id; // 存储 UUID 到 session
        const hashedUuid = await bcrypt.hash(user._id, 10); // 哈希化 UUID
        res.cookie('user', hashedUuid, { maxAge: 24 * 60 * 60 * 1000, httpOnly: true }); // 存储哈希化后的 UUID 到 cookie，有效期一天

        // 根据用户角色重定向
        if (user.admin) {
          res.redirect('/admin'); // 重定向到 admin 页
        } else {
          res.redirect('/success'); // 重定向到 success 页
        }
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

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
