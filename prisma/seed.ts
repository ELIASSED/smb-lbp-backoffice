const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Créer des instructeurs
  const instructor1 = await prisma.instructor.create({
    data: {
      email: "instructor1@example.com",
      firstName: "Jean",
      lastName: "Doe",
      phone: "01 23 45 67 89",
      numeroAutorisationPrefectorale:"B7543986745",    
      isArchived: false,

    },
  });

  const instructor2 = await prisma.instructor.create({
    data: {
      email: "instructor2@example.com",
      firstName: "Alice",
      lastName: "Smith",
      phone: "01 23 45 67 54",
      numeroAutorisationPrefectorale:"B7554386745",
      isArchived: false,
    },
  });

  // Créer des psychologues
  const psychologue1 = await prisma.psychologue.create({
    data: {
      email: "psychologue1@example.com",
      firstName: "Marie",
      lastName: "Curie",
      phone: "01 23 45 43 89",
      numeroAutorisationPrefectorale:"B7543965745",
      isArchived: false,
    },
  });

  const psychologue2 = await prisma.psychologue.create({
    data: {
      email: "psychologue2@example.com",
      firstName: "Albert",
      lastName: "Einstein",
      phone: "01 73 44 67 19",
      numeroAutorisationPrefectorale:"B7523409745",      
      isArchived: false,

    },
  });

  // Générer des sessions dynamiquement : 8 par mois pendant un an
  const startDate = new Date("2025-01-01T09:00:00Z");
  const endDate = new Date("2025-12-31T17:00:00Z");
  const sessions = [];

  let sessionNumber = 1;

  for (let month = 0; month < 12; month++) {
    for (let session = 0; session < 8; session++) {
      const start = new Date(startDate);
      start.setMonth(startDate.getMonth() + month);
      start.setDate(session * 3 + 1); // Espacement de 3 jours entre chaque stage

      const end = new Date(start);
      end.setDate(start.getDate() + 1); // Durée de 2 jours pour chaque stage

      sessions.push({
        numeroStageAnts: `R0060040934${String(sessionNumber).padStart(3, "0")}`,
        price: 200 + session * 10, // Prix variable
        description: "Stage de récupération de points",
        startDate: start,
        endDate: end,
        location: "Saint-Maur-des-Fossés",
        capacity: 15 - (session % 5), // Capacité variable
        instructorId: session % 2 === 0 ? instructor1.id : instructor2.id,
        psychologueId: session % 2 === 0 ? psychologue1.id : psychologue2.id,
      });

      sessionNumber++;
    }
  }

  await prisma.session.createMany({ data: sessions });

  // Créer un utilisateur
  const user = await prisma.user.create({
    data: {
      civilite: "Monsieur",
      nom: "Dupont",
      prenom: "Jean",
      prenom2: "Louis",
      adresse: "12 rue Exemple",
      codePostal: "75001",
      ville: "Paris",
      telephone: "0123456789",
      email: "jean.dupont@example.com",
      nationalite: "Française",
      dateNaissance: new Date("1990-01-01"),
      codePostalNaissance: "75001",
    },
  });

  // Associer l'utilisateur à une session
  await prisma.sessionUsers.create({
    data: {
      sessionId: 1, // Assurez-vous que l'ID correspond à une session existante
      userId: user.id,
      numeroPermis: "123456789",
      dateDelivrancePermis: new Date("2015-06-01"),
      prefecture: "Paris",
      etatPermis: "Valide",
      casStage: "Volontaire",
    },
  });

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

  