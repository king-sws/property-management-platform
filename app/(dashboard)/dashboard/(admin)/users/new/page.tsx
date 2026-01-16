// app/(dashboard)/dashboard/(admin)/users/new/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Typography } from "@/components/ui/typography";
import { Container, Stack } from "@/components/ui/container";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { CreateUserForm } from "@/components/admin/create-user-form";

export default async function NewUserPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <Container padding="none" size="full">
      <Stack spacing="lg">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard/users">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <Typography variant="h2">Add New User</Typography>
            <Typography variant="muted">
              Create a new user account with selected role
            </Typography>
          </div>
        </div>

        {/* Form */}
        <div className="max-w-2xl">
          <Card>
            <CardHeader>
              <Typography variant="h4">User Information</Typography>
            </CardHeader>
            <CardContent>
              <CreateUserForm />
            </CardContent>
          </Card>
        </div>
      </Stack>
    </Container>
  );
}