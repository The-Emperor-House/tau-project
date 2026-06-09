const { cloudinary, uploadAvatar } = require('../utils/cloudinary')
const prisma = require('../utils/prisma')

exports.getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      }
    })
    res.json(users)
  } catch (err) {
    console.error('Get users error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

exports.updateUser = async (req, res) => {
  const userId = Number(req.params.id)
  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({ message: 'Invalid ID' })
  }

  const updateData = {}
  if (req.body.name !== undefined) updateData.name = req.body.name
  if (req.body.email !== undefined) updateData.email = req.body.email
  if (req.body.role !== undefined) updateData.role = req.body.role

  if (updateData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updateData.email)) {
    return res.status(400).json({ message: 'Invalid email format' })
  }

  try {
    // เช็ก email ซ้ำ (เฉพาะถ้ามีการส่ง email มาใหม่)
    if (updateData.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: updateData.email }
      })
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({ message: 'Email already in use' })
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true
      }
    })

    res.json({ message: 'User updated', user: updatedUser })
  } catch (err) {
    console.error('Update user error:', err)
    if (err.code === 'P2025') {
      return res.status(404).json({ message: 'User not found' })
    }
    res.status(500).json({ message: 'Server error' })
  }
}

exports.uploadAvatar = [
  uploadAvatar.single('avatar'),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'Missing or invalid avatar file' })
    }

    try {
      console.log('Uploaded file info:', req.file)

      const user = await prisma.user.findUnique({ 
        where: { id: req.user.id },
        select: {
          id: true,
          avatarPublicId: true,
        }
      })

      if (!user) {
        return res.status(404).json({ message: 'User not found' })
      }

      if (user.avatarPublicId) {
        console.log('Deleting old avatar:', user.avatarPublicId)
        await cloudinary.uploader.destroy(user.avatarPublicId)
      }

      const publicId = req.file.filename

      await prisma.user.update({
        where: { id: req.user.id },
        data: {
          avatarUrl: req.file.path,
          avatarPublicId: publicId
        }
      })

      res.json({ message: 'Avatar updated', avatarUrl: req.file.path })
    } catch (err) {
      console.error('Upload avatar error:', err)
      res.status(500).json({ message: 'Server error' })
    }
  }
]