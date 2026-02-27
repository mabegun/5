import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Начинаем заполнение базы данных...')

  // Создаем администратора
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      password: adminPassword,
      name: 'Администратор',
      position: 'Системный администратор',
      role: 'admin',
      avatarColor: '#3B82F6',
    }
  })
  console.log('✅ Создан администратор:', admin.email)

  // Создаем ГИПа
  const gipPassword = await bcrypt.hash('gip123', 10)
  const gip = await prisma.user.upsert({
    where: { email: 'gip@test.com' },
    update: {},
    create: {
      email: 'gip@test.com',
      password: gipPassword,
      name: 'Иванов Иван Иванович',
      position: 'Главный инженер проекта',
      role: 'gip',
      avatarColor: '#10B981',
    }
  })
  console.log('✅ Создан ГИП:', gip.email)

  // Создаем исполнителя
  const empPassword = await bcrypt.hash('emp123', 10)
  const employee = await prisma.user.upsert({
    where: { email: 'emp@test.com' },
    update: {},
    create: {
      email: 'emp@test.com',
      password: empPassword,
      name: 'Петров Петр Петрович',
      position: 'Инженер-проектировщик',
      role: 'employee',
      competencies: ['АР', 'КР', 'ОВ'],
      avatarColor: '#F59E0B',
    }
  })
  console.log('✅ Создан исполнитель:', employee.email)

  // Создаем стандартные изыскания
  const standardInvestigations = [
    { name: 'Инженерно-геодезические изыскания', sortOrder: 1 },
    { name: 'Инженерно-геологические изыскания', sortOrder: 2 },
    { name: 'Инженерно-гидрометеорологические изыскания', sortOrder: 3 },
    { name: 'Инженерно-экологические изыскания', sortOrder: 4 },
    { name: 'Обследование строительных конструкций', sortOrder: 5 },
    { name: 'Археологические изыскания', sortOrder: 6 },
  ]

  for (const inv of standardInvestigations) {
    await prisma.standardInvestigation.upsert({
      where: { name: inv.name },
      update: { sortOrder: inv.sortOrder },
      create: {
        name: inv.name,
        sortOrder: inv.sortOrder,
      }
    })
  }
  console.log('✅ Созданы стандартные изыскания')

  // Создаем демо-проект
  const project = await prisma.project.upsert({
    where: { id: 'demo-project-1' },
    update: {},
    create: {
      id: 'demo-project-1',
      name: 'Жилой дом №1',
      code: 'ЖД-2024-001',
      address: 'г. Москва, ул. Примерная, д. 1',
      type: 'construction',
      status: 'in_work',
      deadline: '2024-12-31',
      gipId: gip.id,
    }
  })
  console.log('✅ Создан демо-проект:', project.name)

  // Создаем разделы для проекта
  const sections = [
    { code: 'ГП', description: 'Генеральный план' },
    { code: 'АР', description: 'Архитектурные решения' },
    { code: 'КР', description: 'Конструктивные решения' },
    { code: 'ОВ', description: 'Отопление, вентиляция и кондиционирование' },
    { code: 'ВК', description: 'Водоснабжение и канализация' },
    { code: 'ЭОМ', description: 'Электроснабжение и электрооборудование' },
  ]

  for (const section of sections) {
    await prisma.section.upsert({
      where: { 
        projectId_code: {
          projectId: project.id,
          code: section.code
        }
      },
      update: {},
      create: {
        projectId: project.id,
        code: section.code,
        description: section.description,
        status: 'not_started',
      }
    })
  }
  console.log('✅ Созданы разделы проекта')

  console.log('🎉 Заполнение базы данных завершено!')
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
