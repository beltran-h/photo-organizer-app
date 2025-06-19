import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Crear algunos fotógrafos de ejemplo
  const photographer1 = await prisma.photographer.upsert({
    where: { name: 'Fotógrafo Principal' },
    update: {},
    create: {
      name: 'Fotógrafo Principal',
    },
  })

  // Crear algunas marcas de ejemplo
  const brand1 = await prisma.brand.upsert({
    where: { name: 'Nike' },
    update: {},
    create: {
      name: 'Nike',
    },
  })

  const brand2 = await prisma.brand.upsert({
    where: { name: 'Adidas' },
    update: {},
    create: {
      name: 'Adidas',
    },
  })

  // Crear una plantilla de caption de ejemplo
  const template1 = await prisma.captionTemplate.create({
    data: {
      language: 'Spanish',
      postStyle: 'Casual y Amigable',
      pictureDesc: 'Foto de ejemplo para el organizador',
      city: 'Madrid',
      country: 'España',
      mainCategory: 'lifestyle',
      customHashtags: '#fotografia #organizador #madrid',
    },
  })

  console.log({ photographer1, brand1, brand2, template1 })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })