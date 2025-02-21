// app/api/earnings/route.ts

import { NextResponse } from "next/server";
import Stripe from "stripe";

// Initialisez Stripe avec votre clé secrète
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia", // ou la version souhaitée
});

// Fonction utilitaire pour agréger les transactions d'une période
async function aggregateTransactions(start: number, end: number): Promise<number> {
  let total = 0;
  let hasMore = true;
  let startingAfter: string | undefined = undefined;

  // Parcourir toutes les pages de transactions
  while (hasMore) {
    const params: Stripe.BalanceTransactionListParams = {
      limit: 100,
      created: {
        gte: start,
        lte: end,
      },
      // Vous pouvez filtrer par type si nécessaire (ex: type: "charge")
    };
    if (startingAfter) {
      params.starting_after = startingAfter;
    }

    const transactions = await stripe.balanceTransactions.list(params);
    // Ici, on additionne les montants (en centimes)
    for (const tx of transactions.data) {
      total += tx.amount;
    }
    hasMore = transactions.has_more;
    if (hasMore && transactions.data.length > 0) {
      startingAfter = transactions.data[transactions.data.length - 1].id;
    }
  }
  return total;
}

export async function GET(request: Request) {
  try {
    // Obtenir le timestamp courant en secondes
    const now = Math.floor(Date.now() / 1000);

    // Définir les bornes pour chaque période
    // (pour simplifier, on considère : journée = dernières 24h, semaine = 7 jours, mois = 30 jours, année = 365 jours)
    const periods = {
      day: now - 86400,
      week: now - 7 * 86400,
      month: now - 30 * 86400,
      year: now - 365 * 86400,
    };

    // Calculer l’agrégation pour chaque période
    const [dayTotal, weekTotal, monthTotal, yearTotal] = await Promise.all([
      aggregateTransactions(periods.day, now),
      aggregateTransactions(periods.week, now),
      aggregateTransactions(periods.month, now),
      aggregateTransactions(periods.year, now),
    ]);

    const earnings = {
      day: dayTotal,   // en centimes
      week: weekTotal, // en centimes
      month: monthTotal, // en centimes
      year: yearTotal,   // en centimes
    };

    return NextResponse.json(earnings);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur lors de la récupération des données Stripe." }, { status: 500 });
  }
}
