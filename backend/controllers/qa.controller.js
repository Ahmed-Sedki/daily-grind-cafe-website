// controllers/qa.controller.js
import QA from '../models/qa.model.js';
import Category from '../models/category.model.js';
import mongoose from 'mongoose';
import slugify from 'slugify';

// Helper function to create a unique slug
const createUniqueSlug = async (question) => {
    // Create basic slug
    let slug = slugify(question, {
        lower: true,      // Convert to lowercase
        strict: true,     // Remove special characters
        locale: 'tr'      // Support for Turkish characters
    });

    // Check if slug exists
    let exists = await QA.findOne({ slug });

    // If exists, append a number
    if (exists) {
        let count = 1;
        let newSlug = slug;

        while (exists) {
            newSlug = `${slug}-${count}`;
            exists = await QA.findOne({ slug: newSlug });
            count++;
        }

        slug = newSlug;
    }

    return slug;
};

// Get all Q&A items with pagination and filtering
export const getQAItems = async (req, res) => {
    try {
        const { page = 1, limit = 10, category, approved = 'true', active = 'true' } = req.query;

        // Build filter object
        const filter = {
            active: active === 'true',
            approved: approved === 'true'
        };

        if (category) filter.category = category;

        // Calculate how many documents to skip
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Get Q&A items with pagination
        const qaItems = await QA.find(filter)
            .sort({ sortOrder: 1, createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count for pagination
        const total = await QA.countDocuments(filter);

        res.status(200).json({
            qaItems,
            totalPages: Math.ceil(total / parseInt(limit)),
            currentPage: parseInt(page),
            total
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching Q&A items',
            error: error.message
        });
    }
};

// Get Q&A categories
export const getQACategories = async (req, res) => {
    try {
        const categories = await QA.distinct('category');
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching Q&A categories',
            error: error.message
        });
    }
};

// Get Q&A items by category
export const getQAItemsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const { page = 1, limit = 10 } = req.query;

        // Calculate how many documents to skip
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Get Q&A items with pagination
        const qaItems = await QA.find({
            category,
            active: true,
            approved: true
        })
            .sort({ sortOrder: 1, createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count for pagination
        const total = await QA.countDocuments({
            category,
            active: true,
            approved: true
        });

        res.status(200).json({
            qaItems,
            totalPages: Math.ceil(total / parseInt(limit)),
            currentPage: parseInt(page),
            total
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching Q&A items by category',
            error: error.message
        });
    }
};

// Get a single Q&A item by slug
export const getQAItemBySlug = async (req, res) => {
    try {
        const { slug } = req.params;

        const qaItem = await QA.findOne({
            slug,
            active: true,
            approved: true
        });

        if (!qaItem) {
            return res.status(404).json({ message: 'Q&A item not found' });
        }

        res.status(200).json(qaItem);
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching Q&A item',
            error: error.message
        });
    }
};

// Submit a new Q&A item (public endpoint)
export const submitQAItem = async (req, res) => {
    try {
        const { question, submittedBy } = req.body;

        // Validation
        if (!question) {
            return res.status(400).json({ message: 'Question is required' });
        }

        // Generate slug from question
        const slug = await createUniqueSlug(question);

        // Create new Q&A item (unapproved)
        const qaItem = new QA({
            question,
            slug,
            answer: '', // Empty answer initially
            submittedBy: submittedBy || 'Anonymous',
            isUserSubmitted: true,
            approved: false, // Requires admin approval
            active: true
        });

        // Save to database
        await qaItem.save();

        res.status(201).json({
            message: 'Thank you for your question! It will be reviewed by our team.',
            qaItem: {
                question: qaItem.question,
                submittedBy: qaItem.submittedBy
            }
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error submitting question',
            error: error.message
        });
    }
};

// Create a new Q&A item (admin endpoint)
export const createQAItem = async (req, res) => {
    try {
        const { question, answer, category, sortOrder } = req.body;

        // Validation
        if (!question || !answer) {
            return res.status(400).json({ message: 'Question and answer are required' });
        }

        // Validate category if provided
        if (category) {
            const validCategory = await Category.findOne({
                slug: category,
                type: 'qa',
                active: true
            });

            if (!validCategory) {
                return res.status(400).json({
                    message: 'Invalid category. Please select a valid Q&A category.'
                });
            }
        }

        // Generate slug from question
        const slug = await createUniqueSlug(question);

        // Create new Q&A item
        const qaItem = new QA({
            question,
            slug,
            answer,
            category: category || 'general',
            isUserSubmitted: false,
            approved: true, // Admin-created items are auto-approved
            sortOrder: sortOrder ? parseInt(sortOrder) : 0,
            active: true
        });

        // Save to database
        await qaItem.save();

        res.status(201).json({
            message: 'Q&A item created successfully',
            qaItem
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error creating Q&A item',
            error: error.message
        });
    }
};

// Update an existing Q&A item
export const updateQAItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { question, answer, category, sortOrder, approved, active } = req.body;

        // Validate object ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid Q&A item ID' });
        }

        // Find Q&A item
        const qaItem = await QA.findById(id);

        if (!qaItem) {
            return res.status(404).json({ message: 'Q&A item not found' });
        }

        // Validate category if provided
        if (category && category !== qaItem.category) {
            const validCategory = await Category.findOne({
                slug: category,
                type: 'qa',
                active: true
            });

            if (!validCategory) {
                return res.status(400).json({
                    message: 'Invalid category. Please select a valid Q&A category.'
                });
            }
        }

        // Check if question is changed, then update slug
        let slug = qaItem.slug;
        if (question && question !== qaItem.question) {
            slug = await createUniqueSlug(question);
        }

        // Update Q&A item
        const updatedQAItem = await QA.findByIdAndUpdate(
            id,
            {
                question: question || qaItem.question,
                slug,
                answer: answer || qaItem.answer,
                category: category || qaItem.category,
                sortOrder: sortOrder !== undefined ? parseInt(sortOrder) : qaItem.sortOrder,
                approved: approved !== undefined ? approved === 'true' : qaItem.approved,
                active: active !== undefined ? active === 'true' : qaItem.active,
                updatedAt: Date.now()
            },
            { new: true } // Return updated document
        );

        res.status(200).json({
            message: 'Q&A item updated successfully',
            qaItem: updatedQAItem
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error updating Q&A item',
            error: error.message
        });
    }
};

// Delete a Q&A item (soft delete)
export const deleteQAItem = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate object ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid Q&A item ID' });
        }

        // Soft delete (set active to false)
        const qaItem = await QA.findByIdAndUpdate(
            id,
            { active: false, updatedAt: Date.now() },
            { new: true }
        );

        if (!qaItem) {
            return res.status(404).json({ message: 'Q&A item not found' });
        }

        res.status(200).json({
            message: 'Q&A item deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error deleting Q&A item',
            error: error.message
        });
    }
};

// Hard delete a Q&A item (admin only)
export const hardDeleteQAItem = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate object ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid Q&A item ID' });
        }

        // Remove from database
        const result = await QA.findByIdAndDelete(id);

        if (!result) {
            return res.status(404).json({ message: 'Q&A item not found' });
        }

        res.status(200).json({
            message: 'Q&A item permanently deleted'
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error deleting Q&A item',
            error: error.message
        });
    }
};

// Approve a user-submitted Q&A item
export const approveQAItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { answer } = req.body;

        // Validate object ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid Q&A item ID' });
        }

        // Validation
        if (!answer) {
            return res.status(400).json({ message: 'Answer is required for approval' });
        }

        // Find Q&A item
        const qaItem = await QA.findById(id);

        if (!qaItem) {
            return res.status(404).json({ message: 'Q&A item not found' });
        }

        // Check if it's a user-submitted question
        if (!qaItem.isUserSubmitted) {
            return res.status(400).json({ message: 'This is not a user-submitted question' });
        }

        // Update with answer and approved status
        const approvedQAItem = await QA.findByIdAndUpdate(
            id,
            {
                answer,
                approved: true,
                updatedAt: Date.now()
            },
            { new: true }
        );

        res.status(200).json({
            message: 'Q&A item approved successfully',
            qaItem: approvedQAItem
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error approving Q&A item',
            error: error.message
        });
    }
};