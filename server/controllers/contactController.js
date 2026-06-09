const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

exports.getContacts = async (req, res) => {
  try {
    const contacts = await prisma.contact.findMany({
      orderBy: { createdAt: 'desc' }
    })
    res.json(
      contacts.map(contact => ({
        id: contact.id,
        fullName: contact.fullName,
        email: contact.email,
        phone: contact.phone,
        budget: contact.budget,
        areaSize: contact.areaSize,
        needs: contact.needs.split(',').map(n => n.trim()),
        details: contact.details,
        createdAt: contact.createdAt,
      }))
    )
  } catch (err) {
    console.error('🔥 getContacts error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

exports.submitContact = async (req, res) => {
  const { fullName, email, phone, budget, areaSize, needs, details } = req.body
  if (!fullName || !email || !phone || !budget || !areaSize || !needs)
    return res.status(400).json({ message: 'Missing required fields' })
  try {
    const contact = await prisma.contact.create({
      data: { fullName, email, phone, budget, areaSize, needs: needs.join(', '), details }
    })
    res.json({ message: 'Contact submitted', contact })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
    console.error('🔥 submitContact error:', err)
  }
}
