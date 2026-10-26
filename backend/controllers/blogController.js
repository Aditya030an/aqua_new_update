import Blog from "../models/blogModel.js";

// CREATE
export const createBlog = async (req, res) => {
  try {
    console.log("req" , req.body);
    console.log("req" , req.file?.path);

    // Multipart body not parsed / empty form: don't save a blank blog.
    if (!req.body?.title || !req.body?.content) {
      return res
        .status(400)
        .json({ error: "Title and content are required" });
    }

    const blog = new Blog({
      ...req.body,
      image_url: req.file?.path, // cloudinary url
    });

    await blog.save();
    res.status(201).json({ success: true, blog });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ALL
export const getBlogs = async (req, res) => {
  const blogs = await Blog.find().sort({ createdAt: -1 }).lean();
  res.json(blogs);
};

// GET SINGLE
export const getSingleBlog = async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  res.json(blog);
};

// UPDATE
export const updateBlog = async (req, res) => {
  try {
    let updateData = { ...req.body };

    if (req.file) {
      updateData.image_url = req.file.path;
    }

    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json({ success: true, blog });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE
export const deleteBlog = async (req, res) => {
  await Blog.findByIdAndDelete(req.params.id);
  res.json({ success: true });
};