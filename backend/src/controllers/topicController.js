import { TopicModel } from "../models/TopicModel.js";

// GET /api/topics/subject/:subjectId - Get all topics for a subject
export async function getTopicsBySubject(req, res, next) {
  try {
    const { subjectId } = req.params;
    const topics = await TopicModel.getBySubject(subjectId);
    res.json({
      success: true,
      data: topics
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/topics/:id - Get single topic
export async function getTopic(req, res, next) {
  try {
    const { id } = req.params;
    const topic = await TopicModel.getById(id);
    
    if (!topic) {
      return res.status(404).json({
        success: false,
        message: "Topik tidak ditemukan"
      });
    }

    res.json({
      success: true,
      data: topic
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/topics/subject/:subjectId/slug/:slug - Get topic by slug
export async function getTopicBySlug(req, res, next) {
  try {
    const { subjectId, slug } = req.params;
    const topic = await TopicModel.getBySlug(subjectId, slug);
    
    if (!topic) {
      return res.status(404).json({
        success: false,
        message: "Topik tidak ditemukan"
      });
    }

    res.json({
      success: true,
      data: topic
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/topics/category/:category - Get topics by category
export async function getTopicsByCategory(req, res, next) {
  try {
    const { category } = req.params;
    const topics = await TopicModel.getByCategory(category);
    res.json({
      success: true,
      data: topics
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/topics - Create new topic (teacher/admin only)
export async function createTopic(req, res, next) {
  try {
    const { subject_id, slug, title, subtitle, description, points } = req.body;

    if (!subject_id || !slug || !title) {
      return res.status(400).json({
        success: false,
        message: "subject_id, slug, dan title harus diisi"
      });
    }

    const topic = await TopicModel.create({
      subject_id,
      slug,
      title,
      subtitle,
      description,
      points
    });

    res.status(201).json({
      success: true,
      data: topic,
      message: "Topik berhasil dibuat"
    });
  } catch (err) {
    next(err);
  }
}

// PUT /api/topics/:id - Update topic
export async function updateTopic(req, res, next) {
  try {
    const { id } = req.params;
    const { title, subtitle, description, points } = req.body;

    const topic = await TopicModel.update(id, {
      title,
      subtitle,
      description,
      points
    });

    res.json({
      success: true,
      data: topic,
      message: "Topik berhasil diperbarui"
    });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/topics/:id - Delete topic
export async function deleteTopic(req, res, next) {
  try {
    const { id } = req.params;
    await TopicModel.delete(id);

    res.json({
      success: true,
      message: "Topik berhasil dihapus"
    });
  } catch (err) {
    next(err);
  }
}
