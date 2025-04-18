// src/lib/generateAttestation.ts
import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core'; // Importez puppeteer-core ici
import { Browser } from 'puppeteer-core';
import { SessionUsers, User, Session } from '@prisma/client';
import prisma from '@/lib/prisma';

const templatePath = path.join(process.cwd(), 'src/lib/templates/attestation.html');
if (!fs.existsSync(templatePath)) {
  console.error(`❌ Fichier template introuvable à : ${templatePath}`);
  throw new Error(`Template HTML introuvable à : ${templatePath}`);
}
const templateHtml = fs.readFileSync(templatePath, 'utf8');
const template = Handlebars.compile(templateHtml);

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const generateAttestation = async (
  sessionUser: SessionUsers & { user: User; session: Session }
): Promise<Buffer> => {
  const { user, session } = sessionUser;

  const instructor = await prisma.instructor.findUnique({
    where: { id: session.instructorId },
    select: { lastName: true, firstName: true },
  });

  const psychologue = session.psychologueId
    ? await prisma.psychologue.findUnique({
        where: { id: session.psychologueId },
        select: { lastName: true, firstName: true },
      })
    : null;

  const stagiaire = {
    nom: user.nom,
    prenom: user.prenom,
    adresse: user.adresse,
    ville: user.ville,
    dateNaissance: formatDate(user.dateNaissance),
    lieuNaissance: user.codePostalNaissance || 'Non spécifié',
    numeroPermis: user.numeroPermis,
    datePermis: formatDate(user.dateDelivrancePermis),
    prefecturePermis: user.prefecture,
    dateDebutStage: formatDate(session.startDate),
    dateFinStage: formatDate(session.endDate),
    casStage: user.casStage,
    dateAttestation: formatDate(new Date()),
    animateur: instructor ? `${instructor.firstName} ${instructor.lastName}` : 'Animateur non spécifié',
    psychologue: psychologue ? `${psychologue.firstName} ${psychologue.lastName}` : 'Psychologue non spécifié',
  };

  const html = template(stagiaire);

  let browser: Browser | null = null;
  try {
    const executablePath = await chromium.executablePath();
    if (!executablePath) {
      throw new Error('Chromium executable path not found');
    }

    browser = await puppeteer.launch({ // Utilisez puppeteer.launch directement
      args: chromium.args,
      executablePath,
      headless: true,
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfData = await page.pdf({
      format: 'A4',
      printBackground: true,
    });

    return Buffer.from(pdfData);
  } catch (error) {
    console.error('❌ Erreur lors de la génération du PDF :', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

export default generateAttestation;