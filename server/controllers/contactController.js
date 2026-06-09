const prisma = require('../utils/prisma')

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
        needs: contact.needs ? contact.needs.split(',').map(n => n.trim()) : [],
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

  const budgetNum = parseInt(budget, 10)
  const areaSizeNum = parseFloat(areaSize)
  if (isNaN(budgetNum)) return res.status(400).json({ message: 'budget must be a number' })
  if (isNaN(areaSizeNum)) return res.status(400).json({ message: 'areaSize must be a number' })
  if (!Array.isArray(needs) || needs.length === 0)
    return res.status(400).json({ message: 'needs must be a non-empty array' })

  try {
    const contact = await prisma.contact.create({
      data: { fullName, email, phone, budget: budgetNum, areaSize: areaSizeNum, needs: needs.join(', '), details: details || null }
    })
    res.json({ message: 'Contact submitted', contact })
  } catch (err) {
    console.error('🔥 submitContact error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}
