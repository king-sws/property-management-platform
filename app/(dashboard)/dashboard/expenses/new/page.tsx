// app/(dashboard)/dashboard/expenses/new/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ExpenseForm } from "@/components/expenses/expense-form";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container, Stack } from "@/components/ui/container";
import { Typography } from "@/components/ui/typography";
import prisma from "@/lib/prisma";
import Link from "next/link";

export const metadata = {
  title: "Add Expense | Property Management",
};

export default async function NewExpensePage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/sign-in");
  }
  
  if (session.user.role !== "LANDLORD") {
    redirect(`/dashboard/${session.user.role?.toLowerCase()}`);
  }
  
  // Get landlord's properties
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      landlordProfile: {
        include: {
          properties: {
            where: {
              isActive: true,
              deletedAt: null,
            },
            select: {
              id: true,
              name: true,
              address: true,
            },
          },
        },
      },
    },
  });
  
  const properties = user?.landlordProfile?.properties || [];
  
  return (
    <Container padding="none" size="full">
      <Stack spacing="lg">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/expenses">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <Typography variant="h2" className="mb-1">
              Add Expense
            </Typography>
            <Typography variant="muted">
              Record a new property expense
            </Typography>
          </div>
        </div>
        
        <ExpenseForm properties={properties} />
      </Stack>
    </Container>
  );
}