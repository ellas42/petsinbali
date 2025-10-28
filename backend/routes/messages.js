const express = require('express');
const Message = require('../models/message');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/conversations', auth, async (req, res) => {
  try {
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: req.user._id },
            { receiver: req.user._id }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', req.user._id] },
              '$receiver',
              '$sender'
            ]
          },
          lastMessage: { $first: '$$ROOT' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          userId: '$_id',
          userName: '$user.name',
          userRole: '$user.role',
          lastMessage: '$lastMessage.content',
          lastMessageTime: '$lastMessage.createdAt',
          isRead: '$lastMessage.isRead'
        }
      }
    ]);

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:userId', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user._id }
      ]
    })
      .populate('sender', 'name role')
      .populate('receiver', 'name role')
      .populate('listing', 'name photos')
      .sort({ createdAt: 1 });

      //read receipt msg
    await Message.updateMany(
      {
        sender: req.params.userId,
        receiver: req.user._id,
        isRead: false
      },
      { isRead: true }
    );

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

//send msg
router.post('/', auth, async (req, res) => {
  try {
    const { receiverId, content, listingId } = req.body;

    if (!receiverId || !content) {
      return res.status(400).json({ error: 'Receiver and content required' });
    }

    const message = new Message({
      sender: req.user._id,
      receiver: receiverId,
      content,
      listing: listingId
    });

    await message.save();
    await message.populate('sender', 'name role');
    await message.populate('receiver', 'name role');
    if (listingId) {
      await message.populate('listing', 'name photos');
    }

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;