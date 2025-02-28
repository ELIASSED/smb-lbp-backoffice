// app/api/stripe-webhook/route.ts
export async function POST(request: Request) {
    const payload = await request.json();
    const eventType = payload.type;
  
    if (eventType === "checkout.session.completed") {
      const sessionUserId = payload.data.object.metadata.sessionUserId;
      await prisma.sessionUsers.update({
        where: { id: parseInt(sessionUserId) },
        data: { isPaid: true },
      });
    }
  
    return NextResponse.json({ received: true }, { status: 200 });
  }