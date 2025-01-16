import { PrismaClient } from "@prisma/client/extension";
const fs = require('fs');
const csv = require('csv-parser');

const prisma = new PrismaClient();

const filePath = './smb_relance.csv'; // Chemin vers ton fichier CSV

async function importCsv() {
  const dataToInsert: { email: any; firstName: any; lastName: any; phone: any; userId: number | null; lastSessionId: number | null; profession: any; }[] = [];

  // Lire le fichier CSV
  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (row) => {
      // Vérifier si la ligne est vide
      const isRowEmpty = Object.values(row).every((value) => !value.trim());
      if (isRowEmpty) {
        return; // Ignorer la ligne vide
      }

      // Transformer les données si nécessaire
      const formattedRow = {
        email: row.email || null,
        firstName: row.firstName || null,
        lastName: row.lastName || null,
        phone: row.phone || null,
        userId: row.userId ? parseInt(row.userId, 10) : null,
        lastSessionId: row.lastSessionId ? parseInt(row.lastSessionId, 10) : null,
        profession: row.profession || null,
      };

      dataToInsert.push(formattedRow);
    })
    .on('end', async () => {
      console.log('Importing data...');
      for (const data of dataToInsert) {
        try {
          // Insérer les données dans la table Relance
          await prisma.relance.create({
            data,
          });
        } catch (err) {
          console.error('Error inserting data:', err);
        }
      }
      console.log('Data imported successfully!');
      await prisma.$disconnect();
    });
}

importCsv().catch((err) => {
  console.error('Error during import:', err);
  prisma.$disconnect();
});
