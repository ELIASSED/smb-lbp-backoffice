// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log("📢 Suppression des anciennes données...");

  try {
    // Suppression des données existantes
    await prisma.sessionUsers.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.session.deleteMany();
    await prisma.psychologue.deleteMany();
    await prisma.instructor.deleteMany();
    await prisma.user.deleteMany();
    await prisma.admin.deleteMany();
    console.log("✅ Anciennes données supprimées !");
  } catch (error) {
    console.error("❌ Erreur lors de la suppression des données :", error);
    throw error;
  }

  // Création d'un administrateur
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.admin.create({
    data: {
      email: "admin@example.com",
      password: adminPassword,
      name: "Administrateur",
    },
  });
  console.log("✅ Administrateur créé ! Email: admin@example.com, Mot de passe: admin123");

  // Création d'un instructeur
  const instructor = await prisma.instructor.create({
    data: {
      email: 'instructor@example.com',
      firstName: 'John',
      lastName: 'Doe',
      numeroAutorisationPrefectorale: 'AUTH123456',
      phone: '0123456789',
    },
  });

  // Création d'un psychologue
  const psychologue = await prisma.psychologue.create({
    data: {
      email: 'psychologue@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      numeroAutorisationPrefectorale: 'AUTH654321',
      phone: '0987654321',
    },
  });

  console.log("✅ Instructeur et psychologue créés !");

  // Création de 100 sessions
  console.log("📢 Génération de 100 sessions...");
  const sessions = [];
  for (let i = 0; i < 100; i++) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + i * 3);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 1);

    const session = await prisma.session.create({
      data: {
        numeroStageAnts: `STAGE${i + 1}`,
        price: 200.0,
        description: `Session de formation n°${i + 1}`,
        startDate,
        endDate,
        location: 'Paris',
        capacity: 20,
        instructorId: instructor.id,
        psychologueId: psychologue.id,
      },
    });
    sessions.push(session);
  }
  console.log("✅ 100 sessions créées avec succès !");

  // Création d'un utilisateur
  const user = await prisma.user.create({
    data: {
      civilite: 'Mr',
      nom: 'Dupont',
      prenom: 'Jean',
      adresse: '123 Rue de la République',
      codePostal: '75001',
      ville: 'Paris',
      telephone: '0123456789',
      email: 'jean.dupont@example.com',
      nationalite: 'Française',
      dateNaissance: new Date('1990-01-01'),
      codePostalNaissance: '75001',
      numeroPermis: 'P123456',
      dateDelivrancePermis: new Date('2020-01-01'),
      prefecture: 'Paris',
      etatPermis: 'Valide',
      casStage: 'N/A',
    },
  });
  console.log("✅ Utilisateur créé !");

  // Inscription de l'utilisateur à une session aléatoire
  const randomSession = sessions[Math.floor(Math.random() * sessions.length)];
  const sessionUser = await prisma.sessionUsers.create({
    data: {
      sessionId: randomSession.id,
      userId: user.id,
      isPaid: false,
    },
  });
  console.log(`✅ L'utilisateur a été inscrit à la session ${randomSession.numeroStageAnts}`);

  // Création d'un paiement
  const payment = await prisma.payment.create({
    data: {
      sessionUserId: sessionUser.id,
      amount: 200.0,
      method: 'Credit Card',
    },
  });
  console.log("✅ Paiement enregistré !");

  console.log("🎉 Base de données semée avec succès !");
}

main()
  .catch((error) => {
    console.error('❌ Erreur lors du seed : ', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });