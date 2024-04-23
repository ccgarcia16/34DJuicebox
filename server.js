const express = require("express");
const app = express();
const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
app.use(express.json());

const prisma = new PrismaClient();

app.get("/", function (req,res) {
  res.send("Heyo World!");
})

app.get("/api/posts", async (req,res) => {
  const posts = await prisma.post.findMany({
  })
  res.send(posts);
})

app.get("/api/posts/:id", async (req,res) => {
  try {
    const postId = parseInt(req.params.id);
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      }
    })
    res.send(post);
  } catch (error) {
    res.status(500).send("Internal issue")
  }
})

app.post("/auth/register", async (req,res) => {
  try {
    const {username, password} = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword
      }
    })
    const token = jwt.sign({userId: newUser.id}, "My lil secret key");
    res.status(201).json({token})
  } catch (error) {
    console.error(error)
  }
})

app.post("/auth/login", async (req,res) => {
  try {
    const {username, password} = req.body;
    if (!username || !password) {
      return res.status(400).json({error: "Please fill out your username and password"})
    }
    const user = await prisma.user.findFirst({
      where: {username}
    });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({error: "Invalid username or password"});
    }
    const token = jwt.sign({ userId: user.id}, "My lil secret key");
    res.json({token})
  } catch (error) {
    console.error(error)
  }
})

const authenticateUser = (req,res,next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({error: "Need Authentication token!"})
  }
  try {
    const decoded = jwt.verify(token, "My lil secret key");
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({error: "Invalid token!"})
  }
}

app.post("/api/posts", authenticateUser, async (req,res) => {
  try {
    const {title, content} = req.body;
    const userId = req.user.userId;
    const newPost = await prisma.post.create({
      data: {
        title,
        content,
        userId,
      }
    })
    res.status(201).json(newPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({error: "Failed to make a new post!"})
  }
})

app.put("/api/posts/:id", authenticateUser, async (req,res) => {
  try {
    const {id} = req.params;
    const {title, content} = req.body;
    const userId = req.user.userId;
    const post = await prisma.post.findUnique({
      where: {id: parseInt(id)},
    });
    if (!post) {
      return res.status(404).json({error: "Post not found"})
    }
    if (post.userId !== userId) {
      return res.status(403).json({error: "You lack permission to update this post!"});
    }
    const updatedPost = await prisma.post.update({
      where: {id: parseInt(id)},
      data: {title, content}
    })
    res.json(updatedPost);
  } catch (error) {
    console.error(error)
    res.status(500).json({error: "Failed to update post"})
  }
})

app.delete("/api/posts/:id", authenticateUser, async (req,res) => {
  try {
    const {id} = req.params;
    const userId = req.user.userId;
    const post = await prisma.post.findUnique({
      where: {id: parseInt(id)},
    });
    if (!post) {
      return res.status(404).json({error: "Post not found!"});
    }
    if (post.userId !== userId) {
      return res.status(403).json({error: "You lack permission to delete!"});
    }
    await prisma.post.delete({
      where: {id: parseInt(id)},
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({error: "Failed to delete this post!"})
  }
})

app.listen(3013);